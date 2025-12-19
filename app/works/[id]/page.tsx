'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { 
  Heart, 
  Share2, 
  Flag, 
  Zap, 
  Users, 
  TrendingUp,
  Clock,
  Shield,
  Vote,
  Gift,
  ArrowLeft,
  ExternalLink,
  Coins
} from 'lucide-react'
import { transactionAPI } from '../../../lib/api'
import toast from 'react-hot-toast'

interface Work {
  id: number
  title: string
  description: string
  creator: string
  licenseFee: string
  derivativeAllowed: boolean
  isOriginal: boolean
  parentId?: number
  createdAt: string
  txHash: string
  contentHash: string
  category: string
  tags: string[]
  stakeAmount: string
  authorizeType: string
  royaltyPercentage: number
  fanStakeEnabled: boolean
  votingEnabled: boolean
  isPublic: boolean
}

interface FanStake {
  user: string
  amount: string
  timestamp: string
}

interface Vote {
  id: string
  title: string
  description: string
  options: string[]
  votes: { [option: string]: number }
  endTime: string
  status: 'active' | 'ended'
  createdBy: string
}

export default function WorkDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const workId = params.id as string

  const [work, setWork] = useState<Work | null>(null)
  const [loading, setLoading] = useState(true)
  const [fanStakes, setFanStakes] = useState<FanStake[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
  const [stakeAmount, setStakeAmount] = useState('0.01')
  const [showStakeModal, setShowStakeModal] = useState(false)
  const [showVoteModal, setShowVoteModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [creationChain, setCreationChain] = useState<{
    parents: Work[]
    children: Work[]
  }>({ parents: [], children: [] })
  const [showCreationChain, setShowCreationChain] = useState(false)

  useEffect(() => {
    if (workId) {
      fetchWorkDetail()
      fetchFanStakes()
      fetchVotes()
      fetchCreationChain()
    }
  }, [workId])

  const fetchCreationChain = async () => {
    try {
      // 模拟获取创作链数据
      const mockParents: Work[] = [
        {
          id: 1,
          title: '原始概念图',
          description: '最初的创意来源',
          creator: '0xoriginal...creator',
          licenseFee: '0.005',
          derivativeAllowed: true,
          isOriginal: true,
          createdAt: '2024-01-10T10:00:00Z',
          txHash: '0xparent1...',
          contentHash: 'QmParent1...',
          category: 'concept-art',
          tags: ['原创', '概念'],
          stakeAmount: '0.1',
          authorizeType: 'commercial',
          royaltyPercentage: 10,
          fanStakeEnabled: true,
          votingEnabled: true,
          isPublic: true
        }
      ]

      const mockChildren: Work[] = [
        {
          id: 3,
          title: '衍生设计 A',
          description: '基于原作的第一个衍生版本',
          creator: '0xchild1...creator',
          licenseFee: '0.008',
          derivativeAllowed: true,
          isOriginal: false,
          parentId: parseInt(workId),
          createdAt: '2024-01-25T14:00:00Z',
          txHash: '0xchild1...',
          contentHash: 'QmChild1...',
          category: 'concept-art',
          tags: ['衍生', '设计'],
          stakeAmount: '0.05',
          authorizeType: 'commercial',
          royaltyPercentage: 8,
          fanStakeEnabled: true,
          votingEnabled: true,
          isPublic: true
        },
        {
          id: 4,
          title: '衍生设计 B',
          description: '基于原作的第二个衍生版本',
          creator: '0xchild2...creator',
          licenseFee: '0.012',
          derivativeAllowed: true,
          isOriginal: false,
          parentId: parseInt(workId),
          createdAt: '2024-01-28T16:30:00Z',
          txHash: '0xchild2...',
          contentHash: 'QmChild2...',
          category: 'concept-art',
          tags: ['衍生', '创新'],
          stakeAmount: '0.08',
          authorizeType: 'non-commercial',
          royaltyPercentage: 12,
          fanStakeEnabled: true,
          votingEnabled: false,
          isPublic: true
        }
      ]

      setCreationChain({ parents: mockParents, children: mockChildren })
    } catch (error) {
      console.error('获取创作链失败:', error)
    }
  }

  const fetchWorkDetail = async () => {
    try {
      setLoading(true)
      // 这里应该调用获取作品详情的API
      // 暂时使用模拟数据
      const mockWork: Work = {
        id: parseInt(workId),
        title: `作品 #${workId}`,
        description: '这是一个精美的数字艺术作品，展现了未来主义的设计理念...',
        creator: '0x1234...5678',
        licenseFee: '0.01',
        derivativeAllowed: true,
        isOriginal: true,
        createdAt: new Date().toISOString(),
        txHash: '0xabcd...efgh',
        contentHash: 'QmHash123...',
        category: 'digital-art',
        tags: ['未来主义', '数字艺术', '原创'],
        stakeAmount: '0.1',
        authorizeType: 'commercial',
        royaltyPercentage: 10,
        fanStakeEnabled: true,
        votingEnabled: true,
        isPublic: true
      }
      setWork(mockWork)
    } catch (error) {
      console.error('获取作品详情失败:', error)
      toast.error('获取作品详情失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchFanStakes = async () => {
    // 模拟粉丝质押数据
    setFanStakes([
      { user: '0xabc...def', amount: '0.05', timestamp: new Date().toISOString() },
      { user: '0x123...456', amount: '0.03', timestamp: new Date().toISOString() }
    ])
  }

  const fetchVotes = async () => {
    // 模拟投票数据
    setVotes([
      {
        id: '1',
        title: '下一个故事走向',
        description: '选择主角的下一步行动',
        options: ['探索神秘森林', '返回村庄', '寻找宝藏'],
        votes: { '探索神秘森林': 15, '返回村庄': 8, '寻找宝藏': 22 },
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        createdBy: work?.creator || ''
      }
    ])
  }

  const handleFanStake = async () => {
    if (!user) {
      toast.error('请先登录')
      return
    }

    try {
      // 调用质押API
      toast.success(`成功质押 ${stakeAmount} ETH！`)
      setShowStakeModal(false)
      fetchFanStakes()
    } catch (error) {
      console.error('质押失败:', error)
      toast.error('质押失败')
    }
  }

  const handleVote = async (voteId: string, option: string) => {
    if (!user) {
      toast.error('请先登录')
      return
    }

    try {
      // 调用投票API
      toast.success('投票成功！')
      fetchVotes()
    } catch (error) {
      console.error('投票失败:', error)
      toast.error('投票失败')
    }
  }

  const handleReport = async (reason: string) => {
    if (!user) {
      toast.error('请先登录')
      return
    }

    try {
      // 调用举报API
      toast.success('举报已提交，我们会尽快处理')
      setShowReportModal(false)
    } catch (error) {
      console.error('举报失败:', error)
      toast.error('举报失败')
    }
  }

  const handleCreateDerivative = () => {
    router.push(`/works/create?parent=${workId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!work) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">作品不存在</h2>
          <button onClick={() => router.back()} className="btn-primary">
            返回
          </button>
        </div>
      </div>
    )
  }

  const totalFanStake = fanStakes.reduce((sum, stake) => sum + parseFloat(stake.amount), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{work.title}</h1>
              <p className="text-gray-600">{work.description}</p>
            </div>
            
            <div className="flex space-x-2">
              <button className="btn-outline flex items-center">
                <Heart className="w-4 h-4 mr-2" />
                收藏
              </button>
              <button className="btn-outline flex items-center">
                <Share2 className="w-4 h-4 mr-2" />
                分享
              </button>
              <button 
                onClick={() => setShowReportModal(true)}
                className="btn-outline flex items-center text-red-600 border-red-200 hover:bg-red-50"
              >
                <Flag className="w-4 h-4 mr-2" />
                举报
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左侧 - 作品展示 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 作品图片 */}
            <div className="card">
              <div className="w-full h-96 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-4xl font-bold">#{work.id}</div>
                  <div className="text-lg opacity-80">{work.category}</div>
                </div>
              </div>
            </div>

            {/* 作品信息 */}
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">作品信息</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">创作者:</span>
                  <span className="ml-2 font-mono">{work.creator.slice(0, 10)}...</span>
                </div>
                <div>
                  <span className="text-gray-500">类型:</span>
                  <span className="ml-2">{work.isOriginal ? '原创作品' : '衍生作品'}</span>
                </div>
                <div>
                  <span className="text-gray-500">授权类型:</span>
                  <span className="ml-2">{work.authorizeType}</span>
                </div>
                <div>
                  <span className="text-gray-500">版税比例:</span>
                  <span className="ml-2">{work.royaltyPercentage}%</span>
                </div>
                <div>
                  <span className="text-gray-500">二创费用:</span>
                  <span className="ml-2">{work.licenseFee} ETH</span>
                </div>
                <div>
                  <span className="text-gray-500">质押金额:</span>
                  <span className="ml-2">{work.stakeAmount} ETH</span>
                </div>
              </div>
              
              <div className="mt-4">
                <span className="text-gray-500">标签:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {work.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 社区投票 */}
            {work.votingEnabled && votes.length > 0 && (
              <div className="card">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Vote className="w-5 h-5 mr-2 text-purple-600" />
                  社区投票
                </h3>
                {votes.map((vote) => (
                  <div key={vote.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium mb-2">{vote.title}</h4>
                    <p className="text-sm text-gray-600 mb-4">{vote.description}</p>
                    
                    <div className="space-y-3">
                      {vote.options.map((option) => {
                        const voteCount = vote.votes[option] || 0
                        const totalVotes = Object.values(vote.votes).reduce((sum, count) => sum + count, 0)
                        const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0
                        
                        return (
                          <div key={option} className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">{option}</span>
                                <span className="text-sm text-gray-500">{voteCount} 票 ({percentage.toFixed(1)}%)</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleVote(vote.id, option)}
                              className="ml-4 btn-outline text-xs py-1 px-3"
                            >
                              投票
                            </button>
                          </div>
                        )
                      })}
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                      <span>截止时间: {new Date(vote.endTime).toLocaleString()}</span>
                      <span className={`px-2 py-1 rounded-full ${
                        vote.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {vote.status === 'active' ? '进行中' : '已结束'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 右侧 - 操作面板 */}
          <div className="space-y-6">
            {/* 操作按钮 */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">操作</h3>
              <div className="space-y-3">
                {work.derivativeAllowed && (
                  <button
                    onClick={handleCreateDerivative}
                    className="w-full btn-primary flex items-center justify-center"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    创建衍生作品
                  </button>
                )}
                
                {work.fanStakeEnabled && (
                  <button
                    onClick={() => setShowStakeModal(true)}
                    className="w-full btn-outline flex items-center justify-center"
                  >
                    <Coins className="w-4 h-4 mr-2" />
                    质押支持
                  </button>
                )}
                
                <button className="w-full btn-outline flex items-center justify-center">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  在区块浏览器查看
                </button>
              </div>
            </div>

            {/* 粉丝质押统计 */}
            {work.fanStakeEnabled && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  粉丝支持
                </h3>
                
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{totalFanStake.toFixed(4)} ETH</div>
                    <div className="text-sm text-blue-600">总质押金额</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">支持者列表</h4>
                  {fanStakes.map((stake, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="font-mono">{stake.user.slice(0, 8)}...</span>
                      <span className="font-medium">{stake.amount} ETH</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 收益分配说明 */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                收益分配
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>创作者:</span>
                  <span className="font-medium">40%</span>
                </div>
                <div className="flex justify-between">
                  <span>中间创作者:</span>
                  <span className="font-medium">20%</span>
                </div>
                <div className="flex justify-between">
                  <span>直接二创:</span>
                  <span className="font-medium">40%</span>
                </div>
                <div className="flex justify-between">
                  <span>粉丝质押:</span>
                  <span className="font-medium">1%</span>
                </div>
              </div>
            </div>

            {/* 安全信息 */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-amber-600" />
                安全信息
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                  <span>已质押 {work.stakeAmount} ETH</span>
                </div>
                <div className="flex items-center text-blue-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>7天举报期</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  质押金额用于保证作品原创性，7天无人举报后可退回
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 质押模态框 */}
      {showStakeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">质押支持作品</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  质押金额 (ETH)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0.01"
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  质押后您将获得该作品未来收益的分润，并帮助提高作品曝光度
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowStakeModal(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleFanStake}
                  className="flex-1 btn-primary"
                >
                  确认质押
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 举报模态框 */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">举报作品</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  举报原因
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="plagiarism">抄袭</option>
                  <option value="inappropriate">不当内容</option>
                  <option value="copyright">版权侵犯</option>
                  <option value="other">其他</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  详细说明
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="请详细描述举报原因..."
                ></textarea>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={() => handleReport('举报原因')}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                >
                  提交举报
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}