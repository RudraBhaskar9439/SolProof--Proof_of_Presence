// backend/src/middleware/validateRequest.js
const Joi = require('joi');
const { PublicKey } = require('@solana/web3.js');

// Custom Joi validator for Solana PublicKey
const JoiPublicKey = Joi.extend((joi) => ({
  type: 'publicKey',
  base: joi.string(),
  messages: {
    'publicKey.invalid': '{{#label}} must be a valid Solana public key',
  },
  validate(value, helpers) {
    try {
      new PublicKey(value);
      return value;
    } catch (error) {
      return helpers.error('publicKey.invalid');
    }
  },
}));


const schemas = {
  createEvent: Joi.object({
    eventId: Joi.string().trim().required(),
    eventName: Joi.string().trim().required(),
    description: Joi.string().allow('', null).optional(),
    eventDate: Joi.date().iso().required(),
    location: Joi.string().allow('', null).optional(),
    maxAttendees: Joi.number().integer().min(1).default(100),
    metadataUri: Joi.string().uri().allow('', null).optional(),
    nftImageUrl: Joi.string().uri().allow('', null).optional(),
    organizerWallet: JoiPublicKey.publicKey().required(),
    eventPda: Joi.string().allow('', null).optional(),
  }),

  generateQrCode: Joi.object({
    eventId: Joi.string().trim().required(),
    organizerWallet: JoiPublicKey.publicKey().required(),
  }),

  verifyQrCode: Joi.object({
    qrData: Joi.string().base64().required(), // Base64 encoded JSON
    attendeeWallet: JoiPublicKey.publicKey().required(),
  }),

  mintBadge: Joi.object({
    eventId: Joi.string().trim().required(),
    attendeeWallet: JoiPublicKey.publicKey().required(),
    nftMint: JoiPublicKey.publicKey().allow('', null).optional(),
    nftTokenAccount: JoiPublicKey.publicKey().allow('', null).optional(),
    transactionSignature: Joi.string().length(88).required(), // Solana transaction signature length
    metadataUri: Joi.string().uri().allow('', null).optional(),
  }),

  updateProfile: Joi.object({
    walletAddress: JoiPublicKey.publicKey().required(),
    displayName: Joi.string().trim().max(50).allow('', null).optional(),
    bio: Joi.string().trim().max(500).allow('', null).optional(),
    avatarUrl: Joi.string().uri().allow('', null).optional(),
  }),

  getLeaderboard: Joi.object({
    limit: Joi.number().integer().min(1).max(200).default(100).optional(),
  }),
};

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });

    if (error) {
      return next(error); // Pass error to the error handling middleware
    }
    req.validatedBody = value; // Attach validated body to request
    next();
  };
};

const validateQueryParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { abortEarly: false, allowUnknown: true });

    if (error) {
      return next(error);
    }
    req.validatedQuery = value;
    next();
  };
};

const validateGenerateQr = validateRequest(schemas.generateQrCode);
const validateVerifyQr = validateRequest(schemas.verifyQrCode);
const validateUpdateProfile = validateRequest(schemas.updateProfile);
const validateGetProfile = validateQueryParams(schemas.getLeaderboard); // If you want to validate query params for leaderboard, otherwise for profile use wallet param only

module.exports = {
  validateRequest,
  validateQueryParams,
  schemas,
  validateGenerateQr,
  validateVerifyQr,
  validateUpdateProfile,
  validateGetProfile,
};