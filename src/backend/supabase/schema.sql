-- WhichWitch 数据库表结构
-- 在 Supabase SQL Editor 中运行此文件

-- ============================================
-- 1. 用户表
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  platform_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100),
  bio TEXT,
  skills TEXT[],
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_platform_id ON users(platform_id);

-- ============================================
-- 2. 作品表（链下元数据）
-- ============================================
CREATE TABLE IF NOT EXISTS works (
  id SERIAL PRIMARY KEY,
  work_id BIGINT UNIQUE NOT NULL,  -- 链上作品ID
  creator_address VARCHAR(42) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  story TEXT,
  image_url TEXT NOT NULL,  -- IPFS URL
  metadata_uri TEXT NOT NULL,  -- 完整元数据 IPFS URI
  material TEXT[],
  tags TEXT[],
  allow_remix BOOLEAN DEFAULT true,
  license_fee VARCHAR(50),  -- 以 ETH 为单位的字符串
  parent_work_id BIGINT,  -- 父作品ID（如果是衍生作品）
  is_remix BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (parent_work_id) REFERENCES works(work_id) ON DELETE SET NULL
);

-- 索引
CREATE INDEX idx_works_work_id ON works(work_id);
CREATE INDEX idx_works_creator ON works(creator_address);
CREATE INDEX idx_works_parent ON works(parent_work_id);
CREATE INDEX idx_works_created_at ON works(created_at DESC);

-- ============================================
-- 3. 收藏夹表
-- ============================================
CREATE TABLE IF NOT EXISTS folders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, name)
);

-- 索引
CREATE INDEX idx_folders_user ON folders(user_id);

-- ============================================
-- 4. 收藏关系表
-- ============================================
CREATE TABLE IF NOT EXISTS collections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  work_id BIGINT NOT NULL,
  folder_id INTEGER NOT NULL,
  note TEXT,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (work_id) REFERENCES works(work_id) ON DELETE CASCADE,
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE,
  UNIQUE(user_id, work_id, folder_id)
);

-- 索引
CREATE INDEX idx_collections_user ON collections(user_id);
CREATE INDEX idx_collections_work ON collections(work_id);
CREATE INDEX idx_collections_folder ON collections(folder_id);

-- ============================================
-- 5. 授权申请表
-- ============================================
CREATE TABLE IF NOT EXISTS authorization_requests (
  id SERIAL PRIMARY KEY,
  user_address VARCHAR(42) NOT NULL,
  work_id BIGINT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',  -- pending, approved, rejected, failed
  tx_hash VARCHAR(66),  -- 交易哈希
  error_message TEXT,  -- 失败原因
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (work_id) REFERENCES works(work_id) ON DELETE CASCADE
);

-- 索引
CREATE INDEX idx_auth_user ON authorization_requests(user_address);
CREATE INDEX idx_auth_work ON authorization_requests(work_id);
CREATE INDEX idx_auth_status ON authorization_requests(status);
CREATE INDEX idx_auth_tx ON authorization_requests(tx_hash);

-- ============================================
-- 6. 作品统计表（缓存）
-- ============================================
CREATE TABLE IF NOT EXISTS work_stats (
  work_id BIGINT PRIMARY KEY,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  remix_count INTEGER DEFAULT 0,  -- 直接衍生作品数量
  total_derivatives INTEGER DEFAULT 0,  -- 所有衍生作品数量（包括间接）
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (work_id) REFERENCES works(work_id) ON DELETE CASCADE
);

-- ============================================
-- 7. 创建默认收藏夹的函数
-- ============================================
CREATE OR REPLACE FUNCTION create_default_folders()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO folders (user_id, name, description, is_default)
  VALUES 
    (NEW.id, 'Inspiration', 'Works that inspire me', true),
    (NEW.id, 'To Remix', 'Works I want to create derivatives from', true),
    (NEW.id, 'Favorites', 'My favorite works', true),
    (NEW.id, 'Reference', 'Reference materials', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 触发器：新用户注册时自动创建默认收藏夹
CREATE TRIGGER trigger_create_default_folders
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_default_folders();

-- ============================================
-- 8. 更新 updated_at 的函数
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为所有表添加 updated_at 触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_works_updated_at BEFORE UPDATE ON works
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON folders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auth_updated_at BEFORE UPDATE ON authorization_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. 更新作品统计的函数
-- ============================================
CREATE OR REPLACE FUNCTION update_work_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- 当新作品是衍生作品时，更新父作品的统计
  IF NEW.parent_work_id IS NOT NULL THEN
    INSERT INTO work_stats (work_id, remix_count, last_updated)
    VALUES (NEW.parent_work_id, 1, NOW())
    ON CONFLICT (work_id) 
    DO UPDATE SET 
      remix_count = work_stats.remix_count + 1,
      last_updated = NOW();
  END IF;
  
  -- 为新作品创建统计记录
  INSERT INTO work_stats (work_id, last_updated)
  VALUES (NEW.work_id, NOW())
  ON CONFLICT (work_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 触发器：新作品创建时更新统计
CREATE TRIGGER trigger_update_work_stats
AFTER INSERT ON works
FOR EACH ROW
EXECUTE FUNCTION update_work_stats();

-- ============================================
-- 10. 启用 Row Level Security (RLS)
-- ============================================
-- 注意：在生产环境中应该启用 RLS 以保护数据
-- 开发阶段可以先禁用，部署前再启用

-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE works ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE authorization_requests ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 11. 创建视图：作品详情（包含统计）
-- ============================================
CREATE OR REPLACE VIEW work_details AS
SELECT 
  w.*,
  u.name as creator_name,
  u.avatar_url as creator_avatar,
  COALESCE(ws.view_count, 0) as view_count,
  COALESCE(ws.like_count, 0) as like_count,
  COALESCE(ws.remix_count, 0) as remix_count,
  COALESCE(ws.total_derivatives, 0) as total_derivatives
FROM works w
LEFT JOIN users u ON w.creator_address = u.wallet_address
LEFT JOIN work_stats ws ON w.work_id = ws.work_id;

-- ============================================
-- 12. 插入测试数据（可选）
-- ============================================
-- 取消注释以下代码来插入测试数据


-- 测试用户
INSERT INTO users (wallet_address, platform_id, name, bio, skills)
VALUES 
  ('0x1234567890123456789012345678901234567890', 'USER001', 'Alice Chen', 'Digital artist and ceramicist', ARRAY['Digital Art', 'Ceramics']),
  ('0x2345678901234567890123456789012345678901', 'USER002', 'Bob Smith', 'Woodworking enthusiast', ARRAY['Woodworking', '3D Modeling']);

-- 测试作品
INSERT INTO works (work_id, creator_address, title, description, image_url, metadata_uri, material, tags, allow_remix, license_fee)
VALUES 
  (1, '0x1234567890123456789012345678901234567890', 'Digital Vase', 'A beautiful digital vase', 'ipfs://QmTest1', 'ipfs://QmMeta1', ARRAY['Digital'], ARRAY['abstract', 'modern'], true, '0.01'),
  (2, '0x2345678901234567890123456789012345678901', 'Wooden Sculpture', 'Hand-carved wooden sculpture', 'ipfs://QmTest2', 'ipfs://QmMeta2', ARRAY['Wood'], ARRAY['traditional', 'organic'], true, '0.05');


-- ============================================
-- 完成！
-- ============================================
-- 运行此脚本后，你的数据库表结构就创建完成了
-- 可以通过 Supabase Dashboard 的 Table Editor 查看表结构
