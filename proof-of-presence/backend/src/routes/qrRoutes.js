const express = require('express');
const { generateQrCode, verifyQrCode } = require('../controllers/qrController');
const { validateGenerateQr, validateVerifyQr } = require('../middleware/validateRequest');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply rate limiting to all QR-related routes
router.use(apiLimiter);

/**
 * @route POST /api/events/generate-qr
 * @description Generates a secure QR code for an event.
 * @access Public (authentication should be handled in a real app)
 */
router.post('/generate-qr', validateGenerateQr, generateQrCode);

/**
 * @route POST /api/events/verify-qr
 * @description Verifies a QR code and checks event attendance conditions.
 * @access Public (authentication should be handled in a real app)
 */
router.post('/verify-qr', validateVerifyQr, verifyQrCode);

module.exports = router;