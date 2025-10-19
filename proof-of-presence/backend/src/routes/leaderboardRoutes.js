const express = require('express');
const { getLeaderboard } = require('../controllers/leaderboardController');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply rate limiting to leaderboard routes
router.use(apiLimiter);

/**
 * @route GET /api/leaderboard
 * @description Retrieves the user leaderboard based on reputation score.
 * @access Public
 */
router.get('/', getLeaderboard);

module.exports = router;