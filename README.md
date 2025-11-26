# 🎨 WhichWitch - Web3 Creation Platform

基于区块链的创作平台，支持原创作品和衍生作品的创建、授权和收益分配。

## 📁 项目结构

```
whichWitch/
├── app/                          # Next.js 15 App Router
│   ├── layout.tsx               # 根布局（集成 Web3Provider）
│   ├── page.tsx                 # 首页
│   └── globals.css              # 全局样式
├── components/                   # React 组件
│   ├── providers/               # Context Providers
│   │   └── web3-provider.tsx   # Web3 Provider（Wagmi + React Query）
│   ├── whichwitch/              # 业务组件
│   │   ├── app-container.tsx   # 主应用容器
│   │   ├── auth-view.tsx       # 登录/钱包连接
│   │   ├── collections-view.tsx # 作品集合展示
│   │   ├── profile-view.tsx    # 用户资料
│   │   ├── square-view.tsx     # 广场/发现页
│   │   ├── upload-view.tsx     # 上传/创建作品
│   │   └── work-card.tsx       # 作品卡片
│   └── ui/                      # shadcn/ui 组件库
├── lib/                          # 工具函数和配置
│   ├── web3/                    # Web3 集成
│   │   ├── config.ts           # Wagmi 配置
│   │   ├── contracts/          # 合约相关
│   │   │   ├── abis.ts        # 合约 ABI
│   │   │   └── addresses.ts   # 合约地址
│   │   └── hooks/              # Web3 Hooks
│   │       ├── useCreationManager.ts
│   │       └── useAuthorizationManager.ts
│   ├── mock-data.ts            # Mock 数据（待替换）
│   └── utils.ts                # 工具函数
├── contracts/                    # Hardhat 智能合约项目
│   ├── src/                     # Solidity 合约
│   │   ├── CreationManager.sol
│   │   ├── PaymentManager.sol
│   │   └── AuthorizationManager.sol
│   ├── scripts/                 # 部署脚本
│   ├── test/                    # 合约测试
│   └── hardhat.config.cjs      # Hardhat 配置
├── public/                       # 静态资源
├── .env.local                   # 环境变量（本地）
├── .env.example                 # 环境变量示例
├── package.json                 # 依赖配置
├── next.config.mjs              # Next.js 配置
├── tailwind.config.ts           # Tailwind CSS 配置
└── tsconfig.json                # TypeScript 配置
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env.local` 并填写你的配置：

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
# 已部署的合约地址（Sepolia 测试网）
NEXT_PUBLIC_CONTRACT_ADDRESS_CREATION=0xB9365df57B3250cC6e4B9b3efDeE9871020b68cF
NEXT_PUBLIC_CONTRACT_ADDRESS_PAYMENT=0xE9e700df0e448F5DebE55A8B153aebf8988db0c8
NEXT_PUBLIC_CONTRACT_ADDRESS_AUTHORIZATION=0x182AF7db7B2928455900595506D94b26E173aeA1

# 网络配置
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NETWORK_NAME=sepolia
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

### 3. 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 4. 编译智能合约（可选）

```bash
npm run compile
```

### 5. 部署合约到 Sepolia（可选）

```bash
npm run deploy:sepolia
```

## 📦 技术栈

### 前端
- **Next.js 15** - React 框架
- **React 19** - UI 库
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **shadcn/ui** - UI 组件库
- **Framer Motion** - 动画库

### Web3
- **Wagmi** - React Hooks for Ethereum
- **Viem** - TypeScript Ethereum 库
- **Ethers.js v6** - 以太坊交互
- **@tanstack/react-query** - 数据获取和缓存

### 智能合约
- **Solidity** - 智能合约语言
- **Hardhat** - 开发环境
- **OpenZeppelin** - 合约库
- **Ethers.js** - 合约交互

## 🔧 可用脚本

### 前端开发
```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 启动生产服务器
npm run lint         # 代码检查
```

### 智能合约
```bash
npm run compile      # 编译合约
npm run test:contracts  # 运行合约测试
npm run deploy       # 部署到本地网络
npm run deploy:sepolia  # 部署到 Sepolia 测试网
npm run node         # 启动本地 Hardhat 节点
npm run clean        # 清理编译文件
```

## 🌐 部署到 Vercel

### 1. 推送代码到 GitHub

```bash
git add .
git commit -m "feat: integrate frontend with smart contracts"
git push origin combine
```

