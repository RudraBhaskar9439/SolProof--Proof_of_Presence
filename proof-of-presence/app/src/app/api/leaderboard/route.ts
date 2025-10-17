// app/src/app/api/leaderboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    // Get top users by reputation score
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('reputation_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Leaderboard error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      );
    }

    // Add rank to each user
    const rankedUsers = users?.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    return NextResponse.json({
      success: true,
      leaderboard: rankedUsers || [],
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}