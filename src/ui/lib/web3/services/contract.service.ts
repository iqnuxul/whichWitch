import { readContract, writeContract, waitForTransactionReceipt } from '@wagmi/core';
import { config } from '../config';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';
import { 
  CreationManagerABI, 
  PaymentManagerABI, 
  AuthorizationManagerABI 
} from '../contracts/abis';
import { parseEther } from 'viem';

/**
 * 合约服务 - 处理所有智能合约交互
 */

// ==================== CreationManager ====================

/**
 * 注册原创作品
 */
export async function registerOriginalWork(
  licenseFee: string, // ETH 金额
  derivativeAllowed: boolean,
  metadataURI: string
): Promise<{ hash: string; workId: bigint }> {
  try {
    const hash = await writeContract(config, {
      address: CONTRACT_ADDRESSES.creation,
      abi: CreationManagerABI,
      functionName: 'registerOriginalWork',
      args: [parseEther(licenseFee), derivativeAllowed, metadataURI],
    });

    // 等待交易确认
    const receipt = await waitForTransactionReceipt(config, { hash });
    
    // 从事件日志中提取 workId
    // WorkRegistered 事件的第一个参数是 workId (indexed)
    let workId = 0n;
    
    if (receipt.logs && receipt.logs.length > 0) {
      // workId 是第一个 indexed 参数，在 topics[1] 中
      const log = receipt.logs[0];
      if (log.topics && log.topics.length > 1) {
        workId = BigInt(log.topics[1]);
      }
    }
    
    console.log('Work registered with ID:', workId.toString());
    return { hash, workId };
  } catch (error) {
    console.error('Error registering original work:', error);
    throw error;
  }
}

/**
 * 注册衍生作品
 */
export async function registerDerivativeWork(
  parentId: bigint,
  licenseFee: string,
  derivativeAllowed: boolean,
  metadataURI: string
): Promise<{ hash: string; workId: bigint }> {
  try {
    const hash = await writeContract(config, {
      address: CONTRACT_ADDRESSES.creation,
      abi: CreationManagerABI,
      functionName: 'registerDerivativeWork',
      args: [parentId, parseEther(licenseFee), derivativeAllowed, metadataURI],
    });

    const receipt = await waitForTransactionReceipt(config, { hash });
    
    // 从事件日志中提取 workId
    let workId = 0n;
    
    if (receipt.logs && receipt.logs.length > 0) {
      // workId 是第一个 indexed 参数，在 topics[1] 中
      const log = receipt.logs[0];
      if (log.topics && log.topics.length > 1) {
        workId = BigInt(log.topics[1]);
      }
    }
    
    console.log('Derivative work registered with ID:', workId.toString());
    return { hash, workId };
  } catch (error) {
    console.error('Error registering derivative work:', error);
    throw error;
  }
}

/**
 * 获取作品信息
 */
export async function getWork(workId: bigint) {
  try {
    const work = await readContract(config, {
      address: CONTRACT_ADDRESSES.creation,
      abi: CreationManagerABI,
      functionName: 'getWork',
      args: [workId],
    });

    return work;
  } catch (error) {
    console.error('Error getting work:', error);
    throw error;
  }
}

/**
 * 获取创作者的所有作品 ID
 */
export async function getWorksByCreator(creatorAddress: string): Promise<bigint[]> {
  try {
    const workIds = await readContract(config, {
      address: CONTRACT_ADDRESSES.creation,
      abi: CreationManagerABI,
      functionName: 'getWorksByCreator',
      args: [creatorAddress as `0x${string}`],
    });

    return workIds as bigint[];
  } catch (error) {
    console.error('Error getting works by creator:', error);
    return [];
  }
}

/**
 * 获取衍生作品列表
 */
export async function getDerivatives(parentId: bigint): Promise<bigint[]> {
  try {
    const derivatives = await readContract(config, {
      address: CONTRACT_ADDRESSES.creation,
      abi: CreationManagerABI,
      functionName: 'getDerivatives',
      args: [parentId],
    });

    return derivatives as bigint[];
  } catch (error) {
    console.error('Error getting derivatives:', error);
    return [];
  }
}

/**
 * 获取祖先链（用于创作谱系树）
 */
