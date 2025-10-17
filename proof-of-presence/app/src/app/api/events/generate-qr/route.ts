// app/src/app/api/events/generate-qr/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { generateSecureQR } from '@/lib/crypto/qr';

export async function POST(req: NextRequest) {
  try {
    const { eventId, organizerWallet } = await req.json();

    if (!eventId || !organizerWallet) {
      return NextResponse.json(
        { error: 'Missing eventId or organizerWallet' },
        { status: 400 }
      );
    }

    // Verify event exists and belongs to organizer
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('event_id', eventId)
      .eq('organizer_wallet', organizerWallet)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found or unauthorized' },
        { status: 404 }
      );
    }

    // Generate QR payload
    const qrPayload = generateSecureQR(eventId, organizerWallet);

    // Store QR token in database
    const expiresAt = new Date(qrPayload.timestamp + 24 * 60 * 60 * 1000); // 24 hours

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
      return NextResponse.json(
        { error: 'Failed to generate QR code' },
        { status: 500 }
      );
    }

    // Encode QR data as base64
    const qrData = Buffer.from(JSON.stringify(qrPayload)).toString('base64');

    return NextResponse.json({
      success: true,
      qrData,
      qrUrl: `${process.env.NEXT_PUBLIC_APP_URL}/scan?data=${qrData}`,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Generate QR error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}