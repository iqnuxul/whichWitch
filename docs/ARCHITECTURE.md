# whichWitch 架构文档 (Architecture Documentation)

## 系统概述 (System Overview)

whichWitch 是一个去中心化的创作平台，使用智能合约管理作品注册、授权和收益分配。

## 智能合约架构 (Smart Contract Architecture)

### 合约关系图 (Contract Relationships)

```
┌─────────────────────┐
│   Frontend (UI)     │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────────────────┐
│         Smart Contracts              │
│                                      │
│  ┌────────────────────────────┐    │
│  │   CreationManager          │    │
│  │  - 作品注册                 │    │
│  │  - 创作树管理               │    │
│  └────────┬───────────────────┘    │
│           │                         │
│  ┌────────▼───────────────────┐    │
│  │  AuthorizationManager      │    │
│  │  - 授权管理                 │    │
│  │  - 授权费支付               │    │
│  └────────┬───────────────────┘    │
│           │                         │
│  ┌────────▼───────────────────┐    │
│  │   PaymentManager           │    │
│  │  - 余额管理                 │    │
│  │  - 收益分配                 │    │
│  │  - 提现                     │    │
│  └────────────────────────────┘    │
└──────────────────────────────────────┘
```

## 核心流程 (Core Flows)

### 1. 注册原创作品 (Register Original Work)

```
用户 → CreationManager.registerOriginalWork()
  ├─ 生成唯一 workId
  ├─ 存储作品信息 (creator, licenseFee, timestamp)
  ├─ 更新 creatorWorks 映射
  └─ 发出 WorkRegistered 事件
```

### 2. 请求授权 (Request Authorization)

```
用户 → AuthorizationManager.requestAuthorization(workId) + ETH
  ├─ 验证支付金额 = licenseFee
  ├─ 检查是否已授权
  ├─ 标记用户已授权
  ├─ 获取创作者链
  ├─ 调用 PaymentManager.distributeRevenue()
  │   ├─ 50% → 直接创作者
  │   └─ 50% → 祖先创作者（平均分配）
  └─ 发出 AuthorizationGranted 事件
```

### 3. 注册衍生作品 (Register Derivative Work)

```
用户 → CreationManager.registerDerivativeWork(parentId)
  ├─ 验证 parentId 存在
  ├─ 调用 AuthorizationManager.hasAuthorization()
  ├─ 如果未授权 → 回滚
  ├─ 生成新 workId
  ├─ 存储作品信息 (包含 parentId)
  ├─ 更新 derivatives 映射
  └─ 发出 DerivativeWorkRegistered 事件
```

### 4. 打赏创作者 (Tip Creator)

```
用户 → PaymentManager.tipCreator(creator) + ETH
  ├─ 验证金额 > 0
  ├─ 更新创作者余额 (100%)
  └─ 发出 TipReceived 事件
```

### 5. 提现 (Withdraw)

```
创作者 → PaymentManager.withdraw()
  ├─ 检查余额 > 0
  ├─ 余额归零 (防止重入)
  ├─ 转账 ETH
  └─ 发出 Withdrawal 事件
```

## 数据结构 (Data Structures)

### Work 结构体

```solidity
struct Work {
    uint256 id;           // 唯一标识符
    address creator;      // 创作者地址
    uint256 parentId;     // 父作品 ID (0 表示原创)
    uint256 licenseFee;   // 授权费用 (wei)
    uint256 timestamp;    // 注册时间
    bool exists;          // 存在标志
}
```

### 关键映射 (Key Mappings)

```solidity
// CreationManager
mapping(uint256 => Work) public works;
mapping(address => uint256[]) public creatorWorks;
mapping(uint256 => uint256[]) public derivatives;

// AuthorizationManager
mapping(uint256 => mapping(address => bool)) public authorizations;
mapping(address => uint256[]) public userAuthorizations;

// PaymentManager
mapping(address => uint256) public balances;
```

## 收益分配算法 (Revenue Distribution Algorithm)

### 授权费分配 (License Fee Distribution)

```
总金额 = licenseFee
直接创作者份额 = 总金额 × 50%
祖先池 = 总金额 × 50%

如果有祖先:
    每个祖先份额 = 祖先池 / 祖先数量
    余数 = 祖先池 % 祖先数量
    第一个祖先额外获得余数
```

### 示例计算

创作链: A → B → C → D
授权费: 1 ETH

```
D (直接创作者): 0.5 ETH
祖先池: 0.5 ETH
  ├─ A: 0.166666... ETH
  ├─ B: 0.166666... ETH
  └─ C: 0.166666... ETH
```

## Gas 优化策略 (Gas Optimization)

1. **使用自定义错误**: 比 require 字符串节省 gas
2. **映射优先于数组**: O(1) 查找时间
3. **事件代替存储**: 历史数据用事件记录
4. **打包存储变量**: 相关变量打包到同一 slot
5. **拉取式支付**: 避免循环转账的高 gas 成本

## 安全考虑 (Security Considerations)

### 1. 重入攻击防护
- PaymentManager 使用 OpenZeppelin 的 ReentrancyGuard
- 遵循检查-效果-交互模式

### 2. 整数溢出
- Solidity 0.8.x 内置溢出检查

### 3. 访问控制
- 只有 AuthorizationManager 可以调用 PaymentManager.distributeRevenue()
- 只有 CreationManager 可以设置 AuthorizationManager

### 4. 输入验证
- 所有公共函数验证输入参数
- 检查地址非零
- 检查金额非零
- 验证作品存在

## 事件系统 (Event System)

所有关键操作都发出事件，用于：
- 前端 UI 更新
- 后端数据索引
- 交易历史追踪

### 主要事件

```solidity
// CreationManager
event WorkRegistered(uint256 indexed workId, address indexed creator, ...);
event DerivativeWorkRegistered(uint256 indexed workId, uint256 indexed parentId, ...);

// AuthorizationManager
event AuthorizationGranted(uint256 indexed workId, address indexed user, ...);

// PaymentManager
event TipReceived(address indexed tipper, address indexed creator, ...);
event RevenueDistributed(uint256 indexed workId, address[] recipients, ...);
event Withdrawal(address indexed creator, uint256 amount, ...);
```

## 未来扩展 (Future Extensions)

1. **NFT 集成**: 为每个作品铸造 NFT
2. **动态收益分配**: 允许创作者自定义分配比例
3. **批量授权**: 一次购买多个作品的授权
4. **作品分类**: 添加标签和分类系统
5. **声誉系统**: 追踪创作者统计和评级
6. **可升级合约**: 使用代理模式实现合约升级

## 部署顺序 (Deployment Order)

1. 部署 PaymentManager
2. 部署 CreationManager (传入 PaymentManager 地址)
3. 部署 AuthorizationManager (传入 CreationManager 和 PaymentManager 地址)
4. 在 CreationManager 中设置 AuthorizationManager 地址
5. 验证所有合约

## 测试策略 (Testing Strategy)

### 单元测试
- 每个合约独立测试
- 测试所有公共函数
- 测试边界条件和错误情况

### 集成测试
- 测试完整的用户流程
- 测试合约间交互
- 测试多层创作链

### Gas 测试
- 测量每个操作的 gas 消耗
- 优化高频操作

## 监控和维护 (Monitoring & Maintenance)

### 链上监控
- 监听所有事件
- 追踪交易失败
- 监控合约余额

### 数据同步
- 使用事件索引器同步链上数据到数据库
- 定期验证数据一致性

### 升级计划
- 当前版本不可升级
- 未来版本考虑使用代理模式
- 保持向后兼容性
