import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';
import { AuthorizationManagerABI } from '../contracts/abis';
import { parseEther } from 'viem';

// 请求授权（支付授权费）
export function useRequestAuthorization() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const requestAuthorization = async (workId: bigint, licenseFee: string) => {
    return writeContract({
      address: CONTRACT_ADDRESSES.authorization,
      abi: AuthorizationManagerABI,
      functionName: 'requestAuthorization',
      args: [workId],
      value: parseEther(licenseFee),
    });
  };

  return {
    requestAuthorization,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// 检查用户是否有授权
export function useHasAuthorization(
  userAddress: `0x${string}` | undefined,
  workId: bigint | undefined
) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.authorization,
    abi: AuthorizationManagerABI,
    functionName: 'hasAuthorization',
    args: userAddress && workId !== undefined ? [userAddress, workId] : undefined,
    query: {
      enabled: !!userAddress && workId !== undefined,
    },
  });
}

// 获取授权时间戳
export function useGetAuthorizationTimestamp(
  userAddress: `0x${string}` | undefined,
  workId: bigint | undefined
) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.authorization,
    abi: AuthorizationManagerABI,
    functionName: 'getAuthorizationTimestamp',
    args: userAddress && workId !== undefined ? [userAddress, workId] : undefined,
    query: {
      enabled: !!userAddress && workId !== undefined,
    },
  });
}
