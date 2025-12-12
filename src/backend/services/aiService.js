import axios from 'axios';

const QWEN_API_KEY = process.env.QWEN_API_KEY || 'sk-b25e0402c60f4fe99dbb37eaa2659693';
const QWEN_BASE_URL = process.env.QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';

/**
 * 调用Qwen API
 */
async function callQwenAPI(messages, temperature = 0.7) {
  try {
    const response = await axios.post(
      `${QWEN_BASE_URL}/chat/completions`,
      {
        model: 'qwen-turbo',
        messages: messages,
        temperature: temperature,
        max_tokens: 1000,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${QWEN_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      content: response.data.choices[0].message.content,
      usage: response.data.usage
    };
  } catch (error) {
    console.error('Qwen API error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

/**
 * AI Agent: 生成钱包创建建议
 */
export async function generateWalletCreationAdvice(userEmail, userPreferences = {}) {
  const messages = [
    {
      role: 'system',
      content: `你是whichWitch创作平台的AI助手，专门帮助用户管理区块链钱包和数字资产。你的任务是为新用户提供钱包创建和安全管理的建议。

平台特点：
- 创作者可以注册原创作品并获得NFT
- 支持衍生作品创作和授权
- 自动收益分配系统
- 支持创作者打赏

请用友好、专业的语调回答，并提供实用的建议。`
    },
    {
      role: 'user',
      content: `用户邮箱: ${userEmail}
用户偏好: ${JSON.stringify(userPreferences)}

请为这位新用户生成钱包创建的欢迎信息和安全建议。包括：
1. 欢迎信息
2. 钱包安全提醒
3. 平台功能介绍
4. 下一步操作建议

请用中文回复，语调要友好且专业。`
    }
  ];

  return await callQwenAPI(messages);
}

/**
 * AI Agent: 分析用户交易模式并提供建议
 */
export async function analyzeUserTransactionPattern(userAddress, transactionHistory) {
  const messages = [
    {
      role: 'system',
      content: `你是whichWitch平台的AI分析师，专门分析用户的创作和交易模式，提供个性化建议。

分析维度：
- 创作活跃度
- 收益模式
- 社交互动
- 投资偏好

请提供建设性的建议来帮助用户提升创作收益。`
    },
    {
      role: 'user',
      content: `用户钱包地址: ${userAddress}
交易历史: ${JSON.stringify(transactionHistory)}

请分析这位用户的活动模式并提供以下建议：
1. 创作策略优化
2. 收益提升建议
3. 社区参与建议
4. 风险管理提醒

请用中文回复，提供具体可行的建议。`
    }
  ];

  return await callQwenAPI(messages);
}

/**
 * AI Agent: 智能合约交互建议
 */
export async function generateSmartContractAdvice(contractFunction, parameters, userContext) {
  const messages = [
    {
      role: 'system',
      content: `你是whichWitch平台的智能合约顾问，帮助用户理解和优化智能合约交互。

合约功能：
- registerOriginalWork: 注册原创作品
- registerDerivativeWork: 注册衍生作品
- requestAuthorization: 请求创作授权
- tipCreator: 打赏创作者
- withdraw: 提现收益

请提供清晰的操作指导和风险提醒。`
    },
    {
      role: 'user',
      content: `合约函数: ${contractFunction}
参数: ${JSON.stringify(parameters)}
用户上下文: ${JSON.stringify(userContext)}

请为这次合约交互提供：
1. 操作说明
2. 参数解释
3. 预期结果
4. 风险提醒
5. Gas费用建议

请用中文回复，确保用户能够理解。`
    }
  ];

  return await callQwenAPI(messages);
}

/**
 * AI Agent: 创作内容建议
 */
export async function generateCreationAdvice(workType, parentWork, userProfile) {
  const messages = [
    {
      role: 'system',
      content: `你是whichWitch平台的创作顾问，帮助创作者优化作品策略和提升创作质量。

平台创作类型：
- 原创作品：完全原创的内容
- 衍生作品：基于现有作品的再创作

请提供有价值的创作建议和市场洞察。`
    },
    {
      role: 'user',
      content: `作品类型: ${workType}
父作品信息: ${JSON.stringify(parentWork)}
用户档案: ${JSON.stringify(userProfile)}

请为这次创作提供：
1. 创作方向建议
2. 市场定位分析
3. 定价策略建议
4. 推广策略
5. 版权保护提醒

请用中文回复，提供实用的建议。`
    }
  ];

  return await callQwenAPI(messages);
}

/**
 * AI Agent: 个性化钱包管理建议
 */
export async function generateWalletManagementAdvice(walletAddress, balance, activityLevel) {
  const messages = [
    {
      role: 'system',
      content: `你是whichWitch平台的财务顾问，专门帮助用户管理数字资产和优化收益。

管理维度：
- 资产配置
- 风险控制
- 收益优化
- 安全防护

请提供专业且易懂的财务建议。`
    },
    {
      role: 'user',
      content: `钱包地址: ${walletAddress}
当前余额: ${balance} ETH
活跃度: ${activityLevel}

请提供个性化的钱包管理建议：
1. 资产管理策略
2. 安全防护措施
3. 收益优化建议
4. 风险控制提醒
5. 定期维护建议

请用中文回复，确保建议实用可行。`
    }
  ];

  return await callQwenAPI(messages);
}

/**
 * AI Agent: 智能客服
 */
export async function handleUserQuery(userQuery, userContext) {
  const messages = [
    {
      role: 'system',
      content: `你是whichWitch平台的AI客服助手，专门解答用户关于平台功能、区块链技术、NFT创作等问题。

平台核心功能：
- 邮箱登录自动创建钱包
- 作品注册和NFT铸造
- 衍生作品授权系统
- 自动收益分配
- 创作者打赏功能

请提供准确、友好、有帮助的回答。如果遇到技术问题，请建议用户联系技术支持。`
    },
    {
      role: 'user',
      content: `用户问题: ${userQuery}
用户上下文: ${JSON.stringify(userContext)}

请回答用户的问题，如果需要，可以提供相关的操作指导。请用中文回复。`
    }
  ];

  return await callQwenAPI(messages, 0.3); // 降低温度以获得更准确的回答
}

/**
 * AI Agent: 生成个性化欢迎消息
 */
export async function generateWelcomeMessage(userEmail, walletAddress, isNewUser = true) {
  const messages = [
    {
      role: 'system',
      content: `你是whichWitch平台的AI欢迎助手，为新用户生成个性化的欢迎消息。

平台特色：
- 去中心化创作平台
- 自动钱包生成
- NFT作品证书
- 智能收益分配
- 创作者社区

请生成温暖、专业且有吸引力的欢迎消息。`
    },
    {
      role: 'user',
      content: `用户邮箱: ${userEmail}
钱包地址: ${walletAddress}
是否新用户: ${isNewUser}

请生成一个个性化的欢迎消息，包括：
1. 热情的欢迎词
2. 钱包信息说明
3. 平台功能亮点
4. 下一步操作建议
5. 鼓励性结语

请用中文回复，语调要友好且激励人心。`
    }
  ];

  return await callQwenAPI(messages);
}

/**
 * AI Agent: 交易风险评估
 */
export async function assessTransactionRisk(transactionType, amount, userHistory) {
  const messages = [
    {
      role: 'system',
      content: `你是whichWitch平台的风险评估专家，负责分析交易风险并提供安全建议。

风险评估维度：
- 交易金额合理性
- 用户历史行为
- 市场环境因素
- 技术安全风险

请提供客观、专业的风险评估。`
    },
    {
      role: 'user',
      content: `交易类型: ${transactionType}
交易金额: ${amount}
用户历史: ${JSON.stringify(userHistory)}

请评估这笔交易的风险等级并提供：
1. 风险等级评估 (低/中/高)
2. 主要风险因素
3. 安全建议
4. 预防措施
5. 应急处理方案

请用中文回复，确保评估客观准确。`
    }
  ];

  return await callQwenAPI(messages, 0.2); // 低温度确保评估准确性
}