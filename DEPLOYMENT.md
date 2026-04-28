# 部署指南

## 🚀 快速开始

### 本地开发（当前环境）

你的项目已经在本地成功运行！

- 访问 http://localhost:3000
- 数据库已初始化，包含 6 个示例商品
- 所有核心功能都可以测试

### 部署到 Cloudflare Pages

## 方法一：通过 Cloudflare Dashboard（推荐新手）

### 步骤 1：创建 Cloudflare 账户

如果你还没有 Cloudflare 账户，访问 https://dash.cloudflare.com/ 注册。

### 步骤 2：安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 步骤 3：登录 Cloudflare

```bash
wrangler login
```

这会打开浏览器让你授权访问 Cloudflare 账户。

### 步骤 4：创建 D1 数据库

```bash
wrangler d1 create shop-database
```

你会看到类似这样的输出：

```
✅ Successfully created DB 'shop-database'

[[d1_databases]]
binding = "DB"
database_name = "shop-database"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**重要：** 复制 `database_id` 的值！

### 步骤 5：更新 wrangler.toml

打开 `wrangler.toml` 文件，将 `database_id` 替换为实际值：

```toml
[[d1_databases]]
binding = "DB"
database_name = "shop-database"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # 替换这里
```

### 步骤 6：初始化数据库结构

```bash
wrangler d1 execute shop-database --file=./prisma/migrations/0001_init.sql
```

### 步骤 7：推送到 GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main

# 创建 GitHub 仓库后
git remote add origin https://github.com/你的用户名/你的仓库.git
git push -u origin main
```

### 步骤 8：在 Cloudflare Pages 创建项目

1. 访问 https://dash.cloudflare.com/
2. 进入 **Workers & Pages** -> **Create application**
3. 选择 **Pages** 标签
4. 点击 **Connect to Git**
5. 选择你的 GitHub 仓库
6. 配置构建设置：
   - **Project name**: `nextjs-cloudflare-shop`（或其他名称）
   - **Production branch**: `main`
   - **Framework preset**: `Next.js`
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
7. 点击 **Save and Deploy**

等待构建完成（通常需要 1-2 分钟）。

### 步骤 9：配置环境变量

在项目设置中添加环境变量：

1. 在 Cloudflare Pages 项目页面，点击 **Settings**
2. 进入 **Environment variables**
3. 点击 **Add variable**，添加以下变量：

| 变量名 | 值 | 环境变量类型 |
|--------|-----|------------|
| `STRIPE_SECRET_KEY` | `sk_live_...` | Production |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Production |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://your-site.pages.dev` | Production |

**注意：** 
- `NEXT_PUBLIC_APP_URL` 的值是你的实际 Pages URL，部署后你可以在项目首页看到
- 如果只是测试，可以使用 Stripe 的测试密钥（`sk_test_...` 和 `pk_test_...`）

### 步骤 10：绑定 D1 数据库

1. 在项目设置中，进入 **Functions** -> **D1 database bindings**
2. 点击 **Add binding**
3. 选择你之前创建的 `shop-database`
4. **Variable name** 设置为：`DB`（必须大写）
5. 点击 **Save**

### 步骤 11：配置 Stripe Webhook（可选，用于真实支付）

如果你要启用真实的支付功能：

1. 登录 https://dashboard.stripe.com/
2. 进入 **Developers** -> **Webhooks**
3. 点击 **Add endpoint**
4. **Endpoint URL**: `https://your-site.pages.dev/api/webhook`
5. 选择要监听的事件：`checkout.session.completed`
6. 点击 **Add events**
7. 点击 **Add endpoint**
8. 复制显示的 **Webhook Secret**（以 `whsec_` 开头）
9. 回到 Cloudflare Pages，在环境变量中添加：
   - 变量名：`STRIPE_WEBHOOK_SECRET`
   - 值：刚刚复制的 Webhook Secret

### 步骤 12：重新部署

添加完所有配置后，在 Cloudflare Pages 项目页面点击 **Retry deployment** 或推送新的代码触发重新部署。

