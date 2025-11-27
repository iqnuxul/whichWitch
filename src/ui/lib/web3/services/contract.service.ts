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
    console.log('🎨 Registering original work:', {
      licenseFee,
      derivativeAllowed,
      metadataURI
    });
    
    const hash = await writeContract(config, {
      address: CONTRACT_ADDRESSES.creation,
      abi: CreationManagerABI,
      functionName: 'registerOriginalWork',
      args: [parseEther(licenseFee), derivativeAllowed, metadataURI],
    });

    console.log('📤 Transaction sent:', hash);
    const receipt = await waitForTransactionReceipt(config, { hash });
    console.log('📋 Receipt:', {
      status: receipt.status,
      logs: receipt.logs.length,
      blockNumber: receipt.blockNumber
    });
    
    // 从事件日志中提取 workId
    let workId = 0n;
    
    if (receipt.logs && receipt.logs.length > 0) {
      console.log('🔍 Parsing logs to find WorkRegistered event...');
      
      // 查找来自 CreationManager 合约的日志
      const creationManagerLogs = receipt.logs.filter(
        log => log.address.toLowerCase() === CONTRACT_ADDRESSES.creation.toLowerCase()
      );
      
      console.log(`Found ${creationManagerLogs.length} logs from CreationManager`);
      
      if (creationManagerLogs.length > 0) {
        const log = creationManagerLogs[0];
        console.log('📝 Log topics:', log.topics);
        
        // workId 是第一个 indexed 参数，在 topics[1] 中
        if (log.topics && log.topics.length > 1) {
          workId = BigInt(log.topics[1]);
          console.log('✅ Extracted workId from topics[1]:', workId.toString());
        } else {
          console.error('❌ No topics found in log');
        }
      } else {
        console.error('❌ No logs from CreationManager contract');
        console.log('All logs:', receipt.logs.map(l => ({
          address: l.address,
          topics: l.topics
        })));
      }
    } else {
      console.error('❌ No logs in receipt');
    }
    
    if (workId === 0n) {
      console.warn('⚠️ Could not extract workId from logs, trying alternative method...');
      
      // 备用方案：读取 nextWorkId 并减 1
      try {
        const nextWorkId = await readContract(config, {
          address: CONTRACT_ADDRESSES.creation,
          abi: CreationManagerABI,
          functionName: 'nextWorkId',
        }) as bigint;
        
        workId = nextWorkId - 1n;
        console.log('✅ Got workId from nextWorkId:', workId.toString());
      } catch (e) {
        console.error('❌ Failed to get nextWorkId:', e);
        throw new Error('Failed to extract workId from transaction receipt');
      }
    }
    
    if (workId === 0n) {
      console.error('❌ WARNING: workId is still 0! This will cause database issues.');
      throw new Error('Failed to extract workId: workId is 0');
    }
    
    console.log('✅ Work registered with ID:', workId.toString());
    return { hash, workId };
  } catch (error) {
    console.error('❌ Error registering original work:', error);
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
    console.log('🎨 Registering derivative work:', {
      parentId: parentId.toString(),
      licenseFee,
      derivativeAllowed,
      metadataURI
    });
    
    const hash = await writeContract(config, {
      address: CONTRACT_ADDRESSES.creation,
      abi: CreationManagerABI,
      functionName: 'registerDerivativeWork',
      args: [parentId, parseEther(licenseFee), derivativeAllowed, metadataURI],
    });

    console.log('📤 Transaction sent:', hash);
    const receipt = await waitForTransactionReceipt(config, { hash });
    console.log('📋 Receipt:', {
      status: receipt.status,
      logs: receipt.logs.length,
      blockNumber: receipt.blockNumber
    });
    
    // 从事件日志中提取 workId
    let workId = 0n;
    
    if (receipt.logs && receipt.logs.length > 0) {
      console.log('🔍 Parsing logs to find WorkRegistered event...');
      
      // 查找来自 CreationManager 合约的日志
      const creationManagerLogs = receipt.logs.filter(
        log => log.address.toLowerCase() === CONTRACT_ADDRESSES.creation.toLowerCase()
      );
      
      console.log(`Found ${creationManagerLogs.length} logs from CreationManager`);
      
      if (creationManagerLogs.length > 0) {
        const log = creationManagerLogs[0];
        console.log('📝 Log topics:', log.topics);
        
        // workId 是第一个 indexed 参数，在 topics[1] 中
        if (log.topics && log.topics.length > 1) {
          workId = BigInt(log.topics[1]);
          console.log('✅ Extracted workId from topics[1]:', workId.toString());
        } else {
          console.error('❌ No topics found in log');
        }
      } else {
        console.error('❌ No logs from CreationManager contract');
        console.log('All logs:', receipt.logs.map(l => ({
          address: l.address,
          topics: l.topics
        })));
      }
    } else {
      console.error('❌ No logs in receipt');
    }
    
    if (workId === 0n) {
      console.warn('⚠️ Could not extract workId from logs, trying alternative method...');
      
      // 备用方案：读取 nextWorkId 并减 1
      try {
        const nextWorkId = await readContract(config, {
          address: CONTRACT_ADDRESSES.creation,
          abi: CreationManagerABI,
          functionName: 'nextWorkId',
        }) as bigint;
        
        workId = nextWorkId - 1n;
        console.log('✅ Got workId from nextWorkId:', workId.toString());
      } catch (e) {
        console.error('❌ Failed to get nextWorkId:', e);
        throw new Error('Failed to extract workId from transaction receipt');
      }
    }
    
    if (workId === 0n) {
      console.error('❌ WARNING: workId is still 0! This will cause database issues.');
      throw new Error('Failed to extract workId: workId is 0');
    }
    
    console.log('✅ Derivative work registered with ID:', workId.toString());
    return { hash, workId };
  } catch (error) {
    console.error('❌ Error registering derivative work:', error);
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
    console.log('Requesting authorization with params:', {
      contract: CONTRACT_ADDRESSES.authorization,
      workId: workId.toString(),
      licenseFee,
      value: parseEther(licenseFee).toString()
    });

    const hash = await writeContract(config, {
      address: CONTRACT_ADDRESSES.authorization,
      abi: AuthorizationManagerABI,
      functionName: 'requestAuthorization',
      args: [workId],
      value: parseEther(licenseFee),
      gas: 500000n, // 设置足够的 gas limit
    });

    console.log('Transaction hash:', hash);
    console.log('Waiting for confirmation...');
    
    const receipt = await waitForTransactionReceipt(config, { hash });
    console.log('Transaction receipt:', receipt);
    
    // 检查交易是否成功
    if (receipt.status === 'reverted') {
      console.error('❌ Transaction reverted!');
      throw new Error('Transaction failed: The transaction was reverted. Please check if the contract is properly configured.');
    }
    
    console.log('✅ Transaction confirmed!');
    return hash;
  } catch (error: any) {
    console.error('Error requesting authorization:', error);
    console.error('Error details:', {
      message: error.message,
      cause: error.cause,
      details: error.details
    });
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
 * @param workId 作品 ID
 * @param amount ETH 金额
 */
export async function processPayment(
  workId: bigint,
  amount: string
): Promise<string> {
  try {
    console.log('💸 Processing payment:', {
      contract: CONTRACT_ADDRESSES.payment,
      workId: workId.toString(),
      amount: amount + ' ETH',
      value: parseEther(amount).toString() + ' wei'
    });
    
    // 先获取作品信息，看看创作者是谁
    try {
      const work = await readContract(config, {
        address: CONTRACT_ADDRESSES.creation,
        abi: CreationManagerABI,
        functionName: 'getWork',
        args: [workId],
      });
      console.log('📝 Work info:', work);
      console.log('👤 Creator will receive tip:', work.creator);
    } catch (e) {
      console.warn('⚠️ Could not fetch work info:', e);
    }

    const hash = await writeContract(config, {
      address: CONTRACT_ADDRESSES.payment,
      abi: PaymentManagerABI,
      functionName: 'processPayment',
      args: [workId],
      value: parseEther(amount),
    });

    console.log('📤 Transaction sent:', hash);
    console.log('⏳ Waiting for confirmation...');
    
    const receipt = await waitForTransactionReceipt(config, { hash });
    console.log('📋 Transaction receipt:', {
      status: receipt.status,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      logs: receipt.logs.length + ' events'
    });
    
    // 检查交易是否成功
    if (receipt.status === 'reverted') {
      console.error('❌ Transaction reverted!');
      throw new Error('Transaction failed: The transaction was reverted. This might be because the PaymentManager contract\'s creationManager address is not set.');
    }
    
    // 检查是否有 TipReceived 事件
    const tipEvent = receipt.logs.find(log => 
      log.address.toLowerCase() === CONTRACT_ADDRESSES.payment.toLowerCase()
    );
    
    if (tipEvent) {
      console.log('✅ TipReceived event found in logs');
    } else {
      console.warn('⚠️ No TipReceived event found - payment might not have been recorded');
    }
    
    console.log('✅ Transaction successful!');
    console.log('🔗 View on explorer: https://sepolia.etherscan.io/tx/' + hash);
    
    return hash;
  } catch (error) {
    console.error('❌ Error processing payment:', error);
    throw error;
  }
}

/**
 * 直接打赏创作者
 * @param creatorAddress 创作者地址
 * @param amount ETH 金额
 */
export async function tipCreator(
  creatorAddress: string,
  amount: string
): Promise<string> {
  try {
    const hash = await writeContract(config, {
      address: CONTRACT_ADDRESSES.payment,
      abi: PaymentManagerABI,
      functionName: 'tipCreator',
      args: [creatorAddress as `0x${string}`],
      value: parseEther(amount),
    });

    await waitForTransactionReceipt(config, { hash });
    return hash;
  } catch (error) {
    console.error('Error tipping creator:', error);
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
    console.log('💰 Reading balance for:', creatorAddress);
    console.log('📍 Contract:', CONTRACT_ADDRESSES.payment);
    
    // 尝试三种不同的方法查询余额
    console.log('🔍 Method 1: Using balances mapping...');
    const balance1 = await readContract(config, {
      address: CONTRACT_ADDRESSES.payment,
      abi: PaymentManagerABI,
      functionName: 'balances',
      args: [creatorAddress as `0x${string}`],
    });
    console.log('✅ balances() returned:', balance1.toString(), 'wei');
    
    try {
      console.log('🔍 Method 2: Using getBalance function...');
      const balance2 = await readContract(config, {
        address: CONTRACT_ADDRESSES.payment,
        abi: PaymentManagerABI,
        functionName: 'getBalance',
        args: [creatorAddress as `0x${string}`],
      });
      console.log('✅ getBalance() returned:', balance2.toString(), 'wei');
      
      if (balance1 !== balance2) {
        console.warn('⚠️ WARNING: balances and getBalance returned different values!');
      }
    } catch (e) {
      console.log('ℹ️ getBalance() not available or failed');
    }

    console.log('💵 Final balance:', balance1.toString(), 'wei', `(${formatEther(balance1)} ETH)`);
    return balance1 as bigint;
  } catch (error) {
    console.error('❌ Error getting creator revenue:', error);
    return 0n;
  }
}

/**
 * 提现创作者收益
 */
export async function withdrawRevenue(): Promise<string> {
  try {
    const hash = await writeContract(config, {
      address: CONTRACT_ADDRESSES.payment,
      abi: PaymentManagerABI,
      functionName: 'withdraw',
      args: [],
    });

    await waitForTransactionReceipt(config, { hash });
    return hash;
  } catch (error) {
    console.error('Error withdrawing revenue:', error);
    throw error;
  }
}
