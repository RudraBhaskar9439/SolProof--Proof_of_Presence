// backend/src/controllers/profileController.js
const { supabaseAdmin } = require('../config/database');
const { PublicKey } = require('@solana/web3.js');

const getProfile = async (req, res, next) => {
  try {
    const { wallet } = req.params;
    const walletAddress = wallet;

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is 'no rows found'
      console.error('Failed to fetch profile:', profileError);
      return res.status(500).json({ error: 'Failed to fetch user profile', details: profileError.message });
    }

    // Get user's attendances
    const { data: attendances, error: attendanceError } = await supabaseAdmin
      .from('attendances')
      .select(`
        *,
        events:event_id (
          event_id,
          event_name,
          event_date,
          location,
          nft_image_url
        )
      `)
      .eq('attendee_wallet', walletAddress)
      .order('checked_in_at', { ascending: false });

    if (attendanceError) {
      console.error('Failed to fetch attendances:', attendanceError);
      // Don't fail the whole request, just log and return empty attendances
    }

    if (!profile) {
      // Profile doesn't exist yet, return a default empty profile
      return res.status(200).json({
        success: true,
        profile: {
          wallet_address: walletAddress,
          username: null,
          total_badges: 0,
          reputation_score: 0,
          attended_events: [],
          created_at: null,
          updated_at: null,
        }
      });
    }

    // Format attended events from attendances
    const attended_events = (attendances || []).map(att => ({
      event_name: att.events?.event_name || 'Unknown Event',
      event_date: att.events?.event_date || null,
      location: att.events?.location || null,
      checked_in_at: att.checked_in_at,
      nft_mint: att.nft_mint
    }));

    res.status(200).json({
      success: true,
      profile: {
        ...profile,
        username: profile.display_name || profile.username, // Map display_name to username for frontend
        attended_events
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const {
      walletAddress,
      displayName,
      bio,
      avatarUrl,
    } = req.body;

    // Validate wallet
    try {
      new PublicKey(walletAddress);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    // Check if profile exists
    const { data: existingProfile, error: existingProfileError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, total_badges, reputation_score')
      .eq('wallet_address', walletAddress)
      .single();

    if (existingProfileError && existingProfileError.code !== 'PGRST116') {
      console.error('Error checking for existing profile:', existingProfileError);
      return res.status(500).json({ error: 'Database error checking profile', details: existingProfileError.message });
    }

    let resultData;
    let resultError;

    if (existingProfile) {
      // Update existing profile
      ({ data: resultData, error: resultError } = await supabaseAdmin
        .from('user_profiles')
        .update({
          display_name: displayName,
          bio: bio,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('wallet_address', walletAddress)
        .select()
        .single());
    } else {
      // Create new profile
      ({ data: resultData, error: resultError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          wallet_address: walletAddress,
          display_name: displayName,
          bio: bio,
          avatar_url: avatarUrl,
          total_badges: 0, // Initialize for new profiles
          reputation_score: 0, // Initialize for new profiles
        })
        .select()
        .single());
    }

    if (resultError) {
      console.error('Profile update/create error:', resultError);
      return res.status(500).json({ error: 'Failed to update or create profile', details: resultError.message });
    }

    res.status(200).json({
      success: true,
      profile: resultData,
      message: existingProfile ? 'Profile updated successfully' : 'Profile created successfully',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
