# Next.js 个人小店

基于 Next.js + Cloudflare Pages + D1 + Stripe 的个人小店解决方案。

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **UI 库**: Tailwind CSS + Lucide Icons
- **数据库**: Cloudflare D1 (SQLite)
- **ORM**: Prisma
- **支付**: Stripe
- **部署**: Cloudflare Pages

## 功能特性

- 商品展示和分类
- 购物车管理
- Stripe 支付集成
- 订单管理
- 管理后台
- 响应式设计

## 本地开发

1. 安装依赖:
```bash
npm install
```

2. 配置环境变量:
复制 `.env.local` 文件并填写你的 Stripe 密钥:
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
DATABASE_URL=file:./dev.db
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. 初始化数据库:
```bash
npx prisma generate
npx prisma db push
```

4. 运行开发服务器:
```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

## 部署到 Cloudflare Pages

### 方法一：通过 Cloudflare Dashboard (推荐)

#### 1. 创建 D1 数据库

```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 创建 D1 数据库
wrangler d1 create shop-database

# 记录返回的 database_id，类似：
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

#### 2. 更新 wrangler.toml

将 `database_id` 替换为你实际创建的数据库 ID：

```toml
[[d1_databases]]
binding = "DB"
database_name = "shop-database"
database_id = "你的实际数据库ID"  # 替换这里
```

#### 3. 初始化数据库

```bash
# 执行数据库迁移，创建表结构
wrangler d1 execute shop-database --file=./prisma/migrations/0001_init.sql
```

#### 4. 推送代码到 GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/你的仓库.git
git push -u origin main
```

#### 5. 在 Cloudflare Pages 创建项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** -> **Create application**
3. 选择 **Pages** -> **Connect to Git**
4. 选择你的 GitHub 仓库
5. 配置构建设置：
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
6. 点击 **Save and Deploy**

#### 6. 配置环境变量

在项目设置中添加以下环境变量：

**Settings** -> **Environment variables** -> **Add variable**:

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `STRIPE_SECRET_KEY` | `sk_live_...` | Stripe 私钥 |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe Webhook 密钥 |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Stripe 公钥 |
| `NEXT_PUBLIC_APP_URL` | `https://your-site.pages.dev` | 你的网站 URL |

#### 7. 配置 D1 绑定

**Settings** -> **Functions** -> **D1 databases bindings**:

1. 点击 **Add binding**
2. 选择之前创建的 `shop-database`
3. 变量名设置为：`DB`
4. 点击 **Save**

#### 8. 配置 Stripe Webhook

1. 登录 [Stripe Dashboard](https://dashboard.stripe.com/)
2. 进入 **Developers** -> **Webhooks**
3. 点击 **Add endpoint**
4. 端点 URL: `https://your-site.pages.dev/api/webhook`
5. 选择事件：`checkout.session.completed`
6. 复制 **Webhook Secret** (`whsec_...`)
7. 在 Cloudflare Pages 环境变量中添加 `STRIPE_WEBHOOK_SECRET`

### 方法二：通过 Wrangler CLI 部署

```bash
# 1. 安装依赖
npm install

# 2. 构建项目
npm run build

# 3. 部署到 Cloudflare Pages
wrangler pages deploy .next
```

### 部署后检查

1. 访问你的 Pages URL 确认网站正常运行
2. 测试添加商品到购物车
3. 测试 Stripe 支付流程
4. 检查管理后台是否正常显示订单

## 环境变量说明

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe 公钥 | 是 |
| `STRIPE_SECRET_KEY` | Stripe 私钥 | 是 |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook 密钥 | 是 |
| `DATABASE_URL` | 数据库连接 URL | 是 (本地开发) |
| `NEXT_PUBLIC_APP_URL` | 应用 URL | 是 |

## 项目结构

```
├── prisma/
│   ├── schema.prisma          # Prisma 数据模型
│   └── migrations/            # 数据库迁移文件
├── src/
│   ├── app/
│   │   ├── api/               # API 路由 (用于本地开发)
│   │   │   ├── checkout/      # Stripe 结账
│   │   │   ├── webhook/       # Stripe Webhook
│   │   │   ├── products/      # 商品 API
│   │   │   ├── cart/          # 购物车 API
│   │   │   └── admin/         # 管理后台 API
│   │   ├── page.tsx           # 首页
│   │   ├── cart/              # 购物车页面
│   │   ├── success/           # 支付成功页面
│   │   ├── admin/             # 管理后台
│   │   ├── layout.tsx         # 根布局
│   │   └── globals.css        # 全局样式
│   ├── components/
│   │   └── Navbar.tsx         # 导航栏组件
│   └── lib/
│       ├── prisma.ts          # Prisma 客户端
│       └── stripe.ts          # Stripe 配置
├── functions/
│   └── _middleware.js         # Cloudflare Pages Functions (生产环境)
├── public/                    # 静态资源
├── .env.local                 # 本地环境变量
├── wrangler.toml              # Cloudflare 配置
├── next.config.js             # Next.js 配置
└── package.json               # 项目依赖
```

## API 端点

### 本地开发 (使用 Next.js API Routes)
- `GET /api/products` - 获取所有商品
- `GET /api/cart?sessionId=xxx` - 获取购物车
- `POST /api/cart` - 添加商品到购物车
- `DELETE /api/cart?sessionId=xxx&productId=xxx` - 从购物车删除商品
- `POST /api/checkout` - 创建 Stripe 结账会话
- `POST /api/webhook` - Stripe 支付回调
- `GET /api/admin/orders` - 获取所有订单

### 生产环境 (使用 Cloudflare Pages Functions)
- 所有 API 请求通过 `functions/_middleware.js` 处理
- 直接使用 D1 数据库进行查询
- 无需额外的 API 路由配置

## 常见问题

### Stripe Webhook 验证失败
确保在 Cloudflare Pages 环境变量中正确设置了 `STRIPE_WEBHOOK_SECRET`。

### D1 数据库连接失败
检查 Cloudflare Pages 的 D1 绑定配置，确保变量名为 `DB`。

### 图片无法加载
确保 `next.config.js` 中配置了正确的图片域名。

## 许可证

MIT License

## 支持

如有问题，请提交 Issue 或联系支持。