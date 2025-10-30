const express = require('express');
const { createEvent, mintBadge, getLeaderboard } = require('../controllers/eventController');
const { validateRequest, validateQueryParams, schemas } = require('../middleware/validateRequest');
const { strictLimiter, apiLimiter } = require('../middleware/rateLimiter');
const { supabaseAdmin } = require('../config/database');

const router = express.Router();

// Apply general API limiter to all routes
router.use(apiLimiter);

// Get all events
router.get('/', async (req, res, next) => {
  try {
    const { data: events, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .order('event_date', { ascending: false });

    if (error) {
      console.error('Failed to fetch events:', error);
      return res.status(500).json({ error: 'Failed to fetch events', details: error.message });
    }

    res.status(200).json({
      success: true,
      events: events || []
    });
  } catch (error) {
    console.error('Get events error:', error);
    next(error);
  }
});

// Create event
router.post('/', strictLimiter, validateRequest(schemas.createEvent), createEvent);

// Mint badge
router.post('/mint-badge', strictLimiter, validateRequest(schemas.mintBadge), mintBadge);

// Leaderboard can be a GET request and less strict
router.get('/leaderboard', validateQueryParams(schemas.getLeaderboard), getLeaderboard);


module.exports = router;