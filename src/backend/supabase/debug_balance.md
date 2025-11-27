# 余额问题诊断清单

## 问题描述
用户支付 tip 成功，但余额没有增加

## 可能的原因

### 1. 合约配置问题
- [ ] PaymentManager 的 `creationManager` 地址未设置
- [ ] 合约地址配置错误
- [ ] 使用了错误的网络

### 2. 交易问题
- [ ] 交易实际上失败了（reverted）
- [ ] 交易发送到了错误的合约
- [ ] Gas 不足导致交易失败

### 3. 查询问题
- [ ] 查询的地址不正确
- [ ] 使用了错误的函数名
- [ ] ABI 不匹配

## 诊断步骤

### 步骤 1: 检查合约配置
在浏览器控制台运行：

```javascript
// 1. 检查合约地址
console.log('Contract addresses:', {
  payment: '你的 PaymentManager 地址',
  creation: '你的 CreationManager 地址',
  authorization: '你的 AuthorizationManager 地址'
})

// 2. 检查 PaymentManager 的 creationManager 设置
// 在区块链浏览器中查看 PaymentManager 合约
// 调用 creationManager() 函数
// 应该返回 CreationManager 的地址
```

### 步骤 2: 检查交易详情
1. 复制 tip 交易的 hash
2. 在区块链浏览器中查看交易
3. 检查：
   - Status: 应该是 Success
   - To: 应该是 PaymentManager 地址
   - Value: 应该是你发送的金额
   - Logs: 应该有 TipReceived 事件

### 步骤 3: 直接查询余额
在区块链浏览器中：
1. 进入 PaymentManager 合约
2. 调用 `balances(你的地址)`
3. 查看返回值（单位是 wei）

### 步骤 4: 检查前端查询
在浏览器控制台查看：
```
Reading balance for: 0x...
from contract: 0x...
Balance read from contract: ... wei
```

## 常见问题和解决方案

### 问题 1: creationManager 未设置
**症状**: 交易 reverted，错误信息 "Failed to get work"

**解决方案**: 
```solidity
// 在 PaymentManager 合约中调用
setCreationManager(CreationManager地址)
```

### 问题 2: 查询错误的地址
**症状**: 余额始终为 0，但交易成功

**解决方案**: 
- 确认查询的地址和发送 tip 的地址一致
- 确认查询的是作品创作者的地址，不是 tipper 的地址

### 问题 3: 网络不匹配
**症状**: 查询返回 0，但交易在另一个网络成功

**解决方案**:
- 确认前端连接的网络和合约部署的网络一致
- 检查 .env 中的 NEXT_PUBLIC_CHAIN_ID

### 问题 4: ABI 不匹配
**症状**: 查询失败或返回错误数据

**解决方案**:
- 重新编译合约获取最新 ABI
- 更新 src/ui/lib/web3/contracts/abis.ts

## 测试脚本

### 测试 1: 简单 tip
```javascript
// 1. 记录当前余额
const balanceBefore = await getCreatorRevenue(creatorAddress)
console.log('Balance before:', balanceBefore.toString())

// 2. 发送 tip
const txHash = await processPayment(workId, '0.001')
console.log('Transaction:', txHash)

// 3. 等待 2 秒
await new Promise(resolve => setTimeout(resolve, 2000))

// 4. 检查新余额
const balanceAfter = await getCreatorRevenue(creatorAddress)
console.log('Balance after:', balanceAfter.toString())
console.log('Difference:', (balanceAfter - balanceBefore).toString())
```

### 测试 2: 直接查询合约
```javascript
// 使用 ethers.js 或 viem 直接查询
import { readContract } from '@wagmi/core'

const balance = await readContract(config, {
  address: PAYMENT_MANAGER_ADDRESS,
  abi: PaymentManagerABI,
  functionName: 'balances',
  args: [creatorAddress]
})

console.log('Direct balance query:', balance.toString())
```

## 下一步

如果以上都检查过了还是有问题：
1. 提供交易 hash
2. 提供合约地址
3. 提供查询的地址
4. 提供控制台日志截图
