'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { Sparkles, Palette, Shield, Zap, ArrowRight, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()

  // 如果已登录，重定向到仪表板
  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-white">
      {/* 导航栏 */}
      <nav className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold ai-gradient">whichWitch</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/login"
                className="btn-outline"
              >
                登录
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 英雄区域 */}
      <section className="gradient-bg text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            去中心化创作平台
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            支持原创作品NFT化、衍生创作授权、智能收益分配，让创作者获得应有的回报
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/login"
              className="bg-white text-purple-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-colors flex items-center"
            >
              开始创作
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            
            <div className="text-blue-100 text-sm">
              支持邮箱登录 · AI智能助手 · 无需懂区块链
            </div>
          </div>
        </div>
      </section>

      {/* 特色功能 */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              为什么选择 whichWitch？
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              我们结合了区块链技术和AI智能，为创作者提供最佳的创作和收益体验
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 功能卡片 */}
            <div className="card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Palette className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">原创作品NFT化</h3>
              <p className="text-gray-600">
                每个注册的作品自动铸造NFT证书，永久记录在区块链上，证明您的创作权益
              </p>
            </div>

            <div className="card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">智能收益分配</h3>
              <p className="text-gray-600">
                衍生作品的收益自动分配给原创者和中间创作者，确保每个人都能获得应有回报
              </p>
            </div>

            <div className="card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI智能助手</h3>
              <p className="text-gray-600">
                提供创作建议、风险评估、钱包管理等智能服务，让您专注于创作本身
              </p>
            </div>

            <div className="card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">双重登录方式</h3>
              <p className="text-gray-600">
                支持传统钱包登录和邮箱登录，邮箱用户享受AI代理交易服务，无需懂区块链
              </p>
            </div>

            <div className="card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">衍生创作授权</h3>
              <p className="text-gray-600">
                创作者可以设置授权费用，其他人支付费用后即可基于您的作品进行再创作
              </p>
            </div>

            <div className="card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">创作者社区</h3>
              <p className="text-gray-600">
                打赏功能、作品展示、创作者互动，构建活跃的去中心化创作者生态
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 工作流程 */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              简单三步，开始创作
            </h2>
            <p className="text-xl text-gray-600">
              无论您是区块链新手还是资深用户，都能轻松上手
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">选择登录方式</h3>
              <p className="text-gray-600">
                使用邮箱快速注册（AI自动创建钱包）或连接现有Web3钱包
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">注册您的作品</h3>
              <p className="text-gray-600">
                上传作品信息，设置授权费用，系统自动铸造NFT证书
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">获得收益</h3>
              <p className="text-gray-600">
                通过授权费、打赏、衍生作品收益分配等多种方式获得回报
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA区域 */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            准备好开始您的创作之旅了吗？
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            加入 whichWitch，让您的创作获得应有的价值和回报
          </p>
          
          <Link 
            href="/login"
            className="bg-white text-primary-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-colors inline-flex items-center"
          >
            立即开始
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <span className="text-xl font-bold">whichWitch</span>
          </div>
          
          <div className="text-center text-gray-400">
            <p>&copy; 2024 whichWitch. 去中心化创作平台.</p>
            <p className="mt-2">让每个创作者都能获得应有的回报</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
