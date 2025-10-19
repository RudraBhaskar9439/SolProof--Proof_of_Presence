const express = require('express');
const { createEvent, mintBadge, getLeaderboard } = require('../controllers/eventController');
const { validateRequest, validateQueryParams, schemas } = require('../middleware/validateRequest');
const { strictLimiter, apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply general API limiter to all routes
router.use(apiLimiter);

router.post('/create', strictLimiter, validateRequest(schemas.createEvent), createEvent);
router.post('/mint-badge', strictLimiter, validateRequest(schemas.mintBadge), mintBadge);

// Leaderboard can be a GET request and less strict
router.get('/leaderboard', validateQueryParams(schemas.getLeaderboard), getLeaderboard);


module.exports = router;