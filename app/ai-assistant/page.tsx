'use client';

import React, { useState, useEffect } from 'react';
import { useWeb3Context } from '../../contexts/Web3Context';
import { aiAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function AIAssistantPage() {
  const { account, isConnected } = useWeb3Context();
  const [activeTab, setActiveTab] = useState('creation');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    description?: string;
    ideas?: string[];
    suggestions?: string[];
    analysis?: any;
    brainstorm?: any;
    marketAnalysis?: any;
    tradingAdvice?: any;
    web3Education?: any;
    walletManagement?: any;
    walletData?: any;
  }>({});

  // 创作助手状态
  const [workTitle, setWorkTitle] = useState('');
  const [workType, setWorkType] = useState('原创作品');
  const [userInput, setUserInput] = useState('');
  const [creativeGoals, setCreativeGoals] = useState('');

  // 交易助手状态
  const [marketData, setMarketData] = useState<{
    totalListings?: number;
    priceRanges?: any;
    marketTrend?: string;
  } | null>(null);
  const [userPreferences, setUserPreferences] = useState({
    riskLevel: 'medium',
    investmentGoal: 'long-term',
    preferredCategories: []
  });

  // 钱包管理助手状态
  const [web3Question, setWeb3Question] = useState('');
  const [userLevel, setUserLevel] = useState('beginner');
  const [walletGoals, setWalletGoals] = useState({
    securityLevel: 'high',
    profitTarget: 'moderate',
    timeHorizon: 'medium'
  });

  // 通用聊天状态
  const [chatQuery, setChatQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{
    id: number;
    question: string;
    answer: any;
    timestamp: Date;
  }>>([]);

  // 获取市场数据
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await aiAPI.getMarketData();
        if (response.success) {
          setMarketData(response.data);
        }
      } catch (error) {
        console.error('获取市场数据失败:', error);
      }
    };

    fetchMarketData();
  }, []);

  // 创作助手 - 生成作品简介
  const handleGenerateDescription = async () => {
    if (!workTitle.trim()) {
      toast.error('请输入作品标题');
      return;
    }

    setLoading(true);
    try {
      console.log('开始生成作品简介...');
      const response = await aiAPI.generateWorkDescription({
        workTitle,
        workType,
        userInput,
      });

      console.log('生成简介响应:', response);
      
      if (response.data?.success) {
        setResults(prev => ({
          ...prev,
          description: response.data.description
        }));
        toast.success('作品简介生成成功！');
      } else {
        toast.error('生成失败: ' + (response.data?.error || '未知错误'));
      }
    } catch (error: any) {
      console.error('生成作品简介失败:', error);
      toast.error('生成失败: ' + (error.message || '请重试'));
    } finally {
      setLoading(false);
    }
  };

  // 创作助手 - 头脑风暴
  const handleBrainstorm = async () => {
    if (!workTitle.trim()) {
      alert('请输入作品标题');
      return;
    }

    setLoading(true);
    try {
      const response = await aiAPI.brainstormIdeas({
        workTitle,
        currentDescription: results.description || userInput,
        creativeGoals
      });

      if (response.success) {
        setResults(prev => ({
          ...prev,
          brainstorm: (response as any).ideas
        }));
      } else {
        alert('头脑风暴失败: ' + (response.error || '未知错误'));
      }
    } catch (error) {
      console.error('头脑风暴失败:', error);
      alert('头脑风暴失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 交易助手 - 市场分析
  const handleMarketAnalysis = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.getMarketAnalysis(userPreferences);

      if (response.success) {
        setResults(prev => ({
          ...prev,
          marketAnalysis: (response as any).analysis,
          marketData: (response as any).marketData
        }));
      } else {
        alert('市场分析失败: ' + (response.error || '未知错误'));
      }
    } catch (error) {
      console.error('市场分析失败:', error);
      alert('市场分析失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 交易助手 - 个性化建议
  const handleTradingAdvice = async () => {
    if (!account) {
      alert('请先连接钱包');
      return;
    }

    setLoading(true);
    try {
      const response = await aiAPI.getTradingAdvice({
        walletAddress: account,
        userPreferences
      });

      if (response.success) {
        setResults(prev => ({
          ...prev,
          tradingAdvice: (response as any).advice,
          walletData: (response as any).walletData
        }));
      } else {
        alert('获取交易建议失败: ' + (response.error || '未知错误'));
      }
    } catch (error) {
      console.error('获取交易建议失败:', error);
      alert('获取交易建议失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 钱包管理助手 - Web3 教育
  const handleWeb3Education = async () => {
    if (!web3Question.trim()) {
      alert('请输入您的问题');
      return;
    }

    setLoading(true);
    try {
      const response = await aiAPI.getWeb3Education({
        question: web3Question,
        userLevel
      });

      if (response.success) {
        setResults(prev => ({
          ...prev,
          web3Education: (response as any).explanation
        }));
      } else {
        alert('获取解答失败: ' + (response.error || '未知错误'));
      }
    } catch (error) {
      console.error('获取解答失败:', error);
      alert('获取解答失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 钱包管理助手 - 财务管理建议
  const handleWalletManagement = async () => {
    if (!account) {
      alert('请先连接钱包');
      return;
    }

    setLoading(true);
    try {
      const response = await aiAPI.getWalletManagement({
        walletAddress: account,
        userGoals: walletGoals
      });

      if ((response as any).success) {
        setResults(prev => ({
          ...prev,
          walletManagement: (response as any).advice,
          walletData: (response as any).walletData
        }));
      } else {
        alert('获取管理建议失败: ' + ((response as any).error || '未知错误'));
      }
    } catch (error) {
      console.error('获取管理建议失败:', error);
      alert('获取管理建议失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 通用聊天
  const handleChat = async () => {
    if (!chatQuery.trim()) {
      alert('请输入您的问题');
      return;
    }

    setLoading(true);
    try {
      const response = await aiAPI.chat({
        query: chatQuery,
        userContext: {
          account,
          isConnected,
          workTitle,
          workType
        }
      });

      if ((response as any).success) {
        const newMessage = {
          id: Date.now(),
          question: chatQuery,
          answer: (response as any).response,
          timestamp: new Date()
        };
        
        setChatHistory(prev => [...prev, newMessage]);
        setChatQuery('');
      } else {
        alert('聊天失败: ' + ((response as any).error || '未知错误'));
      }
    } catch (error) {
      console.error('聊天失败:', error);
      alert('聊天失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'creation', name: '创作助手', icon: '🎨' },
    { id: 'trading', name: '交易助手', icon: '📈' },
    { id: 'wallet', name: '钱包管理', icon: '💰' },
    { id: 'chat', name: '智能聊天', icon: '💬' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">AI 智能助手</h1>

        {/* 标签页导航 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* 创作助手 */}
            {activeTab === 'creation' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">🎨 创作助手</h2>
                <p className="text-gray-600">
                  为您的作品生成吸引人的简介，提供创作建议和授权方式推荐。
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        作品标题 *
                      </label>
                      <input
                        type="text"
                        value={workTitle}
                        onChange={(e) => setWorkTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="输入您的作品标题"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        作品类型
                      </label>
                      <select
                        value={workType}
                        onChange={(e) => setWorkType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="原创作品">原创作品</option>
                        <option value="衍生作品">衍生作品</option>
                        <option value="数字艺术">数字艺术</option>
                        <option value="文字作品">文字作品</option>
                        <option value="音频作品">音频作品</option>
                        <option value="视频作品">视频作品</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        作品描述（可选）
                      </label>
                      <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="简单描述您的作品内容、风格或创作理念"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        创作目标（可选）
                      </label>
                      <textarea
                        value={creativeGoals}
                        onChange={(e) => setCreativeGoals(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="您希望通过这个作品达到什么目标？"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={handleGenerateDescription}
                        disabled={loading}
                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                      >
                        {loading ? '生成中...' : '生成作品简介'}
                      </button>
                      <button
                        onClick={handleBrainstorm}
                        disabled={loading}
                        className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
                      >
                        {loading ? '思考中...' : '头脑风暴'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {results.description && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-2">📝 作品简介</h3>
                        <div className="text-blue-700 whitespace-pre-wrap">
                          {results.description}
                        </div>
                      </div>
                    )}

                    {results.brainstorm && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-green-800 mb-2">💡 创作建议</h3>
                        <div className="text-green-700 whitespace-pre-wrap">
                          {results.brainstorm}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 交易助手 */}
            {activeTab === 'trading' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">📈 交易助手</h2>
                <p className="text-gray-600">
                  基于最新的 NFT 交易数据，为您提供购买、售卖等方面的专业建议。
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        风险偏好
                      </label>
                      <select
                        value={userPreferences.riskLevel}
                        onChange={(e) => setUserPreferences(prev => ({
                          ...prev,
                          riskLevel: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">保守型</option>
                        <option value="medium">平衡型</option>
                        <option value="high">激进型</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        投资目标
                      </label>
                      <select
                        value={userPreferences.investmentGoal}
                        onChange={(e) => setUserPreferences(prev => ({
                          ...prev,
                          investmentGoal: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="short-term">短期收益</option>
                        <option value="long-term">长期投资</option>
                        <option value="collection">收藏价值</option>
                      </select>
                    </div>

                    {marketData && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">📊 当前市场数据</h3>
                        <div className="text-sm space-y-1">
                          <p>上架数量: {marketData.totalListings}</p>
                          <p>平均价格: {marketData.priceRanges.average.toFixed(4)} ZETA</p>
                          <p>价格区间: {marketData.priceRanges.low.toFixed(4)} - {marketData.priceRanges.high.toFixed(4)} ZETA</p>
                          <p>市场趋势: {marketData.marketTrend}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-3">
                      <button
                        onClick={handleMarketAnalysis}
                        disabled={loading}
                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                      >
                        {loading ? '分析中...' : '市场分析'}
                      </button>
                      <button
                        onClick={handleTradingAdvice}
                        disabled={loading || !isConnected}
                        className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
                      >
                        {loading ? '分析中...' : '个性化建议'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {results.marketAnalysis && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-2">📈 市场分析</h3>
                        <div className="text-blue-700 whitespace-pre-wrap">
                          {results.marketAnalysis}
                        </div>
                      </div>
                    )}

                    {results.tradingAdvice && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-green-800 mb-2">💡 交易建议</h3>
                        <div className="text-green-700 whitespace-pre-wrap">
                          {results.tradingAdvice}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 钱包管理助手 */}
            {activeTab === 'wallet' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">💰 钱包管理助手</h2>
                <p className="text-gray-600">
                  为 Web3 新手提供基础知识普及和钱包管理建议，帮助您更好地管理数字资产。
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    {/* Web3 教育 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold mb-3">🎓 Web3 知识普及</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            您的问题
                          </label>
                          <textarea
                            value={web3Question}
                            onChange={(e) => setWeb3Question(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="例如：什么是私钥？如何保护我的钱包安全？"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            您的 Web3 水平
                          </label>
                          <select
                            value={userLevel}
                            onChange={(e) => setUserLevel(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="beginner">初学者</option>
                            <option value="intermediate">中级</option>
                            <option value="advanced">高级</option>
                          </select>
                        </div>

                        <button
                          onClick={handleWeb3Education}
                          disabled={loading}
                          className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                        >
                          {loading ? '解答中...' : '获取解答'}
                        </button>
                      </div>
                    </div>

                    {/* 钱包管理 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold mb-3">💼 财务管理建议</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            安全级别
                          </label>
                          <select
                            value={walletGoals.securityLevel}
                            onChange={(e) => setWalletGoals(prev => ({
                              ...prev,
                              securityLevel: e.target.value
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="basic">基础安全</option>
                            <option value="high">高级安全</option>
                            <option value="enterprise">企业级安全</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            收益目标
                          </label>
                          <select
                            value={walletGoals.profitTarget}
                            onChange={(e) => setWalletGoals(prev => ({
                              ...prev,
                              profitTarget: e.target.value
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="conservative">保守收益</option>
                            <option value="moderate">适中收益</option>
                            <option value="aggressive">激进收益</option>
                          </select>
                        </div>

                        <button
                          onClick={handleWalletManagement}
                          disabled={loading || !isConnected}
                          className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
                        >
                          {loading ? '分析中...' : '获取管理建议'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {results.web3Education && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-2">🎓 知识解答</h3>
                        <div className="text-blue-700 whitespace-pre-wrap">
                          {results.web3Education}
                        </div>
                      </div>
                    )}

                    {results.walletManagement && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-green-800 mb-2">💼 管理建议</h3>
                        <div className="text-green-700 whitespace-pre-wrap">
                          {results.walletManagement}
                        </div>
                      </div>
                    )}

                    {results.walletData && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">📊 钱包数据</h3>
                        <div className="text-sm space-y-1">
                          <p>余额: {results.walletData.balance} ZETA</p>
                          <p>作品数量: {results.walletData.worksCount}</p>
                          <p>总价值: {results.walletData.totalValue.toFixed(4)} ZETA</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 智能聊天 */}
            {activeTab === 'chat' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">💬 智能聊天</h2>
                <p className="text-gray-600">
                  与 AI 助手自由对话，获取关于平台功能、创作、交易等各方面的帮助。
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        您的问题
                      </label>
                      <textarea
                        value={chatQuery}
                        onChange={(e) => setChatQuery(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="请输入您想了解的问题..."
                      />
                    </div>

                    <button
                      onClick={handleChat}
                      disabled={loading}
                      className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                    >
                      {loading ? '思考中...' : '发送问题'}
                    </button>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {chatHistory.length === 0 ? (
                      <div className="text-gray-500 text-center py-8">
                        还没有对话记录，开始您的第一个问题吧！
                      </div>
                    ) : (
                      chatHistory.map((chat) => (
                        <div key={chat.id} className="space-y-2">
                          <div className="bg-blue-100 p-3 rounded-lg">
                            <div className="font-medium text-blue-800">您的问题:</div>
                            <div className="text-blue-700">{chat.question}</div>
                          </div>
                          <div className="bg-green-100 p-3 rounded-lg">
                            <div className="font-medium text-green-800">AI 回答:</div>
                            <div className="text-green-700 whitespace-pre-wrap">{chat.answer}</div>
                          </div>
                          <div className="text-xs text-gray-500 text-right">
                            {chat.timestamp.toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}