export async function getAncestorChain(workId: bigint): Promise<string[]> {
  try {
    const ancestors = await readContract(config, {
      address: CONTRACT_ADDRESSES.creation,
      abi: CreationManagerABI,
      functionName: 'getAncestorChain',
      args: [workId],
    });

    return ancestors as string[];
  } catch (error) {
    console.error('Error getting ancestor chain:', error);
    return [];
  }
}

// ==================== AuthorizationManager ====================

/**
 * 请求授权（支付授权费）
 */
export async function requestAuthorization(
  workId: bigint,
  licenseFee: string
): Promise<string> {
  try {
    const hash = await writeContract(config, {
      address: CONTRACT_ADDRESSES.authorization,
      abi: AuthorizationManagerABI,
      functionName: 'requestAuthorization',
      args: [workId],
      value: parseEther(licenseFee),
    });

    await waitForTransactionReceipt(config, { hash });
    return hash;
  } catch (error) {
    console.error('Error requesting authorization:', error);
    throw error;
  }
}

/**
 * 检查用户是否有授权
 */
export async function hasAuthorization(
  userAddress: string,
  workId: bigint
): Promise<boolean> {
  try {
    const authorized = await readContract(config, {
      address: CONTRACT_ADDRESSES.authorization,
      abi: AuthorizationManagerABI,
      functionName: 'hasAuthorization',
      args: [userAddress as `0x${string}`, workId],
    });

    return authorized as boolean;
  } catch (error) {
    console.error('Error checking authorization:', error);
    return false;
  }
}

/**
 * 获取授权时间戳
 */
export async function getAuthorizationTimestamp(
  userAddress: string,
  workId: bigint
): Promise<bigint> {
  try {
    const timestamp = await readContract(config, {
      address: CONTRACT_ADDRESSES.authorization,
      abi: AuthorizationManagerABI,
      functionName: 'getAuthorizationTimestamp',
      args: [userAddress as `0x${string}`, workId],
    });

    return timestamp as bigint;
  } catch (error) {
    console.error('Error getting authorization timestamp:', error);
    return 0n;
  }
}

// ==================== PaymentManager ====================

/**
 * 处理支付（Tip 功能）
 */
export async function processPayment(
  workId: bigint,
  amount: string
): Promise<string> {
  try {
    const hash = await writeContract(config, {
      address: CONTRACT_ADDRESSES.payment,
      abi: PaymentManagerABI,
      functionName: 'processPayment',
      args: [workId],
      value: parseEther(amount),
    });

    await waitForTransactionReceipt(config, { hash });
    return hash;
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
}

/**
 * 计算收益分配
 */
export async function calculateDistribution(
  workId: bigint,
  amount: string
): Promise<{ recipients: string[]; amounts: bigint[] }> {
  try {
    const result = await readContract(config, {
      address: CONTRACT_ADDRESSES.payment,
      abi: PaymentManagerABI,
      functionName: 'calculateDistribution',
      args: [workId, parseEther(amount)],
    });

    const [recipients, amounts] = result as [string[], bigint[]];
    return { recipients, amounts };
  } catch (error) {
    console.error('Error calculating distribution:', error);
    return { recipients: [], amounts: [] };
  }
}

/**
 * 获取作品总收益
 */
export async function getTotalRevenue(workId: bigint): Promise<bigint> {
  try {
    const revenue = await readContract(config, {
      address: CONTRACT_ADDRESSES.payment,
      abi: PaymentManagerABI,
      functionName: 'getTotalRevenue',
      args: [workId],
    });

    return revenue as bigint;
  } catch (error) {
    console.error('Error getting total revenue:', error);
    return 0n;
  }
}

/**
 * 获取创作者收益
 */
export async function getCreatorRevenue(creatorAddress: string): Promise<bigint> {
  try {
    const revenue = await readContract(config, {
      address: CONTRACT_ADDRESSES.payment,
      abi: PaymentManagerABI,
      functionName: 'getCreatorRevenue',
      args: [creatorAddress as `0x${string}`],
    });

    return revenue as bigint;
  } catch (error) {
    console.error('Error getting creator revenue:', error);
    return 0n;
  }
}
