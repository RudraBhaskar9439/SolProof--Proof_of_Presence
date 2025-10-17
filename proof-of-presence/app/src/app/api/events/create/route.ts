import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { PublicKey } from '@solana/web3.js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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
    } = body;

    // Validate required fields
    if (!eventId || !eventName || !eventDate || !organizerWallet) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate wallet address
    try {
      new PublicKey(organizerWallet);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Insert event into database
    const { data, error } = await supabaseAdmin
      .from('events')
      .insert({
        event_id: eventId,
        event_name: eventName,
        description: description || null,
        event_date: eventDate,
        location: location || null,
        max_attendees: maxAttendees || 100,
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
      return NextResponse.json(
        { error: 'Failed to create event', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      event: data,
    });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}