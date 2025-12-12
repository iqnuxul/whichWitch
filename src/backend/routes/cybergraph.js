import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  syncContentToCyberGraph,
  batchSyncContent,
  updateCreatorProfileToCyberGraph,
  createSocialRelationToCyberGraph,
  getCyberGraphSocialGraph,
  searchCyberGraphContent
} from '../services/cyberGraphService.js';
import { supabase } from '../utils/supabaseClient.js';

const router = express.Router();

/**
 * 同步作品到CyberGraph
 * POST /api/cybergraph/sync-work
 */
router.post('/sync-work', authMiddleware, async (req, res) => {
  try {
    const { 
      workId, 
      contentType, 
      contentHash, 
      title, 
      description, 
      tags, 
      category,
      socialConnections 
    } = req.body;

    if (!workId || !contentType || !contentHash) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // 准备同步数据
    const syncData = {
      syncId: Date.now(), // 临时ID，实际应该从合约事件获取
      workId,
      contentType,
      contentHash,
      title: title || `Work #${workId}`,
      description: description || '',
      creator: req.user.walletAddress,
      creatorHandle: req.user.email?.split('@')[0] || req.user.walletAddress.slice(0, 8),
      tags: tags || [],
      category: category || 'art',
      socialConnections: socialConnections || [],
      metadata: JSON.stringify({
        platform: 'whichWitch',
        workId,
        creator: req.user.walletAddress,
        timestamp: new Date().toISOString()
      })
    };

    const result = await syncContentToCyberGraph(syncData);

    if (result.success) {
      res.json({
        success: true,
        cyberGraphId: result.cyberGraphId,
        url: result.url,
        message: 'Content synced to CyberGraph successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Sync work to CyberGraph route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * 批量同步作品到CyberGraph
 * POST /api/cybergraph/batch-sync
 */
router.post('/batch-sync', authMiddleware, async (req, res) => {
  try {
    const { works } = req.body;

    if (!works || !Array.isArray(works) || works.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Works array is required'
      });
    }

    // 准备批量同步数据
    const syncDataArray = works.map((work, index) => ({
      syncId: Date.now() + index,
      workId: work.workId,
      contentType: work.contentType || 'original_work',
      contentHash: work.contentHash,
      title: work.title || `Work #${work.workId}`,
      description: work.description || '',
      creator: req.user.walletAddress,
      creatorHandle: req.user.email?.split('@')[0] || req.user.walletAddress.slice(0, 8),
      tags: work.tags || [],
      category: work.category || 'art',
      socialConnections: work.socialConnections || [],
      metadata: JSON.stringify({
        platform: 'whichWitch',
        workId: work.workId,
        creator: req.user.walletAddress,
        timestamp: new Date().toISOString()
      })
    }));

    const results = await batchSyncContent(syncDataArray);

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    res.json({
      success: true,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount
      }
    });
  } catch (error) {
    console.error('Batch sync to CyberGraph route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * 更新创作者档案到CyberGraph
 * POST /api/cybergraph/update-profile
 */
router.post('/update-profile', authMiddleware, async (req, res) => {
  try {
    const { 
      cyberGraphHandle, 
      bio, 
      avatar, 
      website, 
      social 
    } = req.body;

    if (!cyberGraphHandle) {
      return res.status(400).json({
        success: false,
        error: 'CyberGraph handle is required'
      });
    }

    const profileData = {
      address: req.user.walletAddress,
      cyberGraphHandle,
      bio: bio || '',
      avatar: avatar || '',
      website: website || '',
      social: social || {},
      isVerified: false
    };

    const result = await updateCreatorProfileToCyberGraph(profileData);

    if (result.success) {
      res.json({
        success: true,
        profile: result.profile,
        message: 'Profile updated on CyberGraph successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Update profile to CyberGraph route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * 创建社交关系到CyberGraph
 * POST /api/cybergraph/follow
 */
router.post('/follow', authMiddleware, async (req, res) => {
  try {
    const { followingAddress, relationshipType } = req.body;

    if (!followingAddress) {
      return res.status(400).json({
        success: false,
        error: 'Following address is required'
      });
    }

    const relationData = {
      follower: req.user.walletAddress,
      following: followingAddress,
      relationshipType: relationshipType || 0, // 0 = follow
      metadata: {
        platform: 'whichWitch',
        timestamp: new Date().toISOString()
      }
    };

    const result = await createSocialRelationToCyberGraph(relationData);

    if (result.success) {
      res.json({
        success: true,
        relationId: result.relationId,
        message: 'Social relation created on CyberGraph successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Create social relation to CyberGraph route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * 获取创作者的CyberGraph社交图谱
 * GET /api/cybergraph/social-graph/:address
 */
router.get('/social-graph/:address', async (req, res) => {
  try {
    const { address } = req.params;

    const result = await getCyberGraphSocialGraph(address);

    if (result.success) {
      res.json({
        success: true,
        socialGraph: result.socialGraph
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Get CyberGraph social graph route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * 在CyberGraph上搜索内容
 * GET /api/cybergraph/search
 */
router.get('/search', async (req, res) => {
  try {
    const { 
      q: query, 
      type, 
      creator, 
      tags, 
      page = 1, 
      limit = 20 
    } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const filters = {
      type,
      creator,
      tags: tags ? tags.split(',') : undefined,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await searchCyberGraphContent(query, filters);

    if (result.success) {
      res.json({
        success: true,
        results: result.results,
        total: result.total,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.total
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Search CyberGraph content route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * 获取用户的CyberGraph同步状态
 * GET /api/cybergraph/sync-status
 */
router.get('/sync-status', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cybergraph_syncs')
      .select('*')
      .eq('creator_address', req.user.walletAddress)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const stats = {
      total: data.length,
      synced: data.filter(s => s.status === 'synced').length,
      pending: data.filter(s => s.status === 'pending').length,
      failed: data.filter(s => s.status === 'failed').length
    };

    res.json({
      success: true,
      syncs: data,
      stats
    });
  } catch (error) {
    console.error('Get sync status route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * 获取CyberGraph热门内容
 * GET /api/cybergraph/trending
 */
router.get('/trending', async (req, res) => {
  try {
    const { 
      category, 
      timeframe = '24h', 
      limit = 20 
    } = req.query;

    const { data, error } = await supabase
      .from('cybergraph_content_discovery')
      .select('*')
      .order('trending_score', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      trending: data || [],
      timeframe,
      category
    });
  } catch (error) {
    console.error('Get trending content route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;