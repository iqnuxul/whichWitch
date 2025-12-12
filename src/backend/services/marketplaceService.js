import { ethers } from 'ethers';
import { getUserPrivateKey } from './authService.js';
import { supabase } from '../utils/supabaseClient.js';

// 合约ABI
const MARKETPLACE_ABI = [
  "function listItem(address nftContract, uint256 tokenId, uint256 price, uint8 listingType, uint256 duration, bool allowCrossChain) external",
  "function buyItem(uint256 listingId) external payable",
  "function makeOffer(uint256 listingId, uint256 duration, string calldata sourceChain) external payable",
  "function acceptOffer(uint256 listingId, uint256 offerIndex) external",
  "function cancelListing(uint256 listingId) external",
  "function getListing(uint256 listingId) external view returns (tuple(uint256,address,uint256,address,uint256,uint8,uint8,uint256,uint256,bool))",
  "function getListingOffers(uint256 listingId) external view returns (tuple(uint256,uint256,address,uint256,uint256,bool,string)[])",
  "function getUserListings(address user) external view returns (uint256[])"
];

const NFT_ABI = [
  "function approve(address to, uint256 tokenId) external",
  "function setApprovalForAll(address operator, bool approved) external",
  "function isApprovedForAll(address owner, address operator) external view returns (bool)",
  "function getApproved(uint256 tokenId) external view returns (address)"
];

