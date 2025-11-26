# 🔑 Alchemy API Key 更新指南

## 问题
你的应用显示 401 错误，这是因为 Alchemy API key 无效或已过期。

## 解决步骤

### 1. 获取新的 Alchemy API Key

1. 访问 [Alchemy Dashboard](https://dashboard.alchemy.com/)
2. 登录你的账号（如果没有账号，需要先注册）
3. 点击 "Create new app" 或 "Apps" → "+ Create new app"
4. 填写信息：
   - **Name**: WhichWitch DApp（或任意名称）
   - **Chain**: Ethereum
   - **Network**: Sepolia（测试网）
5. 点击 "Create app"
6. 在应用列表中找到刚创建的应用，点击 "View Key"
7. 复制 **HTTPS** URL，格式类似：
   ```
   https://eth-sepolia.g.alchemy.com/v2/YOUR_NEW_API_KEY
   ```

### 2. 更新本地环境变量

编辑 `.env.local` 文件，更新这一行：

```bash
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_NEW_API_KEY
```

### 3. 更新 Vercel 环境变量

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到你的 `whichWitch` 项目并点击进入
3. 点击 "Settings" 标签
4. 在左侧菜单选择 "Environment Variables"
5. 找到 `NEXT_PUBLIC_RPC_URL` 变量
6. 点击右侧的 "..." → "Edit"
7. 更新为新的 Alchemy URL
8. 点击 "Save"

### 4. 重新部署

更新环境变量后，Vercel 会自动触发重新部署。如果没有：

1. 在 Vercel 项目页面，点击 "Deployments" 标签
2. 找到最新的部署，点击右侧的 "..." → "Redeploy"
3. 选择 "Redeploy"

### 5. 测试

等待部署完成后，访问你的应用，检查：
- 页面是否正常加载
- 浏览器控制台是否还有 401 错误
- 钱包连接是否正常

## 💡 提示

### Alchemy 免费额度
- 免费计划每月有 300M 计算单位（Compute Units）
- 对于测试网应用，这个额度通常足够使用
- 如果需要更多，可以升级到付费计划

### 备用方案
如果不想使用 Alchemy，也可以使用其他 RPC 提供商：

**Infura**
```
https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
```

**公共 RPC（不推荐用于生产）**
```
https://rpc.sepolia.org
```

## ❓ 常见问题

**Q: 为什么会出现 401 错误？**
A: 通常是因为 API key 无效、过期或达到使用限制。

**Q: 更新后还是有错误怎么办？**
A: 
1. 确认新的 API key 是否正确复制
2. 检查 Vercel 环境变量是否保存成功
3. 清除浏览器缓存并刷新页面
4. 查看 Vercel 部署日志是否有其他错误

**Q: 本地测试正常，但 Vercel 还是有问题？**
A: 确保 Vercel 的环境变量已更新，并且重新部署了应用。
