# 🔒 提交比赛前的安全检查清单

## ✅ 已完成的安全配置

### 1. 环境变量保护
- ✅ `.env.local` 已添加到 `.gitignore`
- ✅ 所有敏感 API 密钥已配置在 `.env.local` 中
- ✅ `.env.example` 只包含示例值，不含真实密钥

### 2. 当前配置的密钥（仅供参考）
```
✅ Alchemy RPC URL: 已配置
✅ Supabase URL: 已配置
✅ Supabase Anon Key: 已配置
✅ Supabase Service Role Key: 已配置
✅ Pinata API Key: 已配置
✅ Pinata API Secret: 已配置
✅ Pinata JWT: 已配置
```

## 📋 提交前必做检查

### 步骤 1: 检查 Git 状态
```bash
# 确认 .env.local 不会被提交
git status

# 如果看到 .env.local，立即执行：
git rm --cached .env.local
```

### 步骤 2: 检查提交历史
```bash
# 查看最近的提交，确保没有包含敏感信息
git log --oneline -10

# 如果发现历史提交中有敏感信息，需要清理历史
```

### 步骤 3: 搜索代码中的硬编码密钥
```bash
# 搜索可能的硬编码 API 密钥
grep -r "Jf9AtHozZzalDMkqCamEp" src/
grep -r "0f64e9a610081fda5bb3" src/
grep -r "csdhiozlgawtjsfglglh" src/
```

### 步骤 4: 验证环境变量使用
确保代码中使用的是环境变量，而不是硬编码的值：
- ✅ `process.env.NEXT_PUBLIC_RPC_URL`
- ✅ `process.env.NEXT_PUBLIC_SUPABASE_URL`
- ✅ `process.env.PINATA_API_KEY`

### 步骤 5: 清理构建文件
```bash
# 删除可能包含环境变量的构建文件
rm -rf .next/
rm -rf out/
rm -rf build/
rm -rf dist/
```

## 🚨 紧急情况处理

### 如果不小心提交了密钥：

1. **立即撤销密钥**
   - Alchemy: 登录 https://alchemy.com 删除并重新创建 API Key
   - Pinata: 登录 https://pinata.cloud 撤销并重新创建 API Key
   - Supabase: 登录 https://supabase.com 重置数据库密钥

2. **清理 Git 历史**
   ```bash
   # 使用 BFG Repo-Cleaner 或 git filter-branch
   # 建议寻求专业帮助或重新创建仓库
   ```

## 📦 提交包准备

### 推荐的提交方式：
1. 创建一个干净的分支用于提交
2. 确保 `.env.example` 包含所有必要的配置说明
3. 在 README.md 中说明如何配置环境变量
4. 不要包含 `node_modules/`, `.next/`, `.env.local`

### 最终检查命令：
```bash
# 查看将要提交的文件
git ls-files

# 确认这些文件不在列表中：
# - .env.local
# - .env
# - 任何包含真实密钥的文件
```

## ✨ 最佳实践

1. **永远不要**在代码中硬编码密钥
2. **始终使用**环境变量
3. **定期轮换** API 密钥
4. **使用不同的密钥**用于开发和生产环境
5. **提交前**运行安全扫描工具

---

**记住：一旦密钥泄露，立即撤销并重新生成！**
