// app/src/app/api/events/mint-badge/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { PublicKey } from '@solana/web3.js';

export async function POST(req: NextRequest) {
  try {
    const {
      eventId,
      attendeeWallet,
      nftMint,
      nftTokenAccount,
      transactionSignature,
      metadataUri,
    } = await req.json();

    if (!eventId || !attendeeWallet || !transactionSignature) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate wallet addresses
    try {
      new PublicKey(attendeeWallet);
      if (nftMint) new PublicKey(nftMint);
      if (nftTokenAccount) new PublicKey(nftTokenAccount);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Get event
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('event_id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if already attended
    const { data: existing } = await supabaseAdmin
      .from('attendances')
      .select('*')
      .eq('event_id', event.id)
      .eq('attendee_wallet', attendeeWallet)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Already checked in' },
        { status: 400 }
      );
    }

    // Record attendance
    const { data: attendance, error: attendanceError } = await supabaseAdmin
      .from('attendances')
      .insert({
        event_id: event.id,
        attendee_wallet: attendeeWallet,
        nft_mint: nftMint,
        nft_token_account: nftTokenAccount,
        metadata_uri: metadataUri,
        transaction_signature: transactionSignature,
        checked_in_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (attendanceError) {
      console.error('Failed to record attendance:', attendanceError);
      return NextResponse.json(
        { error: 'Failed to record attendance' },
        { status: 500 }
      );
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

    return NextResponse.json({
      success: true,
      attendance,
      message: 'Badge minted successfully',
    });
  } catch (error) {
    console.error('Mint badge error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}