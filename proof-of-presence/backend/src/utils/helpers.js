const { PublicKey } = require('@solana/web3.js'); // Assuming @solana/web3.js is installed

/**
 * Validates if a given string is a valid Solana wallet address (Public Key).
 * @param {string} walletAddress - The string to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
function isValidSolanaWallet(walletAddress) {
  try {
    new PublicKey(walletAddress);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Formats a database error for consistent API responses.
 * @param {object} error - The error object from Supabase.
 * @param {string} defaultMessage - A default message if the error details are not specific.
 * @returns {{message: string, details?: string}} Formatted error.
 */
function formatDbError(error, defaultMessage = 'Database operation failed') {
  return {
    message: defaultMessage,
    details: error.message || 'Unknown database error',
    code: error.code || 'UNKNOWN_DB_ERROR'
  };
}

module.exports = {
  isValidSolanaWallet,
  formatDbError,
};