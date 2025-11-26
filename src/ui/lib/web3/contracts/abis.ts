// 智能合约 ABI
// 这些 ABI 需要从编译后的合约中导出
// 运行 npm run compile 后，从 contracts/artifacts 中获取

export const CreationManagerABI = [
  // 事件
  "event WorkRegistered(uint256 indexed workId, address indexed creator, uint256 licenseFee, bool derivativeAllowed, string metadataURI, uint256 timestamp)",
  "event DerivativeWorkRegistered(uint256 indexed workId, uint256 indexed parentId, address indexed creator, uint256 licenseFee, bool derivativeAllowed, string metadataURI, uint256 timestamp)",
  
  // 创建原创作品
  "function registerOriginalWork(uint256 licenseFee, bool derivativeAllowed, string calldata metadataURI) external returns (uint256 workId)",
  
  // 创建衍生作品
  "function registerDerivativeWork(uint256 parentId, uint256 licenseFee, bool derivativeAllowed, string calldata metadataURI) external returns (uint256 workId)",
  
  // 查询函数
  "function getWork(uint256 workId) external view returns (tuple(uint256 id, address creator, uint256 parentId, uint256 licenseFee, uint256 timestamp, bool derivativeAllowed, bool exists))",
  "function getWorksByCreator(address creator) external view returns (uint256[])",
  "function getDerivatives(uint256 parentId) external view returns (uint256[])",
  "function getAncestorChain(uint256 workId) external view returns (address[])",
] as const;

export const PaymentManagerABI = [
  // 事件
  "event PaymentProcessed(uint256 indexed workId, address indexed payer, uint256 totalAmount, uint256 timestamp)",
  "event RevenueDistributed(uint256 indexed workId, address indexed recipient, uint256 amount)",
  
  // 支付函数
  "function processPayment(uint256 workId) external payable",
  
  // 查询函数
  "function calculateDistribution(uint256 workId, uint256 amount) external view returns (address[], uint256[])",
  "function getTotalRevenue(uint256 workId) external view returns (uint256)",
  "function getCreatorRevenue(address creator) external view returns (uint256)",
] as const;

export const AuthorizationManagerABI = [
  // 事件
  "event AuthorizationGranted(uint256 indexed workId, address indexed user, uint256 licenseFee, uint256 timestamp)",
  
  // 授权函数
  "function requestAuthorization(uint256 workId) external payable",
  
  // 查询函数
  "function hasAuthorization(address user, uint256 workId) external view returns (bool)",
  "function getAuthorizationTimestamp(address user, uint256 workId) external view returns (uint256)",
] as const;
