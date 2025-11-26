'use client';

import { useEffect, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, CHAIN_CONFIG } from '@/lib/web3/contracts/addresses';
import { CreationManagerABI } from '@/lib/web3/contracts/abis';
import { supabase } from '@/lib/supabase/client';

export default function TestConnectionPage() {
  const { address, isConnected } = useAccount();
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [pinataStatus, setPinataStatus] = useState<'checking' | 'configured' | 'error'>('checking');

  // 测试合约读取
  const { data: contractData, isError: contractError, isLoading: contractLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.creation,
    abi: CreationManagerABI,
    functionName: 'getWork',
    args: [1n],
  });

  // 测试 Supabase 连接
  useEffect(() => {
    const testSupabase = async () => {
      try {
        const { error } = await supabase.from('users').select('count').limit(1);
        if (error) throw error;
        setSupabaseStatus('connected');
      } catch (err) {
        console.error('Supabase error:', err);
        setSupabaseStatus('error');
      }
    };
    testSupabase();
  }, []);

  // 检查 Pinata 配置
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
    const jwt = process.env.NEXT_PUBLIC_PINATA_JWT;
    if (apiKey || jwt) {
      setPinataStatus('configured');
    } else {
      setPinataStatus('error');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔗 连接测试页面</h1>

        {/* Web3 连接状态 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">1. Web3 钱包连接</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">状态: </span>
              <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                {isConnected ? '✅ 已连接' : '❌ 未连接'}
              </span>
            </p>
            {isConnected && (
              <p>
                <span className="font-medium">地址: </span>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">{address}</code>
              </p>
            )}
            <p>
              <span className="font-medium">网络: </span>
              <span>{CHAIN_CONFIG.networkName} (Chain ID: {CHAIN_CONFIG.chainId})</span>
            </p>
            <p>
              <span className="font-medium">RPC URL: </span>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm break-all">
                {CHAIN_CONFIG.rpcUrl}
              </code>
            </p>
          </div>
        </div>

        {/* 智能合约连接状态 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">2. 智能合约连接</h2>
          <div className="space-y-4">
            <div>
              <p className="font-medium mb-2">合约地址:</p>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-600">CreationManager: </span>
                  <code className="bg-gray-100 px-2 py-1 rounded">{CONTRACT_ADDRESSES.creation}</code>
                </p>
                <p>
                  <span className="text-gray-600">PaymentManager: </span>
                  <code className="bg-gray-100 px-2 py-1 rounded">{CONTRACT_ADDRESSES.payment}</code>
                </p>
                <p>
                  <span className="text-gray-600">AuthorizationManager: </span>
                  <code className="bg-gray-100 px-2 py-1 rounded">{CONTRACT_ADDRESSES.authorization}</code>
                </p>
              </div>
            </div>
            <div>
              <p className="font-medium mb-2">合约读取测试:</p>
              {contractLoading && <p className="text-gray-600">⏳ 加载中...</p>}
              {contractError && <p className="text-red-600">❌ 读取失败（可能作品 ID 1 不存在）</p>}
              {contractData && (
                <p className="text-green-600">✅ 合约连接成功</p>
              )}
            </div>
          </div>
        </div>

        {/* Supabase 连接状态 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">3. Supabase 数据库连接</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">状态: </span>
              <span className={
                supabaseStatus === 'connected' ? 'text-green-600' :
                supabaseStatus === 'error' ? 'text-red-600' : 'text-gray-600'
              }>
                {supabaseStatus === 'connected' ? '✅ 已连接' :
                 supabaseStatus === 'error' ? '❌ 连接失败' : '⏳ 检查中...'}
              </span>
            </p>
            <p>
              <span className="font-medium">项目 URL: </span>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                {process.env.NEXT_PUBLIC_SUPABASE_URL}
              </code>
            </p>
            {supabaseStatus === 'error' && (
              <p className="text-sm text-red-600 mt-2">
                ⚠️ 请确保已在 Supabase Dashboard 中运行 schema.sql
              </p>
            )}
          </div>
        </div>

        {/* Pinata IPFS 配置状态 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">4. Pinata IPFS 配置</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">状态: </span>
              <span className={
                pinataStatus === 'configured' ? 'text-green-600' :
                pinataStatus === 'error' ? 'text-red-600' : 'text-gray-600'
              }>
                {pinataStatus === 'configured' ? '✅ 已配置' :
                 pinataStatus === 'error' ? '❌ 未配置' : '⏳ 检查中...'}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              Pinata 配置通过环境变量设置，用于上传作品到 IPFS
            </p>
          </div>
        </div>

        {/* 环境变量检查 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">5. 环境变量检查</h2>
          <div className="space-y-1 text-sm">
            <p>✅ NEXT_PUBLIC_RPC_URL: {process.env.NEXT_PUBLIC_RPC_URL ? '已设置' : '❌ 未设置'}</p>
            <p>✅ NEXT_PUBLIC_CHAIN_ID: {process.env.NEXT_PUBLIC_CHAIN_ID ? '已设置' : '❌ 未设置'}</p>
            <p>✅ NEXT_PUBLIC_CONTRACT_ADDRESS_CREATION: {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_CREATION ? '已设置' : '❌ 未设置'}</p>
            <p>✅ NEXT_PUBLIC_CONTRACT_ADDRESS_PAYMENT: {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_PAYMENT ? '已设置' : '❌ 未设置'}</p>
            <p>✅ NEXT_PUBLIC_CONTRACT_ADDRESS_AUTHORIZATION: {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_AUTHORIZATION ? '已设置' : '❌ 未设置'}</p>
            <p>✅ NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '已设置' : '❌ 未设置'}</p>
            <p>✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已设置' : '❌ 未设置'}</p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>提示:</strong> 访问 <code className="bg-blue-100 px-2 py-1 rounded">http://localhost:3000/test-connection</code> 查看此页面
          </p>
        </div>
      </div>
    </div>
  );
}
