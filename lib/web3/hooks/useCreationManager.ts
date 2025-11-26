import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';
import { CreationManagerABI } from '../contracts/abis';
import { parseEther } from 'viem';

// 创建作品
export function useCreateWork() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createWork = async (
    contentHash: string,
    title: string,
    description: string,
    licenseFee: string // ETH 金额字符串，如 "0.01"
  ) => {
    return writeContract({
      address: CONTRACT_ADDRESSES.creation,
      abi: CreationManagerABI,
      functionName: 'createWork',
      args: [contentHash, title, description, parseEther(licenseFee)],
    });
  };

  return {
    createWork,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// 创建衍生作品
export function useCreateDerivative() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createDerivative = async (
    parentId: bigint,
    contentHash: string,
    title: string,
    description: string,
    licenseFee: string
  ) => {
    return writeContract({
      address: CONTRACT_ADDRESSES.creation,
      abi: CreationManagerABI,
      functionName: 'createDerivative',
      args: [parentId, contentHash, title, description, parseEther(licenseFee)],
    });
  };

  return {
    createDerivative,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// 获取作品信息
export function useGetWork(workId: bigint | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.creation,
    abi: CreationManagerABI,
    functionName: 'getWork',
    args: workId !== undefined ? [workId] : undefined,
    query: {
      enabled: workId !== undefined,
    },
  });
}

// 获取创作者的所有作品
export function useGetWorksByCreator(creator: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.creation,
    abi: CreationManagerABI,
    functionName: 'getWorksByCreator',
    args: creator ? [creator] : undefined,
    query: {
      enabled: !!creator,
    },
  });
}

// 获取衍生作品列表
export function useGetDerivatives(parentId: bigint | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.creation,
    abi: CreationManagerABI,
    functionName: 'getDerivatives',
    args: parentId !== undefined ? [parentId] : undefined,
    query: {
      enabled: parentId !== undefined,
    },
  });
}

// 获取祖先链
export function useGetAncestorChain(workId: bigint | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.creation,
    abi: CreationManagerABI,
    functionName: 'getAncestorChain',
    args: workId !== undefined ? [workId] : undefined,
    query: {
      enabled: workId !== undefined,
    },
  });
}
