'use client';

import { useState } from 'react';
import { aiAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function TestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testAIChat = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('开始测试 AI 聊天...');
      const response = await aiAPI.chat({
        query: '你好，请介绍一下这个平台'
      });
      
      console.log('AI 响应:', response);
      setResult(response);
      toast.success('AI 聊天测试成功！');
    } catch (error: any) {
      console.error('AI 聊天测试失败:', error);
      toast.error('测试失败: ' + (error.message || '未知错误'));
      setResult({ error: error.message || '未知错误' });
    } finally {
      setLoading(false);
    }
  };

  const testMarketData = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('开始测试市场数据...');
      const response = await aiAPI.getMarketData();
      
      console.log('市场数据响应:', response);
      setResult(response);
      toast.success('市场数据测试成功！');
    } catch (error: any) {
      console.error('市场数据测试失败:', error);
      toast.error('测试失败: ' + (error.message || '未知错误'));
      setResult({ error: error.message || '未知错误' });
    } finally {
      setLoading(false);
    }
  };

  const testGenerateDescription = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('开始测试生成描述...');
      const response = await aiAPI.generateWorkDescription({
        workTitle: '测试作品',
        workType: '数字艺术',
        userInput: '一幅未来主义风格的插画'
      });
      
      console.log('生成描述响应:', response);
      setResult(response);
      toast.success('生成描述测试成功！');
    } catch (error: any) {
      console.error('生成描述测试失败:', error);
      toast.error('测试失败: ' + (error.message || '未知错误'));
      setResult({ error: error.message || '未知错误' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API 测试页面</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={testAIChat}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '测试中...' : '测试 AI 聊天'}
          </button>
          
          <button
            onClick={testMarketData}
            disabled={loading}
            className="w-full bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '测试中...' : '测试市场数据'}
          </button>
          
          <button
            onClick={testGenerateDescription}
            disabled={loading}
            className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '测试中...' : '测试生成描述'}
          </button>
        </div>
        
        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">测试结果：</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">调试提示：</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 打开浏览器控制台（F12）查看详细日志</li>
            <li>• 检查网络请求是否成功</li>
            <li>• 查看是否有错误提示</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