const ZETA_BRIDGE_ABI = [
  "function initiateCrossChainPayment(string calldata sourceChain, string calldata destinationChain, address recipient, uint256 listingId) external payable",
  "function calculateFee(string calldata sourceChain) external view returns (uint256)"
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
 * 代理挂单NFT
 */
export async function proxyListNFT(userId, nftContract, tokenId, price, listingType, duration, allowCrossChain) {
  try {
    const wallet = await getUserWallet(userId);
    
    // 首先检查和设置NFT授权
    const nftContractInstance = getContract(nftContract, NFT_ABI, wallet);
    const isApproved = await nftContractInstance.isApprovedForAll(
      wallet.address, 
      process.env.MARKETPLACE_ADDRESS
    );
    
    if (!isApproved) {
      const approveTx = await nftContractInstance.setApprovalForAll(
        process.env.MARKETPLACE_ADDRESS,
        true
      );
      await approveTx.wait();
    }
    
    // 挂单
    const marketplace = getContract(
      process.env.MARKETPLACE_ADDRESS,
      MARKETPLACE_ABI,
      wallet
    );
    
    const gasEstimate = await marketplace.listItem.estimateGas(
      nftContract,
      tokenId,
      price,
      listingType,
      duration,
      allowCrossChain
    );
    
    const tx = await marketplace.listItem(
      nftContract,
      tokenId,
      price,
      listingType,
      duration,
      allowCrossChain,
      {
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
    console.error('Proxy list NFT error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 代理购买NFT
 */
export async function proxyBuyNFT(userId, listingId, price) {
  try {
    const wallet = await getUserWallet(userId);
    const marketplace = getContract(
      process.env.MARKETPLACE_ADDRESS,
      MARKETPLACE_ABI,
      wallet
    );
    
    const gasEstimate = await marketplace.buyItem.estimateGas(listingId, {
      value: price
    });
    
    const tx = await marketplace.buyItem(listingId, {
      value: price,
      gasLimit: gasEstimate.mul(120).div(100)
    });
    
    const receipt = await tx.wait();
    
    return {
      success: true,
      txHash: tx.hash,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error('Proxy buy NFT error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 代理出价
 */
export async function proxyMakeOffer(userId, listingId, amount, duration, sourceChain = 'native') {
  try {
    const wallet = await getUserWallet(userId);
    const marketplace = getContract(
      process.env.MARKETPLACE_ADDRESS,
      MARKETPLACE_ABI,
      wallet
    );
    
    const gasEstimate = await marketplace.makeOffer.estimateGas(
      listingId,
      duration,
      sourceChain,
      { value: amount }
    );
    
    const tx = await marketplace.makeOffer(
      listingId,
      duration,
      sourceChain,
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
    console.error('Proxy make offer error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 代理接受出价
 */
export async function proxyAcceptOffer(userId, listingId, offerIndex) {
  try {
    const wallet = await getUserWallet(userId);
    const marketplace = getContract(
      process.env.MARKETPLACE_ADDRESS,
      MARKETPLACE_ABI,
      wallet
    );
    
    const gasEstimate = await marketplace.acceptOffer.estimateGas(listingId, offerIndex);
    
    const tx = await marketplace.acceptOffer(listingId, offerIndex, {
      gasLimit: gasEstimate.mul(120).div(100)
    });
    
    const receipt = await tx.wait();
    
    return {
      success: true,
      txHash: tx.hash,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error('Proxy accept offer error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 代理取消挂单
 */
export async function proxyCancelListing(userId, listingId) {
  try {
    const wallet = await getUserWallet(userId);
    const marketplace = getContract(
      process.env.MARKETPLACE_ADDRESS,
      MARKETPLACE_ABI,
      wallet
    );
    
    const gasEstimate = await marketplace.cancelListing.estimateGas(listingId);
    
    const tx = await marketplace.cancelListing(listingId, {
      gasLimit: gasEstimate.mul(120).div(100)
    });
    
    const receipt = await tx.wait();
    
    return {
      success: true,
      txHash: tx.hash,
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error('Proxy cancel listing error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 发起跨链支付
 */
export async function initiateCrossChainPayment(userId, sourceChain, destinationChain, recipient, listingId, amount) {
  try {
    const wallet = await getUserWallet(userId);
    const bridge = getContract(
      process.env.ZETA_BRIDGE_ADDRESS,
      ZETA_BRIDGE_ABI,
      wallet
    );
    
    // 计算跨链费用
    const fee = await bridge.calculateFee(sourceChain);
    const totalAmount = ethers.BigNumber.from(amount).add(fee);
    
    const gasEstimate = await bridge.initiateCrossChainPayment.estimateGas(
      sourceChain,
      destinationChain,
      recipient,
      listingId,
      { value: totalAmount }
    );
    
    const tx = await bridge.initiateCrossChainPayment(
      sourceChain,
      destinationChain,
      recipient,
      listingId,
      {
        value: totalAmount,
        gasLimit: gasEstimate.mul(120).div(100)
      }
    );
    
    const receipt = await tx.wait();
    
    return {
      success: true,
      txHash: tx.hash,
      gasUsed: receipt.gasUsed.toString(),
      fee: fee.toString(),
      totalAmount: totalAmount.toString()
    };
  } catch (error) {
    console.error('Initiate cross-chain payment error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 获取挂单信息
 */
export async function getListingInfo(listingId) {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const marketplace = new ethers.Contract(
      process.env.MARKETPLACE_ADDRESS,
      MARKETPLACE_ABI,
      provider
    );
    
    const listing = await marketplace.getListing(listingId);
    
    return {
      success: true,
      listing: {
        listingId: listing[0].toString(),
        nftContract: listing[1],
        tokenId: listing[2].toString(),
        seller: listing[3],
        price: listing[4].toString(),
        listingType: listing[5],
        status: listing[6],
        createdAt: listing[7].toString(),
        expiresAt: listing[8].toString(),
        allowCrossChain: listing[9]
      }
    };
  } catch (error) {
    console.error('Get listing info error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 获取挂单的出价
 */
export async function getListingOffers(listingId) {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const marketplace = new ethers.Contract(
      process.env.MARKETPLACE_ADDRESS,
      MARKETPLACE_ABI,
      provider
    );
    
    const offers = await marketplace.getListingOffers(listingId);
    
    return {
      success: true,
      offers: offers.map(offer => ({
        offerId: offer[0].toString(),
        listingId: offer[1].toString(),
        bidder: offer[2],
        amount: offer[3].toString(),
        expiresAt: offer[4].toString(),
        isActive: offer[5],
        sourceChain: offer[6]
      }))
    };
  } catch (error) {
    console.error('Get listing offers error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 获取用户的挂单
 */
export async function getUserListings(userAddress) {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const marketplace = new ethers.Contract(
      process.env.MARKETPLACE_ADDRESS,
      MARKETPLACE_ABI,
      provider
    );
    
    const listingIds = await marketplace.getUserListings(userAddress);
    
    return {
      success: true,
      listingIds: listingIds.map(id => id.toString())
    };
  } catch (error) {
    console.error('Get user listings error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}