## 方法二：通过 Wrangler CLI 部署

如果你更喜欢命令行操作：

```bash
# 1. 确保已登录
wrangler login

# 2. 创建 D1 数据库（如果还没有）
wrangler d1 create shop-database

# 3. 更新 wrangler.toml 中的 database_id

# 4. 初始化数据库
wrangler d1 execute shop-database --file=./prisma/migrations/0001_init.sql

# 5. 构建项目
npm run build

# 6. 部署
wrangler pages deploy .next --project-name=nextjs-cloudflare-shop
```

然后按照方法一的步骤 9-11 配置环境变量和 D1 绑定。

## 🎯 部署后验证

### 1. 检查网站是否正常运行

访问你的 Pages URL，确认：
- 首页能正常显示商品列表
- 可以点击"加入购物车"
- 购物车页面能正常显示
- 管理后台能访问

### 2. 测试数据库连接

尝试添加商品到购物车，如果成功，说明 D1 数据库连接正常。

### 3. 测试 Stripe 支付（如果配置了）

1. 添加商品到购物车
2. 点击"去结账"
3. 应该跳转到 Stripe Checkout 页面
4. 完成测试支付
5. 应该跳转到成功页面
6. 检查管理后台，订单应该出现在列表中

## 🔧 常见问题

### Q1: 找不到 D1 数据库

**错误信息：** `Couldn't find a D1 DB with the name or binding 'shop-database'`

**解决方案：**
1. 检查 `wrangler.toml` 中的 `database_id` 是否正确
2. 运行 `wrangler d1 list` 查看已创建的数据库
3. 确保在 Cloudflare Pages 设置中绑定了正确的数据库

### Q2: 数据库表不存在

**错误信息：** `no such table: Product`

**解决方案：**
```bash
wrangler d1 execute shop-database --file=./prisma/migrations/0001_init.sql
```

### Q3: Stripe Webhook 验证失败

**错误信息：** `Webhook Error: No signatures found matching the expected signature`

**解决方案：**
1. 确认 `STRIPE_WEBHOOK_SECRET` 环境变量设置正确
2. 确认 Webhook 端点 URL 正确
3. 确认选择的事件类型正确

### Q4: 图片无法加载

**问题：** 商品图片显示不出来

**解决方案：**
1. 确认 `next.config.js` 中的 `images.remotePatterns` 配置正确
2. 确认图片 URL 可以公开访问

### Q5: 构建失败

**错误信息：** 各种构建错误

**解决方案：**
1. 检查 `npm run build` 在本地是否成功
2. 查看 Cloudflare Pages 的构建日志
3. 确认所有依赖都在 `package.json` 中

## 📊 监控和日志

### 查看构建日志

1. 进入 Cloudflare Pages 项目
2. 点击 **Deployments**
3. 选择一个部署，点击查看日志

### 查看 Functions 日志

1. 进入项目设置
2. 点击 **Functions** -> **Real-time logs**
3. 实时查看 API 调用日志

### 查看 D1 数据库

```bash
# 列出所有数据库
wrangler d1 list

# 查询数据库
wrangler d1 execute shop-database --command="SELECT * FROM Product"

# 打开数据库控制台
wrangler d1 console shop-database
```

## 🔄 更新部署

当你修改代码后：

1. 提交并推送到 GitHub
2. Cloudflare Pages 会自动触发新的部署
3. 或手动点击 **Retry deployment**

## 🚦 生产环境清单

部署到生产环境前，确保：

- [ ] 更新所有示例商品为真实商品
- [ ] 使用 Stripe 生产环境密钥
- [ ] 配置正确的 Webhook 端点
- [ ] 设置正确的 `NEXT_PUBLIC_APP_URL`
- [ ] 测试完整的购物和支付流程
- [ ] 检查管理后台是否需要添加认证
- [ ] 配置自定义域名（可选）
- [ ] 启用 Cloudflare Analytics（可选）

## 📞 获取帮助

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [Stripe 文档](https://stripe.com/docs)
- [Next.js 文档](https://nextjs.org/docs)