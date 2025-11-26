# 智能合约

## 📝 说明

这些合约已通过 **Remix IDE** 手动部署到 Sepolia 测试网。

## 📍 已部署的合约地址

- **CreationManager**: `0xB9365df57B3250cC6e4B9b3efDeE9871020b68cF`
- **PaymentManager**: `0xE9e700df0e448F5DebE55A8B153aebf8988db0c8`
- **AuthorizationManager**: `0x182AF7db7B2928455900595506D94b26E173aeA1`

## 🔧 如何修改和重新部署

1. 访问 [Remix IDE](https://remix.ethereum.org/)
2. 打开 `src/contracts/src/` 下的 `.sol` 文件
3. 修改合约代码
4. 编译合约
5. 连接 MetaMask (Sepolia 测试网)
6. 部署合约
7. 更新 `.env.local` 中的合约地址

## 📂 文件说明

- `src/` - Solidity 合约源代码
  - `CreationManager.sol` - 作品创建和管理
  - `PaymentManager.sol` - 支付和收益分配
  - `AuthorizationManager.sol` - 二创授权管理

- `hardhat.config.cjs` - Hardhat 配置（可选，如果只用 Remix 可以忽略）
- `artifacts/` - 编译产物（可以删除）
- `cache/` - 编译缓存（可以删除）

## 🚀 前端使用

前端通过以下文件调用合约：
- `src/ui/lib/web3/contracts/addresses.ts` - 合约地址
- `src/ui/lib/web3/contracts/abis.ts` - 合约 ABI
- `src/ui/lib/web3/services/contract.service.ts` - 合约调用服务

## ⚠️ 注意

如果重新部署合约，记得更新：
1. `.env.local` 中的合约地址
2. `src/ui/lib/web3/contracts/addresses.ts` 中的地址
3. 如果合约接口有变化，更新 `abis.ts` 中的 ABI
