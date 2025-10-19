require('dotenv').config(); // Load environment variables first
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler.js');

// Import routes
const eventRoutes = require('./routes/eventRoutes');
const qrRoutes = require('./routes/qrRoutes');
const profileRoutes = require('./routes/profileRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes'); // Assuming you'll create this based on your structure

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(helmet()); // Add security headers
app.use(express.json()); // Parse JSON request bodies
app.use(morgan('dev')); // Log HTTP requests

// Basic route for health check
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the Solana Event Badges Backend API!' });
});

// API Routes
app.use('/api/events', eventRoutes);
app.use('/api/events', qrRoutes); // QR routes are nested under /api/events
app.use('/api/profile', profileRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Centralized Error Handling Middleware (must be last)
app.use(errorHandler);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Access the API at http://localhost:${port}`);
});

module.exports = app; // Export app for testing purposes