'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  Globe, 
  Share2, 
  Users, 
  TrendingUp, 
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  ExternalLink,
  User,
  Heart,
  Eye
} from 'lucide-react'
import { cyberGraphAPI } from '../../lib/api'
import toast from 'react-hot-toast'

interface SyncRecord {
  id: number
  syncId: string
  workId: number
  contentType: string
  cyberGraphId?: string
  status: 'pending' | 'syncing' | 'synced' | 'failed'
  createdAt: string
  syncedAt?: string
  errorMessage?: string
}

interface TrendingContent {
  id: string
  title: string
  description: string
  creatorAddress: string
  creatorHandle: string
  contentType: string
  tags: string[]
  viewCount: number
  likeCount: number
  shareCount: number
  trendingScore: number
}

export default function CyberGraphPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState<'sync' | 'profile' | 'social' | 'discover'>('sync')
  const [syncRecords, setSyncRecords] = useState<SyncRecord[]>([])
  const [syncStats, setSyncStats] = useState({
    total: 0,
    synced: 0,
    pending: 0,
    failed: 0
  })
  const [trendingContent, setTrendingContent] = useState<TrendingContent[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])

  // 个人档案表单
  const [profileForm, setProfileForm] = useState({
    cyberGraphHandle: '',
    bio: '',
    avatar: '',
    website: '',
    social: {
      twitter: '',
      discord: '',
      instagram: ''
    }
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchSyncStatus()
    fetchTrendingContent()
  }, [user, router])

  const fetchSyncStatus = async () => {
    try {
      const response = await cyberGraphAPI.getSyncStatus()
      if (response.success) {
        setSyncRecords(response.syncs)
        setSyncStats(response.stats)
      }
    } catch (error) {
      console.error('Fetch sync status error:', error)
    }
  }

  const fetchTrendingContent = async () => {
    try {
      const response = await cyberGraphAPI.getTrending()
      if (response.success) {
        setTrendingContent(response.trending)
      }
    } catch (error) {
      console.error('Fetch trending content error:', error)
    }
  }

  const handleSyncWork = async (workId: number, contentType: string) => {
    if (!user || user.loginType !== 'email') {
      toast.error('CyberGraph同步功能仅支持邮箱登录用户')
      return
    }

    try {
      setLoading(true)
      
      const response = await cyberGraphAPI.syncWork({
        workId,
        contentType,
        contentHash: `work-${workId}-${Date.now()}`, // 实际应该是IPFS hash
        title: `作品 #${workId}`,
        description: '来自whichWitch平台的创作作品',
        tags: ['whichWitch', 'nft', 'art'],
        category: 'art'
      })

      if (response.success) {
        toast.success('作品已开始同步到CyberGraph！')
        fetchSyncStatus()
      } else {
        toast.error(response.error || '同步失败')
      }
    } catch (error: any) {
      console.error('Sync work error:', error)
      toast.error(error.message || '同步失败')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!profileForm.cyberGraphHandle) {
      toast.error('请输入CyberGraph用户名')
      return
    }

    try {
      setLoading(true)
      
      const response = await cyberGraphAPI.updateProfile(profileForm)
      
      if (response.success) {
        toast.success('档案已更新到CyberGraph！')
      } else {
        toast.error(response.error || '更新失败')
      }
    } catch (error: any) {
      console.error('Update profile error:', error)
      toast.error(error.message || '更新失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      setLoading(true)
      
      const response = await cyberGraphAPI.searchContent({
        q: searchQuery,
        limit: 20
      })
      
      if (response.success) {
        setSearchResults(response.results)
      } else {
        toast.error(response.error || '搜索失败')
      }
    } catch (error: any) {
      console.error('Search error:', error)
      toast.error(error.message || '搜索失败')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending':
      case 'syncing':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'synced': return '已同步'
      case 'pending': return '待同步'
      case 'syncing': return '同步中'
      case 'failed': return '同步失败'
      default: return '未知状态'
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Globe className="w-8 h-8 mr-3 text-blue-600" />
                CyberGraph 集成
              </h1>
              <p className="text-gray-600 mt-1">将您的创作内容同步到CyberGraph社交网络</p>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{syncStats.total}</div>
              <div className="text-sm text-blue-600">总同步数</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{syncStats.synced}</div>
              <div className="text-sm text-green-600">已同步</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">{syncStats.pending}</div>
              <div className="text-sm text-yellow-600">待同步</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">{syncStats.failed}</div>
              <div className="text-sm text-red-600">同步失败</div>
            </div>
          </div>

          {/* 标签导航 */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('sync')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'sync'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              内容同步
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              个人档案
            </button>
            <button
              onClick={() => setActiveTab('social')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'social'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              社交网络
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'discover'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              内容发现
            </button>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="container mx-auto px-4 py-8">
        {/* 内容同步标签 */}
        {activeTab === 'sync' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">同步新作品</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 text-sm">
                  将您的whichWitch作品同步到CyberGraph，让更多人发现您的创作！
                </p>
              </div>
              
              <button
                onClick={() => handleSyncWork(1, 'original_work')}
                disabled={loading || user.loginType !== 'email'}
                className="btn-primary flex items-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                同步最新作品
              </button>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">同步记录</h3>
              {syncRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Globe className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>还没有同步记录</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {syncRecords.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(record.status)}
                        <div>
                          <div className="font-medium">作品 #{record.workId}</div>
                          <div className="text-sm text-gray-500">
                            {getStatusText(record.status)} • {new Date(record.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      {record.cyberGraphId && (
                        <button className="text-blue-600 hover:text-blue-700 flex items-center text-sm">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          查看
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 个人档案标签 */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleUpdateProfile} className="card space-y-6">
              <h3 className="text-lg font-semibold">更新CyberGraph档案</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CyberGraph用户名 *
                </label>
                <input
                  type="text"
                  value={profileForm.cyberGraphHandle}
                  onChange={(e) => setProfileForm({...profileForm, cyberGraphHandle: e.target.value})}
                  className="input-field"
                  placeholder="your_handle"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  个人简介
                </label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="介绍一下您自己..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  头像URL
                </label>
                <input
                  type="url"
                  value={profileForm.avatar}
                  onChange={(e) => setProfileForm({...profileForm, avatar: e.target.value})}
                  className="input-field"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  个人网站
                </label>
                <input
                  type="url"
                  value={profileForm.website}
                  onChange={(e) => setProfileForm({...profileForm, website: e.target.value})}
                  className="input-field"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  社交媒体
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={profileForm.social.twitter}
                    onChange={(e) => setProfileForm({
                      ...profileForm, 
                      social: {...profileForm.social, twitter: e.target.value}
                    })}
                    className="input-field"
                    placeholder="Twitter用户名"
                  />
                  <input
                    type="text"
                    value={profileForm.social.discord}
                    onChange={(e) => setProfileForm({
                      ...profileForm, 
                      social: {...profileForm.social, discord: e.target.value}
                    })}
                    className="input-field"
                    placeholder="Discord用户名"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <User className="w-4 h-4 mr-2" />
                )}
                更新档案
              </button>
            </form>
          </div>
        )}

        {/* 社交网络标签 */}
        {activeTab === 'social' && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">社交网络</h3>
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p>社交功能开发中...</p>
            </div>
          </div>
        )}

        {/* 内容发现标签 */}
        {activeTab === 'discover' && (
          <div className="space-y-6">
            {/* 搜索栏 */}
            <div className="card">
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="搜索CyberGraph内容..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="btn-primary flex items-center"
                >
                  <Search className="w-4 h-4 mr-2" />
                  搜索
                </button>
              </div>
            </div>

            {/* 热门内容 */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                热门内容
              </h3>
              
              {trendingContent.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>暂无热门内容</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trendingContent.map((content) => (
                    <div key={content.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h4 className="font-medium mb-2">{content.title}</h4>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{content.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>@{content.creatorHandle}</span>
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {content.viewCount}
                          </span>
                          <span className="flex items-center">
                            <Heart className="w-3 h-3 mr-1" />
                            {content.likeCount}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {content.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}