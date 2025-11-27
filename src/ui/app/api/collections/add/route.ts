import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { userId, workId, folderId, note } = await request.json();

    if (!userId || !workId || !folderId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('collections')
      .insert({
        user_id: userId,
        work_id: workId,
        folder_id: folderId,
        note: note || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding collection:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in add collection API:', error);
    return NextResponse.json(
      { error: 'Failed to add collection' },
      { status: 500 }
    );
  }
}
