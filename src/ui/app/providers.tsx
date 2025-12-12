'use client'

import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { sepolia, hardhat } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { infuraProvider } from 'wagmi/providers/infura'
import { RainbowKitProvider, getDefaultWallets, connectorsForWallets } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../contexts/AuthContext'
import { AIProvider } from '../contexts/AIContext'
import '@rainbow-me/rainbowkit/styles.css'

// 配置链
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [sepolia, hardhat],
  [
    infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_KEY || '' }),
    publicProvider(),
  ]
)

// 配置钱包
const { wallets } = getDefaultWallets({
  appName: 'whichWitch',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
  chains,
})

const connectors = connectorsForWallets([
  ...wallets,
])

// 创建 wagmi 配置
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

// 创建 React Query 客户端
const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains} theme="light">
          <AuthProvider>
            <AIProvider>
              {children}
            </AIProvider>
          </AuthProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  )
}