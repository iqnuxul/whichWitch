// 智能合约地址配置
export const CONTRACT_ADDRESSES = {
  creation: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_CREATION as `0x${string}`,
  payment: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_PAYMENT as `0x${string}`,
  authorization: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_AUTHORIZATION as `0x${string}`,
} as const;

export const CHAIN_CONFIG = {
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '11155111'),
  networkName: process.env.NEXT_PUBLIC_NETWORK_NAME || 'sepolia',
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.sepolia.org',
} as const;
