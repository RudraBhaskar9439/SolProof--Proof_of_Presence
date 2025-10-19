// backend/src/controllers/eventController.js
const { supabaseAdmin } = require('../config/database');
const { PublicKey } = require('@solana/web3.js');

const createEvent = async (req, res, next) => {
  try {
    const {
      eventId,
      eventName,
      description,
      eventDate,
      location,
      maxAttendees,
      metadataUri,
      nftImageUrl,
      organizerWallet,
      eventPda,
    } = req.body;

    // Validate wallet address
    try {
      new PublicKey(organizerWallet);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid organizer wallet address' });
    }

    const { data, error } = await supabaseAdmin
      .from('events')
      .insert({
        event_id: eventId,
        event_name: eventName,
        description: description || null,
        event_date: eventDate,
        location: location || null,
        max_attendees: maxAttendees || 100,
        current_attendees: 0, // Initialize current attendees
        metadata_uri: metadataUri || null,
        nft_image_url: nftImageUrl || null,
        organizer_wallet: organizerWallet,
        event_pda: eventPda || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to create event', details: error.message });
    }

    res.status(201).json({
      success: true,
      event: data,
    });
  } catch (error) {
    console.error('Create event error:', error);
    next(error);
  }
};

const mintBadge = async (req, res, next) => {
  try {
    const {
      eventId,
      attendeeWallet,
      nftMint,
      nftTokenAccount,
      transactionSignature,
      metadataUri,
    } = req.body;

    // Validate wallet addresses
    try {
      new PublicKey(attendeeWallet);
      if (nftMint) new PublicKey(nftMint);
      if (nftTokenAccount) new PublicKey(nftTokenAccount);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid wallet address provided' });
    }

    // Get event
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('event_id', eventId)
      .single();

    if (eventError || !event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if already attended
    const { data: existingAttendance } = await supabaseAdmin
      .from('attendances')
      .select('*')
      .eq('event_id', event.id)
      .eq('attendee_wallet', attendeeWallet)
      .single();

    if (existingAttendance) {
      return res.status(400).json({ error: 'Attendee has already checked in to this event' });
    }

    // Record attendance
    const { data: attendance, error: attendanceError } = await supabaseAdmin
      .from('attendances')
      .insert({
        event_id: event.id,
        attendee_wallet: attendeeWallet,
        nft_mint: nftMint || null,
        nft_token_account: nftTokenAccount || null,
        metadata_uri: metadataUri || null,
        transaction_signature: transactionSignature,
        checked_in_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (attendanceError) {
      console.error('Failed to record attendance:', attendanceError);
      return res.status(500).json({ error: 'Failed to record attendance', details: attendanceError.message });
    }

    // Update event attendance count
    await supabaseAdmin
      .from('events')
      .update({
        current_attendees: event.current_attendees + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', event.id);

    // Update or create user profile
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('wallet_address', attendeeWallet)
      .single();

    if (profile) {
      // Update existing profile
      await supabaseAdmin
        .from('user_profiles')
        .update({
          total_badges: profile.total_badges + 1,
          reputation_score: profile.reputation_score + 10,
          updated_at: new Date().toISOString(),
        })
        .eq('wallet_address', attendeeWallet);
    } else {
      // Create new profile
      await supabaseAdmin
        .from('user_profiles')
        .insert({
          wallet_address: attendeeWallet,
          total_badges: 1,
          reputation_score: 10,
        });
    }

    res.status(200).json({
      success: true,
      attendance,
      message: 'Badge minted and attendance recorded successfully',
    });
  } catch (error) {
    console.error('Mint badge error:', error);
    next(error);
  }
};

const getLeaderboard = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '100');

    const { data: users, error } = await supabaseAdmin // Using supabaseAdmin as it might be an admin-level read
      .from('user_profiles')
      .select('*')
      .order('reputation_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Leaderboard fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch leaderboard', details: error.message });
    }

    const rankedUsers = users?.map((user, index) => ({
      ...user,
      rank: index + 1,
    })) || [];

    res.status(200).json({
      success: true,
      leaderboard: rankedUsers,
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    next(error);
  }
};

module.exports = {
  createEvent,
  mintBadge,
  getLeaderboard,
};