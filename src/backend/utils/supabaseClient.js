const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// 使用服务密钥创建客户端，绕过RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// 用于前端的匿名客户端
const supabaseAnon = createClient(
  supabaseUrl, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || supabaseServiceKey
);

module.exports = {
  supabase,
  supabaseAnon
};