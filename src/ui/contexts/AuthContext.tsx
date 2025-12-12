'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import { authAPI } from '../lib/api'

export type LoginType = 'wallet' | 'email'

export interface User {
  id: string
  walletAddress: string
  email?: string
  loginType: LoginType
  emailVerified?: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  loginType: LoginType | null
  
  // 钱包登录
  connectWallet: () => Promise<void>
  
  // 邮箱登录
  registerWithEmail: (email: string) => Promise<void>
  verifyEmail: (token: string) => Promise<void>
  sendMagicLink: (email: string) => Promise<void>
  loginWithMagicLink: (token: string) => Promise<void>
  
  // 通用
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loginType, setLoginType] = useState<LoginType | null>(null)
  
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()

  // 初始化时检查已保存的认证状态
  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get('auth_token')
      const savedLoginType = Cookies.get('login_type') as LoginType
      
      if (token && savedLoginType) {
        try {
          const response = await authAPI.getMe(token)
          if (response.success) {
            setUser(response.user)
            setLoginType(savedLoginType)
          } else {
            // Token 无效，清除
            Cookies.remove('auth_token')
            Cookies.remove('login_type')
          }
        } catch (error) {
          console.error('Auth initialization error:', error)
          Cookies.remove('auth_token')
          Cookies.remove('login_type')
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  // 钱包登录
  const connectWallet = async () => {
    if (!address || !isConnected) {
      toast.error('请先连接钱包')
      return
    }

    try {
      setIsLoading(true)
      
      // 生成签名消息
      const message = `欢迎来到 whichWitch!\n\n请签名以验证您的身份。\n\n时间戳: ${Date.now()}`
      
      // 请求用户签名
      const signature = await signMessageAsync({ message })
      
      // 发送到后端验证
      const response = await authAPI.walletLogin({
        walletAddress: address,
        signature,
        message
      })

      if (response.success) {
        setUser(response.user)
        setLoginType('wallet')
        
        // 保存认证信息
        Cookies.set('auth_token', response.token, { expires: 7 })
        Cookies.set('login_type', 'wallet', { expires: 7 })
        
        toast.success('钱包登录成功！')
      } else {
        toast.error(response.error || '登录失败')
      }
    } catch (error: any) {
      console.error('Wallet login error:', error)
      toast.error(error.message || '钱包登录失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 邮箱注册
  const registerWithEmail = async (email: string) => {
    try {
      setIsLoading(true)
      
      const response = await authAPI.emailRegister({ email })
      
      if (response.success) {
        toast.success('注册成功！请检查您的邮箱进行验证。')
        
        // 如果有AI建议，显示给用户
        if (response.aiAdvice) {
          setTimeout(() => {
            toast.success('AI助手已为您生成个性化建议，请查看邮箱！', {
              duration: 6000
            })
          }, 1000)
        }
      } else {
        toast.error(response.error || '注册失败')
      }
    } catch (error: any) {
      console.error('Email register error:', error)
      toast.error(error.message || '邮箱注册失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 邮箱验证
  const verifyEmail = async (token: string) => {
    try {
      setIsLoading(true)
      
      const response = await authAPI.verifyEmail({ token })
      
      if (response.success) {
        toast.success('邮箱验证成功！欢迎加入 whichWitch！')
        
        // 如果有欢迎消息，显示给用户
        if (response.welcomeMessage) {
          setTimeout(() => {
            toast.success('AI助手为您准备了专属建议！', {
              duration: 6000
            })
          }, 1000)
        }
      } else {
        toast.error(response.error || '验证失败')
      }
    } catch (error: any) {
      console.error('Email verify error:', error)
      toast.error(error.message || '邮箱验证失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 发送魔法链接
  const sendMagicLink = async (email: string) => {
    try {
      setIsLoading(true)
      
      const response = await authAPI.sendMagicLink({ email })
      
      if (response.success) {
        toast.success('登录链接已发送到您的邮箱！')
      } else {
        toast.error(response.error || '发送失败')
      }
    } catch (error: any) {
      console.error('Send magic link error:', error)
      toast.error(error.message || '发送魔法链接失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 魔法链接登录
  const loginWithMagicLink = async (token: string) => {
    try {
      setIsLoading(true)
      
      const response = await authAPI.magicLogin({ token })
      
      if (response.success) {
        setUser(response.user)
        setLoginType('email')
        
        // 保存认证信息
        Cookies.set('auth_token', response.token, { expires: 7 })
        Cookies.set('login_type', 'email', { expires: 7 })
        
        toast.success('登录成功！欢迎回来！')
      } else {
        toast.error(response.error || '登录失败')
      }
    } catch (error: any) {
      console.error('Magic link login error:', error)
      toast.error(error.message || '魔法链接登录失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 登出
  const logout = () => {
    setUser(null)
    setLoginType(null)
    Cookies.remove('auth_token')
    Cookies.remove('login_type')
    toast.success('已退出登录')
  }

  // 刷新用户信息
  const refreshUser = async () => {
    const token = Cookies.get('auth_token')
    if (!token) return

    try {
      const response = await authAPI.getMe(token)
      if (response.success) {
        setUser(response.user)
      }
    } catch (error) {
      console.error('Refresh user error:', error)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    loginType,
    connectWallet,
    registerWithEmail,
    verifyEmail,
    sendMagicLink,
    loginWithMagicLink,
    logout,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}