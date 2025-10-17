// app/src/app/api/events/verify-qr/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { verifyQRSignature, isQRExpired, QRPayload } from '@/lib/crypto/qr';

export async function POST(req: NextRequest) {
  try {
    const { qrData, attendeeWallet } = await req.json();

    if (!qrData || !attendeeWallet) {
      return NextResponse.json(
        { error: 'Missing qrData or attendeeWallet' },
        { status: 400 }
      );
    }

    // Decode QR data
    let qrPayload: QRPayload;
    try {
      const decoded = Buffer.from(qrData, 'base64').toString('utf-8');
      qrPayload = JSON.parse(decoded);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid QR code format' },
        { status: 400 }
      );
    }

    // Verify signature
    if (!verifyQRSignature(qrPayload)) {
      return NextResponse.json(
        { error: 'Invalid QR code signature' },
        { status: 400 }
      );
    }

    // Check expiry
    if (isQRExpired(qrPayload.timestamp, 24)) {
      return NextResponse.json(
        { error: 'QR code has expired' },
        { status: 400 }
      );
    }

    // Get event from database
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('event_id', qrPayload.eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if QR token exists and is not used
    const { data: qrToken, error: tokenError } = await supabaseAdmin
      .from('qr_tokens')
      .select('*')
      .eq('nonce', qrPayload.nonce)
      .eq('event_id', event.id)
      .single();

    if (tokenError || !qrToken) {
      return NextResponse.json(
        { error: 'Invalid or expired QR token' },
        { status: 400 }
      );
    }

    if (qrToken.is_used) {
      return NextResponse.json(
        { error: 'QR code has already been used' },
        { status: 400 }
      );
    }

    // Check if user already attended
    const { data: existingAttendance } = await supabaseAdmin
      .from('attendances')
      .select('*')
      .eq('event_id', event.id)
      .eq('attendee_wallet', attendeeWallet)
      .single();

    if (existingAttendance) {
      return NextResponse.json(
        { error: 'You have already checked in to this event' },
        { status: 400 }
      );
    }

    // Check event capacity
    if (event.current_attendees >= event.max_attendees) {
      return NextResponse.json(
        { error: 'Event has reached maximum capacity' },
        { status: 400 }
      );
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

    return NextResponse.json({
      valid: true,
      eventId: qrPayload.eventId,
      organizerPubkey: qrPayload.organizerPubkey,
      eventName: event.event_name,
      eventPda: event.event_pda,
      canMint: true,
    });
  } catch (error) {
    console.error('Verify QR error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}