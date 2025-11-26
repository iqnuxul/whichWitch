# WhichWitch - Web3 Creation Platform

## 🚀 快速启动

1. 安装依赖：
```bash
npm install
```

2. 配置环境变量：
```bash
cp .env.example .env.local
# 编辑 .env.local 填入你的 API keys
```

3. 启动开发服务器：
```bash
npm run dev
```

4. 打开浏览器访问 http://localhost:3000

## 📦 技术栈

- **前端**: Next.js 15 + React 19 + TypeScript
- **Web3**: Wagmi + Viem + Ethers.js
- **数据库**: Supabase
- **存储**: Pinata (IPFS)
- **测试网络**: Sepolia

## 🔗 已部署的智能合约

- **CreationManager**: `0xB9365df57B3250cC6e4B9b3efDeE9871020b68cF`
- **PaymentManager**: `0xE9e700df0e448F5DebE55A8B153aebf8988db0c8`
- **AuthorizationManager**: `0x182AF7db7B2928455900595506D94b26E173aeA1`

## 📁 项目结构

```
whichWitch/
├── app/              # Next.js 应用页面
├── components/       # React 组件
│   └── whichwitch/  # 核心业务组件
├── lib/             # 工具函数和 Web3 集成
│   ├── supabase/    # Supabase 客户端
│   └── web3/        # Web3 hooks 和配置
├── contracts/       # 智能合约源码
├── public/          # 静态资源
└── supabase/        # 数据库 schema
```

## 🔧 主要功能

- 钱包连接 (MetaMask)
- 作品上传到 IPFS
- 链上作品注册
- 支付管理
- 用户授权系统
