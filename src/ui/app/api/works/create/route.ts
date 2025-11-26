import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const workData = await request.json();

    const { data, error } = await supabaseAdmin
      .from('works')
      .insert({
        work_id: workData.workId,
        creator_address: workData.creatorAddress.toLowerCase(),
        title: workData.title,
        description: workData.description || null,
        story: workData.story || null,
        image_url: workData.imageUrl,
        metadata_uri: workData.metadataUri,
        material: workData.material || null,
        tags: workData.tags || null,
        allow_remix: workData.allowRemix,
        license_fee: workData.licenseFee || null,
        parent_work_id: workData.parentWorkId || null,
        is_remix: workData.isRemix,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating work:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in create work API:', error);
    return NextResponse.json(
      { error: 'Failed to create work' },
      { status: 500 }
    );
  }
}
