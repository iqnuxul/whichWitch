'use client'

import { useAuth } from '../contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Home, 
  PlusCircle, 
  ShoppingBag, 
  User, 
  Sparkles,
  LogOut,
  Menu,
  X,
  Heart,
  Users,
  TrendingUp
} from 'lucide-react'
import { useState } from 'react'

export function Navigation() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { name: '作品库', href: '/works', icon: ShoppingBag },
    { name: 'NFT市场', href: '/marketplace', icon: TrendingUp },
    { name: '社区', href: '/community', icon: Users },
    { name: '创作者中心', href: '/dashboard', icon: User, requireAuth: true },
    { name: '粉丝中心', href: '/fan-dashboard', icon: Heart, requireAuth: true },
    { name: 'AI助手', href: '/ai-assistant', icon: Sparkles },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const handleNavigation = (href: string) => {
    router.push(href)
    setMobileMenuOpen(false)
  }

  if (pathname.includes('/login') || pathname.includes('/auth')) {
    return null // 不在登录页面显示导航
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => handleNavigation('/')}
          >
            <img src="/websiteLogo.PNG" alt="whichWitch" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-bold ai-gradient">whichWitch</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              if (item.requireAuth && !user) return null
              
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </button>
              )
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  {user.email || `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`}
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="w-4 h-4" />
                  <span>退出</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNavigation('/login')}
                className="btn-primary"
              >
                登录
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                if (item.requireAuth && !user) return null
                
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </button>
                )
              })}
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-sm text-gray-600">
                      {user.email || `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`}
                    </div>
                    <button
                      onClick={logout}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>退出</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleNavigation('/login')}
                    className="w-full btn-primary"
                  >
                    登录
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}