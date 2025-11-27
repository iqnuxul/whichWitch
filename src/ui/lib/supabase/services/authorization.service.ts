import { supabase } from '../client';
import type { AuthorizationRequest } from '../client';

/**
 * 授权服务 - 处理二创授权请求
 */

export type AuthorizationStatus = 'pending' | 'approved' | 'rejected' | 'failed';

/**
 * 创建授权请求
 */
export async function createAuthorizationRequest(
  userAddress: string,
  workId: number
): Promise<AuthorizationRequest> {
  try {
    const { data, error } = await supabase
      .from('authorization_requests')
      .insert({
        user_address: userAddress.toLowerCase(),
        work_id: workId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating authorization request:', error);
    throw error;
  }
}

/**
 * 获取用户对某作品的授权状态
 */
export async function getAuthorizationStatus(
  userAddress: string,
  workId: number
): Promise<AuthorizationStatus | null> {
  try {
    const { data, error } = await supabase
      .from('authorization_requests')
      .select('status')
      .eq('user_address', userAddress.toLowerCase())
      .eq('work_id', workId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 没有授权请求记录
        return null;
      }
      throw error;
    }

    return data.status as AuthorizationStatus;
  } catch (error) {
    console.error('Error getting authorization status:', error);
    return null;
  }
}

/**
 * 更新授权请求状态
 */
export async function updateAuthorizationStatus(
  userAddress: string,
  workId: number,
  status: AuthorizationStatus,
  txHash?: string,
  errorMessage?: string
): Promise<AuthorizationRequest> {
  try {
    // 先查询最新的授权请求
    const { data: latestRequest, error: queryError } = await supabase
      .from('authorization_requests')
      .select('id')
      .eq('user_address', userAddress.toLowerCase())
      .eq('work_id', workId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (queryError) {
      // 如果没有找到记录，创建一个新的
      if (queryError.code === 'PGRST116') {
        const { data: newData, error: insertError } = await supabase
          .from('authorization_requests')
          .insert({
            user_address: userAddress.toLowerCase(),
            work_id: workId,
            status,
            tx_hash: txHash || null,
            error_message: errorMessage || null,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newData;
      }
      throw queryError;
    }

    // 更新找到的记录
    const { data, error } = await supabase
      .from('authorization_requests')
      .update({
        status,
        tx_hash: txHash || null,
        error_message: errorMessage || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', latestRequest.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating authorization status:', error);
    throw error;
  }
}

/**
 * 获取用户的所有授权请求
 */
export async function getUserAuthorizationRequests(
  userAddress: string
): Promise<AuthorizationRequest[]> {
  try {
    const { data, error } = await supabase
      .from('authorization_requests')
      .select('*')
      .eq('user_address', userAddress.toLowerCase())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user authorization requests:', error);
    return [];
  }
}

/**
 * 获取用户收藏作品的授权状态映射
 * 返回 { workId: status } 的对象
 */
export async function getUserCollectionAuthStatuses(
  userAddress: string,
  workIds: number[]
): Promise<Record<number, AuthorizationStatus | 'none'>> {
  if (workIds.length === 0) return {};

  try {
    const { data, error } = await supabase
      .from('authorization_requests')
      .select('work_id, status, created_at')
      .eq('user_address', userAddress.toLowerCase())
      .in('work_id', workIds)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 创建状态映射
    const statusMap: Record<number, AuthorizationStatus | 'none'> = {};
    
    // 初始化所有作品为 'none'
    workIds.forEach(id => {
      statusMap[id] = 'none';
    });

    // 更新有授权请求的作品状态（只取每个作品的最新记录）
    if (data) {
      const seenWorkIds = new Set<number>();
      data.forEach(req => {
        if (!seenWorkIds.has(req.work_id)) {
          statusMap[req.work_id] = req.status as AuthorizationStatus;
          seenWorkIds.add(req.work_id);
        }
      });
    }

    return statusMap;
  } catch (error) {
    console.error('Error fetching collection auth statuses:', error);
    return {};
  }
}

/**
 * 删除授权请求（用于重试）
 */
export async function deleteAuthorizationRequest(
  userAddress: string,
  workId: number
): Promise<void> {
  try {
    const { error } = await supabase
      .from('authorization_requests')
      .delete()
      .eq('user_address', userAddress.toLowerCase())
      .eq('work_id', workId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting authorization request:', error);
    throw error;
  }
}
