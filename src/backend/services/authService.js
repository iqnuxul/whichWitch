import { ethers } from 'ethers';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../utils/supabaseClient.js';
import { sendVerificationEmail, sendWelcomeEmailWithAI } from '../utils/emailService.js';
import { generateWalletCreationAdvice, generateWelcomeMessage } from './aiService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);

/**
 * 加密私钥
 */
function encryptPrivateKey(privateKey) {
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

/**
 * 解密私钥
 */
function decryptPrivateKey(encryptedPrivateKey) {
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedPrivateKey, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * 生成新的以太坊钱包
 */
function generateWallet() {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey
  };
}

/**
 * 生成JWT token
 */
function generateJWT(userId, walletAddress) {
  return jwt.sign(
    { 
      userId, 
      walletAddress,
      type: 'session'
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * 验证JWT token
 */
function verifyJWT(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * 钱包登录
 */
export async function walletLogin(walletAddress, signature, message) {
  try {
    // 验证签名
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new Error('Invalid signature');
    }

    // 检查用户是否存在
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // 如果用户不存在，创建新用户
    if (!user) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          wallet_address: walletAddress.toLowerCase(),
          login_type: 'wallet',
          last_login: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) throw createError;
      user = newUser;
    } else {
      // 更新最后登录时间
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);
    }

    // 生成JWT token
    const token = generateJWT(user.id, user.wallet_address);

    return {
      success: true,
      user: {
        id: user.id,
        walletAddress: user.wallet_address,
        email: user.email,
        loginType: user.login_type,
        emailVerified: user.email_verified
      },
      token
    };
  } catch (error) {
    console.error('Wallet login error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 邮箱注册
 */
export async function emailRegister(email) {
  try {
    // 检查邮箱是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return {
        success: false,
        error: 'Email already registered'
      };
    }

    // 生成新钱包
    const wallet = generateWallet();
    const encryptedPrivateKey = encryptPrivateKey(wallet.privateKey);

    // 创建用户
    const { data: user, error: createError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        wallet_address: wallet.address.toLowerCase(),
        encrypted_private_key: encryptedPrivateKey,
        login_type: 'email',
        email_verified: false
      })
      .select()
      .single();

    if (createError) throw createError;

    // 生成验证token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时后过期

    const { error: tokenError } = await supabase
      .from('email_verification_tokens')
      .insert({
        user_id: user.id,
        token: verificationToken,
        expires_at: expiresAt.toISOString()
      });

    if (tokenError) throw tokenError;

    // 生成AI欢迎建议
    const aiAdvice = await generateWalletCreationAdvice(email, {
      isNewUser: true,
      walletAddress: wallet.address
    });

    // 发送验证邮件（包含AI建议）
    await sendVerificationEmail(email, verificationToken, aiAdvice.success ? aiAdvice.content : null);

    return {
      success: true,
      message: 'Registration successful. Please check your email for verification.',
      walletAddress: wallet.address,
      aiAdvice: aiAdvice.success ? aiAdvice.content : null
    };
  } catch (error) {
    console.error('Email register error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 邮箱验证
 */
export async function verifyEmail(token) {
  try {
    // 查找验证token
    const { data: tokenData, error: tokenError } = await supabase
      .from('email_verification_tokens')
      .select('*, users(*)')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (tokenError || !tokenData) {
      return {
        success: false,
        error: 'Invalid or expired verification token'
      };
    }

    // 更新用户验证状态
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        email_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', tokenData.user_id);

    if (updateError) throw updateError;

    // 删除验证token
    await supabase
      .from('email_verification_tokens')
      .delete()
      .eq('token', token);

    // 生成个性化欢迎消息
    const welcomeMessage = await generateWelcomeMessage(
      tokenData.users.email,
      tokenData.users.wallet_address,
      true
    );

    // 发送欢迎邮件（包含钱包信息和AI建议）
    if (welcomeMessage.success) {
      await sendWelcomeEmailWithAI(
        tokenData.users.email,
        tokenData.users.wallet_address,
        welcomeMessage.content
      );
    }

    return {
      success: true,
      message: 'Email verified successfully',
      welcomeMessage: welcomeMessage.success ? welcomeMessage.content : null
    };
  } catch (error) {
    console.error('Email verification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 邮箱登录
 */
export async function emailLogin(email, verificationCode) {
  try {
    // 这里可以实现邮箱验证码登录
    // 或者使用魔法链接登录
    
    // 查找用户
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('email_verified', true)
      .single();

    if (error || !user) {
      return {
        success: false,
        error: 'User not found or email not verified'
      };
    }

    // 更新最后登录时间
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // 生成JWT token
    const token = generateJWT(user.id, user.wallet_address);

    return {
      success: true,
      user: {
        id: user.id,
        walletAddress: user.wallet_address,
        email: user.email,
        loginType: user.login_type,
        emailVerified: user.email_verified
      },
      token
    };
  } catch (error) {
    console.error('Email login error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 获取用户的私钥（仅用于交易签名）
 */
export async function getUserPrivateKey(userId) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('encrypted_private_key, login_type')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new Error('User not found');
    }

    if (user.login_type !== 'email' || !user.encrypted_private_key) {
      throw new Error('Private key not available for wallet login users');
    }

    return decryptPrivateKey(user.encrypted_private_key);
  } catch (error) {
    console.error('Get private key error:', error);
    throw error;
  }
}

/**
 * 验证会话token
 */
export async function validateSession(token) {
  try {
    const decoded = verifyJWT(token);
    if (!decoded) {
      return { valid: false, error: 'Invalid token' };
    }

    // 检查用户是否存在
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return { valid: false, error: 'User not found' };
    }

    return {
      valid: true,
      user: {
        id: user.id,
        walletAddress: user.wallet_address,
        email: user.email,
        loginType: user.login_type,
        emailVerified: user.email_verified
      }
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return { valid: false, error: error.message };
  }
}

/**
 * 发送魔法链接登录邮件
 */
export async function sendMagicLink(email) {
  try {
    // 查找用户
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    if (!user.email_verified) {
      return {
        success: false,
        error: 'Email not verified'
      };
    }

    // 生成魔法链接token
    const magicToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15分钟后过期

    // 存储魔法链接token（可以复用email_verification_tokens表）
    const { error: tokenError } = await supabase
      .from('email_verification_tokens')
      .insert({
        user_id: user.id,
        token: magicToken,
        expires_at: expiresAt.toISOString()
      });

    if (tokenError) throw tokenError;

    // 发送魔法链接邮件
    await sendMagicLinkEmail(email, magicToken);

    return {
      success: true,
      message: 'Magic link sent to your email'
    };
  } catch (error) {
    console.error('Send magic link error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 魔法链接登录
 */
export async function magicLinkLogin(token) {
  try {
    // 查找魔法链接token
    const { data: tokenData, error: tokenError } = await supabase
      .from('email_verification_tokens')
      .select('*, users(*)')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (tokenError || !tokenData) {
      return {
        success: false,
        error: 'Invalid or expired magic link'
      };
    }

    const user = tokenData.users;

    // 更新最后登录时间
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // 删除魔法链接token
    await supabase
      .from('email_verification_tokens')
      .delete()
      .eq('token', token);

    // 生成JWT token
    const jwtToken = generateJWT(user.id, user.wallet_address);

    return {
      success: true,
      user: {
        id: user.id,
        walletAddress: user.wallet_address,
        email: user.email,
        loginType: user.login_type,
        emailVerified: user.email_verified
      },
      token: jwtToken
    };
  } catch (error) {
    console.error('Magic link login error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}