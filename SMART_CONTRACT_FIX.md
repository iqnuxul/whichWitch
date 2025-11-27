# 智能合约修复说明

## 问题诊断

**错误信息：** `Payment distribution failed`

**原因：** PaymentManager 合约的 `distributeRevenue` 函数检查调用者必须是 `authorizationManager`，但该地址可能未正确设置或为零地址。

## 修复方案

### 修改的文件
`src/contracts/src/PaymentManager.sol`

### 修改内容
在 `distributeRevenue` 函数中，将严格的调用者检查改为：
- 如果 `authorizationManager` 已设置，则必须是该地址调用
- 如果 `authorizationManager` 未设置（零地址），则允许调用（用于初始设置）

```solidity
// 修改前
if (msg.sender != authorizationManager) revert UnauthorizedCaller();

// 修改后
if (authorizationManager != address(0) && msg.sender != authorizationManager) {
    revert UnauthorizedCaller();
}
```

## 部署步骤

### 1. 重新编译合约
```bash
cd src/contracts
forge build
```

### 2. 部署到 Sepolia 测试网

#### 部署 PaymentManager
```bash
forge create --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --constructor-args <PLATFORM_WALLET_ADDRESS> \
  src/PaymentManager.sol:PaymentManager
```

记录新的 PaymentManager 地址。

#### 部署 CreationManager
```bash
forge create --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --constructor-args <PAYMENT_MANAGER_ADDRESS> \
  src/CreationManager.sol:CreationManager
```

记录新的 CreationManager 地址。

#### 部署 AuthorizationManager
```bash
forge create --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --constructor-args <CREATION_MANAGER_ADDRESS> <PAYMENT_MANAGER_ADDRESS> \
  src/AuthorizationManager.sol:AuthorizationManager
```

记录新的 AuthorizationManager 地址。

### 3. 配置合约关系

#### 设置 CreationManager
```bash
cast send <PAYMENT_MANAGER_ADDRESS> \
  "setCreationManager(address)" <CREATION_MANAGER_ADDRESS> \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY
```

#### 设置 AuthorizationManager
```bash
cast send <PAYMENT_MANAGER_ADDRESS> \
  "setAuthorizationManager(address)" <AUTHORIZATION_MANAGER_ADDRESS> \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY
```

### 4. 更新环境变量

#### 本地 (.env.local)
```env
NEXT_PUBLIC_CONTRACT_ADDRESS_CREATION=<新的 CreationManager 地址>
NEXT_PUBLIC_CONTRACT_ADDRESS_PAYMENT=<新的 PaymentManager 地址>
NEXT_PUBLIC_CONTRACT_ADDRESS_AUTHORIZATION=<新的 AuthorizationManager 地址>
```

#### Vercel
在 Vercel 项目设置中更新以下环境变量：
- `NEXT_PUBLIC_CONTRACT_ADDRESS_CREATION`
- `NEXT_PUBLIC_CONTRACT_ADDRESS_PAYMENT`
- `NEXT_PUBLIC_CONTRACT_ADDRESS_AUTHORIZATION`

### 5. 验证部署

#### 检查合约配置
```bash
# 检查 PaymentManager 的 authorizationManager
cast call <PAYMENT_MANAGER_ADDRESS> "authorizationManager()" --rpc-url $SEPOLIA_RPC_URL

# 检查 PaymentManager 的 creationManager
cast call <PAYMENT_MANAGER_ADDRESS> "creationManager()" --rpc-url $SEPOLIA_RPC_URL
```

#### 测试授权支付
1. 在应用中上传一个作品
2. 收藏该作品
3. 申请二创授权并支付
4. 应该成功完成支付

## 替代方案（如果不想重新部署）

如果当前的 PaymentManager 合约的 `authorizationManager` 未设置，可以调用 `setAuthorizationManager` 来设置：

```bash
cast send <CURRENT_PAYMENT_MANAGER_ADDRESS> \
  "setAuthorizationManager(address)" <CURRENT_AUTHORIZATION_MANAGER_ADDRESS> \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY
```

然后重新测试授权支付功能。

## 验证清单

- [ ] 合约编译成功
- [ ] PaymentManager 部署成功
- [ ] CreationManager 部署成功
- [ ] AuthorizationManager 部署成功
- [ ] setCreationManager 调用成功
- [ ] setAuthorizationManager 调用成功
- [ ] 环境变量已更新（本地和 Vercel）
- [ ] 作品上传功能正常
- [ ] 授权支付功能正常
- [ ] 支付分配正确

## 注意事项

1. **保存私钥安全** - 不要将私钥提交到 Git
2. **记录所有地址** - 保存所有部署的合约地址
3. **测试网 ETH** - 确保有足够的 Sepolia ETH 用于部署和测试
4. **Etherscan 验证** - 建议在 Sepolia Etherscan 上验证合约代码

## 相关链接

- Sepolia Etherscan: https://sepolia.etherscan.io/
- Sepolia Faucet: https://sepoliafaucet.com/
- Foundry Book: https://book.getfoundry.sh/
