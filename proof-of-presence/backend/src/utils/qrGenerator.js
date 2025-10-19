const crypto = require('crypto');

/**
 * Generates a secure QR code payload with a signature.
 * @param {string} eventId - The ID of the event.
 * @param {string} organizerPubkey - The public key of the event organizer.
 * @returns {QRPayload} The generated QR payload.
 */

/**
 * @typedef {object} qrPayload
 * @property {string} eventId
 * @property {string} organizerPubkey
 * @property {number} timestamp
 * @property {string} nonce
 * @property {string} signature 
 */

function generateSecureQR(eventId, organizerPubkey) {
    const nonce = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const secretKey = process.env.QR_SECRET_KEY;

    if (!secretKey) {
        throw new Error('QR_SECRET_KEY is not defined in environmental variables.');
    }

const payloadString = `${eventId}:${organizerPubkey}:${timestamp}:${nonce}`;
const signature = crypto
    .createHmac('sha256', secretKey)
    .update(payloadString)
    .digest('hex');

  return {
    eventId,
    organizerPubkey,
    timestamp,
    nonce,
    signature,
  };
}

/**
 * Verifies the signature of a QR payload.
 * @param {QRPayload} qrPayload - The QR payload to verify.
 * @returns {boolean} True if the signature is valid, false otherwise.
 */
function verifyQRSignature(qrPayload) {
  const secretKey = process.env.QR_SECRET_KEY; // Ensure this is set in your .env

  if (!secretKey) {
    console.error('QR_SECRET_KEY is not defined for signature verification.');
    return false;
  }

  const payloadString = `${qrPayload.eventId}:${qrPayload.organizerPubkey}:${qrPayload.timestamp}:${qrPayload.nonce}`;
  
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(payloadString)
    .digest('hex');

  // Use timingSafeEqual to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(qrPayload.signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Checks if a QR code has expired.
 * @param {number} timestamp - The timestamp when the QR code was generated (milliseconds).
 * @param {number} expiryHours - The number of hours after which the QR code expires.
 * @returns {boolean} True if the QR code is expired, false otherwise.
 */
function isQRExpired(timestamp, expiryHours = 24) {
  const expiryMs = expiryHours * 60 * 60 * 1000;
  return Date.now() - timestamp > expiryMs;
}

module.exports = {
  generateSecureQR,
  verifyQRSignature,
  isQRExpired,
};
