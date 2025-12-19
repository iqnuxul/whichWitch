'use client'

import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  User,
  Zap,
  TrendingUp,
  Vote,
  Sparkles,
  Plus,
  Heart,
  Search,
  ArrowRight
} from 'lucide-react'

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="ai-gradient">whichWitch</span>
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              OC共创经济平台
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              连接创作者与粉丝，通过区块链技术保护版权，实现创作价值的公平分配
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => router.push('/works')}
                className="btn-primary text-lg px-8 py-4 flex items-center justify-center"
              >
                <Search className="w-5 h-5 mr-2" />
                探索作品库
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              
              {!user && (
                <button
                  onClick={() => router.push('/login')}
                  className="btn-outline text-lg px-8 py-4 flex items-center justify-center"
                >
                  <User className="w-5 h-5 mr-2" />
                  加入平台
                </button>
              )}
              
              {user && (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn-outline text-lg px-8 py-4 flex items-center justify-center"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  创作者中心
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Creation Chain Concept */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">创作链知识图谱</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              可视化展示原创与衍生作品的关系网络，构建去中心化的创作生态
            </p>
          </div>

          {/* 知识图谱可视化 */}
          <div className="relative max-w-4xl mx-auto h-96 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl overflow-hidden">
            {/* 背景网格 */}
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#6366f1" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* 创作节点 */}
            <div className="relative h-full flex items-center justify-center">
              {/* 中心原创节点 */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="text-center mt-2">
                  <div className="text-sm font-semibold text-gray-900">原创作品</div>
                  <div className="text-xs text-gray-500">创作起点</div>
                </div>
              </div>

              {/* 衍生节点 */}
              <div className="absolute top-20 left-20">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-md">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="text-center mt-1">
                  <div className="text-xs font-medium text-gray-800">二创A</div>
                </div>
              </div>

              <div className="absolute top-32 right-16">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-md">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="text-center mt-1">
                  <div className="text-xs font-medium text-gray-800">二创B</div>
                </div>
              </div>

              <div className="absolute bottom-20 left-32">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="text-center mt-1">
                  <div className="text-xs font-medium text-gray-800">二创C</div>
                </div>
              </div>

              {/* 粉丝投票节点 */}
              <div className="absolute bottom-16 right-20">
                <div className="w-14 h-14 bg-gradient-to-r from-pink-400 to-red-500 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  <Vote className="w-5 h-5 text-white" />
                </div>
                <div className="text-center mt-1">
                  <div className="text-xs font-medium text-gray-800">投票节点</div>
                </div>
              </div>

              {/* 连接线 */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* 原创到衍生的连线 */}
                <line x1="50%" y1="50%" x2="20%" y2="25%" stroke="#6366f1" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
                <line x1="50%" y1="50%" x2="80%" y2="35%" stroke="#6366f1" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
                <line x1="50%" y1="50%" x2="35%" y2="75%" stroke="#6366f1" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
                <line x1="50%" y1="50%" x2="75%" y2="80%" stroke="#ec4899" strokeWidth="2" strokeDasharray="3,3" className="animate-pulse" />
              </svg>

              {/* 浮动标签 */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm">
                <div className="text-xs text-gray-600">💡 原创激发灵感</div>
              </div>
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm">
                <div className="text-xs text-gray-600">🔗 衍生扩展创意</div>
              </div>
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm">
                <div className="text-xs text-gray-600">🎯 版税自动分配</div>
              </div>
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm">
                <div className="text-xs text-gray-600">🗳️ 粉丝投票决策</div>
              </div>
            </div>
          </div>

          {/* 概念说明 */}
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">原创节点</h3>
              <p className="text-gray-600 text-sm">每个原创作品都是创作网络中的核心节点，激发无限衍生可能</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">衍生链条</h3>
              <p className="text-gray-600 text-sm">二创作品形成分支网络，每个节点都记录创作谱系和版税关系</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Vote className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">社区节点</h3>
              <p className="text-gray-600 text-sm">粉丝投票产生新的创作方向，社区共同决定网络发展</p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Highlights */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              平台核心亮点
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              革命性的Web3创作经济模式，重新定义创作价值
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI创作助手</h3>
              <p className="text-blue-100 text-sm">内容检测、授权建议、创作优化全程AI辅助</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">智能二创授权</h3>
              <p className="text-blue-100 text-sm">AI辅助授权决策，自动版税分配</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">创作链追溯</h3>
              <p className="text-blue-100 text-sm">完整记录从原创到衍生的创作谱系</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Vote className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">圆形NFT徽章</h3>
              <p className="text-blue-100 text-sm">粉丝投票获得独特徽章，作品图+专属背景</p>
            </div>
          </div>

          <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-white mb-2">🔒 版权保护</div>
                <p className="text-blue-100">区块链永久记录，作品哈希上链不可篡改</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">🤖 违规检测</div>
                <p className="text-blue-100">上传前AI自动检测内容合规性，确保平台质量</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">💰 粉丝经济</div>
                <p className="text-blue-100">质押支持创作者，投票参与创作方向决策</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">快速开始</h2>
            <p className="text-xl text-gray-600">选择你的角色，开始Web3创作之旅</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">创作者</h3>
              <p className="text-gray-600 mb-4">上传原创作品，获得版权保护和收益分成</p>
              <button
                onClick={() => user ? router.push('/works/create') : router.push('/login')}
                className="btn-primary w-full"
              >
                开始创作
              </button>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">粉丝</h3>
              <p className="text-gray-600 mb-4">支持喜爱的创作者，参与作品投票和治理</p>
              <button
                onClick={() => router.push('/works')}
                className="btn-primary w-full"
              >
                发现作品
              </button>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">收藏家</h3>
              <p className="text-gray-600 mb-4">收藏和交易NFT，投资优质数字艺术品</p>
              <button
                onClick={() => router.push('/marketplace')}
                className="btn-primary w-full"
              >
                浏览市场
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">1,200+</div>
              <div className="text-gray-600">注册创作者</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">5,800+</div>
              <div className="text-gray-600">原创作品</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">120 ETH</div>
              <div className="text-gray-600">总交易额</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">8,500+</div>
              <div className="text-gray-600">活跃用户</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}