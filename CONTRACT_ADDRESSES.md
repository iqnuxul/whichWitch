# 智能合约地址

## Sepolia 测试网 - 当前部署

部署时间：2025-11-28

### 合约地址

- **CreationManager**: `0x166253a474D74738D47CB59Ab39ee08e4fA4E607`
  - [查看合约](https://sepolia.etherscan.io/address/0x166253a474D74738D47CB59Ab39ee08e4fA4E607)

- **PaymentManager**: `0x4CD314D46F1d09af04fb7784F9083468206D3858`
  - [查看合约](https://sepolia.etherscan.io/address/0x4CD314D46F1d09af04fb7784F9083468206D3858)

- **AuthorizationManager**: `0x975830aA477523448F407eF6769D4A21F1A1724D`
  - [查看合约](https://sepolia.etherscan.io/address/0x975830aA477523448F407eF6769D4A21F1A1724D)

### 配置状态

需要在 Remix 中执行以下配置：

#### PaymentManager 配置
- [ ] `setCreationManager(0x166253a474D74738D47CB59Ab39ee08e4fA4E607)`
- [ ] `setAuthorizationManager(0x975830aA477523448F407eF6769D4A21F1A1724D)`

#### CreationManager 配置
- [ ] `setAuthorizationManager(0x975830aA477523448F407eF6769D4A21F1A1724D)`

### 环境变量配置

在 `.env.local` 中设置：

```env
NEXT_PUBLIC_CONTRACT_ADDRESS_CREATION=0x166253a474D74738D47CB59Ab39ee08e4fA4E607
NEXT_PUBLIC_CONTRACT_ADDRESS_PAYMENT=0x4CD314D46F1d09af04fb7784F9083468206D3858
NEXT_PUBLIC_CONTRACT_ADDRESS_AUTHORIZATION=0x975830aA477523448F407eF6769D4A21F1A1724D
```

在 Vercel 环境变量中也需要更新这些值。