### 2. 在 Vercel 中导入项目

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "Add New Project"
3. 导入你的 GitHub 仓库
4. Vercel 会自动检测 Next.js 项目

### 3. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

```
NEXT_PUBLIC_CONTRACT_ADDRESS_CREATION=0xB9365df57B3250cC6e4B9b3efDeE9871020b68cF
NEXT_PUBLIC_CONTRACT_ADDRESS_PAYMENT=0xE9e700df0e448F5DebE55A8B153aebf8988db0c8
NEXT_PUBLIC_CONTRACT_ADDRESS_AUTHORIZATION=0x182AF7db7B2928455900595506D94b26E173aeA1
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NETWORK_NAME=sepolia
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

### 4. 部署

点击 "Deploy"，Vercel 会自动构建和部署你的应用。

## 📝 智能合约

### 已部署的合约（Sepolia 测试网）

- **CreationManager**: `0xB9365df57B3250cC6e4B9b3efDeE9871020b68cF`
  - 管理作品创建和衍生关系
  
- **PaymentManager**: `0xE9e700df0e448F5DebE55A8B153aebf8988db0c8`
  - 处理支付和收益分配
  
- **AuthorizationManager**: `0x182AF7db7B2928455900595506D94b26E173aeA1`
  - 管理创作授权

### 合约功能

#### CreationManager
- `createWork()` - 创建原创作品
- `createDerivative()` - 创建衍生作品
- `getWork()` - 获取作品信息
- `getWorksByCreator()` - 获取创作者的所有作品
- `getDerivatives()` - 获取衍生作品列表
- `getAncestorChain()` - 获取祖先链

#### AuthorizationManager
- `requestAuthorization()` - 请求授权（支付授权费）
- `hasAuthorization()` - 检查是否有授权
- `getAuthorizationTimestamp()` - 获取授权时间

#### PaymentManager
- `processPayment()` - 处理支付
- `calculateDistribution()` - 计算收益分配
- `getTotalRevenue()` - 获取总收益
- `getCreatorRevenue()` - 获取创作者收益

## 🔗 Web3 集成示例

### 连接钱包

```typescript
import { useConnect, useAccount } from 'wagmi';

function ConnectButton() {
  const { connect, connectors } = useConnect();
  const { address, isConnected } = useAccount();

  if (isConnected) {
    return <div>Connected: {address}</div>;
  }

  return (
    <button onClick={() => connect({ connector: connectors[0] })}>
      Connect Wallet
    </button>
  );
}
```

### 创建作品

```typescript
import { useCreateWork } from '@/lib/web3/hooks/useCreationManager';

function CreateWorkForm() {
  const { createWork, isPending, isSuccess } = useCreateWork();

  const handleSubmit = async () => {
    await createWork(
      'QmHash...', // IPFS hash
      'My Artwork',
      'Description',
      '0.01' // 0.01 ETH
    );
  };

  return (
    <button onClick={handleSubmit} disabled={isPending}>
      {isPending ? 'Creating...' : 'Create Work'}
    </button>
  );
}
```

### 请求授权

```typescript
import { useRequestAuthorization } from '@/lib/web3/hooks/useAuthorizationManager';

function AuthorizeButton({ workId, licenseFee }: { workId: bigint, licenseFee: string }) {
  const { requestAuthorization, isPending, isSuccess } = useRequestAuthorization();

  const handleAuthorize = async () => {
    await requestAuthorization(workId, licenseFee);
  };

  return (
    <button onClick={handleAuthorize} disabled={isPending}>
      {isPending ? 'Processing...' : `Pay ${licenseFee} ETH`}
    </button>
  );
}
```

## 📚 下一步

### 待完成的任务

- [ ] 更新 `upload-view.tsx` 连接 CreationManager
- [ ] 更新 `collections-view.tsx` 读取链上数据
- [ ] 更新 `work-card.tsx` 显示真实作品信息
- [ ] 更新 `auth-view.tsx` 集成 MetaMask 登录
- [ ] 替换 `mock-data.ts` 为真实数据
- [ ] 添加 IPFS 集成用于存储作品内容
- [ ] 添加错误处理和加载状态
- [ ] 添加交易确认提示
- [ ] 优化用户体验

## 📖 文档

- [架构文档](./docs/ARCHITECTURE.md)
- [支付流程](./docs/PAYMENT_FLOW.md)
- [部署指南](./docs/DEPLOYMENT.md)
- [整合计划](./INTEGRATION_PLAN.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

ISC
