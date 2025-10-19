const { supabaseAdmin } = require('../config/database');
const { formatDbError } = require('../utils/helpers');

/**
 * @function getLeaderboard
 * @description Retrieves a list of user profiles ordered by reputation score.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
async function getLeaderboard(req, res, next) {
  try {
    const limit = parseInt(req.query.limit || '100');

    // Get top users by reputation score
    const { data: users, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .order('reputation_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Leaderboard DB error:', error);
      return next(new Error(formatDbError(error, 'Failed to fetch leaderboard').message));
    }

    // Add rank to each user
    const rankedUsers = users?.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    res.status(200).json({
      success: true,
      leaderboard: rankedUsers || [],
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    next(new Error('Internal server error while fetching leaderboard'));
  }
}

module.exports = {
  getLeaderboard,
};