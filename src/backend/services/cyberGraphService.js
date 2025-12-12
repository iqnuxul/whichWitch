import axios from 'axios';
import { ethers } from 'ethers';
import { supabase } from '../utils/supabaseClient.js';

// CyberGraph API配置
const CYBERGRAPH_API_URL = process.env.CYBERGRAPH_API_URL || 'https://api.cybergraph.xyz';
const CYBERGRAPH_API_KEY = process.env.CYBERGRAPH_API_KEY || 'demo_key';

// 环境变量验证
if (!process.env.CYBERGRAPH_API_KEY && process.env.NODE_ENV === 'production') {
  console.warn('Warning: CYBERGRAPH_API_KEY not set in production');
}

// 合约ABI
const CYBERGRAPH_SYNC_ABI = [
  "function confirmCyberGraphSync(uint256 syncId, string calldata cyberGraphId) external",
  "function markSyncFailed(uint256 syncId, string calldata reason) external"
];

/**
 * CyberGraph API客户端
 */
class CyberGraphClient {
  constructor() {
    this.apiClient = axios.create({
      baseURL: CYBERGRAPH_API_URL,
      headers: {
        'Authorization': `Bearer ${CYBERGRAPH_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // 添加响应拦截器处理错误
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('CyberGraph API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * 创建内容到CyberGraph
   */
  async createContent(contentData) {
    try {
      const response = await this.apiClient.post('/content', {
        type: contentData.contentType,
        title: contentData.title,
        description: contentData.description,
        contentHash: contentData.contentHash,
        metadata: JSON.parse(contentData.metadata || '{}'),
        creator: {
          address: contentData.creator,
          handle: contentData.creatorHandle
        },
        socialConnections: JSON.parse(contentData.socialConnections || '[]'),
        tags: contentData.tags || [],
        category: contentData.category || 'art'
      });

      return {
        success: true,
        cyberGraphId: response.data.id,
        url: response.data.url
      };
    } catch (error) {
      console.error('CyberGraph create content error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * 更新创作者档案
   */
  async updateCreatorProfile(profileData) {
    try {
      const response = await this.apiClient.put(`/creators/${profileData.address}`, {
        handle: profileData.cyberGraphHandle,
        bio: profileData.bio,
        avatar: profileData.avatar,
        website: profileData.website,
        social: profileData.social || {},
        verified: profileData.isVerified || false
      });

      return {
        success: true,
        profile: response.data
      };
    } catch (error) {
      console.error('CyberGraph update profile error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * 创建社交关系
   */
  async createSocialRelation(relationData) {
    try {
      const response = await this.apiClient.post('/social/relations', {
        follower: relationData.follower,
        following: relationData.following,
        type: this.getRelationType(relationData.relationshipType),
        metadata: relationData.metadata || {}
      });

      return {
        success: true,
        relationId: response.data.id
      };
    } catch (error) {
      console.error('CyberGraph create relation error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * 获取创作者的社交图谱
   */
  async getCreatorSocialGraph(creatorAddress) {
    try {
      const response = await this.apiClient.get(`/creators/${creatorAddress}/social-graph`);
      
      return {
        success: true,
        socialGraph: response.data
      };
    } catch (error) {
      console.error('CyberGraph get social graph error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * 搜索内容
   */
  async searchContent(query, filters = {}) {
    try {
      const response = await this.apiClient.get('/content/search', {
        params: {
          q: query,
          ...filters
        }
      });

      return {
        success: true,
        results: response.data.results,
        total: response.data.total
      };
    } catch (error) {
      console.error('CyberGraph search error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * 获取关系类型字符串
   */
  getRelationType(relationshipType) {
    switch (relationshipType) {
      case 0: return 'follow';
      case 1: return 'collaborate';
      case 2: return 'derivative';
      default: return 'follow';
    }
  }
}

// 创建CyberGraph客户端实例
const cyberGraphClient = new CyberGraphClient();

/**
 * 处理内容同步到CyberGraph
 */
export async function syncContentToCyberGraph(syncData) {
  try {
    // 准备内容数据
    const contentData = {
      contentType: syncData.contentType,
      title: syncData.title || `Work #${syncData.workId}`,
      description: syncData.description || '',
      contentHash: syncData.contentHash,
      metadata: syncData.metadata,
      creator: syncData.creator,
      creatorHandle: syncData.creatorHandle,
      socialConnections: syncData.socialConnections,
      tags: syncData.tags,
      category: syncData.category
    };

    // 调用CyberGraph API创建内容
    const result = await cyberGraphClient.createContent(contentData);

    if (result.success) {
      // 确认同步成功
      await confirmSyncSuccess(syncData.syncId, result.cyberGraphId);
      
      // 保存到数据库
      await saveSyncRecord(syncData.syncId, result.cyberGraphId, 'synced');
      
      return {
        success: true,
        cyberGraphId: result.cyberGraphId,
        url: result.url
      };
    } else {
      // 标记同步失败
      await markSyncFailed(syncData.syncId, result.error);
      await saveSyncRecord(syncData.syncId, null, 'failed', result.error);
      
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    console.error('Sync content to CyberGraph error:', error);
    await markSyncFailed(syncData.syncId, error.message);
    await saveSyncRecord(syncData.syncId, null, 'failed', error.message);
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 确认同步成功（调用智能合约）
 */
async function confirmSyncSuccess(syncId, cyberGraphId) {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.CYBERGRAPH_RELAY_PRIVATE_KEY, provider);
    
    const contract = new ethers.Contract(
      process.env.CYBERGRAPH_SYNC_ADDRESS,
      CYBERGRAPH_SYNC_ABI,
      wallet
    );

    const tx = await contract.confirmCyberGraphSync(syncId, cyberGraphId);
    await tx.wait();
    
    console.log(`Sync confirmed for syncId: ${syncId}, cyberGraphId: ${cyberGraphId}`);
  } catch (error) {
    console.error('Confirm sync success error:', error);
    throw error;
  }
}

/**
 * 标记同步失败（调用智能合约）
 */
async function markSyncFailed(syncId, reason) {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.CYBERGRAPH_RELAY_PRIVATE_KEY, provider);
    
    const contract = new ethers.Contract(
      process.env.CYBERGRAPH_SYNC_ADDRESS,
      CYBERGRAPH_SYNC_ABI,
      wallet
    );

    const tx = await contract.markSyncFailed(syncId, reason);
    await tx.wait();
    
    console.log(`Sync failed for syncId: ${syncId}, reason: ${reason}`);
  } catch (error) {
    console.error('Mark sync failed error:', error);
    throw error;
  }
}

/**
 * 保存同步记录到数据库
 */
async function saveSyncRecord(syncId, cyberGraphId, status, error = null) {
  try {
    const { error: dbError } = await supabase
      .from('cybergraph_syncs')
      .upsert({
        sync_id: syncId,
        cybergraph_id: cyberGraphId,
        status: status,
        error_message: error,
        synced_at: status === 'synced' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('Save sync record error:', dbError);
    }
  } catch (error) {
    console.error('Save sync record error:', error);
  }
}

/**
 * 批量同步内容
 */
export async function batchSyncContent(syncDataArray) {
  const results = [];
  
  for (const syncData of syncDataArray) {
    try {
      const result = await syncContentToCyberGraph(syncData);
      results.push({
        syncId: syncData.syncId,
        ...result
      });
      
      // 添加延迟避免API限制
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      results.push({
        syncId: syncData.syncId,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

/**
 * 更新创作者档案到CyberGraph
 */
export async function updateCreatorProfileToCyberGraph(profileData) {
  try {
    const result = await cyberGraphClient.updateCreatorProfile(profileData);
    
    if (result.success) {
      // 保存到数据库
      await supabase
        .from('creator_profiles_cybergraph')
        .upsert({
          creator_address: profileData.address,
          cybergraph_handle: profileData.cyberGraphHandle,
          profile_data: JSON.stringify(result.profile),
          updated_at: new Date().toISOString()
        });
    }
    
    return result;
  } catch (error) {
    console.error('Update creator profile to CyberGraph error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 创建社交关系到CyberGraph
 */
export async function createSocialRelationToCyberGraph(relationData) {
  try {
    const result = await cyberGraphClient.createSocialRelation(relationData);
    
    if (result.success) {
      // 保存到数据库
      await supabase
        .from('social_relations_cybergraph')
        .insert({
          follower_address: relationData.follower,
          following_address: relationData.following,
          relationship_type: relationData.relationshipType,
          cybergraph_relation_id: result.relationId,
          created_at: new Date().toISOString()
        });
    }
    
    return result;
  } catch (error) {
    console.error('Create social relation to CyberGraph error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 获取CyberGraph上的社交图谱
 */
export async function getCyberGraphSocialGraph(creatorAddress) {
  try {
    return await cyberGraphClient.getCreatorSocialGraph(creatorAddress);
  } catch (error) {
    console.error('Get CyberGraph social graph error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 在CyberGraph上搜索内容
 */
export async function searchCyberGraphContent(query, filters = {}) {
  try {
    return await cyberGraphClient.searchContent(query, filters);
  } catch (error) {
    console.error('Search CyberGraph content error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export { cyberGraphClient };