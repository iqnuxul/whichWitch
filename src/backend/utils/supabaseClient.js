import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// 使用服务密钥创建客户端，绕过RLS
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// 用于前端的匿名客户端
export const supabaseAnon = createClient(
  supabaseUrl, 
  process.env.SUPABASE_ANON_KEY || supabaseServiceKey
);