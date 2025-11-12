# 部署指南 (Deployment Guide)

## 环境准备 (Environment Setup)

### 1. 安装依赖 (Install Dependencies)

```bash
npm install
```

### 2. 配置环境变量 (Configure Environment Variables)

创建 `.env` 文件:

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入以下信息:

```env
# Sepolia Testnet RPC URL
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# 部署账户私钥 (不要泄露!)
PRIVATE_KEY=your_private_key_here

# Etherscan API Key (用于合约验证)
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 3. 获取测试 ETH (Get Test ETH)

从 Sepolia 水龙头获取测试 ETH:
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia

## 编译合约 (Compile Contracts)

```bash
npm run compile
```

确保所有合约编译成功，无错误。

## 部署流程 (Deployment Process)

### 方式 1: 使用部署脚本 (Using Deployment Script)

创建部署脚本 `scripts/deploy.js`:

```javascript
const hre = require("hardhat");

async function main() {
  console.log("开始部署合约...");

  // 1. 部署 PaymentManager
  console.log("\n1. 部署 PaymentManager...");
  const PaymentManager = await hre.ethers.getContractFactory("PaymentManager");
  const paymentManager = await PaymentManager.deploy();
  await paymentManager.waitForDeployment();
  const paymentManagerAddress = await paymentManager.getAddress();
  console.log("✅ PaymentManager 部署到:", paymentManagerAddress);

  // 2. 部署 CreationManager
  console.log("\n2. 部署 CreationManager...");
  const CreationManager = await hre.ethers.getContractFactory("CreationManager");
  const creationManager = await CreationManager.deploy(paymentManagerAddress);
  await creationManager.waitForDeployment();
  const creationManagerAddress = await creationManager.getAddress();
  console.log("✅ CreationManager 部署到:", creationManagerAddress);

  // 3. 部署 AuthorizationManager
  console.log("\n3. 部署 AuthorizationManager...");
  const AuthorizationManager = await hre.ethers.getContractFactory("AuthorizationManager");
  const authorizationManager = await AuthorizationManager.deploy(
    creationManagerAddress,
    paymentManagerAddress
  );
  await authorizationManager.waitForDeployment();
  const authorizationManagerAddress = await authorizationManager.getAddress();
  console.log("✅ AuthorizationManager 部署到:", authorizationManagerAddress);

  // 4. 设置 AuthorizationManager 地址
  console.log("\n4. 配置合约关系...");
  const tx1 = await creationManager.setAuthorizationManager(authorizationManagerAddress);
  await tx1.wait();
  console.log("✅ CreationManager 已配置 AuthorizationManager");

  const tx2 = await paymentManager.setCreationManager(creationManagerAddress);
  await tx2.wait();
  console.log("✅ PaymentManager 已配置 CreationManager");

  // 5. 输出部署信息
  console.log("\n" + "=".repeat(60));
  console.log("部署完成! 合约地址:");
  console.log("=".repeat(60));
  console.log("PaymentManager:       ", paymentManagerAddress);
  console.log("CreationManager:      ", creationManagerAddress);
  console.log("AuthorizationManager: ", authorizationManagerAddress);
  console.log("=".repeat(60));

  // 6. 保存部署信息
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    contracts: {
      PaymentManager: paymentManagerAddress,
      CreationManager: creationManagerAddress,
      AuthorizationManager: authorizationManagerAddress,
    },
  };

  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n部署信息已保存到 deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

运行部署:

```bash
# 部署到本地 Hardhat 网络
npx hardhat run scripts/deploy.js

# 部署到 Sepolia 测试网
npx hardhat run scripts/deploy.js --network sepolia
```

### 方式 2: 手动部署 (Manual Deployment)

使用 Hardhat console:

```bash
npx hardhat console --network sepolia
```

在 console 中执行:

```javascript
// 1. 部署 PaymentManager
const PaymentManager = await ethers.getContractFactory("PaymentManager");
const paymentManager = await PaymentManager.deploy();
await paymentManager.waitForDeployment();
const pmAddr = await paymentManager.getAddress();
console.log("PaymentManager:", pmAddr);

// 2. 部署 CreationManager
const CreationManager = await ethers.getContractFactory("CreationManager");
const creationManager = await CreationManager.deploy(pmAddr);
await creationManager.waitForDeployment();
const cmAddr = await creationManager.getAddress();
console.log("CreationManager:", cmAddr);

// 3. 部署 AuthorizationManager
const AuthorizationManager = await ethers.getContractFactory("AuthorizationManager");
const authorizationManager = await AuthorizationManager.deploy(cmAddr, pmAddr);
await authorizationManager.waitForDeployment();
const amAddr = await authorizationManager.getAddress();
console.log("AuthorizationManager:", amAddr);

// 4. 配置关系
await creationManager.setAuthorizationManager(amAddr);
await paymentManager.setCreationManager(cmAddr);
console.log("配置完成!");
```

