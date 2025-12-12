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
  Settings,
  Copy,
  ExternalLink
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user, logout, loginType } = useAuth()
  const { chatWithAI, getWalletManagement, isLoading: aiLoading } = useAI()
  const router = useRouter()
  
  const [aiMessage, setAiMessage] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [walletAdvice, setWalletAdvice] = useState<string | null>(null)

  // 如果未登录，重定向到登录页
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  // 获取钱包管理建议（仅邮箱用户）
  useEffect(() => {
    if (user && user.loginType === 'email') {
      getWalletManagement().then(setWalletAdvice)
    }
  }, [user, getWalletManagement])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold ai-gradient">whichWitch</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {loginType === 'email' ? (
                  <Mail className="w-4 h-4" />
                ) : (
                  <Wallet className="w-4 h-4" />
                )}
                <span>{loginType === 'email' ? '邮箱登录' : '钱包登录'}</span>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4" />
                <span>退出</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

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
                <button className="w-full btn-primary flex items-center justify-center">
                  <Plus className="w-4 h-4 mr-2" />
                  注册新作品
                </button>
                
                <button className="w-full btn-outline flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  查看收益
                </button>
                
                <button className="w-full btn-outline flex items-center justify-center">
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
                <div className="text-2xl font-bold text-primary-600">0</div>
                <div className="text-sm text-gray-600">已注册作品</div>
              </div>
              
              <div className="card text-center">
                <div className="text-2xl font-bold text-green-600">0 ETH</div>
                <div className="text-sm text-gray-600">总收益</div>
              </div>
              
              <div className="card text-center">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-sm text-gray-600">获得授权</div>
              </div>
            </div>

            {/* 最近活动 */}
            <div className="card">
              <h3 className="font-semibold mb-4">最近活动</h3>
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>还没有活动记录</p>
                <p className="text-sm">开始创作您的第一个作品吧！</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}