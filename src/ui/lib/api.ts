import axios from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 自动添加认证token
api.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效，清除本地认证信息
      Cookies.remove('auth_token')
      Cookies.remove('login_type')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error)
  }
)

// 认证API
export const authAPI = {
  // 钱包登录
  walletLogin: (data: { walletAddress: string; signature: string; message: string }) =>
    api.post('/api/auth/wallet-login', data),

  // 邮箱注册
  emailRegister: (data: { email: string }) =>
    api.post('/api/auth/email-register', data),

  // 邮箱验证
  verifyEmail: (data: { token: string }) =>
    api.post('/api/auth/verify-email', data),

  // 发送魔法链接
  sendMagicLink: (data: { email: string }) =>
    api.post('/api/auth/send-magic-link', data),

  // 魔法链接登录
  magicLogin: (data: { token: string }) =>
    api.post('/api/auth/magic-login', data),

  // 获取用户信息
  getMe: (token?: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    return api.get('/api/auth/me', { headers })
  },

  // 登出
  logout: () => api.post('/api/auth/logout'),
}

// AI API
export const aiAPI = {
  // AI聊天
  chat: (data: { query: string }) =>
    api.post('/api/ai/chat', data),

  // 钱包建议
  getWalletAdvice: (data: { email: string; preferences?: any }) =>
    api.post('/api/ai/wallet-advice', data),

  // 交易分析
  analyzeTransactions: (data: { transactionHistory: any[] }) =>
    api.post('/api/ai/analyze-transactions', data),

  // 合约建议
  getContractAdvice: (data: { contractFunction: string; parameters?: any }) =>
    api.post('/api/ai/contract-advice', data),

  // 创作建议
  getCreationAdvice: (data: { workType: string; parentWork?: any }) =>
    api.post('/api/ai/creation-advice', data),

  // 钱包管理
  getWalletManagement: () =>
    api.get('/api/ai/wallet-management'),

  // 风险评估
  assessRisk: (data: { transactionType: string; amount: string }) =>
    api.post('/api/ai/assess-risk', data),

  // 欢迎消息
  getWelcomeMessage: (data: { email: string; walletAddress: string; isNewUser?: boolean }) =>
    api.post('/api/ai/welcome-message', data),
}

// 交易API
export const transactionAPI = {
  // 代理注册原创作品
  registerOriginalWork: (data: { licenseFee: string; derivativeAllowed: boolean; metadataURI: string }) =>
    api.post('/api/transactions/register-original-work', data),

  // 代理注册衍生作品
  registerDerivativeWork: (data: { parentId: string; licenseFee: string; derivativeAllowed: boolean; metadataURI: string }) =>
    api.post('/api/transactions/register-derivative-work', data),

  // 代理请求授权
  requestAuthorization: (data: { workId: string; licenseFee: string }) =>
    api.post('/api/transactions/request-authorization', data),

  // 代理打赏创作者
  tipCreator: (data: { creatorAddress: string; amount: string }) =>
    api.post('/api/transactions/tip-creator', data),

  // 代理提现
  withdraw: () =>
    api.post('/api/transactions/withdraw'),

  // 获取余额
  getBalance: () =>
    api.get('/api/transactions/balance'),

  // 估算费用
  estimateCost: (data: { contractAddress: string; abi: any[]; methodName: string; params?: any[]; value?: string }) =>
    api.post('/api/transactions/estimate-cost', data),
}

// NFT市场API
export const marketplaceAPI = {
  // 挂单NFT
  listNFT: (data: { nftContract: string; tokenId: string; price: string; listingType: number; duration: number; allowCrossChain: boolean }) =>
    api.post('/api/marketplace/list', data),

  // 购买NFT
  buyNFT: (data: { listingId: string; price: string }) =>
    api.post('/api/marketplace/buy', data),

  // 出价
  makeOffer: (data: { listingId: string; amount: string; duration: number; sourceChain: string }) =>
    api.post('/api/marketplace/offer', data),

  // 接受出价
  acceptOffer: (data: { listingId: string; offerIndex: number }) =>
    api.post('/api/marketplace/accept-offer', data),

  // 取消挂单
  cancelListing: (data: { listingId: string }) =>
    api.post('/api/marketplace/cancel', data),

  // 跨链支付
  crossChainPayment: (data: { sourceChain: string; destinationChain: string; recipient: string; listingId: string; amount: string }) =>
    api.post('/api/marketplace/cross-chain-payment', data),

  // 获取挂单信息
  getListing: (listingId: string) =>
    api.get(`/api/marketplace/listing/${listingId}`),

  // 获取挂单出价
  getListingOffers: (listingId: string) =>
    api.get(`/api/marketplace/listing/${listingId}/offers`),

  // 获取用户挂单
  getUserListings: (address: string) =>
    api.get(`/api/marketplace/user/${address}/listings`),

  // 搜索NFT
  searchNFTs: (params: { query?: string; listingType?: string; minPrice?: string; maxPrice?: string; status?: string; page?: number; limit?: number }) =>
    api.get('/api/marketplace/search', { params }),

  // 获取市场统计
  getStats: () =>
    api.get('/api/marketplace/stats'),
}

// CyberGraph API
export const cyberGraphAPI = {
  // 同步作品到CyberGraph
  syncWork: (data: { workId: number; contentType: string; contentHash: string; title: string; description: string; tags: string[]; category: string }) =>
    api.post('/api/cybergraph/sync-work', data),

  // 批量同步作品
  batchSync: (data: { works: any[] }) =>
    api.post('/api/cybergraph/batch-sync', data),

  // 更新创作者档案
  updateProfile: (data: { cyberGraphHandle: string; bio: string; avatar: string; website: string; social: any }) =>
    api.post('/api/cybergraph/update-profile', data),

  // 关注用户
  followUser: (data: { followingAddress: string; relationshipType?: number }) =>
    api.post('/api/cybergraph/follow', data),

  // 获取社交图谱
  getSocialGraph: (address: string) =>
    api.get(`/api/cybergraph/social-graph/${address}`),

  // 搜索内容
  searchContent: (params: { q: string; type?: string; creator?: string; tags?: string; page?: number; limit?: number }) =>
    api.get('/api/cybergraph/search', { params }),

  // 获取同步状态
  getSyncStatus: () =>
    api.get('/api/cybergraph/sync-status'),

  // 获取热门内容
  getTrending: (params?: { category?: string; timeframe?: string; limit?: number }) =>
    api.get('/api/cybergraph/trending', { params }),
}

export default api