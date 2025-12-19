const axios = require('axios');

/**
 * AI API 客户端
 */
class AIAPIClient {
  constructor() {
    this.baseURL = process.env.QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
    this.apiKey = process.env.QWEN_API_KEY;
    
    if (!this.apiKey) {
      console.warn('⚠️ QWEN_API_KEY 未设置，AI 功能将不可用');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  /**
   * 发送聊天请求
   */
  async chat(messages, options = {}) {
    if (!this.apiKey) {
      throw new Error('AI API 密钥未配置');
    }

    try {
      const response = await this.client.post('/chat/completions', {
        model: options.model || 'qwen-turbo',
        messages: messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2000,
        stream: false
      });

      return response.data;
    } catch (error) {
      console.error('AI API 调用失败:', error.response?.data || error.message);
      throw new Error(`AI API 调用失败: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * 生成文本
   */
  async generateText(prompt, options = {}) {
    const messages = [
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await this.chat(messages, options);
    return response.choices[0]?.message?.content || '';
  }

  /**
   * 检查 API 状态
   */
  async checkStatus() {
    if (!this.apiKey) {
      return { available: false, error: 'API 密钥未配置' };
    }

    try {
      await this.generateText('测试', { max_tokens: 10 });
      return { available: true };
    } catch (error) {
      return { available: false, error: error.message };
    }
  }
}

/**
 * 通用 HTTP 客户端
 */
class HTTPClient {
  constructor(baseURL, options = {}) {
    this.client = axios.create({
      baseURL,
      timeout: options.timeout || 10000,
      headers: options.headers || {}
    });
  }

  async get(url, config = {}) {
    try {
      const response = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post(url, data, config = {}) {
    try {
      const response = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put(url, data, config = {}) {
    try {
      const response = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete(url, config = {}) {
    try {
      const response = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      // 服务器响应错误
      const message = error.response.data?.message || error.response.statusText;
      const err = new Error(message);
      err.status = error.response.status;
      err.data = error.response.data;
      return err;
    } else if (error.request) {
      // 网络错误
      return new Error('网络请求失败');
    } else {
      // 其他错误
      return error;
    }
  }
}

// 创建全局实例
const aiAPI = new AIAPIClient();

module.exports = {
  AIAPIClient,
  HTTPClient,
  aiAPI
};