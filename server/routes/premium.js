const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { cache } = require('../config/redis');

const router = express.Router();

// Get current subscription status
router.get('/subscription', async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(`
      SELECT 
        plan_type,
        status,
        start_date,
        end_date,
        created_at
      FROM subscriptions
      WHERE user_id = $1 AND status = 'active' AND end_date > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.json({
        hasSubscription: false,
        plan: null
      });
    }

    const subscription = result.rows[0];
    
    res.json({
      hasSubscription: true,
      plan: {
        type: subscription.plan_type,
        status: subscription.status,
        startDate: subscription.start_date,
        endDate: subscription.end_date,
        createdAt: subscription.created_at
      }
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});

// Get premium features available to user
router.get('/features', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current subscription
    const subscriptionResult = await query(`
      SELECT plan_type FROM subscriptions
      WHERE user_id = $1 AND status = 'active' AND end_date > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `, [userId]);

    const hasActiveSubscription = subscriptionResult.rows.length > 0;
    const planType = hasActiveSubscription ? subscriptionResult.rows[0].plan_type : 'free';

    // Define features based on plan
    const features = {
      free: {
        dailyLikes: 50,
        dailySuperLikes: 1,
        canRewind: false,
        canSeeWhoLiked: false,
        canPassport: false,
        canBoost: false,
        canMessageBeforeMatch: false,
        canSeeReadReceipts: false,
        adFree: false
      },
      plus: {
        dailyLikes: -1, // unlimited
        dailySuperLikes: 5,
        canRewind: true,
        canSeeWhoLiked: false,
        canPassport: true,
        canBoost: true,
        canMessageBeforeMatch: false,
        canSeeReadReceipts: false,
        adFree: true
      },
      gold: {
        dailyLikes: -1, // unlimited
        dailySuperLikes: 5,
        canRewind: true,
        canSeeWhoLiked: true,
        canPassport: true,
        canBoost: true,
        canMessageBeforeMatch: false,
        canSeeReadReceipts: true,
        adFree: true
      },
      platinum: {
        dailyLikes: -1, // unlimited
        dailySuperLikes: 5,
        canRewind: true,
        canSeeWhoLiked: true,
        canPassport: true,
        canBoost: true,
        canMessageBeforeMatch: true,
        canSeeReadReceipts: true,
        adFree: true
      }
    };

    res.json({
      plan: planType,
      features: features[planType]
    });
  } catch (error) {
    console.error('Get features error:', error);
    res.status(500).json({ error: 'Failed to get premium features' });
  }
});

// Get who liked you (Gold/Platinum feature)
router.get('/likes-you', async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user has Gold or Platinum subscription
    const subscriptionResult = await query(`
      SELECT plan_type FROM subscriptions
      WHERE user_id = $1 AND status = 'active' AND end_date > NOW()
      AND plan_type IN ('gold', 'platinum')
      ORDER BY created_at DESC
      LIMIT 1
    `, [userId]);

    if (subscriptionResult.rows.length === 0) {
      return res.status(403).json({ error: 'Gold or Platinum subscription required' });
    }

    // Get users who liked this user
    const result = await query(`
      SELECT DISTINCT
        s.swiper_id,
        u.first_name,
        u.last_name,
        u.date_of_birth,
        u.is_verified,
        up.photo_url,
        s.created_at as liked_at,
        s.action
      FROM swipes s
      JOIN users u ON s.swiper_id = u.id
      LEFT JOIN user_photos up ON u.id = up.user_id AND up.is_primary = true
      WHERE s.swiped_id = $1 
      AND s.action IN ('like', 'super_like')
      AND NOT EXISTS (
        SELECT 1 FROM swipes s2 
        WHERE s2.swiper_id = $1 AND s2.swiped_id = s.swiper_id
      )
      ORDER BY s.created_at DESC
    `, [userId]);

    // Get all photos for each user
    const users = result.rows;
    for (let user of users) {
      const photosResult = await query(`
        SELECT id, photo_url, is_primary, order_index
        FROM user_photos
        WHERE user_id = $1
        ORDER BY order_index, created_at
      `, [user.swiper_id]);
      user.photos = photosResult.rows;
    }

    res.json({
      users,
      count: users.length
    });
  } catch (error) {
    console.error('Get likes you error:', error);
    res.status(500).json({ error: 'Failed to get who liked you' });
  }
});

// Use rewind feature (Plus/Gold/Platinum)
router.post('/rewind', async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user has Plus, Gold, or Platinum subscription
    const subscriptionResult = await query(`
      SELECT plan_type FROM subscriptions
      WHERE user_id = $1 AND status = 'active' AND end_date > NOW()
      AND plan_type IN ('plus', 'gold', 'platinum')
      ORDER BY created_at DESC
      LIMIT 1
    `, [userId]);

    if (subscriptionResult.rows.length === 0) {
      return res.status(403).json({ error: 'Plus, Gold, or Platinum subscription required' });
    }

    // Get the most recent swipe
    const lastSwipeResult = await query(`
      SELECT swiped_id, action, created_at
      FROM swipes
      WHERE swiper_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `, [userId]);

    if (lastSwipeResult.rows.length === 0) {
      return res.status(400).json({ error: 'No swipes to rewind' });
    }

    const lastSwipe = lastSwipeResult.rows[0];

    // Delete the last swipe
    await query(
      'DELETE FROM swipes WHERE swiper_id = $1 AND swiped_id = $2 AND created_at = $3',
      [userId, lastSwipe.swiped_id, lastSwipe.created_at]
    );

    res.json({
      message: 'Rewind successful',
      rewoundUser: lastSwipe.swiped_id,
      action: lastSwipe.action
    });
  } catch (error) {
    console.error('Rewind error:', error);
    res.status(500).json({ error: 'Failed to rewind' });
  }
});

// Use boost feature (Plus/Gold/Platinum)
router.post('/boost', async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user has Plus, Gold, or Platinum subscription
    const subscriptionResult = await query(`
      SELECT plan_type FROM subscriptions
      WHERE user_id = $1 AND status = 'active' AND end_date > NOW()
      AND plan_type IN ('plus', 'gold', 'platinum')
      ORDER BY created_at DESC
      LIMIT 1
    `, [userId]);

    if (subscriptionResult.rows.length === 0) {
      return res.status(403).json({ error: 'Plus, Gold, or Platinum subscription required' });
    }

    // Check if user already has an active boost
    const activeBoostResult = await query(`
      SELECT id FROM user_activity
      WHERE user_id = $1 AND activity_type = 'boost'
      AND activity_data->>'expires_at' > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `, [userId]);

    if (activeBoostResult.rows.length > 0) {
      return res.status(400).json({ error: 'Boost already active' });
    }

    // Create boost activity (30 minutes)
    const boostExpires = new Date(Date.now() + 30 * 60 * 1000);
    await query(
      'INSERT INTO user_activity (user_id, activity_type, activity_data) VALUES ($1, $2, $3)',
      [userId, 'boost', JSON.stringify({ 
        expires_at: boostExpires.toISOString(),
        boost_type: 'standard'
      })]
    );

    res.json({
      message: 'Boost activated successfully',
      expiresAt: boostExpires.toISOString()
    });
  } catch (error) {
    console.error('Boost error:', error);
    res.status(500).json({ error: 'Failed to activate boost' });
  }
});

// Get top picks (Gold/Platinum feature)
router.get('/top-picks', async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user has Gold or Platinum subscription
    const subscriptionResult = await query(`
      SELECT plan_type FROM subscriptions
      WHERE user_id = $1 AND status = 'active' AND end_date > NOW()
      AND plan_type IN ('gold', 'platinum')
      ORDER BY created_at DESC
      LIMIT 1
    `, [userId]);

    if (subscriptionResult.rows.length === 0) {
      return res.status(403).json({ error: 'Gold or Platinum subscription required' });
    }

    // Get user preferences
    const prefsResult = await query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [userId]
    );

    if (prefsResult.rows.length === 0) {
      return res.status(400).json({ error: 'User preferences not found' });
    }

    const prefs = prefsResult.rows[0];

    // Get already swiped users
    const swipedResult = await query(
      'SELECT swiped_id FROM swipes WHERE swiper_id = $1',
      [userId]
    );

    const swipedIds = swipedResult.rows.map(row => row.swiped_id);
    swipedIds.push(userId);

    // Get top picks (simplified algorithm - in production, use ML)
    const result = await query(`
      SELECT DISTINCT
        u.id, u.first_name, u.last_name, u.date_of_birth, u.gender, u.bio,
        u.location_lat, u.location_lng, u.location_city, u.location_country,
        u.is_verified, u.created_at,
        up.photo_url, up.is_primary
      FROM users u
      LEFT JOIN user_photos up ON u.id = up.user_id AND up.is_primary = true
      WHERE u.id NOT IN (${swipedIds.map((_, i) => `$${i + 1}`).join(', ')})
      AND u.is_active = true
      AND u.is_verified = true
      ORDER BY u.created_at DESC
      LIMIT 10
    `, swipedIds);

    // Get all photos for each user
    const users = result.rows;
    for (let user of users) {
      const photosResult = await query(`
        SELECT id, photo_url, is_primary, order_index
        FROM user_photos
        WHERE user_id = $1
        ORDER BY order_index, created_at
      `, [user.id]);
      user.photos = photosResult.rows;
    }

    res.json({
      topPicks: users
    });
  } catch (error) {
    console.error('Get top picks error:', error);
    res.status(500).json({ error: 'Failed to get top picks' });
  }
});

// Purchase additional super likes
router.post('/super-likes/purchase', [
  body('quantity').isInt({ min: 1, max: 10 }).withMessage('Quantity must be 1-10'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { quantity } = req.body;

    // In production, integrate with payment processor (Stripe, etc.)
    // For now, just log the purchase
    console.log(`User ${userId} purchased ${quantity} super likes`);

    // Record the purchase
    await query(
      'INSERT INTO user_activity (user_id, activity_type, activity_data) VALUES ($1, $2, $3)',
      [userId, 'super_like_purchase', JSON.stringify({ 
        quantity,
        price: quantity * 0.99, // $0.99 per super like
        purchased_at: new Date().toISOString()
      })]
    );

    res.json({
      message: 'Super likes purchased successfully',
      quantity,
      totalPrice: quantity * 0.99
    });
  } catch (error) {
    console.error('Purchase super likes error:', error);
    res.status(500).json({ error: 'Failed to purchase super likes' });
  }
});

// Get pricing information
router.get('/pricing', async (req, res) => {
  try {
    const pricing = {
      plus: {
        name: 'Zenni Plus',
        price: 9.99,
        period: 'month',
        features: [
          'Unlimited Likes',
          '5 Super Likes per day',
          'Rewind Feature',
          'Passport Mode',
          'Ad-Free Experience'
        ]
      },
      gold: {
        name: 'Zenni Gold',
        price: 29.99,
        period: 'month',
        features: [
          'All Plus features',
          'See Who Liked You',
          'Top Picks',
          'Read Receipts'
        ]
      },
      platinum: {
        name: 'Zenni Platinum',
        price: 39.99,
        period: 'month',
        features: [
          'All Gold features',
          'Message Before Matching',
          'Priority Likes',
          'Message Engagement Metrics'
        ]
      },
      boost: {
        name: 'Boost',
        price: 4.99,
        period: 'one-time',
        duration: '30 minutes',
        description: 'Increase your profile visibility'
      },
      superBoost: {
        name: 'Super Boost',
        price: 15.99,
        period: 'one-time',
        duration: '30 minutes',
        description: 'Maximum visibility during peak hours'
      },
      superLikes: {
        name: 'Additional Super Likes',
        price: 0.99,
        period: 'per super like',
        description: 'Express strong interest'
      }
    };

    res.json({ pricing });
  } catch (error) {
    console.error('Get pricing error:', error);
    res.status(500).json({ error: 'Failed to get pricing information' });
  }
});

module.exports = router;