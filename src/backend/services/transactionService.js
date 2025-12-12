import { ethers } from 'ethers';
import { getUserPrivateKey } from './authService.js';

// 合约ABI（需要从编译后的artifacts中获取）
const CREATION_MANAGER_ABI = [
  "function registerOriginalWork(uint256 licenseFee, bool derivativeAllowed, string calldata metadataURI) external returns (uint256 workId)",
  "function registerDerivativeWork(uint256 parentId, uint256 licenseFee, bool derivativeAllowed, string calldata metadataURI) external returns (uint256 workId)"
];

const AUTHORIZATION_MANAGER_ABI = [
  "function requestAuthorization(uint256 workId) external payable"
];

const PAYMENT_MANAGER_ABI = [
  "function tipCreator(address creator) external payable",
  "function withdraw() external"
];

/**
 * 获取用户的钱包实例
 */
async function getUserWallet(userId) {
  const privateKey = await getUserPrivateKey(userId);
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  return new ethers.Wallet(privateKey, provider);
}

/**
 * 获取合约实例
 */
function getContract(contractAddress, abi, wallet) {
  return new ethers.Contract(contractAddress, abi, wallet);
}

/**
 * 代理注册原创作品
 */
export async function proxyRegisterOriginalWork(userId, licenseFee, derivativeAllowed, metadataURI) {
  try {
    const wallet = await getUserWallet(userId);
    const contract = getContract(
      process.env.CREATION_MANAGER_ADDRESS,
      CREATION_MANAGER_ABI,
      wallet
    );

    // 估算gas
    const gasEstimate = await contract.registerOriginalWork.estimateGas(
      licenseFee,
      derivativeAllowed,
      metadataURI
    );

    // 执行交易
    const tx = await contract.registerOriginalWork(
      licenseFee,
      derivativeAllowed,
      metadataURI,
      {
        gasLimit: gasEstimate.mul(120).div(100) // 增加20%的gas缓冲
      }
    );

    const receipt = await tx.wait();
    
    // 解析事件获取workId
    const workRegisteredEvent = receipt.logs.find(
      log => log.topics[0] === contract.interface.getEventTopic('WorkRegistered')
    );
    
    let workId = null;
    if (workRegisteredEvent) {
      const parsedEvent = contract.interface.parseLog(workRegisteredEvent);
      workId = parsedEvent.args.workId.toString();
    }

    return {
      success: true,
      txHash: tx.hash,
      workId,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error('Proxy register original work error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 代理注册衍生作品
 */
export async function proxyRegisterDerivativeWork(userId, parentId, licenseFee, derivativeAllowed, metadataURI) {
  try {
    const wallet = await getUserWallet(userId);
    const contract = getContract(
      process.env.CREATION_MANAGER_ADDRESS,
      CREATION_MANAGER_ABI,
      wallet
    );

    const gasEstimate = await contract.registerDerivativeWork.estimateGas(
      parentId,
      licenseFee,
      derivativeAllowed,
      metadataURI
    );

    const tx = await contract.registerDerivativeWork(
      parentId,
      licenseFee,
      derivativeAllowed,
      metadataURI,
      {
        gasLimit: gasEstimate.mul(120).div(100)
      }
    );

    const receipt = await tx.wait();
    
    // 解析事件获取workId
    const derivativeRegisteredEvent = receipt.logs.find(
      log => log.topics[0] === contract.interface.getEventTopic('DerivativeWorkRegistered')
    );
    
    let workId = null;
    if (derivativeRegisteredEvent) {
      const parsedEvent = contract.interface.parseLog(derivativeRegisteredEvent);
      workId = parsedEvent.args.workId.toString();
    }

    return {
      success: true,
      txHash: tx.hash,
      workId,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error('Proxy register derivative work error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 代理请求授权
 */
export async function proxyRequestAuthorization(userId, workId, licenseFee) {
  try {
    const wallet = await getUserWallet(userId);
    const contract = getContract(
      process.env.AUTHORIZATION_MANAGER_ADDRESS,
      AUTHORIZATION_MANAGER_ABI,
      wallet
    );

    const gasEstimate = await contract.requestAuthorization.estimateGas(
      workId,
      { value: licenseFee }
    );

    const tx = await contract.requestAuthorization(
      workId,
      {
        value: licenseFee,
        gasLimit: gasEstimate.mul(120).div(100)
      }
    );

    const receipt = await tx.wait();

    return {
      success: true,
      txHash: tx.hash,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error('Proxy request authorization error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 代理打赏创作者
 */
export async function proxyTipCreator(userId, creatorAddress, amount) {
  try {
    const wallet = await getUserWallet(userId);
    const contract = getContract(
      process.env.PAYMENT_MANAGER_ADDRESS,
      PAYMENT_MANAGER_ABI,
      wallet
    );

    const gasEstimate = await contract.tipCreator.estimateGas(
      creatorAddress,
      { value: amount }
    );

    const tx = await contract.tipCreator(
      creatorAddress,
      {
        value: amount,
        gasLimit: gasEstimate.mul(120).div(100)
      }
    );

    const receipt = await tx.wait();

    return {
      success: true,
      txHash: tx.hash,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error('Proxy tip creator error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 代理提现
 */
export async function proxyWithdraw(userId) {
  try {
    const wallet = await getUserWallet(userId);
    const contract = getContract(
      process.env.PAYMENT_MANAGER_ADDRESS,
      PAYMENT_MANAGER_ABI,
      wallet
    );

    const gasEstimate = await contract.withdraw.estimateGas();

    const tx = await contract.withdraw({
      gasLimit: gasEstimate.mul(120).div(100)
    });

    const receipt = await tx.wait();

    return {
      success: true,
      txHash: tx.hash,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error('Proxy withdraw error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 获取用户余额
 */
export async function getUserBalance(userId) {
  try {
    const wallet = await getUserWallet(userId);
    const balance = await wallet.getBalance();
    
    return {
      success: true,
      balance: balance.toString(),
      balanceEth: ethers.formatEther(balance)
    };
  } catch (error) {
    console.error('Get user balance error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 估算交易费用
 */
export async function estimateTransactionCost(userId, contractAddress, abi, methodName, params = [], value = '0') {
  try {
    const wallet = await getUserWallet(userId);
    const contract = getContract(contractAddress, abi, wallet);
    
    const gasEstimate = await contract[methodName].estimateGas(...params, { value });
    const gasPrice = await wallet.getGasPrice();
    const cost = gasEstimate.mul(gasPrice);
    
    return {
      success: true,
      gasEstimate: gasEstimate.toString(),
      gasPrice: gasPrice.toString(),
      cost: cost.toString(),
      costEth: ethers.formatEther(cost)
    };
  } catch (error) {
    console.error('Estimate transaction cost error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}