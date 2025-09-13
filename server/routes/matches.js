const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { cache } = require('../config/redis');
const { swipeRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Swipe on a user (like/pass/super like)
router.post('/swipe', swipeRateLimiter, [
  body('swipedId').isUUID().withMessage('Valid user ID required'),
  body('action').isIn(['like', 'pass', 'super_like']).withMessage('Invalid action'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const swiperId = req.user.id;
    const { swipedId, action } = req.body;

    if (swiperId === swipedId) {
      return res.status(400).json({ error: 'Cannot swipe on yourself' });
    }

    // Check if already swiped
    const existingSwipe = await query(
      'SELECT id, action FROM swipes WHERE swiper_id = $1 AND swiped_id = $2',
      [swiperId, swipedId]
    );

    if (existingSwipe.rows.length > 0) {
      return res.status(400).json({ error: 'Already swiped on this user' });
    }

    // Verify swiped user exists and is active
    const swipedUser = await query(
      'SELECT id, is_active FROM users WHERE id = $1',
      [swipedId]
    );

    if (swipedUser.rows.length === 0 || !swipedUser.rows[0].is_active) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check super like limit (1 per day for free users)
    if (action === 'super_like') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const superLikeCount = await query(
        'SELECT COUNT(*) FROM swipes WHERE swiper_id = $1 AND action = $2 AND created_at >= $3',
        [swiperId, 'super_like', today]
      );

      // Check if user has premium subscription for more super likes
      const subscription = await query(
        'SELECT plan_type FROM subscriptions WHERE user_id = $1 AND status = $2 AND end_date > NOW()',
        [swiperId, 'active']
      );

      const maxSuperLikes = subscription.rows.length > 0 ? 5 : 1; // 5 for premium, 1 for free

      if (parseInt(superLikeCount.rows[0].count) >= maxSuperLikes) {
        return res.status(400).json({ 
          error: 'Super like limit reached',
          limit: maxSuperLikes,
          resetTime: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
        });
      }
    }

    // Record the swipe
    await query(
      'INSERT INTO swipes (swiper_id, swiped_id, action) VALUES ($1, $2, $3)',
      [swiperId, swipedId, action]
    );

    // Check for mutual match if it's a like or super like
    let isMatch = false;
    if (action === 'like' || action === 'super_like') {
      const mutualSwipe = await query(
        'SELECT id FROM swipes WHERE swiper_id = $1 AND swiped_id = $2 AND action IN ($3, $4)',
        [swipedId, swiperId, 'like', 'super_like']
      );

      if (mutualSwipe.rows.length > 0) {
        // Create match
        await query(`
          INSERT INTO matches (user1_id, user2_id)
          VALUES ($1, $2)
          ON CONFLICT (user1_id, user2_id) DO NOTHING
        `, [swiperId, swipedId]);

        isMatch = true;

        // Log match activity
        await query(
          'INSERT INTO user_activity (user_id, activity_type, activity_data) VALUES ($1, $2, $3)',
          [swiperId, 'match', JSON.stringify({ matchedUserId: swipedId, action })]
        );

        await query(
          'INSERT INTO user_activity (user_id, activity_type, activity_data) VALUES ($1, $2, $3)',
          [swipedId, 'match', JSON.stringify({ matchedUserId: swiperId, action })]
        );
      }
    }

    res.json({
      message: 'Swipe recorded successfully',
      isMatch,
      action
    });
  } catch (error) {
    console.error('Swipe error:', error);
    res.status(500).json({ error: 'Failed to record swipe' });
  }
});

