/**
 * 简化的交易服务
 * 用于演示，不依赖复杂的数据库和邮件服务
 */

// 模拟用户数据存储（使用文件系统持久化）
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const WORKS_FILE = path.join(DATA_DIR, 'works.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 加载数据
function loadWorks() {
  try {
    if (fs.existsSync(WORKS_FILE)) {
      const data = fs.readFileSync(WORKS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('加载作品数据失败:', error);
  }
  return {};
}

function saveWorks(works) {
  try {
    fs.writeFileSync(WORKS_FILE, JSON.stringify(works, null, 2));
  } catch (error) {
    console.error('保存作品数据失败:', error);
  }
}

function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('加载用户数据失败:', error);
  }
  return {};
}

function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('保存用户数据失败:', error);
  }
}

let works = loadWorks();
let users = loadUsers();
let workIdCounter = Math.max(...Object.keys(works).map(Number), 0) + 1;

/**
 * 代理注册原创作品
 */
async function proxyRegisterOriginalWork(userId, licenseFee, derivativeAllowed, metadataURI) {
  try {
    console.log('代理注册原创作品:', { userId, licenseFee, derivativeAllowed, metadataURI });

    // 模拟区块链交易
    const workId = workIdCounter++;
    const work = {
      id: workId,
      creator: userId,
      licenseFee,
      derivativeAllowed,
      metadataURI,
      isOriginal: true,
      parentId: null,
      createdAt: new Date().toISOString(),
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`
    };

    works[workId] = work;
    saveWorks(works);

    // 模拟交易延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      workId: workId,
      txHash: work.txHash,
      message: '原创作品注册成功！'
    };
  } catch (error) {
    console.error('注册原创作品失败:', error);
    return {
      success: false,
      error: error.message || '注册失败'
    };
  }
}

/**
 * 代理注册衍生作品
 */
async function proxyRegisterDerivativeWork(userId, parentId, licenseFee, derivativeAllowed, metadataURI) {
  try {
    console.log('代理注册衍生作品:', { userId, parentId, licenseFee, derivativeAllowed, metadataURI });

    // 检查父作品是否存在
    const parentWork = works[parseInt(parentId)];
    if (!parentWork) {
      throw new Error('父作品不存在');
    }

    const workId = workIdCounter++;
    const work = {
      id: workId,
      creator: userId,
      licenseFee,
      derivativeAllowed,
      metadataURI,
      isOriginal: false,
      parentId: parseInt(parentId),
      createdAt: new Date().toISOString(),
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`
    };

    works[workId] = work;
    saveWorks(works);

    // 模拟交易延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      workId: workId,
      txHash: work.txHash,
      message: '衍生作品注册成功！'
    };
  } catch (error) {
    console.error('注册衍生作品失败:', error);
    return {
      success: false,
      error: error.message || '注册失败'
    };
  }
}

/**
 * 获取用户余额
 */
async function getUserBalance(userId) {
  try {
    // 为每个用户生成固定的余额（基于用户ID）
    if (!users[userId]) {
      users[userId] = {
        balance: (Math.random() * 5 + 1).toFixed(4) // 1-6 ETH 固定余额
      };
      saveUsers(users);
    }

    return {
      success: true,
      balance: users[userId].balance,
      currency: 'ETH'
    };
  } catch (error) {
    console.error('获取余额失败:', error);
    return {
      success: false,
      error: error.message || '获取余额失败'
    };
  }
}

/**
 * 获取用户作品
 */
async function getUserWorks(userId) {
  try {
    const userWorks = Object.values(works).filter(work => work.creator === userId);
    
    return {
      success: true,
      works: userWorks
    };
  } catch (error) {
    console.error('获取用户作品失败:', error);
    return {
      success: false,
      error: error.message || '获取作品失败'
    };
  }
}

/**
 * 估算交易费用
 */
async function estimateTransactionCost(userId, contractAddress, abi, methodName, params, value) {
  try {
    // 模拟费用估算
    const gasCost = Math.random() * 0.01; // 0-0.01 ETH

    return {
      success: true,
      estimatedCost: gasCost.toFixed(6),
      currency: 'ETH'
    };
  } catch (error) {
    console.error('估算费用失败:', error);
    return {
      success: false,
      error: error.message || '估算费用失败'
    };
  }
}

module.exports = {
  proxyRegisterOriginalWork,
  proxyRegisterDerivativeWork,
  getUserBalance,
  getUserWorks,
  estimateTransactionCost
};