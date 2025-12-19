'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  Upload, 
  FileText, 
  Lock,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Sparkles
} from 'lucide-react'
import { transactionAPI, aiAPI, uploadAPI } from '../../../lib/api'
import toast from 'react-hot-toast'

export default function CreateWorkPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'digital-art',
    tags: '',
    licenseFee: '0.01',
    derivativeAllowed: true,
    authorizeType: 'commercial',
    royaltyPercentage: '10'
  })
  
  const [loading, setLoading] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [step, setStep] = useState(1)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [contentCheckResult, setContentCheckResult] = useState<{
    isValid: boolean
    message: string
    suggestions?: string[]
  } | null>(null)
  const [checkingContent, setCheckingContent] = useState(false)
  const [showAIHelper, setShowAIHelper] = useState(false)
  const [aiHelperMessage, setAiHelperMessage] = useState('')

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
      return
    }
  }, [user, isLoading, router])

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast.error('文件大小不能超过100MB')
        return
      }
      setSelectedFile(file)
      toast.success(`已选择文件: ${file.name}`)
    }
  }

  // 上传文件到IPFS
  const uploadFile = async () => {
    if (!selectedFile) return null

    setUploading(true)
    try {
      const response = await uploadAPI.uploadFile(selectedFile)
      if (response.data?.success) {
        setFormData(prev => ({
          ...prev,
          contentHash: response.data.data.hash
        }))
        toast.success('文件上传成功！')
        return response.data.data.hash
      } else {
        throw new Error(response.data?.error || '上传失败')
      }
    } catch (error: any) {
      console.error('文件上传失败:', error)
      toast.error('文件上传失败')
      return null
    } finally {
      setUploading(false)
    }
  }

  // 移除文件
  const removeFile = () => {
    setSelectedFile(null)
    setFormData(prev => ({
      ...prev,
      contentHash: ''
    }))
  }

  // AI生成作品描述
  const generateDescription = async () => {
    if (!formData.title.trim()) {
      toast.error('请先输入作品标题')
      return
    }

    setAiGenerating(true)
    try {
      const response = await aiAPI.generateWorkDescription({
        workTitle: formData.title,
        workType: formData.category,
        userInput: formData.description
      })

      if (response.data?.success) {
        setFormData(prev => ({
          ...prev,
          description: response.data.description
        }))
        toast.success('AI描述生成成功！')
      } else {
        toast.error('生成失败')
      }
    } catch (error: any) {
      console.error('AI生成描述失败:', error)
      toast.error('生成失败')
    } finally {
      setAiGenerating(false)
    }
  }

  // AI内容违规检测
  const checkContentCompliance = async () => {
    if (!selectedFile) {
      toast.error('请先选择文件')
      return
    }

    setCheckingContent(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('file', selectedFile)
      
      const response = await aiAPI.checkContentCompliance(formDataToSend)
      
      if (response.data?.success) {
        setContentCheckResult({
          isValid: response.data.isValid,
          message: response.data.message,
          suggestions: response.data.suggestions
        })
        
        if (response.data.isValid) {
          toast.success('内容检测通过！')
        } else {
          toast.error('内容检测未通过，请查看建议')
        }
      } else {
        toast.error('内容检测失败')
      }
    } catch (error) {
      console.error('内容检测失败:', error)
      toast.error('内容检测失败')
    } finally {
      setCheckingContent(false)
    }
  }

  // AI授权类型助手
  const getAILicenseAdvice = async () => {
    setShowAIHelper(true)
    try {
      const response = await aiAPI.getLicenseAdvice({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        isDerivative: false
      })
      
      if (response.data?.success) {
        setAiHelperMessage(response.data.advice)
      } else {
        setAiHelperMessage('AI助手暂时无法提供建议，请稍后再试。')
      }
    } catch (error) {
      console.error('获取AI建议失败:', error)
      setAiHelperMessage('AI助手暂时无法提供建议，请稍后再试。')
    }
  }

  // 提交作品注册
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description) {
      toast.error('请填写作品标题和描述')
      return
    }

    try {
      setLoading(true)
      
      const metadataURI = `ipfs://mock-hash-${Date.now()}`
      
      const response = await transactionAPI.registerOriginalWork({
        licenseFee: (parseFloat(formData.licenseFee) * 1e18).toString(),
        derivativeAllowed: formData.derivativeAllowed,
        metadataURI
      })
      
      if (response.data?.success) {
        toast.success(`作品注册成功！作品ID: ${response.data.workId}`)
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        toast.error(response.data?.error || '注册失败')
      }
    } catch (error: any) {
      console.error('作品注册失败:', error)
      toast.error(error.message || '注册失败')
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
        {/* 头部 */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">注册新作品</h1>
          <p className="text-gray-600">将您的创作注册到区块链，获得永久的版权保护</p>
        </div>

        {/* 步骤指示器 */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {[
              { step: 1, title: '基本信息', icon: FileText },
              { step: 2, title: '内容上传', icon: Upload },
              { step: 3, title: '权限设置', icon: Lock }
            ].map(({ step: stepNum, title, icon: Icon }) => (
              <div key={stepNum} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= stepNum ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step >= stepNum ? 'text-primary-600' : 'text-gray-500'
                }`}>
                  {title}
                </span>
                {stepNum < 3 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step > stepNum ? 'bg-primary-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="card space-y-6">
            {/* 步骤1: 基本信息 */}
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    作品标题 *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="input-field"
                    placeholder="输入您的作品标题"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    作品描述 *
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="input-field resize-none"
                      rows={4}
                      placeholder="详细描述您的作品..."
                      required
                    />
                    <button
                      type="button"
                      onClick={generateDescription}
                      disabled={aiGenerating}
                      className="absolute top-2 right-2 btn-outline text-xs py-1 px-2 flex items-center"
                    >
                      {aiGenerating ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-purple-600 mr-1"></div>
                      ) : (
                        <Sparkles className="w-3 h-3 mr-1" />
                      )}
                      AI生成
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    作品类别
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="input-field"
                  >
                    <option value="digital-art">数字艺术</option>
                    <option value="photography">摄影</option>
                    <option value="music">音乐</option>
                    <option value="video">视频</option>
                    <option value="writing">文学作品</option>
                    <option value="design">设计</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    标签
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    className="input-field"
                    placeholder="用逗号分隔，如：抽象,现代,艺术"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full btn-primary"
                >
                  下一步：上传内容
                </button>
              </>
            )}

            {/* 步骤2: 内容上传 */}
            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    上传作品文件
                  </label>
                  
                  {!selectedFile ? (
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer"
                      onClick={() => document.getElementById('file-input')?.click()}
                    >
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">点击上传或拖拽文件到此处</p>
                      <p className="text-sm text-gray-500">
                        支持图片、音频、视频等格式，最大100MB
                      </p>
                      <input
                        id="file-input"
                        type="file"
                        className="hidden"
                        accept="image/*,audio/*,video/*,.pdf,.doc,.docx"
                        onChange={handleFileSelect}
                      />
                    </div>
                  ) : (
                    <div className="border border-gray-300 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <FileText className="w-8 h-8 text-blue-500 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">{selectedFile.name}</p>
                            <p className="text-sm text-gray-500">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          移除
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={checkContentCompliance}
                          disabled={checkingContent}
                          className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center text-sm"
                        >
                          {checkingContent ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              AI检测中...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              AI内容检测
                            </>
                          )}
                        </button>
                        
                        {contentCheckResult && (
                          <div className={`p-3 rounded-lg text-sm ${
                            contentCheckResult.isValid 
                              ? 'bg-green-50 border border-green-200 text-green-800'
                              : 'bg-red-50 border border-red-200 text-red-800'
                          }`}>
                            <div className="flex items-center mb-2">
                              {contentCheckResult.isValid ? (
                                <CheckCircle className="w-4 h-4 mr-2" />
                              ) : (
                                <AlertCircle className="w-4 h-4 mr-2" />
                              )}
                              <span className="font-medium">
                                {contentCheckResult.isValid ? '检测通过' : '检测未通过'}
                              </span>
                            </div>
                            <p>{contentCheckResult.message}</p>
                          </div>
                        )}
                        
                        {contentCheckResult?.isValid && (
                          <button
                            type="button"
                            onClick={uploadFile}
                            disabled={uploading}
                            className="w-full btn-primary text-sm py-2"
                          >
                            {uploading ? '上传中...' : '上传到IPFS'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 btn-secondary"
                  >
                    上一步
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 btn-primary"
                  >
                    下一步：权限设置
                  </button>
                </div>
              </>
            )}

            {/* 步骤3: 权限设置 */}
            {step === 3 && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      授权类型
                    </label>
                    <button
                      type="button"
                      onClick={getAILicenseAdvice}
                      className="btn-outline text-xs py-1 px-2 flex items-center"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI建议
                    </button>
                  </div>
                  
                  {showAIHelper && aiHelperMessage && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                      <div className="flex items-start">
                        <Sparkles className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-purple-800">
                          <div className="font-medium mb-1">AI助手建议：</div>
                          <div className="whitespace-pre-line">{aiHelperMessage}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="authorizeType"
                        value="commercial"
                        checked={formData.authorizeType === 'commercial'}
                        onChange={(e) => handleInputChange('authorizeType', e.target.value)}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">商业授权</div>
                        <div className="text-sm text-gray-500">允许商业使用和二次创作</div>
                      </div>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="authorizeType"
                        value="non-commercial"
                        checked={formData.authorizeType === 'non-commercial'}
                        onChange={(e) => handleInputChange('authorizeType', e.target.value)}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">非商业授权</div>
                        <div className="text-sm text-gray-500">仅允许非商业用途的二次创作</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      二创授权费 (ETH)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.licenseFee}
                      onChange={(e) => handleInputChange('licenseFee', e.target.value)}
                      className="input-field"
                      placeholder="0.001"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      版税比例 (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={formData.royaltyPercentage}
                      onChange={(e) => handleInputChange('royaltyPercentage', e.target.value)}
                      className="input-field"
                      placeholder="10"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="derivativeAllowed"
                    checked={formData.derivativeAllowed}
                    onChange={(e) => handleInputChange('derivativeAllowed', e.target.checked)}
                    className="mr-3"
                  />
                  <label htmlFor="derivativeAllowed" className="text-sm text-gray-700">
                    允许他人基于此作品进行二次创作
                  </label>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 btn-secondary"
                  >
                    上一步
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    {loading ? '注册中...' : '注册作品'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}