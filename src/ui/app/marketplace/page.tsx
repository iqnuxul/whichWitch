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
  Globe
} from 'lucide-react'
import { marketplaceAPI } from '../../lib/api'
import toast from 'react-hot-toast'

interface NFTListing {
  listingId: string
  nftContract: string
  tokenId: string
  seller: string
  price: string
  listingType: 'sale' | 'exclusive' | 'creative_rights'
  status: 'active' | 'sold' | 'cancelled'
  createdAt: string
  expiresAt: string
  allowCrossChain: boolean
}

export default function MarketplacePage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [listings, setListings] = useState<NFTListing[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    listingType: '',
    minPrice: '',
    maxPrice: '',
    allowCrossChain: false
  })
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalSales: 0,
    totalVolume: 0
  })

  // 获取市场数据
  useEffect(() => {
    fetchMarketplaceData()
    fetchMarketplaceStats()
  }, [])

  const fetchMarketplaceData = async () => {
    try {
      setLoading(true)
      const response = await marketplaceAPI.searchNFTs({
        query: searchQuery,
        listingType: filters.listingType,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        status: 'active'
      })
      
      if (response.success) {
        setListings(response.listings)
      }
    } catch (error) {
      console.error('Fetch marketplace data error:', error)
      toast.error('获取市场数据失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchMarketplaceStats = async () => {
    try {
      const response = await marketplaceAPI.getStats()
      if (response.success) {
        setStats(response.stats)
      }
    } catch (error) {
      console.error('Fetch stats error:', error)
    }
  }

  const handleBuyNFT = async (listingId: string, price: string) => {
    if (!user) {
      toast.error('请先登录')
      return
    }

    if (user.loginType !== 'email') {
      toast.error('购买功能仅支持邮箱登录用户')
      return
    }

    try {
      const response = await marketplaceAPI.buyNFT({ listingId, price })
      
      if (response.success) {
        toast.success('购买成功！')
        fetchMarketplaceData() // 刷新数据
      } else {
        toast.error(response.error || '购买失败')
      }
    } catch (error: any) {
      console.error('Buy NFT error:', error)
      toast.error(error?.response?.data?.error || error.message || '购买失败')
    }
  }

  const handleMakeOffer = async (listingId: string, amount: string) => {
    if (!user) {
      toast.error('请先登录')
      return
    }

    if (user.loginType !== 'email') {
      toast.error('出价功能仅支持邮箱登录用户')
      return
    }

    try {
      const response = await marketplaceAPI.makeOffer({
        listingId,
        amount,
        duration: 7 * 24 * 60 * 60, // 7天
        sourceChain: 'native'
      })
      
      if (response.success) {
        toast.success('出价成功！')
      } else {
        toast.error(response.error || '出价失败')
      }
    } catch (error: any) {
      console.error('Make offer error:', error)
      toast.error(error.message || '出价失败')
    }
  }

  const getListingTypeLabel = (type: string) => {
    switch (type) {
      case 'sale': return '普通销售'
      case 'exclusive': return '专卖'
      case 'creative_rights': return '二创授权'
      default: return type
    }
  }

  const getListingTypeColor = (type: string) => {
    switch (type) {
      case 'sale': return 'bg-blue-100 text-blue-800'
      case 'exclusive': return 'bg-purple-100 text-purple-800'
      case 'creative_rights': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
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
              <h1 className="text-3xl font-bold text-gray-900">NFT 市场</h1>
              <p className="text-gray-600 mt-1">发现、购买和交易独特的数字作品</p>
            </div>
            
            <div className="flex space-x-4">
              {user && (
                <>
                  <button
                    onClick={() => router.push('/marketplace/create')}
                    className="btn-primary flex items-center"
                  >
                    <Tag className="w-4 h-4 mr-2" />
                    挂单销售
                  </button>
                  <button
                    onClick={() => router.push('/cybergraph')}
                    className="btn-outline flex items-center"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    CyberGraph
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 统计数据 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.activeListings}</div>
              <div className="text-sm text-blue-600">活跃挂单</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{stats.totalSales}</div>
              <div className="text-sm text-green-600">总销售量</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">
                {(stats.totalVolume / 1e18).toFixed(2)} ETH
              </div>
              <div className="text-sm text-purple-600">总交易额</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-amber-600">{stats.totalListings}</div>
              <div className="text-sm text-amber-600">总挂单数</div>
            </div>
          </div>

          {/* 搜索和筛选 */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索NFT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={filters.listingType}
                onChange={(e) => setFilters({...filters, listingType: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">所有类型</option>
                <option value="sale">普通销售</option>
                <option value="exclusive">专卖</option>
                <option value="creative_rights">二创授权</option>
              </select>
              
              <button
                onClick={fetchMarketplaceData}
                className="btn-primary flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                搜索
              </button>
              
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NFT列表 */}
      <div className="container mx-auto px-4 py-8">
        {listings.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无NFT挂单</h3>
            <p className="text-gray-500">成为第一个在市场上挂单的用户吧！</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {listings.map((listing) => (
              <div key={listing.listingId} className="card hover:shadow-lg transition-shadow">
                {/* NFT图片占位符 */}
                <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-2xl font-bold">#{listing.tokenId}</div>
                    <div className="text-sm opacity-80">Token ID</div>
                  </div>
                </div>

                {/* NFT信息 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getListingTypeColor(listing.listingType)}`}>
                      {getListingTypeLabel(listing.listingType)}
                    </span>
                    {listing.allowCrossChain && (
                      <div className="flex items-center text-xs text-blue-600">
                        <Globe className="w-3 h-3 mr-1" />
                        跨链
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-sm text-gray-500">价格</div>
                    <div className="text-xl font-bold text-gray-900">
                      {(parseFloat(listing.price) / 1e18).toFixed(4)} ETH
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    <div>卖家: {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}</div>
                    <div className="flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      到期: {new Date(parseInt(listing.expiresAt) * 1000).toLocaleDateString()}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={() => handleBuyNFT(listing.listingId, listing.price)}
                      disabled={!user || user.loginType !== 'email'}
                      className="flex-1 btn-primary text-sm py-2 flex items-center justify-center"
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      购买
                    </button>
                    
                    <button
                      onClick={() => {
                        const amount = prompt('请输入出价金额 (ETH):')
                        if (amount) {
                          handleMakeOffer(listing.listingId, (parseFloat(amount) * 1e18).toString())
                        }
                      }}
                      disabled={!user || user.loginType !== 'email'}
                      className="flex-1 btn-outline text-sm py-2 flex items-center justify-center"
                    >
                      <TrendingUp className="w-4 h-4 mr-1" />
                      出价
                    </button>
                  </div>

                  {listing.listingType === 'creative_rights' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                      <div className="flex items-center text-green-800 text-sm">
                        <Zap className="w-4 h-4 mr-2" />
                        <span className="font-medium">二创授权</span>
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