## 验证合约 (Verify Contracts)

在 Etherscan 上验证合约，使其源代码公开可见:

```bash
# 验证 PaymentManager
npx hardhat verify --network sepolia PAYMENT_MANAGER_ADDRESS

# 验证 CreationManager
npx hardhat verify --network sepolia CREATION_MANAGER_ADDRESS "PAYMENT_MANAGER_ADDRESS"

# 验证 AuthorizationManager
npx hardhat verify --network sepolia AUTHORIZATION_MANAGER_ADDRESS "CREATION_MANAGER_ADDRESS" "PAYMENT_MANAGER_ADDRESS"
```

## 部署后检查 (Post-Deployment Checks)

### 1. 验证合约配置

```javascript
// 检查 CreationManager 的 authorizationManager
const am = await creationManager.authorizationManager();
console.log("AuthorizationManager 地址:", am);

// 检查 PaymentManager 的 creationManager
const cm = await paymentManager.creationManager();
console.log("CreationManager 地址:", cm);
```

### 2. 测试基本功能

```javascript
// 注册一个测试作品
const tx = await creationManager.registerOriginalWork(
  ethers.parseEther("0.01"), // 0.01 ETH 授权费
  "ipfs://test-metadata-uri"
);
await tx.wait();
console.log("测试作品注册成功!");

// 查询作品
const work = await creationManager.getWork(1);
console.log("作品信息:", work);
```

## 常见问题 (Troubleshooting)

### 问题 1: Gas 费用不足

**错误**: `insufficient funds for gas * price + value`

**解决**: 确保部署账户有足够的 Sepolia ETH

### 问题 2: Nonce 太低

**错误**: `nonce too low`

**解决**: 
```bash
# 清除 Hardhat 缓存
rm -rf cache artifacts
npx hardhat clean
```

### 问题 3: 合约验证失败

**错误**: `Contract verification failed`

**解决**:
- 确保使用正确的构造函数参数
- 确保编译器版本匹配 (0.8.20)
- 确保优化设置匹配 (runs: 200)

### 问题 4: RPC 连接超时

**错误**: `timeout of 20000ms exceeded`

**解决**:
- 检查网络连接
- 更换 RPC 提供商
- 增加超时时间

## 部署成本估算 (Deployment Cost Estimate)

基于 Sepolia 测试网 (gas price ~1 gwei):

| 合约 | Gas 消耗 | 成本 (ETH) |
|------|----------|------------|
| PaymentManager | ~800,000 | ~0.0008 |
| CreationManager | ~1,200,000 | ~0.0012 |
| AuthorizationManager | ~1,000,000 | ~0.001 |
| 配置交易 | ~100,000 | ~0.0001 |
| **总计** | ~3,100,000 | ~0.0031 |

## 安全建议 (Security Recommendations)

1. **私钥安全**
   - 永远不要提交 `.env` 文件到 Git
   - 使用硬件钱包进行主网部署
   - 定期轮换测试网私钥

2. **部署验证**
   - 在测试网充分测试后再部署主网
   - 使用多签钱包管理主网合约
   - 考虑时间锁和治理机制

3. **监控**
   - 设置事件监听器
   - 监控异常交易
   - 定期审计合约状态

## 下一步 (Next Steps)

部署完成后:

1. ✅ 保存所有合约地址
2. ✅ 在 Etherscan 上验证合约
3. ✅ 更新前端配置文件
4. ✅ 进行端到端测试
5. ✅ 准备用户文档
6. ✅ 设置监控和告警

## 回滚计划 (Rollback Plan)

如果部署出现问题:

1. 记录所有交易哈希
2. 不要删除部署脚本输出
3. 如需重新部署，使用新地址
4. 更新所有引用旧地址的配置

## 联系支持 (Support)

如有问题，请:
- 查看 Hardhat 文档: https://hardhat.org/docs
- 查看 Etherscan: https://sepolia.etherscan.io/
- 提交 GitHub Issue
