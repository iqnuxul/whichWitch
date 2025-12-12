import express from 'express';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware.js';
import {
  generateWalletCreationAdvice,
  analyzeUserTransactionPattern,
  generateSmartContractAdvice,
  generateCreationAdvice,
  generateWalletManagementAdvice,
  handleUserQuery,
  generateWelcomeMessage,
  assessTransactionRisk
} from '../services/aiService.js';

const router = express.Router();

/**
 * AI助手 - 处理用户查询
 * POST /api/ai/chat
 */
router.post('/chat', optionalAuthMiddleware, async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }

    const userContext = req.user ? {
      userId: req.user.id,
      walletAddress: req.user.walletAddress,
      email: req.user.email,
      loginType: req.user.loginType
    } : {};

    const result = await handleUserQuery(query, userContext);

    if (result.success) {
      res.json({
        success: true,
        response: result.content,
        usage: result.usage
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('AI chat route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * AI助手 - 钱包创建建议
 * POST /api/ai/wallet-advice
 */
router.post('/wallet-advice', async (req, res) => {
  try {
    const { email, preferences } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const result = await generateWalletCreationAdvice(email, preferences || {});

    if (result.success) {
      res.json({
        success: true,
        advice: result.content,
        usage: result.usage
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Wallet advice route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * AI助手 - 交易模式分析
 * POST /api/ai/analyze-transactions
 */
router.post('/analyze-transactions', authMiddleware, async (req, res) => {
  try {
    const { transactionHistory } = req.body;

    if (!transactionHistory) {
      return res.status(400).json({
        success: false,
        error: 'Transaction history is required'
      });
    }

    const result = await analyzeUserTransactionPattern(
      req.user.walletAddress,
      transactionHistory
    );

    if (result.success) {
      res.json({
        success: true,
        analysis: result.content,
        usage: result.usage
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Transaction analysis route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * AI助手 - 智能合约交互建议
 * POST /api/ai/contract-advice
 */
router.post('/contract-advice', authMiddleware, async (req, res) => {
  try {
    const { contractFunction, parameters } = req.body;

    if (!contractFunction) {
      return res.status(400).json({
        success: false,
        error: 'Contract function is required'
      });
    }

    const userContext = {
      userId: req.user.id,
      walletAddress: req.user.walletAddress,
      loginType: req.user.loginType
    };

    const result = await generateSmartContractAdvice(
      contractFunction,
      parameters || {},
      userContext
    );

    if (result.success) {
      res.json({
        success: true,
        advice: result.content,
        usage: result.usage
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Contract advice route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * AI助手 - 创作建议
 * POST /api/ai/creation-advice
 */
router.post('/creation-advice', authMiddleware, async (req, res) => {
  try {
    const { workType, parentWork } = req.body;

    if (!workType) {
      return res.status(400).json({
        success: false,
        error: 'Work type is required'
      });
    }

    const userProfile = {
      userId: req.user.id,
      walletAddress: req.user.walletAddress,
      email: req.user.email,
      loginType: req.user.loginType
    };

    const result = await generateCreationAdvice(
      workType,
      parentWork || {},
      userProfile
    );

    if (result.success) {
      res.json({
        success: true,
        advice: result.content,
        usage: result.usage
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Creation advice route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * AI助手 - 钱包管理建议
 * GET /api/ai/wallet-management
 */
router.get('/wallet-management', authMiddleware, async (req, res) => {
  try {
    if (req.user.loginType !== 'email') {
      return res.status(400).json({
        success: false,
        error: 'Wallet management advice only available for email users'
      });
    }

    // 这里可以从数据库获取用户的实际余额和活跃度
    const balance = '0.0'; // 实际应该从区块链查询
    const activityLevel = 'medium'; // 实际应该从用户行为分析

    const result = await generateWalletManagementAdvice(
      req.user.walletAddress,
      balance,
      activityLevel
    );

    if (result.success) {
      res.json({
        success: true,
        advice: result.content,
        usage: result.usage
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Wallet management route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * AI助手 - 交易风险评估
 * POST /api/ai/assess-risk
 */
router.post('/assess-risk', authMiddleware, async (req, res) => {
  try {
    const { transactionType, amount } = req.body;

    if (!transactionType || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Transaction type and amount are required'
      });
    }

    // 这里可以从数据库获取用户的历史交易记录
    const userHistory = {
      totalTransactions: 0,
      averageAmount: '0',
      lastTransactionDate: null
    };

    const result = await assessTransactionRisk(
      transactionType,
      amount,
      userHistory
    );

    if (result.success) {
      res.json({
        success: true,
        assessment: result.content,
        usage: result.usage
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Risk assessment route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * AI助手 - 生成欢迎消息
 * POST /api/ai/welcome-message
 */
router.post('/welcome-message', async (req, res) => {
  try {
    const { email, walletAddress, isNewUser } = req.body;

    if (!email || !walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Email and wallet address are required'
      });
    }

    const result = await generateWelcomeMessage(
      email,
      walletAddress,
      isNewUser !== false
    );

    if (result.success) {
      res.json({
        success: true,
        message: result.content,
        usage: result.usage
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Welcome message route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;