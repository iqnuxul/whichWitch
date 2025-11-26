import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 调试信息
if (typeof window !== 'undefined') {
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Key exists:', !!supabaseAnonKey);
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables not configured');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 数据库类型定义
export interface User {
  id: number;
  wallet_address: string;
  platform_id: string;
  name: string | null;
  bio: string | null;
  skills: string[] | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Work {
  id: number;
  work_id: number;
  creator_address: string;
  title: string;
  description: string | null;
  story: string | null;
  image_url: string;
  metadata_uri: string;
  material: string[] | null;
  tags: string[] | null;
  allow_remix: boolean;
  license_fee: string | null;
  parent_work_id: number | null;
  is_remix: boolean;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: number;
  user_id: number;
  work_id: number;
  folder_id: number;
  note: string | null;
  saved_at: string;
}

export interface AuthorizationRequest {
  id: number;
  user_address: string;
  work_id: number;
  status: 'pending' | 'approved' | 'rejected' | 'failed';
  tx_hash: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkStats {
  work_id: number;
  view_count: number;
  like_count: number;
  remix_count: number;
  total_derivatives: number;
  last_updated: string;
}
