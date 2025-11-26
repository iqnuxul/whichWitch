# 🔄 前端整合计划

## 📊 当前状态分析

### 你的项目结构
```
whichWitch/
├── src/
│   ├── contracts/          # ✅ 智能合约（已完成）
│   ├── backend/            # 🔄 后端（部分完成）
│   └── ui/                 # ❌ 前端（空的）
├── scripts/                # ✅ 部署脚本
└── docs/                   # ✅ 文档
```

### 队友的项目结构（whichwitch）
```
whichwitch/
├── app/                    # Next.js 13+ App Router
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── whichwitch/         # 核心业务组件
│   │   ├── app-container.tsx
│   │   ├── auth-view.tsx
│   │   ├── collections-view.tsx
│   │   ├── profile-view.tsx
│   │   ├── square-view.tsx
│   │   ├── upload-view.tsx
│   │   └── work-card.tsx
│   └── ui/                 # shadcn/ui 组件库
├── lib/
│   ├── mock-data.ts
│   └── utils.ts
├── public/
├── package.json
└── next.config.mjs
```

## 🎯 整合策略（Vercel 部署优化）

### 方案 A：根目录 Next.js + contracts 子目录（推荐 ⭐）
**优点：**
- ✅ Vercel 零配置部署（自动检测 Next.js）
- ✅ 最简单的部署流程
- ✅ 前端在根目录，合约在 contracts/
- ✅ 符合 Vercel 最佳实践

**结构：**
```
whichWitch/
├── app/                    # Next.js App Router（根目录）
├── components/             # React 组件
├── lib/                    # 工具函数 + Web3 集成
├── public/                 # 静态资源
├── contracts/              # Hardhat 合约项目
│   ├── src/
│   ├── scripts/
│   ├── test/
│   └── hardhat.config.cjs
├── package.json            # 前端依赖
├── next.config.mjs
└── vercel.json             # Vercel 配置（可选）
```

### 方案 B：Monorepo 结构
**优点：**
- 更清晰的代码组织
- 需要配置 Vercel 的 Root Directory

**缺点：**
- 需要额外配置 Vercel
- 部署稍微复杂一些

## ✅ 推荐执行步骤（方案 A - Vercel 优化）

### 第一步：备份当前的合约代码
```bash
# 创建临时目录保存当前的合约和配置
mkdir -p temp_backup
cp -r src/contracts temp_backup/
cp -r scripts temp_backup/
cp -r test temp_backup/
cp hardhat.config.cjs temp_backup/
cp package.json temp_backup/package.json.old
```

### 第二步：将前端代码合并到根目录
```bash
# 从队友的分支复制前端文件到根目录
git checkout teammate/main -- app components lib public
git checkout teammate/main -- next.config.mjs postcss.config.mjs tailwind.config.ts components.json

# 注意：package.json 需要手动合并，不要直接覆盖
git show teammate/main:package.json > teammate-package.json
```

### 第三步：重组项目结构
```bash
# 将合约相关文件移到 contracts/ 目录
mkdir -p contracts
mv temp_backup/contracts/src contracts/
mv temp_backup/scripts contracts/
mv temp_backup/test contracts/
mv temp_backup/hardhat.config.cjs contracts/

# 清理
rm -rf temp_backup
```

### 第三步：需要修改的关键文件

#### 1. 创建 Web3 集成层
需要创建：
- `src/ui/frontend/lib/web3/`
  - `contracts.ts` - 智能合约实例
  - `provider.ts` - Web3 Provider
  - `hooks.ts` - React hooks for Web3

#### 2. 更新组件以使用真实合约
需要修改：
- `components/whichwitch/upload-view.tsx` - 连接 CreationManager
- `components/whichwitch/collections-view.tsx` - 读取链上数据
- `components/whichwitch/work-card.tsx` - 显示真实作品信息
- `components/whichwitch/auth-view.tsx` - 集成 MetaMask 登录

#### 3. 替换 mock 数据
- 删除或重构 `lib/mock-data.ts`
- 创建 `lib/api/` 目录用于链上数据获取

### 第四步：配置文件更新

#### package.json 合并
需要合并两个 package.json：
- 保留你的 Hardhat 依赖（devDependencies）
- 添加队友的 Next.js 依赖（dependencies）
- 添加 Web3 相关依赖（ethers, wagmi, viem 等）
- 更新 scripts 以支持前端和合约开发

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "compile": "cd contracts && hardhat compile",
    "test:contracts": "cd contracts && hardhat test",
    "deploy": "cd contracts && hardhat run scripts/deploy.js"
  }
}
```

#### 环境变量
创建 `.env.local`（根目录）：
```env
# 智能合约地址（部署后填写）
NEXT_PUBLIC_CONTRACT_ADDRESS_CREATION=0x...
NEXT_PUBLIC_CONTRACT_ADDRESS_PAYMENT=0x...
NEXT_PUBLIC_CONTRACT_ADDRESS_AUTHORIZATION=0x...

