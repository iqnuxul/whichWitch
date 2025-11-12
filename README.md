# whichWitch - Web3 Creation Platform

A blockchain-based platform for handmade art creators to register original works, authorize derivative creations (二创), and automatically distribute revenue across the creation tree.

## 项目简介 (Project Overview)

whichWitch 是一个基于区块链的创作平台，让手工艺术创作者能够：
- 在链上注册原创作品
- 通过支付授权费用创建衍生作品
- 自动在创作链中分配收益
- 直接打赏创作者

whichWitch is a blockchain-based creation platform that enables handmade art creators to:
- Register original works on-chain
- Create derivative works through paid authorization
- Automatically distribute revenue across the creation chain
- Tip creators directly

## 项目结构 (Project Structure)

```
whichWitch/
├── src/
│   ├── contracts/          # 智能合约代码 (Smart contracts)
│   │   ├── PaymentManager.sol
│   │   ├── CreationManager.sol
│   │   └── AuthorizationManager.sol
│   ├── backend/            # 后端代码 (Backend code)
│   └── ui/                 # 前端代码 (Frontend code)
├── docs/                   # 文档 (Documentation)
├── test/                   # 测试文件 (Test files)
├── scripts/                # 部署脚本 (Deployment scripts)
└── README.md
```

## 核心功能 (Core Features)

### 1. 作品注册 (Work Registration)
- **原创作品注册**: 创作者可以注册原创作品并设置授权费用
- **衍生作品注册**: 获得授权后可以注册衍生作品

### 2. 授权系统 (Authorization System)
- 支付授权费用获得创作衍生作品的权限
- 链上验证授权状态
- 防止重复授权

### 3. 收益分配 (Revenue Distribution)⚠️ 细则待讨论 ⚠️
- **打赏**: 100% 直接给创作者
- **授权费**: 50% 给直接创作者，50% 在祖先链中平均分配
- 拉取式支付模式，创作者可随时提现

### 4. 创作树可视化 (Creation Tree)
- 追踪完整的创作链
- 可视化作品之间的衍生关系

## 智能合约架构 (Smart Contract Architecture)

### PaymentManager
管理所有财务交易，包括打赏、授权费和收益分配。

**主要功能**:
- `tipCreator()`: 打赏创作者
- `distributeRevenue()`: 分配授权费收益
- `withdraw()`: 提现累积余额

### CreationManager
管理作品注册和创作树结构。

**主要功能**:
- `registerOriginalWork()`: 注册原创作品
- `registerDerivativeWork()`: 注册衍生作品
- `getWorkChain()`: 获取完整创作链
- `getCreatorChain()`: 获取创作者链

### AuthorizationManager
管理授权和许可。

**主要功能**:
- `requestAuthorization()`: 请求授权并支付费用
- `hasAuthorization()`: 验证授权状态
- `getUserAuthorizations()`: 查询用户的所有授权

## 技术栈 (Tech Stack)

- **区块链**: Ethereum (Sepolia Testnet)
- **智能合约**: Solidity 0.8.20
- **开发框架**: Hardhat
- **安全库**: OpenZeppelin
- **前端**: Next.js + React (计划中)
- **Web3**: ethers.js + wagmi + RainbowKit (计划中)
- **后端**: Supabase (计划中)

## 快速开始 (Quick Start)

### 前置要求 (Prerequisites)
- Node.js >= 18
- npm or yarn
- MetaMask wallet

### 安装 (Installation)

```bash
# 克隆仓库
git clone https://github.com/iqnuxul/whichWitch.git
cd whichWitch

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的私钥和 RPC URL
```

### 编译合约 (Compile Contracts)

```bash
npm run compile
```

### 运行测试 (Run Tests)

```bash
npm test
```

### 部署到 Sepolia (Deploy to Sepolia)

```bash
npm run deploy:sepolia
```

## 收益分配示例 (Revenue Distribution Example)

假设创作链: A → B → C → D

当 D 收到 1 ETH 的授权费时:
- D (直接创作者): 0.5 ETH (50%)
- A, B, C (祖先): 各 0.167 ETH (50% 平均分配)

当 D 收到 1 ETH 的打赏时:
- D: 1 ETH (100%)

## 安全特性 (Security Features)

- ✅ 重入攻击保护 (ReentrancyGuard)
- ✅ 检查-效果-交互模式 (Checks-Effects-Interactions)
- ✅ 自定义错误节省 gas (Custom errors)
- ✅ 输入验证
- ✅ 拉取式支付模式

## 开发路线图 (Roadmap)

- [x] 智能合约开发
- [ ] 前端界面开发
- [ ] 后端服务和事件索引
- [ ] Sepolia 测试网部署
- [ ] 用户测试
- [ ] 主网部署

