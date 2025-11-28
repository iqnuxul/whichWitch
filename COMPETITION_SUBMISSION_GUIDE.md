# WhichWitch 比赛提交指南

## 📋 提交步骤

### 步骤 1: 准备提交文件（已完成✅）

运行 `./prepare-submission.sh` 已经创建了 `submission/whichWitch/` 目录，包含所有需要的文件。

### 步骤 2: 克隆你 fork 的比赛仓库

```bash
# 在另一个目录克隆你 fork 的仓库
cd ..
git clone https://github.com/iqnuxul/WWW5.5.git
cd WWW5.5
```

### 步骤 3: 创建或更新你的项目目录

```bash
# 如果 projects 目录不存在，创建它
mkdir -p projects

# 复制你的项目到 projects 目录
cp -r ../whichWitch/submission/whichWitch projects/

# 或者如果你已经有 placeholder，替换它
# rm -rf projects/whichWitch
# cp -r ../whichWitch/submission/whichWitch projects/
```

### 步骤 4: 检查文件结构

```bash
cd projects/whichWitch
tree -L 2  # 或者 ls -la
```

应该看到：
```
whichWitch/
├── src/
│   ├── contracts/
│   ├── backend/
│   └── ui/
├── docs/
│   └── LINKS.md
├── README.md
├── SUBMISSION.md
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
├── components.json
├── .env.example
└── .gitignore
```

### 步骤 5: 提交到你的 fork

```bash
cd ../..  # 回到 WWW5.5 根目录
git add projects/whichWitch
git commit -m "feat: 提交 WhichWitch 项目

WhichWitch - 链上创作平台

核心功能：
- 原创作品上链注册
- 二创授权管理
- 自动收益分配
- 创作谱系追踪

技术栈：
- Frontend: Next.js 14, React, TailwindCSS
- Blockchain: Ethereum (Sepolia), Solidity
- Database: Supabase
- Storage: IPFS (Pinata)

在线演示: https://which-witch-v1-mnoigi2vi-whichwitch.vercel.app/
PPT: https://www.canva.com/design/DAG5t6aAKIU/..."

git push origin main
```

### 步骤 6: 创建 Pull Request

1. 访问 https://github.com/iqnuxul/WWW5.5
2. 点击 "Pull requests" 标签
3. 点击 "New pull request"
4. 选择：
   - base repository: `openbuildxyz/WWW5.5` (比赛主仓库)
   - base: `main`
   - head repository: `iqnuxul/WWW5.5` (你的 fork)
   - compare: `main`
5. 填写 PR 标题和描述：

**标题**:
```
[提交项目] WhichWitch - 链上创作平台
```

**描述**:
```markdown
## 项目名称
WhichWitch

## 项目简介
Let creation be a tree that can see its own growth.

一个去中心化的链上创作平台，支持原创作品注册、二创授权管理和自动收益分配。

## 核心功能
- 🔗 原创作品上链注册
- 💰 自动收益分配（40%-40%-20%）
- 🎨 二创授权管理
- 📊 创作谱系追踪
- 💸 Pull-based 提现模式

## 技术栈
- Frontend: Next.js 14, React, TailwindCSS
- Blockchain: Ethereum (Sepolia), Solidity
- Database: Supabase (PostgreSQL)
- Storage: IPFS (Pinata)
- Deployment: Vercel

## 在线演示
🌐 https://which-witch-v1-mnoigi2vi-whichwitch.vercel.app/

## 项目展示
📊 https://www.canva.com/design/DAG5t6aAKIU/...

## 智能合约地址 (Sepolia)
- CreationManager: 0x166253a474D74738D47CB59Ab39ee08e4fA4E607
- PaymentManager: 0x4CD314D46F1d09af04fb7784F9083468206D3858
- AuthorizationManager: 0x975830aA477523448F407eF6769D4A21F1A1724D

## 团队成员
- Xiaoyuan - 项目管理
- Kekeke - UI设计/前端
- Xiaoguai - 合约开发
- Jiajia - 数据库/后端
- Relax - 项目协调

## 提交内容
- ✅ 完整源代码（合约、前端、后端）
- ✅ 项目文档
- ✅ 在线演示
- ✅ PPT 展示
```

6. 点击 "Create pull request"

## ✅ 检查清单

提交前确认：

- [ ] 所有源代码已包含在 `src/` 目录
- [ ] README.md 完整且格式正确
- [ ] docs/LINKS.md 包含所有链接
- [ ] 没有包含敏感信息（.env.local 等）
- [ ] 没有包含 node_modules
- [ ] 合约地址正确
- [ ] 在线演示链接可访问
- [ ] PPT 链接可访问

## 📝 注意事项

1. **不要包含的文件**：
   - node_modules/
   - .next/
   - .env.local
   - 任何包含密钥的文件

2. **必须包含的文件**：
   - src/ 目录（完整源代码）
   - docs/ 目录（文档和链接）
   - README.md
   - package.json
   - .env.example（环境变量模板）

3. **大文件处理**：
   - 视频和 PPT 不要直接上传
   - 在 docs/LINKS.md 中提供链接

## 🆘 常见问题

### Q: 如果我已经创建了 placeholder 怎么办？
A: 直接替换 `projects/whichWitch/` 目录的内容即可。

### Q: 需要包含 node_modules 吗？
A: 不需要！.gitignore 已经排除了它。

### Q: 合约代码需要编译后的文件吗？
A: 不需要，只需要源代码（.sol 文件）。

### Q: 数据库配置需要包含吗？
A: 包含 schema.sql 和 migrations，但不要包含实际的数据库连接信息。

## 📞 需要帮助？

如果遇到问题，可以：
1. 检查比赛仓库的提交要求
2. 参考其他项目的提交格式
3. 联系比赛组织者

---

**祝你比赛顺利！🎉**
