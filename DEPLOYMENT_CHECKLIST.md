# 部署检查清单

## 🚀 部署前准备

### 1. 环境配置
- [ ] 配置 `.env` 文件（后端）
- [ ] 配置 `.env.local` 文件（前端）
- [ ] 设置 ZetaChain 测试网 RPC
- [ ] 准备部署钱包私钥
- [ ] 确保钱包有足够的 ZETA 代币

### 2. 依赖检查
- [ ] 运行 `npm install` 安装根目录依赖
- [ ] 运行 `cd src/ui && npm install` 安装前端依赖
- [ ] 检查 Hardhat 配置
- [ ] 验证合约编译 `npm run compile`

### 3. 代码检查
- [ ] 所有 TypeScript 错误已修复
- [ ] 所有 Solidity 合约编译通过
- [ ] API 路由正确配置
- [ ] 前后端接口匹配

## 🔗 智能合约部署

### 1. ZetaChain 测试网部署
```bash
# 部署所有合约
npm run deploy:zeta

# 或者手动部署
npx hardhat run scripts/deploy-zeta.js --network zeta_testnet
```

### 2. 验证部署
- [ ] 所有合约部署成功
- [ ] 合约地址已记录
- [ ] 合约关系配置完成
- [ ] 保存部署信息 JSON 文件

### 3. 合约验证（可选）
```bash
npx hardhat verify --network zeta_testnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## 🌐 前端部署 (Vercel)

### 1. Vercel 项目设置
- [ ] 连接 GitHub 仓库
- [ ] 设置构建命令: `cd src/ui && npm run build`
- [ ] 设置输出目录: `src/ui/.next`
- [ ] 设置 Node.js 版本: 18.x

### 2. 环境变量配置
在 Vercel 项目设置中添加：
```
NEXT_PUBLIC_API_URL=https://your-app.vercel.app
NEXT_PUBLIC_CHAIN_ID=7001
NEXT_PUBLIC_NFT_MANAGER_ADDRESS=<部署后的地址>
NEXT_PUBLIC_MARKETPLACE_ADDRESS=<部署后的地址>
NEXT_PUBLIC_INFURA_KEY=<你的Infura密钥>
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=<你的WalletConnect项目ID>
```

### 3. 后端 API 配置
在 Vercel 项目设置中添加后端环境变量：
```
NODE_ENV=production
RPC_URL=https://rpc.ankr.com/zetachain_evm_testnet
CREATION_MANAGER_ADDRESS=<部署后的地址>
AUTHORIZATION_MANAGER_ADDRESS=<部署后的地址>
PAYMENT_MANAGER_ADDRESS=<部署后的地址>
NFT_MANAGER_ADDRESS=<部署后的地址>
MARKETPLACE_ADDRESS=<部署后的地址>
ZETA_BRIDGE_ADDRESS=<部署后的地址>
CYBERGRAPH_SYNC_ADDRESS=<部署后的地址>
SUPABASE_URL=<你的Supabase URL>
SUPABASE_SERVICE_KEY=<你的Supabase服务密钥>
JWT_SECRET=<随机生成的JWT密钥>
ENCRYPTION_KEY=<32字节加密密钥>
CYBERGRAPH_API_KEY=<CyberGraph API密钥>
CYBERGRAPH_RELAY_PRIVATE_KEY=<中继服务私钥>
```

## 📊 数据库设置 (Supabase)

### 1. 创建 Supabase 项目
- [ ] 注册 Supabase 账户
- [ ] 创建新项目
- [ ] 获取项目 URL 和 API 密钥

### 2. 运行数据库迁移
- [ ] 复制 `src/backend/database/schema.sql` 内容
- [ ] 在 Supabase SQL 编辑器中执行
- [ ] 验证所有表创建成功
- [ ] 检查 RLS 策略设置

### 3. 配置认证
- [ ] 启用邮箱认证
- [ ] 配置 SMTP 设置（可选）
- [ ] 设置重定向 URL

## 🧪 部署后测试

### 1. 基础功能测试
- [ ] 网站可以正常访问
- [ ] 钱包连接功能正常
- [ ] 邮箱登录功能正常
- [ ] API 接口响应正常

### 2. 智能合约测试
- [ ] 作品注册功能
- [ ] NFT 铸造功能
- [ ] 授权购买功能
- [ ] 市场交易功能
- [ ] CyberGraph 同步功能

### 3. 集成测试
- [ ] 前后端数据同步
- [ ] 区块链事件监听
- [ ] 邮件发送功能
- [ ] AI 助手功能

## 🔧 故障排除

### 常见问题
1. **合约部署失败**
   - 检查钱包余额
   - 验证网络配置
   - 检查 gas 设置

2. **前端构建失败**
   - 检查 TypeScript 错误
   - 验证环境变量
   - 检查依赖版本

3. **API 调用失败**
   - 检查 CORS 设置
   - 验证环境变量
   - 检查数据库连接

4. **钱包连接问题**
   - 检查网络配置
   - 验证合约地址
   - 检查 RPC 端点

### 调试工具
- Vercel 函数日志
- 浏览器开发者工具
- ZetaChain 区块浏览器
- Supabase 日志

## 📝 部署后配置

### 1. 更新文档
- [ ] 更新 README.md
- [ ] 记录合约地址
- [ ] 更新 API 文档

### 2. 监控设置
- [ ] 设置 Vercel 监控
- [ ] 配置错误报告
- [ ] 设置性能监控

### 3. 安全检查
- [ ] 检查环境变量安全性
- [ ] 验证 API 权限
- [ ] 检查合约权限

## ✅ 部署完成

部署成功后，你将拥有：
- 在 ZetaChain 测试网上运行的智能合约
- 部署在 Vercel 上的全栈应用
- 配置完成的 Supabase 数据库
- 完整的 NFT 交易市场
- CyberGraph 社交网络集成
- AI 智能助手功能

记得保存所有合约地址和配置信息！