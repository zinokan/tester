const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { cache } = require('../config/redis');

const router = express.Router();

// Get messages for a match
router.get('/:matchId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { matchId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Verify user is part of this match
    const matchResult = await query(
      'SELECT id FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2) AND is_active = true',
      [matchId, userId]
    );

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Get messages
    const result = await query(`
      SELECT 
        m.id,
        m.content,
        m.message_type,
        m.is_read,
        m.created_at,
        u.first_name as sender_name,
        u.id as sender_id
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.match_id = $1
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `, [matchId, parseInt(limit), parseInt(offset)]);

    // Mark messages as read (only messages not sent by current user)
    await query(
      'UPDATE messages SET is_read = true WHERE match_id = $1 AND sender_id != $2 AND is_read = false',
      [matchId, userId]
    );

    res.json({
      messages: result.rows.reverse(), // Reverse to show oldest first
      hasMore: result.rows.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Send a message
router.post('/:matchId', [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be 1-1000 characters'),
  body('messageType').optional().isIn(['text', 'image', 'gif', 'emoji']).withMessage('Invalid message type'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { matchId } = req.params;
    const { content, messageType = 'text' } = req.body;

    // Verify user is part of this match
    const matchResult = await query(
      'SELECT id FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2) AND is_active = true',
      [matchId, userId]
    );

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Check if match has expired (14 days of inactivity)
    const matchDetails = await query(
      'SELECT created_at, last_message_at FROM matches WHERE id = $1',
      [matchId]
    );

    if (matchDetails.rows.length > 0) {
      const match = matchDetails.rows[0];
      const lastActivity = match.last_message_at || match.created_at;
      const daysSinceLastActivity = (new Date() - new Date(lastActivity)) / (1000 * 60 * 60 * 24);
      
      if (daysSinceLastActivity > 14) {
        return res.status(400).json({ error: 'Match has expired due to inactivity' });
      }
    }

    // Insert message
    const result = await query(`
      INSERT INTO messages (match_id, sender_id, content, message_type)
      VALUES ($1, $2, $3, $4)
      RETURNING id, content, message_type, is_read, created_at
    `, [matchId, userId, content, messageType]);

    // Update match's last_message_at
    await query(
      'UPDATE matches SET last_message_at = CURRENT_TIMESTAMP WHERE id = $1',
      [matchId]
    );

    const message = result.rows[0];

    // Get sender info
    const senderResult = await query(
      'SELECT first_name FROM users WHERE id = $1',
      [userId]
    );

    res.status(201).json({
      message: {
        ...message,
        sender_name: senderResult.rows[0].first_name,
        sender_id: userId
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark messages as read
router.put('/:matchId/read', async (req, res) => {
  try {
    const userId = req.user.id;
    const { matchId } = req.params;

    // Verify user is part of this match
    const matchResult = await query(
      'SELECT id FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2) AND is_active = true',
      [matchId, userId]
    );

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Mark all messages in this match as read (except own messages)
    await query(
      'UPDATE messages SET is_read = true WHERE match_id = $1 AND sender_id != $2',
      [matchId, userId]
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark messages read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Get unread message count
router.get('/unread/count', async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(`
      SELECT COUNT(*) as unread_count
      FROM messages m
      JOIN matches ma ON m.match_id = ma.id
      WHERE (ma.user1_id = $1 OR ma.user2_id = $1)
      AND m.sender_id != $1
      AND m.is_read = false
      AND ma.is_active = true
    `, [userId]);

    res.json({
      unreadCount: parseInt(result.rows[0].unread_count)
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// Get recent conversations (matches with recent messages)
router.get('/conversations/recent', async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20 } = req.query;

    const result = await query(`
      SELECT 
        m.id as match_id,
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
        up.photo_url as matched_user_photo,
        msg.content as last_message,
        msg.message_type as last_message_type,
        msg.created_at as last_message_created_at,
        msg.sender_id as last_message_sender_id,
        (
          SELECT COUNT(*)
          FROM messages
          WHERE match_id = m.id AND sender_id != $1 AND is_read = false
        ) as unread_count
      FROM matches m
      LEFT JOIN users u1 ON m.user1_id = u1.id
      LEFT JOIN users u2 ON m.user2_id = u2.id
      LEFT JOIN user_photos up ON (
        CASE 
          WHEN m.user1_id = $1 THEN u2.id
          ELSE u1.id
        END = up.user_id AND up.is_primary = true
      )
      LEFT JOIN LATERAL (
        SELECT content, message_type, created_at, sender_id
        FROM messages
        WHERE match_id = m.id
        ORDER BY created_at DESC
        LIMIT 1
      ) msg ON true
      WHERE (m.user1_id = $1 OR m.user2_id = $1) AND m.is_active = true
      ORDER BY m.last_message_at DESC NULLS LAST, m.created_at DESC
      LIMIT $2
    `, [userId, parseInt(limit)]);

    res.json({
      conversations: result.rows
    });
  } catch (error) {
    console.error('Get recent conversations error:', error);
    res.status(500).json({ error: 'Failed to get recent conversations' });
  }
});

// Delete a message (only own messages)
router.delete('/:messageId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;

    // Verify message belongs to user
    const messageResult = await query(
      'SELECT id FROM messages WHERE id = $1 AND sender_id = $2',
      [messageId, userId]
    );

    if (messageResult.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Delete message
    await query(
      'DELETE FROM messages WHERE id = $1',
      [messageId]
    );

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

module.exports = router;