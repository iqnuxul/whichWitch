import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  proxyRegisterOriginalWork,
  proxyRegisterDerivativeWork,
  proxyRequestAuthorization,
  proxyTipCreator,
  proxyWithdraw,
  getUserBalance,
  estimateTransactionCost
} from '../services/transactionService.js';

const router = express.Router();

/**
 * 代理注册原创作品
 * POST /api/transactions/register-original-work
 */
router.post('/register-original-work', authMiddleware, async (req, res) => {
  try {
    const { licenseFee, derivativeAllowed, metadataURI } = req.body;

    if (!licenseFee || derivativeAllowed === undefined || !metadataURI) {
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
router.post('/register-derivative-work', authMiddleware, async (req, res) => {
  try {
    const { parentId, licenseFee, derivativeAllowed, metadataURI } = req.body;

    if (!parentId || !licenseFee || derivativeAllowed === undefined || !metadataURI) {
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
 * 代理请求授权
 * POST /api/transactions/request-authorization
 */
router.post('/request-authorization', authMiddleware, async (req, res) => {
  try {
    const { workId, licenseFee } = req.body;

    if (!workId || !licenseFee) {
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

    const result = await proxyRequestAuthorization(
      req.user.id,
      workId,
      licenseFee
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Request authorization route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * 代理打赏创作者
 * POST /api/transactions/tip-creator
 */
router.post('/tip-creator', authMiddleware, async (req, res) => {
  try {
    const { creatorAddress, amount } = req.body;

    if (!creatorAddress || !amount) {
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

    const result = await proxyTipCreator(
      req.user.id,
      creatorAddress,
      amount
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Tip creator route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * 代理提现
 * POST /api/transactions/withdraw
 */
router.post('/withdraw', authMiddleware, async (req, res) => {
  try {
    if (req.user.loginType !== 'email') {
      return res.status(400).json({
        success: false,
        error: 'Proxy transactions only available for email users'
      });
    }

    const result = await proxyWithdraw(req.user.id);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Withdraw route error:', error);
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
router.get('/balance', authMiddleware, async (req, res) => {
  try {
    if (req.user.loginType !== 'email') {
      return res.status(400).json({
        success: false,
        error: 'Balance check only available for email users'
      });
    }

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
 * 估算交易费用
 * POST /api/transactions/estimate-cost
 */
router.post('/estimate-cost', authMiddleware, async (req, res) => {
  try {
    const { contractAddress, abi, methodName, params, value } = req.body;

    if (!contractAddress || !abi || !methodName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    if (req.user.loginType !== 'email') {
      return res.status(400).json({
        success: false,
        error: 'Cost estimation only available for email users'
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

export default router;