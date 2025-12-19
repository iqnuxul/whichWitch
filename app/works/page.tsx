'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Heart, 
  Eye, 
  Clock,
  User,
  Zap,
  Star,
  TrendingUp,
  Vote
} from 'lucide-react'
import { transactionAPI } from '../../lib/api'
import toast from 'react-hot-toast'

interface Work {
  id: number
  title: string
  description: string
  creator: string
  creatorName?: string
  category: string
  tags: string[]
  licenseFee: string
  derivativeAllowed: boolean
  isOriginal: boolean
  parentId?: number
  createdAt: string
  contentHash: string
  fanStakes: number
  totalStaked: string
  viewCount: number
  hasActiveVote: boolean
  thumbnail?: string
}

export default function WorksPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    fetchAllWorks()
  }, [])

  const fetchAllWorks = async () => {
    try {
      setLoading(true)
      
      // 模拟获取所有作品数据
      const mockWorks: Work[] = [
        {
          id: 1,
          title: '未来城市概念图',
          description: '一个充满科技感的未来城市设计，展现了人类对未来生活的想象...',
          creator: '0x1234567890abcdef',
          creatorName: 'FutureArtist',
          category: 'concept-art',
          tags: ['未来主义', '城市设计', '科幻'],
          licenseFee: '0.01',
          derivativeAllowed: true,
          isOriginal: true,
          createdAt: '2024-01-15T10:00:00Z',
          contentHash: 'QmHash1...',
          fanStakes: 12,
          totalStaked: '0.45',
          viewCount: 234,
          hasActiveVote: true,
          thumbnail: '#FF6B6B'
        },
        {
          id: 2,
          title: '神秘森林插画',
          description: '一幅充满魔幻色彩的森林插画，描绘了一个神秘的魔法世界...',
          creator: '0xabcdef1234567890',
          creatorName: 'MagicPainter',
          category: 'illustration',
          tags: ['魔幻', '森林', '插画'],
          licenseFee: '0.005',
          derivativeAllowed: true,
          isOriginal: true,
          createdAt: '2024-01-18T14:30:00Z',
          contentHash: 'QmHash2...',
          fanStakes: 8,
          totalStaked: '0.32',
          viewCount: 156,
          hasActiveVote: false,
          thumbnail: '#4ECDC4'
        },
        {
          id: 3,
          title: '赛博朋克角色设计',
          description: '一个酷炫的赛博朋克风格角色设计，融合了未来科技和街头文化...',
          creator: '0x9876543210fedcba',
          creatorName: 'CyberDesigner',
          category: 'character-design',
          tags: ['赛博朋克', '角色设计', '未来'],
          licenseFee: '0.02',
          derivativeAllowed: true,
          isOriginal: true,
          createdAt: '2024-01-20T09:15:00Z',
          contentHash: 'QmHash3...',
          fanStakes: 15,
          totalStaked: '0.67',
          viewCount: 312,
          hasActiveVote: true,
          thumbnail: '#45B7D1'
        },
        {
          id: 4,
          title: '未来城市 - 太空站扩展',
          description: '基于原作"未来城市概念图"的衍生创作，展现了太空站的设计...',
          creator: '0xfedcba0987654321',
          creatorName: 'SpaceArchitect',
          category: 'concept-art',
          tags: ['太空站', '衍生创作', '科幻'],
          licenseFee: '0.008',
          derivativeAllowed: true,
          isOriginal: false,
          parentId: 1,
          createdAt: '2024-01-22T16:45:00Z',
          contentHash: 'QmHash4...',
          fanStakes: 5,
          totalStaked: '0.18',
          viewCount: 89,
          hasActiveVote: false,
          thumbnail: '#F39C12'
        }
      ]
      
      setWorks(mockWorks)
    } catch (error) {
      console.error('获取作品失败:', error)
      toast.error('获取作品失败')
    } finally {
      setLoading(false)
    }
  }

  const handleStakeWork = async (workId: number) => {
    if (!user) {
      toast.error('请先登录')
      return
    }

    const amount = prompt('请输入质押金额 (ETH):')
    if (amount) {
      toast.success(`成功质押 ${amount} ETH 支持作品 #${workId}！`)
      // 这里应该调用质押API并刷新数据
    }
  }

  const filteredWorks = works.filter(work => {
    const matchesSearch = work.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         work.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         work.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = categoryFilter === 'all' || work.category === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  const sortedWorks = [...filteredWorks].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'most-staked':
        return parseFloat(b.totalStaked) - parseFloat(a.totalStaked)
      case 'most-viewed':
        return b.viewCount - a.viewCount
      default:
        return 0
    }
  })

  const getCategoryName = (category: string) => {
    const categories: { [key: string]: string } = {
      'concept-art': '概念艺术',
      'illustration': '插画',
      'character-design': '角色设计',
      'digital-art': '数字艺术',
      'photography': '摄影',
      'music': '音乐',
      'video': '视频',
      'writing': '文学作品'
    }
    return categories[category] || category
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">作品库</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            发现优秀的原创作品，支持你喜爱的创作者
          </p>
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索作品标题、描述或标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            {/* 筛选器 */}
            <div className="flex gap-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">所有类别</option>
                <option value="concept-art">概念艺术</option>
                <option value="illustration">插画</option>
                <option value="character-design">角色设计</option>
                <option value="digital-art">数字艺术</option>
                <option value="photography">摄影</option>
                <option value="music">音乐</option>
                <option value="video">视频</option>
                <option value="writing">文学作品</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="newest">最新发布</option>
                <option value="oldest">最早发布</option>
                <option value="most-staked">最多质押</option>
                <option value="most-viewed">最多浏览</option>
              </select>
              
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="mb-6">
          <p className="text-gray-600">
            找到 <span className="font-semibold">{sortedWorks.length}</span> 个作品
          </p>
        </div>

        {/* 作品列表 */}
        {sortedWorks.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">没有找到匹配的作品</h3>
            <p className="text-gray-500">尝试调整搜索条件或筛选器</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {sortedWorks.map((work) => (
              <div 
                key={work.id} 
                className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                  viewMode === 'list' ? 'flex p-4' : 'p-4'
                }`}
                onClick={() => router.push(`/works/${work.id}`)}
              >
                {/* 作品缩略图 */}
                <div 
                  className={`rounded-lg flex items-center justify-center ${
                    viewMode === 'list' ? 'w-24 h-24 mr-4 flex-shrink-0' : 'w-full h-48 mb-4'
                  }`}
                  style={{ backgroundColor: work.thumbnail }}
                >
                  <div className="text-white text-center">
                    <div className={`font-bold ${viewMode === 'list' ? 'text-lg' : 'text-2xl'}`}>
                      #{work.id}
                    </div>
                    <div className={`opacity-80 ${viewMode === 'list' ? 'text-xs' : 'text-sm'}`}>
                      {getCategoryName(work.category)}
                    </div>
                  </div>
                </div>

                {/* 作品信息 */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                      {work.title}
                    </h3>
                    {work.hasActiveVote && (
                      <Vote className="w-4 h-4 text-purple-600 flex-shrink-0 ml-2" />
                    )}
                  </div>
                  
                  <p className={`text-gray-600 text-sm ${viewMode === 'list' ? 'line-clamp-2' : 'line-clamp-3'}`}>
                    {work.description}
                  </p>

                  {/* 创作者信息 */}
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="w-4 h-4 mr-1" />
                    <span>{work.creatorName || work.creator.slice(0, 10)}...</span>
                    {!work.isOriginal && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        衍生作品
                      </span>
                    )}
                  </div>

                  {/* 标签 */}
                  <div className="flex flex-wrap gap-1">
                    {work.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                    {work.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                        +{work.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* 统计信息 */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4 text-gray-500">
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {work.viewCount}
                      </span>
                      <span className="flex items-center text-pink-600">
                        <Heart className="w-4 h-4 mr-1" />
                        {work.fanStakes}
                      </span>
                      <span className="text-green-600 font-medium">
                        {work.totalStaked} ETH
                      </span>
                    </div>
                    <span className="text-gray-400">
                      {new Date(work.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex space-x-2 pt-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleStakeWork(work.id)}
                      className="flex-1 bg-pink-600 text-white py-2 px-3 rounded-lg hover:bg-pink-700 flex items-center justify-center text-sm"
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      质押
                    </button>
                    {work.derivativeAllowed && (
                      <button
                        onClick={() => router.push(`/works/create?parent=${work.id}`)}
                        className="flex-1 btn-outline py-2 px-3 text-sm flex items-center justify-center"
                      >
                        <Zap className="w-4 h-4 mr-1" />
                        二创
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}