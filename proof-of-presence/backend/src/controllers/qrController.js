const { supabaseAdmin } = require('../config/database');
const { generateSecureQR, verifyQRSignature, isQRExpired } = require('../utils/qrGenerator');  

const generateQrCode = async(req, res, next) => {
    try {
        const { eventId, organizerWallet } = req.body;

        // Verify event exists and belongs to organizer
        const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('event_id', eventId)
      .eq('organizer_wallet', organizerWallet)
      .single();

    if (eventError || !event) {
      return res.status(404).json({ error: 'Event not found or unauthorized' });
    }

    // Generate QR payload
    const qrPayload = generateSecureQR(eventId, organizerWallet);

    //Secure QR token in database
    const expiresAt = new Date(qrPayload.timestamp + 24*60*60*1000); // 24 hours validity

    const { error: insertError } = await supabaseAdmin
      .from('qr_tokens')
      .insert({
        event_id: event.id,
        nonce: qrPayload.nonce,
        signature: qrPayload.signature,
        expires_at: expiresAt.toISOString(),
        is_used: false,
      });

    if (insertError) {
      console.error('Failed to store QR token:', insertError);
      return res.status(500).json({ error: 'Failed to generate QR code due to database error', details: insertError.message });
    }

    // Encode QR data as base64
    const qrData = Buffer.from(JSON.stringify(qrPayload)).toString('base64');
    res.status(200).json({
        success: true,
        qrData,
        qrUrl:`YOUR_FRONTEND_APP_URL/scan?data=${qrData}`, // Update with your frontend url
         expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Generate QR error:', error);
    next(error);

    }
};

const verifyQrCode = async (req, res, next) => {
  try {
    const { qrData, attendeeWallet } = req.body;

    // Decode QR data
    let qrPayload;
    try {
      const decoded = Buffer.from(qrData, 'base64').toString('utf-8');
      qrPayload = JSON.parse(decoded);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid QR code format' });
    }

    // Verify signature
    if (!verifyQRSignature(qrPayload)) {
      return res.status(400).json({ error: 'Invalid QR code signature' });
    }

    // Check expiry
    if (isQRExpired(qrPayload.timestamp, 24)) {
      return res.status(400).json({ error: 'QR code has expired' });
    }

    // Get event from database
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('event_id', qrPayload.eventId)
      .single();

    if (eventError || !event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if QR token exists and is not used
    const { data: qrToken, error: tokenError } = await supabaseAdmin
      .from('qr_tokens')
      .select('*')
      .eq('nonce', qrPayload.nonce)
      .eq('event_id', event.id)
      .single();

    if (tokenError || !qrToken) {
      return res.status(400).json({ error: 'Invalid or unrecognized QR token' });
    }

    if (qrToken.is_used) {
      return res.status(400).json({ error: 'QR code has already been used' });
    }

    // Check if user already attended this specific event
    const { data: existingAttendance } = await supabaseAdmin
      .from('attendances')
      .select('*')
      .eq('event_id', event.id)
      .eq('attendee_wallet', attendeeWallet)
      .single();

    if (existingAttendance) {
      return res.status(400).json({ error: 'You have already checked in to this event' });
    }

    // Check event capacity
    if (event.current_attendees >= event.max_attendees) {
      return res.status(400).json({ error: 'Event has reached maximum capacity' });
    }

    // Mark QR as used
    await supabaseAdmin
      .from('qr_tokens')
      .update({
        is_used: true,
        used_by: attendeeWallet,
        used_at: new Date().toISOString(),
      })
      .eq('nonce', qrPayload.nonce);

    res.status(200).json({
      valid: true,
      eventId: qrPayload.eventId,
      organizerPubkey: qrPayload.organizerPubkey,
      eventName: event.event_name,
      eventPda: event.event_pda,
      canMint: true,
      message: 'QR code verified successfully. Ready to mint badge.',
    });
  } catch (error) {
    console.error('Verify QR error:', error);
    next(error);
  }
};

module.exports = {
  generateQrCode,
  verifyQrCode,
};