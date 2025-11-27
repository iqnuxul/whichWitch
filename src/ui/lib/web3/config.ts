import { http, createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

// 使用环境变量或默认的公共 RPC
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.sepolia.org';

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected({ 
      target: 'metaMask',
      shimDisconnect: true,
    }),
    injected({
      target: () => ({
        id: 'onekey',
        name: 'OneKey',
        provider: typeof window !== 'undefined' ? (window as any).$onekey?.ethereum : undefined,
      }),
      shimDisconnect: true,
    }),
    injected({
      shimDisconnect: true,
    }),
  ],
  transports: {
    [sepolia.id]: http(rpcUrl),
  },
  ssr: true, // 启用 SSR 支持
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
