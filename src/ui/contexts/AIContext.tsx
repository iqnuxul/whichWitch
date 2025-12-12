'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { aiAPI } from '../lib/api'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

interface AIContextType {
  isLoading: boolean
  
  // AI聊天
  chatWithAI: (query: string) => Promise<string | null>
  
  // 获取各种AI建议
  getWalletAdvice: (email: string, preferences?: any) => Promise<string | null>
  getCreationAdvice: (workType: string, parentWork?: any) => Promise<string | null>
  getWalletManagement: () => Promise<string | null>
  assessRisk: (transactionType: string, amount: string) => Promise<string | null>
  getContractAdvice: (contractFunction: string, parameters?: any) => Promise<string | null>
}

const AIContext = createContext<AIContextType | undefined>(undefined)

export function useAI() {
  const context = useContext(AIContext)
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider')
  }
  return context
}

export function AIProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  // AI聊天
  const chatWithAI = async (query: string): Promise<string | null> => {
    try {
      setIsLoading(true)
      
      const response = await aiAPI.chat({ query })
      
      if (response.success) {
        return response.response
      } else {
        toast.error('AI助手暂时无法回应，请稍后再试')
        return null
      }
    } catch (error: any) {
      console.error('AI chat error:', error)
      toast.error('AI助手连接失败')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // 获取钱包建议
  const getWalletAdvice = async (email: string, preferences?: any): Promise<string | null> => {
    try {
      setIsLoading(true)
      
      const response = await aiAPI.getWalletAdvice({ email, preferences })
      
      if (response.success) {
        return response.advice
      } else {
        toast.error('获取钱包建议失败')
        return null
      }
    } catch (error: any) {
      console.error('Get wallet advice error:', error)
      toast.error('AI建议服务暂时不可用')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // 获取创作建议
  const getCreationAdvice = async (workType: string, parentWork?: any): Promise<string | null> => {
    if (!user) {
      toast.error('请先登录')
      return null
    }

    try {
      setIsLoading(true)
      
      const response = await aiAPI.getCreationAdvice({ workType, parentWork })
      
      if (response.success) {
        return response.advice
      } else {
        toast.error('获取创作建议失败')
        return null
      }
    } catch (error: any) {
      console.error('Get creation advice error:', error)
      toast.error('AI创作建议服务暂时不可用')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // 获取钱包管理建议
  const getWalletManagement = async (): Promise<string | null> => {
    if (!user || user.loginType !== 'email') {
      toast.error('钱包管理建议仅适用于邮箱登录用户')
      return null
    }

    try {
      setIsLoading(true)
      
      const response = await aiAPI.getWalletManagement()
      
      if (response.success) {
        return response.advice
      } else {
        toast.error('获取钱包管理建议失败')
        return null
      }
    } catch (error: any) {
      console.error('Get wallet management error:', error)
      toast.error('AI钱包管理服务暂时不可用')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // 风险评估
  const assessRisk = async (transactionType: string, amount: string): Promise<string | null> => {
    if (!user) {
      toast.error('请先登录')
      return null
    }

    try {
      setIsLoading(true)
      
      const response = await aiAPI.assessRisk({ transactionType, amount })
      
      if (response.success) {
        return response.assessment
      } else {
        toast.error('风险评估失败')
        return null
      }
    } catch (error: any) {
      console.error('Risk assessment error:', error)
      toast.error('AI风险评估服务暂时不可用')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // 获取合约建议
  const getContractAdvice = async (contractFunction: string, parameters?: any): Promise<string | null> => {
    if (!user) {
      toast.error('请先登录')
      return null
    }

    try {
      setIsLoading(true)
      
      const response = await aiAPI.getContractAdvice({ contractFunction, parameters })
      
      if (response.success) {
        return response.advice
      } else {
        toast.error('获取合约建议失败')
        return null
      }
    } catch (error: any) {
      console.error('Get contract advice error:', error)
      toast.error('AI合约建议服务暂时不可用')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const value: AIContextType = {
    isLoading,
    chatWithAI,
    getWalletAdvice,
    getCreationAdvice,
    getWalletManagement,
    assessRisk,
    getContractAdvice,
  }

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  )
}