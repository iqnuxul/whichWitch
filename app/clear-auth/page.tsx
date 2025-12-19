'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function ClearAuthPage() {
  const router = useRouter();

  useEffect(() => {
    // 清除所有认证相关的数据
    Cookies.remove('auth_token');
    Cookies.remove('login_type');
    localStorage.clear();
    sessionStorage.clear();
    
    // 重定向到登录页
    router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p>清除认证数据中...</p>
      </div>
    </div>
  );
}