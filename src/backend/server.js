import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import aiRoutes from './routes/ai.js';
import marketplaceRoutes from './routes/marketplace.js';
import cybergraphRoutes from './routes/cybergraph.js';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'whichWitch-backend'
  });
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/marketplace', marketplaceRoutes);
if (process.env.ENABLE_CYBERGRAPH === 'true') {
  app.use('/api/cybergraph', cybergraphRoutes);
} else {
  console.warn('CyberGraph routes disabled: ENABLE_CYBERGRAPH is not true');
}

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// 全局错误处理
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 whichWitch backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`💰 Transaction endpoints: http://localhost:${PORT}/api/transactions`);
  console.log(`🤖 AI Assistant endpoints: http://localhost:${PORT}/api/ai`);
  console.log(`🛒 NFT Marketplace endpoints: http://localhost:${PORT}/api/marketplace`);
  console.log(`🌐 CyberGraph endpoints: http://localhost:${PORT}/api/cybergraph`);
});

export default app;
