const express = require('express');
const { getProfile, updateProfile } = require('../controllers/profileController');
const { validateUpdateProfile, validateGetProfile } = require('../middleware/validateRequest');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply rate limiting to all profile-related routes
router.use(apiLimiter);

/**
 * @route GET /api/profile/:wallet
 * @description Retrieves a user profile and their attendance records.
 * @access Public
 */
router.get('/:wallet', validateGetProfile, getProfile);

/**
 * @route PUT /api/profile/update
 * @description Updates or creates a user profile.
 * @access Public (authentication should be handled in a real app)
 */
router.put('/update', validateUpdateProfile, updateProfile);

module.exports = router;