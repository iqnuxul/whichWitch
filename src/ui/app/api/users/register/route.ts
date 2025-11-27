import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    const { walletAddress, name, bio, skills, avatarUrl } = userData;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // 生成平台 ID (格式: WW-随机6位数字)
    const platformId = `WW-${Math.floor(100000 + Math.random() * 900000)}`;

    // 创建用户
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        wallet_address: walletAddress.toLowerCase(),
        platform_id: platformId,
        name: name || 'Anonymous Artisan',
        bio: bio || null,
        skills: skills || null,
        avatar_url: avatarUrl || null,
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating user:', userError);
      return NextResponse.json(
        { error: userError.message },
        { status: 500 }
      );
    }

    // 创建默认文件夹
    const defaultFolders = ['Inspiration', 'To Remix', 'Favorites', 'Research'];
    const folderPromises = defaultFolders.map((folderName) =>
      supabaseAdmin
        .from('folders')
        .insert({
          user_id: user.id,
          name: folderName,
          is_default: true,
        })
        .select()
        .single()
    );

    const folderResults = await Promise.allSettled(folderPromises);
    
    // 检查是否有文件夹创建失败
    const failedFolders = folderResults.filter(r => r.status === 'rejected');
    if (failedFolders.length > 0) {
      console.error('Some folders failed to create:', failedFolders);
      // 不抛出错误，因为用户已经创建成功了
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error in register API:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
