// Vercel serverless function entry point
require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const blockchainRoutes = require('../src/backend/routes/blockchain');
const aiRoutes = require('../src/backend/routes/ai');
const authRoutes = require('../src/backend/routes/auth');
const uploadRoutes = require('../src/backend/routes/upload');
const transactionRoutes = require('../src/backend/routes/simpleTransactions');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'whichWitch API is running',
    timestamp: new Date().toISOString(),
    network: 'ZetaChain Testnet',
    contracts: {
      CreationManager: process.env.CREATION_MANAGER_ADDRESS,
      NFTManager: process.env.NFT_MANAGER_ADDRESS,
      NFTMarketplace: process.env.MARKETPLACE_ADDRESS,
      PaymentManager: process.env.PAYMENT_MANAGER_ADDRESS,
      AuthorizationManager: process.env.AUTHORIZATION_MANAGER_ADDRESS,
      ZetaChainBridge: process.env.ZETA_BRIDGE_ADDRESS
    }
  });
});

// Auth routes are now handled by authRoutes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server for local development
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 whichWitch API server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🤖 AI endpoints: http://localhost:${PORT}/api/ai`);
    console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
    console.log(`⛓️ Blockchain endpoints: http://localhost:${PORT}/api/blockchain`);
  });
}

// Export for Vercel
module.exports = app;