import { supabase } from '../client';
import type { Work } from '../client';

/**
 * 作品服务 - 处理所有作品相关的数据库操作
 */

/**
 * 获取所有作品（广场）
 * 使用 work_details 视图获取包含统计信息的作品
 */
export async function getAllWorks(limit = 100): Promise<Work[]> {
  try {
    const { data, error } = await supabase
      .from('work_details')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all works:', error);
    return [];
  }
}

/**
 * 根据作品 ID 获取作品
 */
export async function getWorkById(workId: number): Promise<Work | null> {
  try {
    const { data, error } = await supabase
      .from('works')
      .select('*')
      .eq('work_id', workId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching work by ID:', error);
    return null;
  }
}

/**
 * 根据创作者地址获取作品
 * 使用 work_details 视图获取包含统计信息的作品
 */
export async function getWorksByCreator(creatorAddress: string): Promise<Work[]> {
  try {
    const { data, error } = await supabase
      .from('work_details')
      .select('*')
      .eq('creator_address', creatorAddress.toLowerCase())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching works by creator:', error);
    return [];
  }
}

/**
 * 获取某作品的直接衍生作品
 */
export async function getDerivativeWorks(parentWorkId: number): Promise<Work[]> {
  try {
    const { data, error } = await supabase
      .from('works')
      .select('*')
      .eq('parent_work_id', parentWorkId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching derivative works:', error);
    return [];
  }
}

/**
 * 创建新作品
 * 通过 API route 调用，使用服务端权限
 */
export async function createWork(workData: {
  workId: number; // 从合约获取
  creatorAddress: string;
  title: string;
  description?: string;
  story?: string;
  imageUrl: string;
  images?: string[]; // 多图片支持
  metadataUri: string;
  material?: string[];
  tags?: string[];
  allowRemix: boolean;
  licenseFee?: string;
  parentWorkId?: number;
  isRemix: boolean;
}): Promise<Work> {
  try {
    const response = await fetch('/api/works/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create work');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating work:', error);
    throw error;
  }
}

/**
 * 更新作品信息
 */
export async function updateWork(
  workId: number,
  updates: Partial<Omit<Work, 'id' | 'work_id' | 'creator_address' | 'created_at'>>
): Promise<Work> {
  try {
    const { data, error } = await supabase
      .from('works')
      .update(updates)
      .eq('work_id', workId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating work:', error);
    throw error;
  }
}

/**
 * 统计作品的直接衍生数量
 */
export async function getRemixCount(workId: number): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('works')
      .select('*', { count: 'exact', head: true })
      .eq('parent_work_id', workId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting remix count:', error);
    return 0;
  }
}

/**
 * 搜索作品
 */
export async function searchWorks(query: string): Promise<Work[]> {
  try {
    const { data, error } = await supabase
      .from('works')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching works:', error);
    return [];
  }
}
