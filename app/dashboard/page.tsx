'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useAI } from '../../contexts/AIContext'
import { useRouter } from 'next/navigation'
import { 
  Wallet, 
  Mail, 
  Sparkles, 
  Plus, 
  TrendingUp, 
  Users, 
  MessageCircle,
  LogOut,
  Copy,
  Zap,
  Upload,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { transactionAPI } from '../../lib/api'

export default function DashboardPage() {
  const { user, logout, loginType, isLoading } = useAuth()
  const { chatWithAI, getWalletManagement, isLoading: aiLoading } = useAI()
  const router = useRouter()
  
  const [aiMessage, setAiMessage] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [walletAdvice, setWalletAdvice] = useState<string | null>(null)
  const [userWorks, setUserWorks] = useState<any[]>([])
  const [userStats, setUserStats] = useState({
    totalWorks: 0,
    totalEarnings: '0',
    totalAuthorizations: 0
  })
  const [derivativeWorks, setDerivativeWorks] = useState<any[]>([])
  const [purchasedLicenses, setPurchasedLicenses] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'my-works' | 'derivative-works' | 'purchased-licenses'>('my-works')
  const [showVoteModal, setShowVoteModal] = useState<number | null>(null)
  const [voteForm, setVoteForm] = useState({
    title: '',
    description: '',
    options: ['', ''],
    duration: '7',
    stakeRequired: '0.01'
  })

  // 如果未登录，重定向到登录页
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  // 获取钱包管理建议（仅邮箱用户）
  useEffect(() => {
    if (user && user.loginType === 'email') {
      getWalletManagement().then(setWalletAdvice)
    }
  }, [user, getWalletManagement])

  // 获取用户作品和统计数据
  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      // 获取用户作品
      const worksResponse = await transactionAPI.getUserWorks()
      if (worksResponse.data?.success) {
        setUserWorks(worksResponse.data.works || [])
        setUserStats(prev => ({
          ...prev,
          totalWorks: worksResponse.data.works?.length || 0
        }))
      }

      // 获取用户余额
      const balanceResponse = await transactionAPI.getBalance()
      if (balanceResponse.data?.success) {
        setUserStats(prev => ({
          ...prev,
          totalEarnings: balanceResponse.data.balance || '0'
        }))
      }

      // 获取已购买的授权
      fetchPurchasedLicenses()
      
      // 获取衍生作品
      fetchDerivativeWorks()
    } catch (error) {
      console.error('获取用户数据失败:', error)
    }
  }

  const fetchPurchasedLicenses = async () => {
    try {
      // 模拟已购买的二创授权数据
      const mockLicenses = [
        {
          id: 1,
          originalWorkId: 1,
          originalTitle: '未来城市概念图',
          originalCreator: 'FutureArtist',
          licenseFee: '0.01',
          purchaseDate: '2024-01-20T10:00:00Z',
          status: 'active',
          expiryDate: '2025-01-20T10:00:00Z',
          hasCreatedDerivative: false
        },
        {
          id: 2,
          originalWorkId: 3,
          originalTitle: '赛博朋克角色设计',
          originalCreator: 'CyberDesigner',
          licenseFee: '0.02',
          purchaseDate: '2024-01-22T14:30:00Z',
          status: 'active',
          expiryDate: '2025-01-22T14:30:00Z',
          hasCreatedDerivative: true
        }
      ]
      setPurchasedLicenses(mockLicenses)
      setUserStats(prev => ({
        ...prev,
        totalAuthorizations: mockLicenses.length
      }))
    } catch (error) {
      console.error('获取授权数据失败:', error)
    }
  }

  const fetchDerivativeWorks = async () => {
    try {
      // 模拟用户创建的衍生作品数据
      const mockDerivativeWorks = [
        {
          id: 4,
          title: '未来城市 - 太空站扩展',
          description: '基于原作"未来城市概念图"的衍生创作，展现了太空站的设计...',
          parentWorkId: 1,
          parentTitle: '未来城市概念图',
          createdAt: '2024-01-22T16:45:00Z',
          status: 'published',
          viewCount: 89,
          fanStakes: 5,
          totalStaked: '0.18'
        }
      ]
      setDerivativeWorks(mockDerivativeWorks)
    } catch (error) {
      console.error('获取衍生作品失败:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return null // 避免闪烁，让 useEffect 处理重定向
  }

  // 复制钱包地址
  const copyWalletAddress = () => {
    navigator.clipboard.writeText(user.walletAddress)
    toast.success('钱包地址已复制')
  }

  // AI聊天
  const handleAIChat = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!aiMessage.trim()) return

    const response = await chatWithAI(aiMessage)
    if (response) {
      setAiResponse(response)
    }
    setAiMessage('')
  }

  const handleCreateVote = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!voteForm.title || !voteForm.description || voteForm.options.some(opt => !opt.trim())) {
      toast.error('请填写所有必填字段')
      return
    }

    try {
      // 这里应该调用创建投票的API
      toast.success('投票创建成功！')
      setShowVoteModal(null)
      setVoteForm({
        title: '',
        description: '',
        options: ['', ''],
        duration: '7',
        stakeRequired: '0.01'
      })
    } catch (error) {
      console.error('创建投票失败:', error)
      toast.error('创建投票失败')
    }
  }

  const addVoteOption = () => {
    if (voteForm.options.length < 5) {
      setVoteForm(prev => ({
        ...prev,
        options: [...prev.options, '']
      }))
    }
  }

  const removeVoteOption = (index: number) => {
    if (voteForm.options.length > 2) {
      setVoteForm(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }))
    }
  }

  const updateVoteOption = (index: number, value: string) => {
    setVoteForm(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">


      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左侧 - 用户信息和快捷操作 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 用户信息卡片 */}
            <div className="card">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  {loginType === 'email' ? (
                    <Mail className="w-6 h-6 text-primary-600" />
                  ) : (
                    <Wallet className="w-6 h-6 text-primary-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {user.email || '钱包用户'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {loginType === 'email' ? 'AI智能钱包' : 'Web3钱包'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">钱包地址</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                      {user.walletAddress}
                    </code>
                    <button
                      onClick={copyWalletAddress}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
                
                {user.email && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">邮箱</label>
                    <p className="text-sm text-gray-900 mt-1">{user.email}</p>
                    {user.emailVerified && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 mt-1">
                        已验证
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 快捷操作 */}
            <div className="card">
              <h3 className="font-semibold mb-4">快捷操作</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => router.push('/works/create')}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  注册新作品
                </button>
                
                <button 
                  onClick={() => toast.success('收益功能开发中...')}
                  className="w-full btn-outline flex items-center justify-center"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  查看收益
                </button>
                
                <button 
                  onClick={() => router.push('/marketplace')}
                  className="w-full btn-outline flex items-center justify-center"
                >
                  <Users className="w-4 h-4 mr-2" />
                  浏览作品
                </button>
              </div>
            </div>

            {/* AI钱包管理建议（仅邮箱用户） */}
            {walletAdvice && loginType === 'email' && (
              <div className="card border-purple-200 bg-purple-50">
                <h4 className="font-semibold mb-2 flex items-center text-purple-800">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI钱包管理建议
                </h4>
                <div className="text-sm text-purple-700 whitespace-pre-line">
                  {walletAdvice}
                </div>
              </div>
            )}
          </div>

          {/* 右侧 - 主要内容区域 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 欢迎消息 */}
            <div className="card gradient-bg text-white">
              <h2 className="text-2xl font-bold mb-2">
                欢迎来到 whichWitch！
              </h2>
              <p className="text-blue-100 mb-4">
                {loginType === 'email' 
                  ? '您正在使用AI智能钱包，我们会为您处理所有区块链交易。'
                  : '您正在使用Web3钱包，可以完全控制您的数字资产。'
                }
              </p>
              <div className="flex items-center space-x-4 text-sm text-blue-100">
                <span>✨ AI助手已就绪</span>
                <span>🎨 开始您的创作之旅</span>
                <span>💰 智能收益分配</span>
              </div>
            </div>

            {/* AI助手聊天 */}
            <div className="card">
              <h3 className="font-semibold mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-purple-600" />
                AI助手
              </h3>
              
              <form onSubmit={handleAIChat} className="space-y-4">
                <div>
                  <textarea
                    value={aiMessage}
                    onChange={(e) => setAiMessage(e.target.value)}
                    placeholder="向AI助手提问，比如：如何创建我的第一个作品？"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={aiLoading || !aiMessage.trim()}
                  className="btn-primary flex items-center"
                >
                  {aiLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  询问AI助手
                </button>
              </form>

              {aiResponse && (
                <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">AI助手回复：</h4>
                  <div className="text-purple-700 whitespace-pre-line">
                    {aiResponse}
                  </div>
                </div>
              )}
            </div>

            {/* 统计数据 */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="card text-center">
                <div className="text-2xl font-bold text-primary-600">{userStats.totalWorks}</div>
                <div className="text-sm text-gray-600">已注册作品</div>
              </div>
              
              <div className="card text-center">
                <div className="text-2xl font-bold text-green-600">{userStats.totalEarnings} ETH</div>
                <div className="text-sm text-gray-600">总收益</div>
              </div>
              
              <div className="card text-center">
                <div className="text-2xl font-bold text-purple-600">{userStats.totalAuthorizations}</div>
                <div className="text-sm text-gray-600">获得授权</div>
              </div>
            </div>

            {/* 作品管理 */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">作品管理</h3>
                <button 
                  onClick={() => router.push('/works/create')}
                  className="btn-primary text-sm py-2 px-4 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  创建作品
                </button>
              </div>

              {/* 标签页 */}
              <div className="flex border-b border-gray-200 mb-4">
                <button
                  onClick={() => setActiveTab('my-works')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'my-works'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  我的原创作品 ({userWorks.length})
                </button>
                <button
                  onClick={() => setActiveTab('purchased-licenses')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'purchased-licenses'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  已购授权 ({purchasedLicenses.length})
                </button>
                <button
                  onClick={() => setActiveTab('derivative-works')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'derivative-works'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  我的衍生作品 ({derivativeWorks.length})
                </button>
              </div>
              
              {/* 我的原创作品 */}
              {activeTab === 'my-works' && (
                <>
                  {userWorks.length > 0 ? (
                    <div className="space-y-4">
                      {userWorks.map((work) => (
                        <div 
                          key={work.id} 
                          className="border border-gray-200 rounded-lg p-4 hover:border-primary-400 transition-all"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 
                                className="font-medium text-gray-900 hover:text-primary-600 cursor-pointer"
                                onClick={() => router.push(`/works/${work.id}`)}
                              >
                                作品 #{work.id}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {work.isOriginal ? '原创作品' : '衍生作品'}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                创建时间: {new Date(work.createdAt).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                授权费用: {parseFloat(work.licenseFee) / 1e18} ETH
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                work.derivativeAllowed 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {work.derivativeAllowed ? '允许衍生' : '不允许衍生'}
                              </span>
                              <p className="text-xs text-gray-500 mt-2">
                                交易哈希: {work.txHash.slice(0, 10)}...
                              </p>
                            </div>
                          </div>
                          
                          {/* 作品操作按钮 */}
                          <div className="flex space-x-2 pt-3 border-t border-gray-100">
                            <button
                              onClick={() => router.push(`/works/${work.id}`)}
                              className="btn-outline text-xs py-1 px-3"
                            >
                              查看详情
                            </button>
                            <button
                              onClick={() => setShowVoteModal(work.id)}
                              className="bg-purple-600 text-white text-xs py-1 px-3 rounded hover:bg-purple-700"
                            >
                              发起投票
                            </button>
                            <button
                              onClick={() => toast.success('数据分析功能开发中...')}
                              className="btn-outline text-xs py-1 px-3"
                            >
                              数据分析
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>还没有注册作品</p>
                      <p className="text-sm">开始创作您的第一个作品吧！</p>
                    </div>
                  )}
                </>
              )}

              {/* 已购买的授权 */}
              {activeTab === 'purchased-licenses' && (
                <>
                  {purchasedLicenses.length > 0 ? (
                    <div className="space-y-4">
                      {purchasedLicenses.map((license) => (
                        <div 
                          key={license.id} 
                          className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-all"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {license.originalTitle}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                原作者: {license.originalCreator}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                购买时间: {new Date(license.purchaseDate).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                授权费用: {license.licenseFee} ETH
                              </p>
                              <p className="text-xs text-gray-500">
                                有效期至: {new Date(license.expiryDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                license.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {license.status === 'active' ? '有效' : '已过期'}
                              </span>
                              {license.hasCreatedDerivative && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 mt-1">
                                  <Zap className="w-3 h-3 mr-1" />
                                  已创作
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* 授权操作按钮 */}
                          <div className="flex space-x-2 pt-3 border-t border-gray-100">
                            <button
                              onClick={() => router.push(`/works/${license.originalWorkId}`)}
                              className="btn-outline text-xs py-1 px-3"
                            >
                              查看原作
                            </button>
                            {license.status === 'active' && !license.hasCreatedDerivative && (
                              <button
                                onClick={() => router.push(`/works/create?parent=${license.originalWorkId}`)}
                                className="bg-blue-600 text-white text-xs py-1 px-3 rounded hover:bg-blue-700 flex items-center"
                              >
                                <Zap className="w-3 h-3 mr-1" />
                                开始二创
                              </button>
                            )}
                            {license.hasCreatedDerivative && (
                              <button
                                onClick={() => toast.success('查看衍生作品功能开发中...')}
                                className="bg-green-600 text-white text-xs py-1 px-3 rounded hover:bg-green-700"
                              >
                                查看我的衍生作品
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Zap className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>还没有购买任何二创授权</p>
                      <p className="text-sm">去作品库购买喜欢的作品授权吧！</p>
                      <button
                        onClick={() => router.push('/')}
                        className="btn-primary mt-4"
                      >
                        浏览作品库
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* 我的衍生作品 */}
              {activeTab === 'derivative-works' && (
                <>
                  {derivativeWorks.length > 0 ? (
                    <div className="space-y-4">
                      {derivativeWorks.map((work) => (
                        <div 
                          key={work.id} 
                          className="border border-gray-200 rounded-lg p-4 hover:border-purple-400 transition-all"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 
                                className="font-medium text-gray-900 hover:text-primary-600 cursor-pointer"
                                onClick={() => router.push(`/works/${work.id}`)}
                              >
                                {work.title}
                              </h4>
                              <p className="text-sm text-blue-600 mt-1">
                                基于: {work.parentTitle}
                              </p>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {work.description}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                创建时间: {new Date(work.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                work.status === 'published'
                                  ? 'bg-green-100 text-green-800'
                                  : work.status === 'draft'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {work.status === 'published' && <CheckCircle className="w-3 h-3 mr-1" />}
                                {work.status === 'draft' && <Clock className="w-3 h-3 mr-1" />}
                                {work.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                                {work.status === 'published' ? '已发布' : 
                                 work.status === 'draft' ? '草稿' : '已拒绝'}
                              </span>
                            </div>
                          </div>

                          {/* 统计信息 */}
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                            <span>浏览: {work.viewCount}</span>
                            <span>质押: {work.fanStakes}</span>
                            <span className="text-green-600 font-medium">{work.totalStaked} ETH</span>
                          </div>
                          
                          {/* 衍生作品操作按钮 */}
                          <div className="flex space-x-2 pt-3 border-t border-gray-100">
                            <button
                              onClick={() => router.push(`/works/${work.id}`)}
                              className="btn-outline text-xs py-1 px-3"
                            >
                              查看详情
                            </button>
                            <button
                              onClick={() => router.push(`/works/${work.parentWorkId}`)}
                              className="bg-blue-600 text-white text-xs py-1 px-3 rounded hover:bg-blue-700"
                            >
                              查看原作
                            </button>
                            {work.status === 'draft' && (
                              <button
                                onClick={() => router.push(`/works/${work.id}/edit`)}
                                className="bg-yellow-600 text-white text-xs py-1 px-3 rounded hover:bg-yellow-700"
                              >
                                继续编辑
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Upload className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>还没有创作衍生作品</p>
                      <p className="text-sm">购买授权后就可以开始二创了！</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 创建投票模态框 */}
      {showVoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">为作品 #{showVoteModal} 创建投票</h3>
            
            <form onSubmit={handleCreateVote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  投票标题 *
                </label>
                <input
                  type="text"
                  value={voteForm.title}
                  onChange={(e) => setVoteForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="例如：下一个场景设计"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  投票描述 *
                </label>
                <textarea
                  value={voteForm.description}
                  onChange={(e) => setVoteForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="详细描述这次投票的目的和背景..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  投票选项 * (最少2个，最多5个)
                </label>
                <div className="space-y-2">
                  {voteForm.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateVoteOption(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder={`选项 ${index + 1}`}
                        required
                      />
                      {voteForm.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeVoteOption(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          删除
                        </button>
                      )}
                    </div>
                  ))}
                  {voteForm.options.length < 5 && (
                    <button
                      type="button"
                      onClick={addVoteOption}
                      className="text-primary-600 hover:text-primary-800 text-sm"
                    >
                      + 添加选项
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    投票时长 (天)
                  </label>
                  <select
                    value={voteForm.duration}
                    onChange={(e) => setVoteForm(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="3">3天</option>
                    <option value="7">7天</option>
                    <option value="14">14天</option>
                    <option value="30">30天</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    参与质押要求 (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={voteForm.stakeRequired}
                    onChange={(e) => setVoteForm(prev => ({ ...prev, stakeRequired: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0.01"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">投票规则</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 粉丝需要质押指定金额才能参与投票</li>
                  <li>• 投票期间不会公布实时结果</li>
                  <li>• 投票结束后，获胜选项的支持者将获得特殊NFT</li>
                  <li>• 创作者需要在投票结束后产出相应内容</li>
                </ul>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowVoteModal(null)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  创建投票
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}