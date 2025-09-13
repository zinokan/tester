const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { cache } = require('../config/redis');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for photo uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(`
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.date_of_birth, u.gender, u.bio,
        u.location_lat, u.location_lng, u.location_city, u.location_country,
        u.is_verified, u.created_at,
        p.min_age, p.max_age, p.max_distance, p.interested_in, p.show_me
      FROM users u
      LEFT JOIN user_preferences p ON u.id = p.user_id
      WHERE u.id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Get user photos
    const photosResult = await query(`
      SELECT id, photo_url, is_primary, order_index
      FROM user_photos
      WHERE user_id = $1
      ORDER BY order_index, created_at
    `, [userId]);

    res.json({
      ...user,
      photos: photosResult.rows
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('bio').optional().isLength({ max: 500 }),
  body('locationLat').optional().isFloat({ min: -90, max: 90 }),
  body('locationLng').optional().isFloat({ min: -180, max: 180 }),
  body('locationCity').optional().trim(),
  body('locationCountry').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const {
      firstName,
      lastName,
      bio,
      locationLat,
      locationLng,
      locationCity,
      locationCountry
    } = req.body;

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (firstName) {
      updateFields.push(`first_name = $${paramCount++}`);
      values.push(firstName);
    }
    if (lastName) {
      updateFields.push(`last_name = $${paramCount++}`);
      values.push(lastName);
    }
    if (bio !== undefined) {
      updateFields.push(`bio = $${paramCount++}`);
      values.push(bio);
    }
    if (locationLat !== undefined) {
      updateFields.push(`location_lat = $${paramCount++}`);
      values.push(locationLat);
    }
    if (locationLng !== undefined) {
      updateFields.push(`location_lng = $${paramCount++}`);
      values.push(locationLng);
    }
    if (locationCity !== undefined) {
      updateFields.push(`location_city = $${paramCount++}`);
      values.push(locationCity);
    }
    if (locationCountry !== undefined) {
      updateFields.push(`location_country = $${paramCount++}`);
      values.push(locationCountry);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const result = await query(`
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, first_name, last_name, bio, location_lat, location_lng, location_city, location_country
    `, values);

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Upload user photo
router.post('/photos', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo provided' });
    }

    const userId = req.user.id;

    // Check photo limit (max 9 photos)
    const photoCountResult = await query(
      'SELECT COUNT(*) FROM user_photos WHERE user_id = $1',
      [userId]
    );

    if (parseInt(photoCountResult.rows[0].count) >= 9) {
      return res.status(400).json({ error: 'Maximum 9 photos allowed' });
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'zenni/users',
          transformation: [
            { width: 800, height: 800, crop: 'fill', gravity: 'face' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Save to database
    const result = await query(`
      INSERT INTO user_photos (user_id, photo_url, cloudinary_public_id, order_index)
      VALUES ($1, $2, $3, $4)
      RETURNING id, photo_url, is_primary, order_index
    `, [
      userId,
      uploadResult.secure_url,
      uploadResult.public_id,
      parseInt(photoCountResult.rows[0].count)
    ]);

    res.status(201).json({
      message: 'Photo uploaded successfully',
      photo: result.rows[0]
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// Set primary photo
router.put('/photos/:photoId/primary', async (req, res) => {
  try {
    const userId = req.user.id;
    const { photoId } = req.params;

    // Verify photo belongs to user
    const photoResult = await query(
      'SELECT id FROM user_photos WHERE id = $1 AND user_id = $2',
      [photoId, userId]
    );

    if (photoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Remove primary status from all photos
    await query(
      'UPDATE user_photos SET is_primary = false WHERE user_id = $1',
      [userId]
    );

    // Set this photo as primary
    await query(
      'UPDATE user_photos SET is_primary = true WHERE id = $1',
      [photoId]
    );

    res.json({ message: 'Primary photo updated successfully' });
  } catch (error) {
    console.error('Set primary photo error:', error);
    res.status(500).json({ error: 'Failed to set primary photo' });
  }
});

// Delete photo
router.delete('/photos/:photoId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { photoId } = req.params;

    // Get photo info
    const photoResult = await query(
      'SELECT id, cloudinary_public_id FROM user_photos WHERE id = $1 AND user_id = $2',
      [photoId, userId]
    );

    if (photoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const photo = photoResult.rows[0];

    // Delete from Cloudinary
    if (photo.cloudinary_public_id) {
      await cloudinary.uploader.destroy(photo.cloudinary_public_id);
    }

    // Delete from database
    await query(
      'DELETE FROM user_photos WHERE id = $1',
      [photoId]
    );

    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

// Update user preferences
router.put('/preferences', [
  body('minAge').optional().isInt({ min: 18, max: 100 }),
  body('maxAge').optional().isInt({ min: 18, max: 100 }),
  body('maxDistance').optional().isInt({ min: 1, max: 100 }),
  body('interestedIn').optional().isIn(['male', 'female', 'both']),
  body('showMe').optional().isIn(['everyone', 'verified']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { minAge, maxAge, maxDistance, interestedIn, showMe } = req.body;

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (minAge !== undefined) {
      updateFields.push(`min_age = $${paramCount++}`);
      values.push(minAge);
    }
    if (maxAge !== undefined) {
      updateFields.push(`max_age = $${paramCount++}`);
      values.push(maxAge);
    }
    if (maxDistance !== undefined) {
      updateFields.push(`max_distance = $${paramCount++}`);
      values.push(maxDistance);
    }
    if (interestedIn !== undefined) {
      updateFields.push(`interested_in = $${paramCount++}`);
      values.push(interestedIn);
    }
    if (showMe !== undefined) {
      updateFields.push(`show_me = $${paramCount++}`);
      values.push(showMe);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No preferences to update' });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const result = await query(`
      UPDATE user_preferences 
      SET ${updateFields.join(', ')}
      WHERE user_id = $${paramCount}
      RETURNING *
    `, values);

    res.json({
      message: 'Preferences updated successfully',
      preferences: result.rows[0]
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Get potential matches (for swiping)
router.get('/discover', async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, offset = 0 } = req.query;

    // Get user preferences
    const prefsResult = await query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [userId]
    );

    if (prefsResult.rows.length === 0) {
      return res.status(400).json({ error: 'User preferences not found' });
    }

    const prefs = prefsResult.rows[0];

    // Get user's location
    const userResult = await query(
      'SELECT location_lat, location_lng FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'User location not found' });
    }

    const userLocation = userResult.rows[0];

    // Get already swiped users
    const swipedResult = await query(
      'SELECT swiped_id FROM swipes WHERE swiper_id = $1',
      [userId]
    );

    const swipedIds = swipedResult.rows.map(row => row.swiped_id);
    swipedIds.push(userId); // Don't show self

    // Build query for potential matches
    let queryText = `
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
    `;

    const queryParams = [...swipedIds];

    // Add age filter
    if (prefs.min_age || prefs.max_age) {
      const currentYear = new Date().getFullYear();
      if (prefs.min_age) {
        queryText += ` AND (${currentYear} - EXTRACT(YEAR FROM u.date_of_birth)) >= $${queryParams.length + 1}`;
        queryParams.push(prefs.min_age);
      }
      if (prefs.max_age) {
        queryText += ` AND (${currentYear} - EXTRACT(YEAR FROM u.date_of_birth)) <= $${queryParams.length + 1}`;
        queryParams.push(prefs.max_age);
      }
    }

    // Add gender filter
    if (prefs.interested_in && prefs.interested_in !== 'both') {
      queryText += ` AND u.gender = $${queryParams.length + 1}`;
      queryParams.push(prefs.interested_in);
    }

    // Add distance filter (simplified - in production, use proper geospatial queries)
    if (prefs.max_distance && userLocation.location_lat && userLocation.location_lng) {
      queryText += ` AND (
        6371 * acos(
          cos(radians($${queryParams.length + 1})) * 
          cos(radians(u.location_lat)) * 
          cos(radians(u.location_lng) - radians($${queryParams.length + 2})) + 
          sin(radians($${queryParams.length + 1})) * 
          sin(radians(u.location_lat))
        )
      ) <= $${queryParams.length + 3}`;
      queryParams.push(userLocation.location_lat, userLocation.location_lng, prefs.max_distance);
    }

    queryText += ` ORDER BY u.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, queryParams);

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
      users,
      hasMore: users.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Discover users error:', error);
    res.status(500).json({ error: 'Failed to get potential matches' });
  }
});

// Deactivate account
router.delete('/account', async (req, res) => {
  try {
    const userId = req.user.id;

    await query(
      'UPDATE users SET is_active = false WHERE id = $1',
      [userId]
    );

    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({ error: 'Failed to deactivate account' });
  }
});

module.exports = router;