const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');

const router = express.Router();

// Report a user
router.post('/report', [
  body('reportedId').isUUID().withMessage('Valid user ID required'),
  body('reason').isIn([
    'inappropriate_photos',
    'fake_profile',
    'spam',
    'harassment',
    'underage',
    'inappropriate_behavior',
    'other'
  ]).withMessage('Invalid report reason'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description too long'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const reporterId = req.user.id;
    const { reportedId, reason, description } = req.body;

    if (reporterId === reportedId) {
      return res.status(400).json({ error: 'Cannot report yourself' });
    }

    // Check if already reported
    const existingReport = await query(
      'SELECT id FROM reports WHERE reporter_id = $1 AND reported_id = $2',
      [reporterId, reportedId]
    );

    if (existingReport.rows.length > 0) {
      return res.status(400).json({ error: 'User already reported' });
    }

    // Verify reported user exists
    const reportedUser = await query(
      'SELECT id FROM users WHERE id = $1',
      [reportedId]
    );

    if (reportedUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create report
    await query(
      'INSERT INTO reports (reporter_id, reported_id, reason, description) VALUES ($1, $2, $3, $4)',
      [reporterId, reportedId, reason, description]
    );

    res.status(201).json({ message: 'Report submitted successfully' });
  } catch (error) {
    console.error('Report user error:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// Block a user
router.post('/block', [
  body('blockedId').isUUID().withMessage('Valid user ID required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const blockerId = req.user.id;
    const { blockedId } = req.body;

    if (blockerId === blockedId) {
      return res.status(400).json({ error: 'Cannot block yourself' });
    }

    // Check if already blocked
    const existingBlock = await query(
      'SELECT id FROM blocks WHERE blocker_id = $1 AND blocked_id = $2',
      [blockerId, blockedId]
    );

    if (existingBlock.rows.length > 0) {
      return res.status(400).json({ error: 'User already blocked' });
    }

    // Verify blocked user exists
    const blockedUser = await query(
      'SELECT id FROM users WHERE id = $1',
      [blockedId]
    );

    if (blockedUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create block
    await query(
      'INSERT INTO blocks (blocker_id, blocked_id) VALUES ($1, $2)',
      [blockerId, blockedId]
    );

    // Deactivate any existing match
    await query(
      'UPDATE matches SET is_active = false WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)',
      [blockerId, blockedId]
    );

    res.status(201).json({ message: 'User blocked successfully' });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ error: 'Failed to block user' });
  }
});

// Unblock a user
router.delete('/block/:blockedId', async (req, res) => {
  try {
    const blockerId = req.user.id;
    const { blockedId } = req.params;

    // Remove block
    const result = await query(
      'DELETE FROM blocks WHERE blocker_id = $1 AND blocked_id = $2',
      [blockerId, blockedId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Block not found' });
    }

    res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ error: 'Failed to unblock user' });
  }
});

// Get blocked users
router.get('/blocked', async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(`
      SELECT 
        b.created_at as blocked_at,
        u.id as blocked_user_id,
        u.first_name,
        u.last_name,
        up.photo_url
      FROM blocks b
      JOIN users u ON b.blocked_id = u.id
      LEFT JOIN user_photos up ON u.id = up.user_id AND up.is_primary = true
      WHERE b.blocker_id = $1
      ORDER BY b.created_at DESC
    `, [userId]);

    res.json({
      blockedUsers: result.rows
    });
  } catch (error) {
    console.error('Get blocked users error:', error);
    res.status(500).json({ error: 'Failed to get blocked users' });
  }
});

// Verify profile (admin function - simplified for demo)
router.post('/verify-profile', async (req, res) => {
  try {
    const userId = req.user.id;

    // In production, this would involve photo verification process
    // For demo, we'll just mark as verified
    await query(
      'UPDATE users SET is_verified = true WHERE id = $1',
      [userId]
    );

    res.json({ message: 'Profile verification submitted' });
  } catch (error) {
    console.error('Verify profile error:', error);
    res.status(500).json({ error: 'Failed to submit verification' });
  }
});

// Get safety settings
router.get('/settings', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's safety preferences
    const result = await query(
      'SELECT show_me FROM user_preferences WHERE user_id = $1',
      [userId]
    );

    const settings = {
      showMe: result.rows[0]?.show_me || 'everyone',
      blockList: [],
      reportHistory: []
    };

    // Get blocked users count
    const blockedCount = await query(
      'SELECT COUNT(*) FROM blocks WHERE blocker_id = $1',
      [userId]
    );

    // Get report history
    const reportHistory = await query(`
      SELECT 
        r.reason,
        r.description,
        r.status,
        r.created_at,
        u.first_name,
        u.last_name
      FROM reports r
      JOIN users u ON r.reported_id = u.id
      WHERE r.reporter_id = $1
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [userId]);

    res.json({
      ...settings,
      blockedCount: parseInt(blockedCount.rows[0].count),
      reportHistory: reportHistory.rows
    });
  } catch (error) {
    console.error('Get safety settings error:', error);
    res.status(500).json({ error: 'Failed to get safety settings' });
  }
});

// Update safety settings
router.put('/settings', [
  body('showMe').optional().isIn(['everyone', 'verified']).withMessage('Invalid show me setting'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { showMe } = req.body;

    if (showMe) {
      await query(
        'UPDATE user_preferences SET show_me = $1 WHERE user_id = $2',
        [showMe, userId]
      );
    }

    res.json({ message: 'Safety settings updated successfully' });
  } catch (error) {
    console.error('Update safety settings error:', error);
    res.status(500).json({ error: 'Failed to update safety settings' });
  }
});

// Get community guidelines
router.get('/guidelines', async (req, res) => {
  try {
    const guidelines = {
      title: 'Zenni Community Guidelines',
      sections: [
        {
          title: 'Be Respectful',
          content: 'Treat all users with respect and kindness. Harassment, bullying, or hate speech will not be tolerated.'
        },
        {
          title: 'Be Authentic',
          content: 'Use recent, accurate photos of yourself. Fake profiles or misleading information will be removed.'
        },
        {
          title: 'Be Safe',
          content: 'Never share personal information like your address, phone number, or financial details with matches.'
        },
        {
          title: 'Be Appropriate',
          content: 'Keep photos and messages appropriate. Nudity, violence, or illegal content is prohibited.'
        },
        {
          title: 'Be Honest',
          content: 'Represent yourself honestly in your profile and conversations. Deception undermines trust.'
        }
      ],
      reporting: {
        title: 'How to Report',
        steps: [
          'Go to the user\'s profile',
          'Tap the three dots menu',
          'Select "Report" or "Block"',
          'Choose the reason for your report',
          'Submit your report'
        ]
      },
      consequences: {
        title: 'Consequences',
        content: 'Violations may result in warnings, temporary restrictions, or permanent account suspension.'
      }
    };

    res.json(guidelines);
  } catch (error) {
    console.error('Get guidelines error:', error);
    res.status(500).json({ error: 'Failed to get community guidelines' });
  }
});

module.exports = router;