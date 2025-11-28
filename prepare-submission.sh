#!/bin/bash

# 准备比赛提交文件
# 这个脚本会创建一个 submission 目录，包含所有需要提交的文件

echo "🚀 准备比赛提交文件..."

# 创建提交目录
rm -rf submission
mkdir -p submission/whichWitch

# 复制 src 目录
echo "📁 复制 src 目录..."
mkdir -p submission/whichWitch/src
cp -r src/contracts submission/whichWitch/src/
cp -r src/backend submission/whichWitch/src/
cp -r src/ui submission/whichWitch/src/

# 创建 docs 目录并添加文档
echo "📄 创建 docs 目录..."
mkdir -p submission/whichWitch/docs
cat > submission/whichWitch/docs/LINKS.md << 'EOF'
# WhichWitch - 项目资源链接

## 🌐 在线演示
- **Live App**: https://which-witch-v1-mnoigi2vi-whichwitch.vercel.app/
- **GitHub 仓库**: https://github.com/iqnuxul/whichWitch

## 📊 项目展示
- **PPT 演示**: https://www.canva.com/design/DAG5t6aAKIU/JLK99jHgZNk_ge5mS-qDsQ/view?utm_content=DAG5t6aAKIU&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h3a5cb0fa9a

## 🎥 演示视频
*待添加*

## 📝 技术文档
- 详见项目 README.md
- 合约代码: src/contracts/
- 前端代码: src/ui/
- 后端代码: src/backend/

## 🔗 智能合约地址 (Sepolia Testnet)
- **CreationManager**: 0x166253a474D74738D47CB59Ab39ee08e4fA4E607
- **PaymentManager**: 0x4CD314D46F1d09af04fb7784F9083468206D3858
- **AuthorizationManager**: 0x975830aA477523448F407eF6769D4A21F1A1724D

## 🛠️ 技术栈
- Frontend: Next.js 14, React, TailwindCSS
- Blockchain: Ethereum (Sepolia), Solidity
- Database: Supabase (PostgreSQL)
- Storage: IPFS (Pinata)
- Deployment: Vercel
EOF

# 复制 README
echo "📝 复制 README..."
cp README.md submission/whichWitch/

# 复制必要的配置文件
echo "⚙️ 复制配置文件..."
cp package.json submission/whichWitch/
cp tsconfig.json submission/whichWitch/
cp next.config.mjs submission/whichWitch/
cp tailwind.config.ts submission/whichWitch/
cp components.json submission/whichWitch/
cp .env.example submission/whichWitch/
cp .gitignore submission/whichWitch/

# 创建提交说明
cat > submission/whichWitch/SUBMISSION.md << 'EOF'
# WhichWitch - 比赛提交说明

## 📦 提交内容

本项目包含以下内容：

### 1. 源代码 (src/)
- **contracts/** - 智能合约源代码（Solidity）
- **backend/** - 后端代码（Supabase 数据库配置）
- **ui/** - 前端代码（Next.js + React）

### 2. 文档 (docs/)
- **LINKS.md** - 项目相关链接（演示、PPT、视频等）

### 3. 项目说明
- **README.md** - 项目完整说明文档

### 4. 配置文件
- package.json - 项目依赖
- tsconfig.json - TypeScript 配置
- next.config.mjs - Next.js 配置
- .env.example - 环境变量模板

## 🚀 快速开始

详见 README.md 中的 Quick Start 部分。

## 🌐 在线演示

访问 https://which-witch-v1-mnoigi2vi-whichwitch.vercel.app/ 体验完整功能。

## 📊 项目展示

查看 docs/LINKS.md 获取所有相关链接。
EOF

echo "✅ 准备完成！"
echo ""
echo "📁 提交文件位于: submission/whichWitch/"
echo ""
echo "下一步："
echo "1. cd submission/whichWitch"
echo "2. 检查文件是否完整"
echo "3. 将此目录复制到你 fork 的 WWW5.5 仓库的 projects/ 目录下"
echo "4. 提交 Pull Request"
