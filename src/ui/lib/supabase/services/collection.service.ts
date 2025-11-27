import { supabase } from '../client';
import type { Collection, Folder } from '../client';

/**
 * 收藏服务 - 处理用户收藏和文件夹操作
 */

/**
 * 获取用户的所有文件夹
 */
export async function getUserFolders(userId: number): Promise<Folder[]> {
  try {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user folders:', error);
    return [];
  }
}

/**
 * 创建新文件夹
 */
export async function createFolder(userId: number, name: string, description?: string): Promise<Folder> {
  try {
    const { data, error } = await supabase
      .from('folders')
      .insert({
        user_id: userId,
        name,
        description: description || null,
        is_default: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
}

/**
 * 初始化用户的默认文件夹
 */
export async function initializeDefaultFolders(userId: number): Promise<Folder[]> {
  const defaultFolders = ['Inspiration', 'To Remix', 'Favorites', 'Research'];
  
  try {
    const folders = await Promise.all(
      defaultFolders.map(async (name) => {
        const { data, error } = await supabase
          .from('folders')
          .insert({
            user_id: userId,
            name,
            is_default: true,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      })
    );

    return folders;
  } catch (error) {
    console.error('Error initializing default folders:', error);
    throw error;
  }
}

/**
 * 收藏作品到文件夹
 * 通过 API route 调用，使用服务端权限
 */
export async function collectWork(
  userId: number,
  workId: number,
  folderId: number,
  note?: string
): Promise<Collection> {
  try {
    const response = await fetch('/api/collections/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, workId, folderId, note }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to collect work');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error collecting work:', error);
    throw error;
  }
}

/**
 * 取消收藏
 * 通过 API route 调用，使用服务端权限
 */
export async function uncollectWork(userId: number, workId: number): Promise<void> {
  try {
    const response = await fetch('/api/collections/remove', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, workId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to remove collection');
    }
  } catch (error) {
    console.error('Error uncollecting work:', error);
    throw error;
  }
}

/**
 * 获取用户的所有收藏（带作品信息和统计）
 */
export async function getUserCollections(userId: number) {
  try {
    console.log('📚 Fetching collections for user:', userId)
    
    const { data, error } = await supabase
      .from('collections')
      .select(`
        *,
        work_details (*),
        folders (*)
      `)
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase error in getUserCollections:', error)
      throw error;
    }
    
    console.log('📋 Collections fetched:', data?.length || 0, 'items')
    if (data && data.length > 0) {
      console.log('📋 Sample collection:', data[0])
    }
    
    return data || [];
  } catch (error) {
    console.error('❌ Error fetching user collections:', error);
    return [];
  }
}

/**
 * 获取某个文件夹的收藏
 */
export async function getFolderCollections(folderId: number) {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select(`
        *,
        works (*)
      `)
      .eq('folder_id', folderId)
      .order('saved_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching folder collections:', error);
    return [];
  }
}

/**
 * 检查作品是否已被收藏
 */
export async function isWorkCollected(userId: number, workId: number): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select('id')
      .eq('user_id', userId)
      .eq('work_id', workId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking if work is collected:', error);
    return false;
  }
}

/**
 * 移动收藏到另一个文件夹
 */
export async function moveCollection(
  userId: number,
  workId: number,
  newFolderId: number
): Promise<Collection> {
  try {
    const { data, error } = await supabase
      .from('collections')
      .update({ folder_id: newFolderId })
      .eq('user_id', userId)
      .eq('work_id', workId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error moving collection:', error);
    throw error;
  }
}
