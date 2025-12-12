import { validateSession } from '../services/authService.js';

/**
 * 认证中间件
 * 验证JWT token并设置req.user
 */
export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const token = authHeader.substring(7); // 移除 'Bearer ' 前缀
    
    const validation = await validateSession(token);
    
    if (!validation.valid) {
      return res.status(401).json({
        success: false,
        error: validation.error || 'Invalid token'
      });
    }

    req.user = validation.user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * 可选认证中间件
 * 如果有token则验证，没有token则继续
 */
export async function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const validation = await validateSession(token);
    
    if (validation.valid) {
      req.user = validation.user;
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // 继续执行，不阻塞请求
  }
}