'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  Heart, 
  TrendingUp, 
  Vote, 
  Coins, 
  Gift,
  Star,
  Trophy,
  Clock,
  Users,
  Zap,
  ArrowRight,
  Plus
} from 'lucide-react'
import { transactionAPI } from '../../lib/api'
import toast from 'react-hot-toast'

interface FanStake {
  workId: number
  workTitle: string
  stakeAmount: string
  stakeDate: string
  earnings: string
  creator: string
}

interface FanVote {
  voteId: string
  workId: number
  workTitle: string
  voteTitle: string
  selectedOption: string
  voteDate: string
  status: 'active' | 'ended' | 'won' | 'lost'
  reward?: string
}

interface FanNFT {
  id: string
  workId: number
  workTitle: string
  type: 'vote_winner' | 'early_supporter' | 'top_staker'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  backgroundColor: string
  earnedDate: string
}

export default function FanDashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  
  const [fanStakes, setFanStakes] = useState<FanStake[]>([])
  const [fanVotes, setFanVotes] = useState<FanVote[]>([])
  const [fanNFTs, setFanNFTs] = useState<FanNFT[]>([])
  const [fanStats, setFanStats] = useState({
    totalStaked: '0',
    totalEarnings: '0',
    totalVotes: 0,
    totalNFTs: 0,
    fanLevel: 1,
    fanPoints: 0
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
      return
    }
    
    if (user) {
      fetchFanData()
    }
  }, [user, isLoading, router])

  const fetchFanData = async () => {
    // 模拟粉丝数据
    setFanStakes([
      {
        workId: 1,
        workTitle: '未来城市概念图',
        stakeAmount: '0.05',
        stakeDate: '2024-01-15',
        earnings: '0.003',
        creator: '0x1234...5678'
      },
      {
        workId: 3,
        workTitle: '赛博朋克角色设计',
        stakeAmount: '0.03',
        stakeDate: '2024-01-20',
        earnings: '0.001',
        creator: '0xabcd...efgh'
      }
    ])

    setFanVotes([
      {
        voteId: '1',
        workId: 1,
        workTitle: '未来城市概念图',
        voteTitle: '下一个场景设计',
        selectedOption: '太空站',
        voteDate: '2024-01-18',
        status: 'won',
        reward: '10'
      },
      {
        voteId: '2',
        workId: 3,
        workTitle: '赛博朋克角色设计',
        voteTitle: '新装备选择',
        selectedOption: '光剑',
        voteDate: '2024-01-22',
        status: 'active'
      }
    ])

    setFanNFTs([
      {
        id: 'nft_1',
        workId: 1,
        workTitle: '未来城市概念图',
        type: 'vote_winner',
        rarity: 'rare',
        backgroundColor: '#FF6B6B',
        earnedDate: '2024-01-19'
      },
      {
        id: 'nft_2',
        workId: 3,
        workTitle: '赛博朋克角色设计',
        type: 'early_supporter',
        rarity: 'common',
        backgroundColor: '#4ECDC4',
        earnedDate: '2024-01-21'
      }
    ])

    setFanStats({
      totalStaked: '0.08',
      totalEarnings: '0.004',
      totalVotes: 2,
      totalNFTs: 2,
      fanLevel: 2,
      fanPoints: 150
    })
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-600 bg-yellow-100'
      case 'epic': return 'text-purple-600 bg-purple-100'
      case 'rare': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getVoteStatusColor = (status: string) => {
    switch (status) {
      case 'won': return 'text-green-600 bg-green-100'
      case 'lost': return 'text-red-600 bg-red-100'
      case 'ended': return 'text-gray-600 bg-gray-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  const getVoteStatusText = (status: string) => {
    switch (status) {
      case 'won': return '获胜'
      case 'lost': return '失败'
      case 'ended': return '已结束'
      default: return '进行中'
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
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* 头部欢迎区域 */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">粉丝中心</h1>
              <p className="text-purple-100">
                支持你喜爱的创作者，参与社区治理，获得独特奖励！
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">Lv.{fanStats.fanLevel}</div>
              <div className="text-sm text-purple-200">粉丝等级</div>
              <div className="text-lg font-semibold mt-1">{fanStats.fanPoints} 积分</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左侧 - 统计数据 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 粉丝统计 */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                我的统计
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">总质押金额</span>
                  <span className="font-semibold">{fanStats.totalStaked} ETH</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">累计收益</span>
                  <span className="font-semibold text-green-600">+{fanStats.totalEarnings} ETH</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">参与投票</span>
                  <span className="font-semibold">{fanStats.totalVotes} 次</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">收集NFT</span>
                  <span className="font-semibold">{fanStats.totalNFTs} 个</span>
                </div>
              </div>
            </div>

            {/* 快捷操作 */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">快捷操作</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => router.push('/marketplace')}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  发现作品
                </button>
                
                <button 
                  onClick={() => router.push('/works/create')}
                  className="w-full btn-outline flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  成为创作者
                </button>
              </div>
            </div>

            {/* 粉丝等级进度 */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-600" />
                等级进度
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Lv.{fanStats.fanLevel}</span>
                  <span>Lv.{fanStats.fanLevel + 1}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(fanStats.fanPoints % 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">
                  还需 {100 - (fanStats.fanPoints % 100)} 积分升级
                </p>
              </div>
            </div>
          </div>

          {/* 右侧 - 主要内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 我的质押 */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center">
                  <Coins className="w-5 h-5 mr-2 text-blue-600" />
                  我的质押
                </h3>
                <button 
                  onClick={() => router.push('/marketplace')}
                  className="btn-outline text-sm"
                >
                  质押更多
                </button>
              </div>
              
              {fanStakes.length > 0 ? (
                <div className="space-y-4">
                  {fanStakes.map((stake, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-primary-400 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{stake.workTitle}</h4>
                          <p className="text-sm text-gray-600 mb-2">
                            创作者: {stake.creator.slice(0, 10)}...
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>质押: {stake.stakeAmount} ETH</span>
                            <span>收益: +{stake.earnings} ETH</span>
                            <span>日期: {stake.stakeDate}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => router.push(`/works/${stake.workId}`)}
                          className="btn-outline text-xs py-1 px-3"
                        >
                          查看详情
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Coins className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>还没有质押任何作品</p>
                  <p className="text-sm">去发现你喜欢的作品并质押支持吧！</p>
                </div>
              )}
            </div>

            {/* 我的投票 */}
            <div className="card">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Vote className="w-5 h-5 mr-2 text-purple-600" />
                我的投票
              </h3>
              
              {fanVotes.length > 0 ? (
                <div className="space-y-4">
                  {fanVotes.map((vote) => (
                    <div key={vote.voteId} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{vote.voteTitle}</h4>
                          <p className="text-sm text-gray-600">作品: {vote.workTitle}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVoteStatusColor(vote.status)}`}>
                          {getVoteStatusText(vote.status)}
                        </span>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">我的选择:</span>
                          <span className="font-medium">{vote.selectedOption}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>投票时间: {vote.voteDate}</span>
                        {vote.reward && (
                          <span className="text-green-600 font-medium">
                            奖励: +{vote.reward} 积分
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Vote className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>还没有参与任何投票</p>
                  <p className="text-sm">参与社区投票，影响作品发展方向！</p>
                </div>
              )}
            </div>

            {/* 我的NFT收藏 */}
            <div className="card">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Gift className="w-5 h-5 mr-2 text-pink-600" />
                我的NFT收藏
              </h3>
              
              {fanNFTs.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {fanNFTs.map((nft) => (
                    <div key={nft.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div 
                        className="w-full h-24 rounded-lg mb-3 flex items-center justify-center"
                        style={{ backgroundColor: nft.backgroundColor }}
                      >
                        <div className="text-white text-center">
                          <Trophy className="w-6 h-6 mx-auto mb-1" />
                          <div className="text-xs font-medium">#{nft.workId}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-900 truncate">
                          {nft.workTitle}
                        </h4>
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(nft.rarity)}`}>
                            {nft.rarity}
                          </span>
                          <span className="text-xs text-gray-500">
                            {nft.earnedDate}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          {nft.type === 'vote_winner' ? '投票获胜' : 
                           nft.type === 'early_supporter' ? '早期支持者' : '顶级质押者'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Gift className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>还没有收集任何NFT</p>
                  <p className="text-sm">参与投票和质押来获得独特的NFT奖励！</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}