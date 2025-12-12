import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  proxyListNFT,
  proxyBuyNFT,
  proxyMakeOffer,
  proxyAcceptOffer,
  proxyCancelListing,
  initiateCrossChainPayment,
  getListingInfo,
  getListingOffers,
  getUserListings
} from '../services/marketplaceService.js';
import { supabase } from '../utils/supabaseClient.js';

const router = express.Router();

/**
 * 挂单NFT
 * POST /api/marketplace/list
 */
router.post('/list', authMiddleware, async (req, res) => {
  try {
    const { nftContract, tokenId, price, listingType, duration, allowCrossChain } = req.body;

    if (!nftContract || !tokenId || !price || listingType === undefined || !duration) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // 只有邮箱登录用户才能使用代理交易
    if (req.user.loginType !== 'email') {
      return res.status(400).json({
        success: false,
        error: 'Proxy transactions only available for email users'
      });
    }

    const result = await proxyListNFT(
      req.user.id,
      nftContract,
      tokenId,
      price,
      listingType,
      duration,
      allowCrossChain || false
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('List NFT route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * 购买NFT
 * POST /api/marketplace/buy
 */
router.post('/buy', authMiddleware, async (req, res) => {
  try {
    const { listingId, price } = req.body;

    if (!listingId || !price) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    if (req.user.loginType !== 'email') {
      return res.status(400).json({
        success: false,
        error: 'Proxy transactions only available for email users'
      });
    }

    const result = await proxyBuyNFT(req.user.id, listingId, price);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Buy NFT route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * 出价
 * POST /api/marketplace/offer
 */
router.post('/offer', authMiddleware, async (req, res) => {
  try {
    const { listingId, amount, duration, sourceChain } = req.body;

    if (!listingId || !amount || !duration) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    if (req.user.loginType !== 'email') {
      return res.status(400).json({
        success: false,
        error: 'Proxy transactions only available for email users'
      });
    }

    const result = await proxyMakeOffer(
      req.user.id,
      listingId,
      amount,
      duration,
      sourceChain || 'native'
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Make offer route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * 接受出价
 * POST /api/marketplace/accept-offer
 */
router.post('/accept-offer', authMiddleware, async (req, res) => {
  try {
    const { listingId, offerIndex } = req.body;

    if (!listingId || offerIndex === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    if (req.user.loginType !== 'email') {
      return res.status(400).json({
        success: false,
        error: 'Proxy transactions only available for email users'
      });
    }

    const result = await proxyAcceptOffer(req.user.id, listingId, offerIndex);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Accept offer route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * 取消挂单
 * POST /api/marketplace/cancel
 */
router.post('/cancel', authMiddleware, async (req, res) => {
  try {
    const { listingId } = req.body;

    if (!listingId) {
      return res.status(400).json({
        success: false,
        error: 'Missing listing ID'
      });
    }

    if (req.user.loginType !== 'email') {
      return res.status(400).json({
        success: false,
        error: 'Proxy transactions only available for email users'
      });
    }

    const result = await proxyCancelListing(req.user.id, listingId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Cancel listing route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * 发起跨链支付
 * POST /api/marketplace/cross-chain-payment
 */
router.post('/cross-chain-payment', authMiddleware, async (req, res) => {
  try {
    const { sourceChain, destinationChain, recipient, listingId, amount } = req.body;

    if (!sourceChain || !destinationChain || !recipient || !listingId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    if (req.user.loginType !== 'email') {
      return res.status(400).json({
        success: false,
        error: 'Cross-chain payments only available for email users'
      });
    }

    const result = await initiateCrossChainPayment(
      req.user.id,
      sourceChain,
      destinationChain,
      recipient,
      listingId,
      amount
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Cross-chain payment route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * 获取挂单信息
 * GET /api/marketplace/listing/:id
 */
router.get('/listing/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await getListingInfo(id);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Get listing route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * 获取挂单的出价
 * GET /api/marketplace/listing/:id/offers
 */
router.get('/listing/:id/offers', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await getListingOffers(id);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Get listing offers route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * 获取用户的挂单
 * GET /api/marketplace/user/:address/listings
 */
router.get('/user/:address/listings', async (req, res) => {
  try {
    const { address } = req.params;

    const result = await getUserListings(address);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Get user listings route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * 获取市场统计数据
 * GET /api/marketplace/stats
 */
router.get('/stats', async (req, res) => {
  try {
    // 从数据库获取统计数据
    const { data: listings, error: listingsError } = await supabase
      .from('nft_listings')
      .select('*');

    const { data: sales, error: salesError } = await supabase
      .from('nft_sales')
      .select('*');

    if (listingsError || salesError) {
      throw new Error('Database query failed');
    }

    const stats = {
      totalListings: listings?.length || 0,
      activeListings: listings?.filter(l => l.status === 'active').length || 0,
      totalSales: sales?.length || 0,
      totalVolume: sales?.reduce((sum, sale) => sum + parseFloat(sale.price), 0) || 0
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get marketplace stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * 搜索NFT
 * GET /api/marketplace/search
 */
router.get('/search', async (req, res) => {
  try {
    const { 
      query, 
      listingType, 
      minPrice, 
      maxPrice, 
      status = 'active',
      page = 1, 
      limit = 20 
    } = req.query;

    let dbQuery = supabase
      .from('nft_listings')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (listingType) {
      dbQuery = dbQuery.eq('listing_type', listingType);
    }

    if (minPrice) {
      dbQuery = dbQuery.gte('price', minPrice);
    }

    if (maxPrice) {
      dbQuery = dbQuery.lte('price', maxPrice);
    }

    const { data, error } = await dbQuery;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      listings: data || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: data?.length || 0
      }
    });
  } catch (error) {
    console.error('Search NFT route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;