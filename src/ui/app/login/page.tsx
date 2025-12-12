'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAuth } from '../../contexts/AuthContext'
import { useAI } from '../../contexts/AIContext'
import { Mail, Wallet, Sparkles, ArrowRight, CheckCircle, Clock, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'wallet' | 'email'>('email')
  const [email, setEmail] = useState('')
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [aiAdvice, setAiAdvice] = useState<string | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading, connectWallet, registerWithEmail, sendMagicLink, verifyEmail, loginWithMagicLink } = useAuth()
  const { getWalletAdvice } = useAI()

  // 处理邮箱验证和魔法链接
  useEffect(() => {
    const token = searchParams.get('token')
    const action = searchParams.get('action')

    if (token && action === 'verify') {
      verifyEmail(token)
    } else if (token && action === 'login') {
      loginWithMagicLink(token)
    }
  }, [searchParams, verifyEmail, loginWithMagicLink])

  // 如果已登录，重定向到仪表板
  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  // 处理邮箱注册
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    try {
      await registerWithEmail(email)
      setIsEmailSent(true)
      
      // 获取AI建议
      const advice = await getWalletAdvice(email)
      if (advice) {
        setAiAdvice(advice)
      }
    } catch (error) {
      console.error('Email register error:', error)
    }
  }

  // 处理邮箱登录
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    try {
      await sendMagicLink(email)
      setIsEmailSent(true)
    } catch (error) {
      console.error('Send magic link error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 头部 */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            欢迎来到 <span className="ai-gradient">whichWitch</span>
          </h1>
          <p className="text-xl text-gray-600">
            去中心化创作平台 · 支持AI智能钱包管理
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* 左侧 - 功能介绍 */}
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                  平台特色
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">原创作品NFT化</p>
                      <p className="text-sm text-gray-600">每个作品自动铸造NFT证书</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">智能收益分配</p>
                      <p className="text-sm text-gray-600">自动分配衍生作品收益</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">AI智能助手</p>
                      <p className="text-sm text-gray-600">提供创作建议和钱包管理</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI建议展示 */}
              {aiAdvice && (
                <div className="card border-purple-200 bg-purple-50">
                  <h4 className="font-semibold mb-2 flex items-center text-purple-800">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI助手建议
                  </h4>
                  <div className="text-sm text-purple-700 whitespace-pre-line">
                    {aiAdvice}
                  </div>
                </div>
              )}
            </div>

            {/* 右侧 - 登录表单 */}
            <div className="card">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-center mb-6">选择登录方式</h2>
                
                {/* 标签切换 */}
                <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                  <button
                    onClick={() => setActiveTab('email')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'email'
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Mail className="w-4 h-4 inline mr-2" />
                    邮箱登录
                  </button>
                  <button
                    onClick={() => setActiveTab('wallet')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'wallet'
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Wallet className="w-4 h-4 inline mr-2" />
                    钱包登录
                  </button>
                </div>
              </div>

              {/* 邮箱登录 */}
              {activeTab === 'email' && (
                <div className="space-y-4">
                  {!isEmailSent ? (
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start space-x-3">
                          <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-800">AI智能钱包</p>
                            <p className="text-xs text-blue-600">
                              我们将为您自动创建安全的以太坊钱包，并提供AI助手服务
                            </p>
                          </div>
                        </div>
                      </div>

                      <form onSubmit={handleEmailRegister} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            邮箱地址
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="输入您的邮箱地址"
                            className="input-field"
                            required
                          />
                        </div>
                        
                        <button
                          type="submit"
                          disabled={isLoading || !email}
                          className="w-full btn-primary flex items-center justify-center"
                        >
                          {isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <Mail className="w-4 h-4 mr-2" />
                          )}
                          注册/登录
                        </button>
                      </form>

                      <div className="text-center">
                        <p className="text-xs text-gray-500">
                          已有账户？输入邮箱后我们会发送登录链接
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Mail className="w-8 h-8 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">邮件已发送！</h3>
                        <p className="text-gray-600">
                          请检查您的邮箱 <span className="font-medium">{email}</span>
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          点击邮件中的链接完成注册或登录
                        </p>
                      </div>
                      
                      <button
                        onClick={() => setIsEmailSent(false)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        重新输入邮箱
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 钱包登录 */}
              {activeTab === 'wallet' && (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">传统Web3方式</p>
                        <p className="text-xs text-amber-600">
                          使用MetaMask等钱包连接，您完全控制私钥
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <ConnectButton.Custom>
                      {({
                        account,
                        chain,
                        openAccountModal,
                        openChainModal,
                        openConnectModal,
                        authenticationStatus,
                        mounted,
                      }) => {
                        const ready = mounted && authenticationStatus !== 'loading'
                        const connected =
                          ready &&
                          account &&
                          chain &&
                          (!authenticationStatus ||
                            authenticationStatus === 'authenticated')

                        return (
                          <div>
                            {(() => {
                              if (!connected) {
                                return (
                                  <button
                                    onClick={openConnectModal}
                                    className="w-full btn-primary flex items-center justify-center"
                                  >
                                    <Wallet className="w-4 h-4 mr-2" />
                                    连接钱包
                                  </button>
                                )
                              }

                              if (chain.unsupported) {
                                return (
                                  <button
                                    onClick={openChainModal}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg"
                                  >
                                    切换网络
                                  </button>
                                )
                              }

                              return (
                                <div className="space-y-3">
                                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <p className="text-sm text-green-800">
                                      钱包已连接: {account.displayName}
                                    </p>
                                  </div>
                                  
                                  <button
                                    onClick={connectWallet}
                                    disabled={isLoading}
                                    className="w-full btn-primary flex items-center justify-center"
                                  >
                                    {isLoading ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    ) : (
                                      <ArrowRight className="w-4 h-4 mr-2" />
                                    )}
                                    签名登录
                                  </button>
                                </div>
                              )
                            })()}
                          </div>
                        )
                      }}
                    </ConnectButton.Custom>

                    <div className="text-center">
                      <p className="text-xs text-gray-500">
                        支持 MetaMask、WalletConnect 等主流钱包
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}