# 网络配置
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NETWORK_NAME=sepolia
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# Vercel 部署时在环境变量中配置
```

#### Vercel 配置
创建 `vercel.json`（可选，用于自定义配置）：
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install"
}
```

## 🔧 需要新增的功能模块

### 1. Web3 Provider 组件
```typescript
// components/providers/web3-provider.tsx
// 使用 wagmi 或 ethers 提供 Web3 上下文
```

### 2. 合约交互 Hooks
```typescript
// lib/web3/hooks/useCreationManager.ts
// lib/web3/hooks/usePaymentManager.ts
// lib/web3/hooks/useAuthorizationManager.ts
```

### 3. 类型定义
```typescript
// types/contracts.ts
// 从合约 ABI 生成 TypeScript 类型
```

### 4. 合约 ABI 和地址
```typescript
// lib/web3/contracts/abis.ts - 导出合约 ABI
// lib/web3/contracts/addresses.ts - 导出合约地址
```

## 📝 待办事项清单

### 阶段 1：项目结构重组
- [ ] 1.1 备份当前合约代码
- [ ] 1.2 将前端代码合并到根目录
- [ ] 1.3 将合约移到 contracts/ 子目录
- [ ] 1.4 合并 package.json
- [ ] 1.5 更新 .gitignore

### 阶段 2：Web3 集成
- [ ] 2.1 安装 Web3 依赖（wagmi, viem, ethers）
- [ ] 2.2 创建 Web3 Provider 组件
- [ ] 2.3 创建合约交互 Hooks
- [ ] 2.4 导出合约 ABI 和地址
- [ ] 2.5 配置环境变量

### 阶段 3：组件更新
- [ ] 3.1 更新 upload-view.tsx（连接 CreationManager）
- [ ] 3.2 更新 collections-view.tsx（读取链上数据）
- [ ] 3.3 更新 work-card.tsx（显示真实作品）
- [ ] 3.4 更新 auth-view.tsx（MetaMask 登录）
- [ ] 3.5 替换 mock-data.ts

### 阶段 4：测试和部署
- [ ] 4.1 本地测试前端
- [ ] 4.2 测试合约连接
- [ ] 4.3 配置 Vercel 项目
- [ ] 4.4 设置 Vercel 环境变量
- [ ] 4.5 部署到 Vercel
- [ ] 4.6 更新文档

## ⚠️ 潜在问题和注意事项

1. **依赖冲突**
   - 检查 Node.js 版本兼容性
   - 解决 package.json 中的依赖冲突

2. **TypeScript 配置**
   - 可能需要合并两个 tsconfig.json
   - 确保路径别名正确配置

3. **构建配置**
   - Next.js 和 Hardhat 的构建流程需要协调
   - 可能需要更新 scripts

4. **合约 ABI**
   - 需要将编译后的合约 ABI 复制到前端
   - 考虑使用 TypeChain 生成类型

## 🚀 下一步行动

你想要：
1. **立即开始整合** - 我帮你执行上述步骤
2. **先看看队友的代码** - 我帮你检查具体的文件内容
3. **修改整合方案** - 讨论其他整合方式

请告诉我你的选择！


## 🚀 Vercel 部署指南

### 1. 连接 GitHub 仓库
1. 登录 Vercel
2. 点击 "Add New Project"
3. 导入你的 GitHub 仓库

### 2. 配置项目设置
- **Framework Preset**: Next.js（自动检测）
- **Root Directory**: `./`（保持默认）
- **Build Command**: `npm run build`（自动）
- **Output Directory**: `.next`（自动）
- **Install Command**: `npm install`（自动）

### 3. 配置环境变量
在 Vercel 项目设置中添加：
```
NEXT_PUBLIC_CONTRACT_ADDRESS_CREATION=0x...
NEXT_PUBLIC_CONTRACT_ADDRESS_PAYMENT=0x...
NEXT_PUBLIC_CONTRACT_ADDRESS_AUTHORIZATION=0x...
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NETWORK_NAME=sepolia
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

### 4. 部署流程
```
1. 推送代码到 GitHub
   ↓
2. Vercel 自动检测变更
   ↓
3. 自动构建和部署
   ↓
4. 获得生产环境 URL
```

### 5. 本地开发与 Vercel 同步
```bash
# 安装 Vercel CLI
npm i -g vercel

# 链接项目
vercel link

# 拉取环境变量
vercel env pull .env.local

# 本地开发
npm run dev
```

## 📦 推荐的依赖包

### Web3 相关
```bash
npm install wagmi viem @tanstack/react-query
npm install @rainbow-me/rainbowkit  # 可选：钱包连接 UI
```

### 或者使用 ethers.js
```bash
npm install ethers@^6
```

## 🎯 关键修改点总结

1. **项目根目录** = Next.js 前端（Vercel 友好）
2. **contracts/** = Hardhat 合约项目
3. **lib/web3/** = Web3 集成代码
4. **环境变量** = 使用 NEXT_PUBLIC_ 前缀
5. **部署** = 推送到 GitHub，Vercel 自动部署
