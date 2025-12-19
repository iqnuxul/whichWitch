'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  Vote, 
  TrendingUp, 
  Clock, 
  Users, 
  Zap,
  Trophy,
  Star,
  Heart,
  MessageCircle,
  Share2,
  Filter,
  Search
} from 'lucide-react'
import toast from 'react-hot-toast'

interface CommunityVote {
  id: string
  workId: number
  workTitle: string
  creator: string
  title: string
  description: string
  options: { name: string; votes: number; percentage: number }[]
  totalVotes: number
  endTime: string
  status: 'active' | 'ended'
  stakeRequired: string
  reward: string
  category: 'story' | 'design' | 'feature'
}

interface TrendingWork {
  id: number
  title: string
  creator: string
  category: string
  fanStakes: number
  totalStaked: string
  recentActivity: string
  thumbnail: string
}

export default function CommunityPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState<'votes' | 'trending' | 'discussions'>('votes')
  const [votes, setVotes] = useState<CommunityVote[]>([])
  const [trendingWorks, setTrendingWorks] = useState<TrendingWork[]>([])
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchCommunityData()
  }, [])

  const fetchCommunityData = async () => {
    // 模拟社区投票数据
    setVotes([
      {
        id: '1',
        workId: 1,
        workTitle: '未来城市概念图',
        creator: '0x1234...5678',
        title: '下一个场景：太空站 vs 海底城市',
        description: '创作者想要扩展这个未来世界，你觉得下一个场景应该是什么？',
        options: [
          { name: '太空站', votes: 45, percentage: 60 },
          { name: '海底城市', votes: 30, percentage: 40 }
        ],
        totalVotes: 75,
        endTime: '2024-02-01T00:00:00Z',
        status: 'active',
        stakeRequired: '0.01',
        reward: '50',
        category: 'story'
      },
      {
        id: '2',
        workId: 3,
        workTitle: '赛博朋克角色设计',
        creator: '0xabcd...efgh',
        title: '新装备设计投票',
        description: '为主角选择下一个装备升级',
        options: [
          { name: '光剑', votes: 28, percentage: 35 },
          { name: '能量盾', votes: 32, percentage: 40 },
          { name: '飞行背包', votes: 20, percentage: 25 }
        ],
        totalVotes: 80,
        endTime: '2024-01-28T00:00:00Z',
        status: 'active',
        stakeRequired: '0.005',
        reward: '30',
        category: 'design'
      }
    ])

    // 模拟热门作品数据
    setTrendingWorks([
      {
        id: 1,
        title: '未来城市概念图',
        creator: '0x1234...5678',
        category: '概念艺术',
        fanStakes: 12,
        totalStaked: '0.45',
        recentActivity: '2小时前有新投票',
        thumbnail: '#FF6B6B'
      },
      {
        id: 3,
        title: '赛博朋克角色设计',
        creator: '0xabcd...efgh',
        category: '角色设计',
        fanStakes: 8,
        totalStaked: '0.32',
        recentActivity: '1天前更新设计',
        thumbnail: '#4ECDC4'
      }
    ])
  }

  const handleVote = async (voteId: string, option: string) => {
    if (!user) {
      toast.error('请先登录')
      return
    }

    try {
      // 这里应该调用投票API
      toast.success(`投票成功！选择了: ${option}`)
      fetchCommunityData() // 刷新数据
    } catch (error) {
      console.error('投票失败:', error)
      toast.error('投票失败')
    }
  }

  const handleStakeWork = async (workId: number) => {
    if (!user) {
      toast.error('请先登录')
      return
    }

    const amount = prompt('请输入质押金额 (ETH):')
    if (amount) {
      toast.success(`成功质押 ${amount} ETH 支持作品！`)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'story': return 'bg-blue-100 text-blue-800'
      case 'design': return 'bg-purple-100 text-purple-800'
      case 'feature': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'story': return '故事走向'
      case 'design': return '设计选择'
      case 'feature': return '功能特性'
      default: return category
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
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">社区中心</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            参与投票，支持创作者，影响作品发展方向，获得独特奖励
          </p>
        </div>

        {/* 标签页导航 */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('votes')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'votes'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Vote className="w-4 h-4 inline mr-2" />
              社区投票
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'trending'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              热门作品
            </button>
            <button
              onClick={() => setActiveTab('discussions')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'discussions'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageCircle className="w-4 h-4 inline mr-2" />
              讨论区
            </button>
          </div>
        </div>

        {/* 社区投票标签页 */}
        {activeTab === 'votes' && (
          <div className="max-w-4xl mx-auto">
            {/* 筛选和搜索 */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="搜索投票..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">所有类型</option>
                <option value="story">故事走向</option>
                <option value="design">设计选择</option>
                <option value="feature">功能特性</option>
              </select>
            </div>

            {/* 投票列表 */}
            <div className="space-y-6">
              {votes.map((vote) => (
                <div key={vote.id} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{vote.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(vote.category)}`}>
                          {getCategoryText(vote.category)}
                        </span>
                        {vote.status === 'active' && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            进行中
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{vote.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>作品: {vote.workTitle}</span>
                        <span>创作者: {vote.creator.slice(0, 10)}...</span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(vote.endTime).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-600">{vote.totalVotes}</div>
                      <div className="text-sm text-gray-500">总投票</div>
                    </div>
                  </div>

                  {/* 投票选项 */}
                  <div className="space-y-3 mb-4">
                    {vote.options.map((option) => (
                      <div key={option.name} className="flex items-center justify-between">
                        <div className="flex-1 mr-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{option.name}</span>
                            {vote.status === 'ended' ? (
                              <span className="text-sm text-gray-500">
                                {option.votes} 票 ({option.percentage}%)
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">
                                投票中...
                              </span>
                            )}
                          </div>
                          {vote.status === 'ended' ? (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${option.percentage}%` }}
                              ></div>
                            </div>
                          ) : (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-gray-300 h-2 rounded-full w-0"></div>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleVote(vote.id, option.name)}
                          disabled={vote.status !== 'active' || !user}
                          className="btn-outline text-sm py-1 px-4 disabled:opacity-50"
                        >
                          {vote.status === 'active' ? '投票' : '已结束'}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* 投票信息 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">质押要求:</span>
                        <span className="ml-2 font-medium">{vote.stakeRequired} ETH</span>
                      </div>
                      <div>
                        <span className="text-gray-500">参与奖励:</span>
                        <span className="ml-2 font-medium text-green-600">+{vote.reward} 积分</span>
                      </div>
                      <div>
                        <span className="text-gray-500">状态:</span>
                        <span className="ml-2 font-medium">
                          {vote.status === 'active' ? '进行中' : '已结束'}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button className="flex items-center text-gray-500 hover:text-gray-700">
                          <Share2 className="w-4 h-4 mr-1" />
                          分享
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 热门作品标签页 */}
        {activeTab === 'trending' && (
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingWorks.map((work) => (
                <div key={work.id} className="card hover:shadow-lg transition-shadow">
                  <div 
                    className="w-full h-48 rounded-lg mb-4 flex items-center justify-center cursor-pointer"
                    style={{ backgroundColor: work.thumbnail }}
                    onClick={() => router.push(`/works/${work.id}`)}
                  >
                    <div className="text-white text-center">
                      <div className="text-3xl font-bold">#{work.id}</div>
                      <div className="text-sm opacity-80">{work.category}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">{work.title}</h3>
                    <p className="text-sm text-gray-600">
                      创作者: {work.creator.slice(0, 10)}...
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center text-pink-600">
                          <Heart className="w-4 h-4 mr-1" />
                          {work.fanStakes} 粉丝
                        </span>
                        <span className="text-green-600">
                          {work.totalStaked} ETH
                        </span>
                      </div>
                      <span className="text-gray-500">{work.recentActivity}</span>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStakeWork(work.id)}
                        className="flex-1 bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 flex items-center justify-center"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        质押支持
                      </button>
                      <button
                        onClick={() => router.push(`/works/${work.id}`)}
                        className="btn-outline py-2 px-4"
                      >
                        查看详情
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 讨论区标签页 */}
        {activeTab === 'discussions' && (
          <div className="max-w-4xl mx-auto text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">讨论区即将上线</h3>
            <p className="text-gray-500">敬请期待更多社区互动功能！</p>
          </div>
        )}
      </div>
    </div>
  )
}