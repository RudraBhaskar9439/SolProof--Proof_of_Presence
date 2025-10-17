// app/src/app/api/profile/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { PublicKey } from '@solana/web3.js';

export async function PUT(req: NextRequest) {
  try {
    const {
      walletAddress,
      displayName,
      bio,
      avatarUrl,
    } = await req.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    // Validate wallet
    try {
      new PublicKey(walletAddress);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Check if profile exists
    const { data: existing } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (existing) {
      // Update existing profile
      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .update({
          display_name: displayName,
          bio: bio,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('wallet_address', walletAddress)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Failed to update profile' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        profile: data,
      });
    } else {
      // Create new profile
      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          wallet_address: walletAddress,
          display_name: displayName,
          bio: bio,
          avatar_url: avatarUrl,
          total_badges: 0,
          reputation_score: 0,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Failed to create profile' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        profile: data,
      });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}