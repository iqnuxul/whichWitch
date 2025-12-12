'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  Upload, 
  Tag, 
  Clock, 
  Globe, 
  AlertCircle,
  CheckCircle,
  ArrowLeft
} from 'lucide-react'
import { marketplaceAPI } from '../../../lib/api'
import toast from 'react-hot-toast'

export default function CreateListingPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    nftContract: process.env.NEXT_PUBLIC_NFT_MANAGER_ADDRESS || '',
    tokenId: '',
    price: '',
    listingType: 'sale',
    duration: '7', // 天数
    allowCrossChain: false
  })
  const [loading, setLoading] = useState(false)
  const [userNFTs, setUserNFTs] = useState([])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (user.loginType !== 'email') {
      toast.error('挂单功能仅支持邮箱登录用户')
      router.push('/marketplace')
      return
    }

    // 获取用户的NFT
    fetchUserNFTs()
  }, [user, router])

  const fetchUserNFTs = async () => {
    // 这里应该调用API获取用户拥有的NFT
    // 暂时使用模拟数据
    setUserNFTs([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.tokenId || !formData.price) {
      toast.error('请填写所有必填字段')
      return
    }

    try {
      setLoading(true)
      
      const priceInWei = (parseFloat(formData.price) * 1e18).toString()
      const durationInSeconds = parseInt(formData.duration) * 24 * 60 * 60
      
      const response = await marketplaceAPI.listNFT({
        nftContract: formData.nftContract,
        tokenId: formData.tokenId,
        price: priceInWei,
        listingType: parseInt(formData.listingType === 'sale' ? '0' : formData.listingType === 'exclusive' ? '1' : '2'),
        duration: durationInSeconds,
        allowCrossChain: formData.allowCrossChain
      })
      
      if (response.success) {
        toast.success('NFT挂单成功！')
        router.push('/marketplace')
      } else {
        toast.error(response.error || '挂单失败')
      }
    } catch (error: any) {
      console.error('Create listing error:', error)
      toast.error(error.message || '挂单失败')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
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
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">挂单销售NFT</h1>
          <p className="text-gray-600">将您的NFT在市场上挂单销售</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="card space-y-6">
            {/* NFT选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择NFT
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">合约地址</label>
                  <input
                    type="text"
                    value={formData.nftContract}
                    onChange={(e) => handleInputChange('nftContract', e.target.value)}
                    className="input-field text-sm"
                    placeholder="NFT合约地址"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Token ID</label>
                  <input
                    type="number"
                    value={formData.tokenId}
                    onChange={(e) => handleInputChange('tokenId', e.target.value)}
                    className="input-field"
                    placeholder="Token ID"
                    required
                  />
                </div>
              </div>
              
              {formData.tokenId && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center text-blue-800 text-sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span>NFT预览</span>
                  </div>
                  <div className="mt-2">
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center text-white">
                      <div className="text-center">
                        <div className="text-lg font-bold">#{formData.tokenId}</div>
                        <div className="text-xs opacity-80">Token ID</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 价格设置 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                销售价格 (ETH)
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className="input-field"
                placeholder="0.0000"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                设置您希望的销售价格，买家需要支付此金额购买NFT
              </p>
            </div>

            {/* 挂单类型 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                挂单类型
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="listingType"
                    value="sale"
                    checked={formData.listingType === 'sale'}
                    onChange={(e) => handleInputChange('listingType', e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">普通销售</div>
                    <div className="text-sm text-gray-500">标准的NFT销售，任何人都可以购买</div>
                  </div>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="listingType"
                    value="exclusive"
                    checked={formData.listingType === 'exclusive'}
                    onChange={(e) => handleInputChange('listingType', e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">专卖</div>
                    <div className="text-sm text-gray-500">独家销售，具有特殊权益的销售方式</div>
                  </div>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="listingType"
                    value="creative_rights"
                    checked={formData.listingType === 'creative_rights'}
                    onChange={(e) => handleInputChange('listingType', e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">二创授权</div>
                    <div className="text-sm text-gray-500">出售基于此NFT的二次创作权限</div>
                  </div>
                </label>
              </div>
            </div>

            {/* 挂单时长 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                挂单时长
              </label>
              <select
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                className="input-field"
              >
                <option value="1">1天</option>
                <option value="3">3天</option>
                <option value="7">7天</option>
                <option value="14">14天</option>
                <option value="30">30天</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                挂单将在指定时间后自动过期
              </p>
            </div>

            {/* 跨链支付 */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.allowCrossChain}
                  onChange={(e) => handleInputChange('allowCrossChain', e.target.checked)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-blue-600" />
                    允许跨链支付
                  </div>
                  <div className="text-sm text-gray-500">
                    允许买家使用其他区块链的资产购买此NFT
                  </div>
                </div>
              </label>
            </div>

            {/* 费用说明 */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-amber-800">费用说明</h4>
                  <div className="text-sm text-amber-700 mt-1 space-y-1">
                    <div>• 市场手续费: 2.5%</div>
                    <div>• Gas费用: 由系统代付</div>
                    {formData.allowCrossChain && (
                      <div>• 跨链手续费: 根据源链而定</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Tag className="w-4 h-4 mr-2" />
                )}
                {loading ? '挂单中...' : '确认挂单'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}