// Get all matches
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const result = await query(`
      SELECT 
        m.id as match_id,
        m.created_at as matched_at,
        m.last_message_at,
        CASE 
          WHEN m.user1_id = $1 THEN u2.id
          ELSE u1.id
        END as matched_user_id,
        CASE 
          WHEN m.user1_id = $1 THEN u2.first_name
          ELSE u1.first_name
        END as matched_user_name,
        CASE 
          WHEN m.user1_id = $1 THEN u2.last_name
          ELSE u1.last_name
        END as matched_user_last_name,
        CASE 
          WHEN m.user1_id = $1 THEN u2.date_of_birth
          ELSE u1.date_of_birth
        END as matched_user_birth,
        CASE 
          WHEN m.user1_id = $1 THEN u2.is_verified
          ELSE u1.is_verified
        END as matched_user_verified,
        up.photo_url as matched_user_photo
      FROM matches m
      LEFT JOIN users u1 ON m.user1_id = u1.id
      LEFT JOIN users u2 ON m.user2_id = u2.id
      LEFT JOIN user_photos up ON (
        CASE 
          WHEN m.user1_id = $1 THEN u2.id
          ELSE u1.id
        END = up.user_id AND up.is_primary = true
      )
      WHERE (m.user1_id = $1 OR m.user2_id = $1) AND m.is_active = true
      ORDER BY m.last_message_at DESC NULLS LAST, m.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, parseInt(limit), parseInt(offset)]);

    // Get all photos for each matched user
    const matches = result.rows;
    for (let match of matches) {
      const photosResult = await query(`
        SELECT id, photo_url, is_primary, order_index
        FROM user_photos
        WHERE user_id = $1
        ORDER BY order_index, created_at
      `, [match.matched_user_id]);
      match.photos = photosResult.rows;
    }

    res.json({
      matches,
      hasMore: matches.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to get matches' });
  }
});

// Get specific match details
router.get('/:matchId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { matchId } = req.params;

    const result = await query(`
      SELECT 
        m.id as match_id,
        m.created_at as matched_at,
        m.last_message_at,
        CASE 
          WHEN m.user1_id = $1 THEN u2.id
          ELSE u1.id
        END as matched_user_id,
        CASE 
          WHEN m.user1_id = $1 THEN u2.first_name
          ELSE u1.first_name
        END as matched_user_name,
        CASE 
          WHEN m.user1_id = $1 THEN u2.last_name
          ELSE u1.last_name
        END as matched_user_last_name,
        CASE 
          WHEN m.user1_id = $1 THEN u2.date_of_birth
          ELSE u1.date_of_birth
        END as matched_user_birth,
        CASE 
          WHEN m.user1_id = $1 THEN u2.gender
          ELSE u1.gender
        END as matched_user_gender,
        CASE 
          WHEN m.user1_id = $1 THEN u2.bio
          ELSE u1.bio
        END as matched_user_bio,
        CASE 
          WHEN m.user1_id = $1 THEN u2.is_verified
          ELSE u1.is_verified
        END as matched_user_verified
      FROM matches m
      LEFT JOIN users u1 ON m.user1_id = u1.id
      LEFT JOIN users u2 ON m.user2_id = u2.id
      WHERE m.id = $2 AND (m.user1_id = $1 OR m.user2_id = $1) AND m.is_active = true
    `, [userId, matchId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const match = result.rows[0];

    // Get photos for matched user
    const photosResult = await query(`
      SELECT id, photo_url, is_primary, order_index
      FROM user_photos
      WHERE user_id = $1
      ORDER BY order_index, created_at
    `, [match.matched_user_id]);

    match.photos = photosResult.rows;

    res.json(match);
  } catch (error) {
    console.error('Get match error:', error);
    res.status(500).json({ error: 'Failed to get match details' });
  }
});

// Unmatch a user
router.delete('/:matchId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { matchId } = req.params;

    // Verify match belongs to user
    const matchResult = await query(
      'SELECT id FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
      [matchId, userId]
    );

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Deactivate match
    await query(
      'UPDATE matches SET is_active = false WHERE id = $1',
      [matchId]
    );

    res.json({ message: 'Match removed successfully' });
  } catch (error) {
    console.error('Unmatch error:', error);
    res.status(500).json({ error: 'Failed to remove match' });
  }
});

// Get swipe statistics
router.get('/stats/swipes', async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's swipe count
    const todaySwipes = await query(
      'SELECT COUNT(*) FROM swipes WHERE swiper_id = $1 AND created_at >= $2',
      [userId, today]
    );

    // Get total swipe count
    const totalSwipes = await query(
      'SELECT COUNT(*) FROM swipes WHERE swiper_id = $1',
      [userId]
    );

    // Get like count
    const likes = await query(
      'SELECT COUNT(*) FROM swipes WHERE swiper_id = $1 AND action IN ($2, $3)',
      [userId, 'like', 'super_like']
    );

    // Get super like count for today
    const todaySuperLikes = await query(
      'SELECT COUNT(*) FROM swipes WHERE swiper_id = $1 AND action = $2 AND created_at >= $3',
      [userId, 'super_like', today]
    );

    // Get match count
    const matches = await query(
      'SELECT COUNT(*) FROM matches WHERE (user1_id = $1 OR user2_id = $1) AND is_active = true',
      [userId]
    );

    res.json({
      todaySwipes: parseInt(todaySwipes.rows[0].count),
      totalSwipes: parseInt(totalSwipes.rows[0].count),
      totalLikes: parseInt(likes.rows[0].count),
      todaySuperLikes: parseInt(todaySuperLikes.rows[0].count),
      totalMatches: parseInt(matches.rows[0].count)
    });
  } catch (error) {
    console.error('Get swipe stats error:', error);
    res.status(500).json({ error: 'Failed to get swipe statistics' });
  }
});

module.exports = router;