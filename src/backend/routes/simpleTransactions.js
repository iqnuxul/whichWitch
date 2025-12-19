const express = require('express');
const {
  proxyRegisterOriginalWork,
  proxyRegisterDerivativeWork,
  getUserBalance,
  getUserWorks,
  estimateTransactionCost
} = require('../services/simpleTransactionService');

const router = express.Router();

// 简化的认证中间件（不依赖数据库）
function simpleAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'No token provided'
    });
  }

  // 简单的token解析（实际应该验证JWT）
  const token = authHeader.substring(7);
  
  // 模拟用户信息
  req.user = {
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    loginType: 'email' // 假设都是邮箱用户
  };
  
  next();
}

/**
 * 代理注册原创作品
 * POST /api/transactions/register-original-work
 */
router.post('/register-original-work', simpleAuthMiddleware, async (req, res) => {
  try {
    const { licenseFee, derivativeAllowed, metadataURI } = req.body;

    if (!licenseFee || derivativeAllowed === undefined || !metadataURI) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await proxyRegisterOriginalWork(
      req.user.id,
      licenseFee,
      derivativeAllowed,
      metadataURI
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Register original work route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * 代理注册衍生作品
 * POST /api/transactions/register-derivative-work
 */
router.post('/register-derivative-work', simpleAuthMiddleware, async (req, res) => {
  try {
    const { parentId, licenseFee, derivativeAllowed, metadataURI } = req.body;

    if (!parentId || !licenseFee || derivativeAllowed === undefined || !metadataURI) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await proxyRegisterDerivativeWork(
      req.user.id,
      parentId,
      licenseFee,
      derivativeAllowed,
      metadataURI
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Register derivative work route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * 获取用户余额
 * GET /api/transactions/balance
 */
router.get('/balance', simpleAuthMiddleware, async (req, res) => {
  try {
    const result = await getUserBalance(req.user.id);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Get balance route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * 获取用户作品
 * GET /api/transactions/works
 */
router.get('/works', simpleAuthMiddleware, async (req, res) => {
  try {
    const result = await getUserWorks(req.user.id);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Get works route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * 估算交易费用
 * POST /api/transactions/estimate-cost
 */
router.post('/estimate-cost', simpleAuthMiddleware, async (req, res) => {
  try {
    const { contractAddress, abi, methodName, params, value } = req.body;

    if (!contractAddress || !abi || !methodName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await estimateTransactionCost(
      req.user.id,
      contractAddress,
      abi,
      methodName,
      params || [],
      value || '0'
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Estimate cost route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;