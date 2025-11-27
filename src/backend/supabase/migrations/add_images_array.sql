-- 添加 images 数组字段到 works 表
-- 用于支持多图片上传

ALTER TABLE works 
ADD COLUMN IF NOT EXISTS images TEXT[];

-- 为已有数据迁移：将 image_url 复制到 images 数组
UPDATE works 
SET images = ARRAY[image_url]
WHERE images IS NULL AND image_url IS NOT NULL;

-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_works_images ON works USING GIN (images);

COMMENT ON COLUMN works.images IS '作品的所有图片 URL 数组（IPFS）';
