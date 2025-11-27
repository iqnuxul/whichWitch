import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { userId, workId } = await request.json();

    if (!userId || !workId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('collections')
      .delete()
      .eq('user_id', userId)
      .eq('work_id', workId);

    if (error) {
      console.error('Error removing collection:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in remove collection API:', error);
    return NextResponse.json(
      { error: 'Failed to remove collection' },
      { status: 500 }
    );
  }
}
