'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  ShoppingCart, 
  Tag, 
  Clock, 
  TrendingUp, 
  Filter,
  Search,
  Grid,
  List,
  ExternalLink,
  Zap,
  Globe,
  Heart,
  Eye,
  User,
  DollarSign
} from 'lucide-react'
import toast from 'react-hot-toast'

interface NFTListing {
  id: string
  workId: number
  workTitle: string
  tokenId: string
  seller: string
  sellerName?: string
  price: string
  originalPrice?: string
  listingType: 'sale' | 'auction' | 'derivative_rights'
  status: 'active' | 'sold' | 'cancelled'
  createdAt: string
  expiresAt: string
  category: string
  thumbnail: string
  viewCount: number
  favoriteCount: number
  isOriginal: boolean
  royaltyPercentage: number
}

export default function MarketplacePage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [listings, setListings] = useState<NFTListing[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    listingType: 'all',
    category: 'all',
    priceRange: 'all',
    status: 'active'
  })
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalSales: 0,
    totalVolume: '0',
    averagePrice: '0'
  })

  useEffect(() => {
    fetchMarketplaceData()
    fetchMarketplaceStats()
  }, [])

  const fetchMarketplaceData = async () => {
    try {
      setLoading(true)
      
      // 模拟NFT市场数据
      const mockListings: NFTListing[] = [
        {
          id: 'listing_1',
          workId: 1,
          workTitle: '未来城市概念图',
          tokenId: '1001',
          seller: '0x1234567890abcdef',
          sellerName: 'FutureArtist',
          price: '0.5',
          originalPrice: '0.3',
          listingType: 'sale',
          status: 'active',
          createdAt: '2024-01-25T10:00:00Z',
          expiresAt: '2024-02-25T10:00:00Z',
          category: 'concept-art',
          thumbnail: '#FF6B6B',
          viewCount: 89,
          favoriteCount: 12,
          isOriginal: true,
          royaltyPercentage: 10
        },
        {
          id: 'listing_2',
          workId: 2,
          workTitle: '神秘森林插画',
          tokenId: '1002',
          seller: '0xabcdef1234567890',
          sellerName: 'MagicPainter',
          price: '0.3',
          listingType: 'auction',
          status: 'active',
          createdAt: '2024-01-26T14:30:00Z',
          expiresAt: '2024-02-02T14:30:00Z',
          category: 'illustration',
          thumbnail: '#4ECDC4',
          viewCount: 67,
          favoriteCount: 8,
          isOriginal: true,
          royaltyPercentage: 15
        },
        {
          id: 'listing_3',
          workId: 4,
          workTitle: '未来城市 - 太空站扩展',
          tokenId: '1003',
          seller: '0xfedcba0987654321',
          sellerName: 'SpaceArchitect',
          price: '0.2',
          listingType: 'derivative_rights',
          status: 'active',
          createdAt: '2024-01-27T16:45:00Z',
          expiresAt: '2024-02-10T16:45:00Z',
          category: 'concept-art',
          thumbnail: '#F39C12',
          viewCount: 45,
          favoriteCount: 5,
          isOriginal: false,
          royaltyPercentage: 8
        }
      ]
      
      setListings(mockListings)
    } catch (error) {
      console.error('获取市场数据失败:', error)
      toast.error('获取市场数据失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchMarketplaceStats = async () => {
    setStats({
      totalListings: 15,
      activeListings: 12,
      totalSales: 8,
      totalVolume: '2.4',
      averagePrice: '0.3'
    })
  }

  const handleBuyNFT = async (listingId: string, price: string) => {
    if (!user) {
      toast.error('请先登录')
      return
    }

    try {
      toast.success(`成功购买NFT！价格: ${price} ETH`)
      fetchMarketplaceData() // 刷新数据
    } catch (error: any) {
      console.error('购买NFT失败:', error)
      toast.error('购买失败')
    }
  }

  const handleMakeOffer = async (listingId: string) => {
    if (!user) {
      toast.error('请先登录')
      return
    }

    const amount = prompt('请输入出价金额 (ETH):')
    if (amount) {
      toast.success(`出价成功！金额: ${amount} ETH`)
    }
  }

  const getListingTypeLabel = (type: string) => {
    switch (type) {
      case 'sale': return '固定价格'
      case 'auction': return '拍卖'
      case 'derivative_rights': return '衍生权限'
      default: return type
    }
  }

  const getListingTypeColor = (type: string) => {
    switch (type) {
      case 'sale': return 'bg-blue-100 text-blue-800'
      case 'auction': return 'bg-purple-100 text-purple-800'
      case 'derivative_rights': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

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

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.workTitle.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filters.listingType === 'all' || listing.listingType === filters.listingType
    const matchesCategory = filters.category === 'all' || listing.category === filters.category
    const matchesStatus = listing.status === filters.status
    
    return matchesSearch && matchesType && matchesCategory && matchesStatus
  })

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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">NFT 市场</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            购买、出售和交易独特的数字艺术NFT
          </p>
        </div>

        {/* 市场统计 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.activeListings}</div>
            <div className="text-sm text-gray-600">在售NFT</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.totalSales}</div>
            <div className="text-sm text-gray-600">总销量</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalVolume} ETH</div>
            <div className="text-sm text-gray-600">交易额</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.averagePrice} ETH</div>
            <div className="text-sm text-gray-600">均价</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.totalListings}</div>
            <div className="text-sm text-gray-600">总挂单</div>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* 搜索框 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索NFT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            {/* 筛选器 */}
            <div className="flex gap-4">
              <select
                value={filters.listingType}
                onChange={(e) => setFilters({...filters, listingType: e.target.value})}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">所有类型</option>
                <option value="sale">固定价格</option>
                <option value="auction">拍卖</option>
                <option value="derivative_rights">衍生权限</option>
              </select>
              
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">所有类别</option>
                <option value="concept-art">概念艺术</option>
                <option value="illustration">插画</option>
                <option value="character-design">角色设计</option>
                <option value="digital-art">数字艺术</option>
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

        {/* NFT列表 */}
        {filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无NFT在售</h3>
            <p className="text-gray-500">成为第一个在市场上出售NFT的用户吧！</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {filteredListings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                {/* NFT图片 */}
                <div 
                  className="w-full h-48 rounded-t-lg flex items-center justify-center cursor-pointer"
                  style={{ backgroundColor: listing.thumbnail }}
                  onClick={() => router.push(`/works/${listing.workId}`)}
                >
                  <div className="text-white text-center">
                    <div className="text-2xl font-bold">#{listing.tokenId}</div>
                    <div className="text-sm opacity-80">{getCategoryName(listing.category)}</div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {/* NFT信息 */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getListingTypeColor(listing.listingType)}`}>
                      {getListingTypeLabel(listing.listingType)}
                    </span>
                    {!listing.isOriginal && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        衍生作品
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 hover:text-primary-600 cursor-pointer"
                        onClick={() => router.push(`/works/${listing.workId}`)}>
                      {listing.workTitle}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="w-4 h-4 mr-1" />
                      <span>{listing.sellerName || listing.seller.slice(0, 10)}...</span>
                    </div>
                  </div>

                  {/* 价格信息 */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-500">
                          {listing.listingType === 'auction' ? '当前出价' : '价格'}
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          {listing.price} ETH
                        </div>
                        {listing.originalPrice && parseFloat(listing.originalPrice) < parseFloat(listing.price) && (
                          <div className="text-xs text-green-600">
                            +{(((parseFloat(listing.price) - parseFloat(listing.originalPrice)) / parseFloat(listing.originalPrice)) * 100).toFixed(1)}%
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">版税</div>
                        <div className="font-medium">{listing.royaltyPercentage}%</div>
                      </div>
                    </div>
                  </div>

                  {/* 统计信息 */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {listing.viewCount}
                      </span>
                      <span className="flex items-center">
                        <Heart className="w-4 h-4 mr-1" />
                        {listing.favoriteCount}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{new Date(listing.expiresAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex space-x-2 pt-2">
                    {listing.listingType === 'sale' && (
                      <button
                        onClick={() => handleBuyNFT(listing.id, listing.price)}
                        className="flex-1 btn-primary text-sm py-2 flex items-center justify-center"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        购买
                      </button>
                    )}
                    
                    {listing.listingType === 'auction' && (
                      <button
                        onClick={() => handleMakeOffer(listing.id)}
                        className="flex-1 btn-primary text-sm py-2 flex items-center justify-center"
                      >
                        <TrendingUp className="w-4 h-4 mr-1" />
                        出价
                      </button>
                    )}
                    
                    {listing.listingType === 'derivative_rights' && (
                      <button
                        onClick={() => router.push(`/works/create?parent=${listing.workId}`)}
                        className="flex-1 bg-green-600 text-white text-sm py-2 flex items-center justify-center rounded-lg hover:bg-green-700"
                      >
                        <Zap className="w-4 h-4 mr-1" />
                        获取授权
                      </button>
                    )}
                    
                    <button
                      onClick={() => router.push(`/works/${listing.workId}`)}
                      className="btn-outline text-sm py-2 px-3"
                    >
                      详情
                    </button>
                  </div>

                  {/* 特殊标记 */}
                  {listing.listingType === 'derivative_rights' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center text-green-800 text-sm">
                        <Zap className="w-4 h-4 mr-2" />
                        <span className="font-medium">衍生创作权限</span>
                      </div>
                      <p className="text-green-700 text-xs mt-1">
                        购买后可获得基于此作品的二次创作权限
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}