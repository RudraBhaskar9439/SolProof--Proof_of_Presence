// app/src/app/api/profile/[wallet]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(
  req: NextRequest,
  { params }: { params: { wallet: string } }
) {
  try {
    const { wallet } = params;

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('wallet_address', wallet)
      .single();

    if (profileError) {
      // Profile doesn't exist yet
      return NextResponse.json({
        wallet_address: wallet,
        total_badges: 0,
        reputation_score: 0,
        attendances: [],
      });
    }

    // Get user's attendances
    const { data: attendances, error: attendanceError } = await supabase
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
      .eq('attendee_wallet', wallet)
      .order('checked_in_at', { ascending: false });

    if (attendanceError) {
      console.error('Failed to fetch attendances:', attendanceError);
    }

    return NextResponse.json({
      ...profile,
      attendances: attendances || [],
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}