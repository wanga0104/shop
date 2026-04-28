# Cloudflare Pages 部署故障排除

## 🔧 常见构建问题及解决方案

### 问题 1: npm 安装依赖失败

**错误信息：**
```
npm error Exit handler never called!
npm error This is an error with npm itself.
```

**解决方案：**

#### ✅ 已修复的内容

1. **更新了 package.json**
   - 将所有依赖从范围版本（`^14.2.0`）改为固定版本（`14.2.35`）
   - 添加了 `engines` 字段，指定 Node.js 和 npm 版本要求
   - 添加了 `postinstall` 脚本，自动生成 Prisma Client

2. **创建了 .npmrc 文件**
   - 配置了 npm 的严格模式
   - 优化了依赖解析

#### 🔍 如果问题仍然存在

1. **清除缓存并重新构建**
   - 在 Cloudflare Pages 项目页面
   - 进入 **Settings** -> **Builds & deployments**
   - 点击 **Clear cache** 并重新部署

2. **检查 Node.js 版本**
   - Cloudflare Pages 默认使用 Node.js 22
   - 确保你的 package.json 中的 `engines` 字段允许使用 Node.js 22

3. **使用 yarn 代替 npm**
   - 在 Cloudflare Pages 构建设置中：
     - Build command: `yarn install && yarn build`
     - 或者创建 `yarn.lock` 文件

---

### 问题 2: 找不到 D1 数据库

**错误信息：**
```
Couldn't find a D1 DB with the name or binding 'shop-database'
```

**解决方案：**

1. **确认数据库已创建**
   ```bash
   wrangler d1 list
   ```

2. **检查 wrangler.toml 配置**
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "shop-database"
   database_id = "你的实际数据库ID"
   ```

3. **在 Cloudflare Pages 中绑定数据库**
   - 进入 **Settings** -> **Functions** -> **D1 database bindings**
   - 添加绑定，变量名必须是 `DB`（大写）
   - 选择对应的数据库

---

### 问题 3: 数据库表不存在

**错误信息：**
```
no such table: Product
```

**解决方案：**

1. **执行数据库迁移**
   ```bash
   wrangler d1 execute shop-database --file=./prisma/migrations/0001_init.sql
   ```

2. **验证表已创建**
   ```bash
   wrangler d1 execute shop-database --command="SELECT name FROM sqlite_master WHERE type='table'"
   ```

---

### 问题 4: Stripe Webhook 验证失败

**错误信息：**
```
Webhook Error: No signatures found matching the expected signature
```

**解决方案：**

1. **确认环境变量正确**
   - 在 Cloudflare Pages 项目设置中
   - 检查 `STRIPE_WEBHOOK_SECRET` 是否正确
   - 确认没有多余的空格或换行符

2. **重新创建 Webhook**
   - 在 Stripe Dashboard 删除旧的 Webhook
   - 创建新的 Webhook，端点 URL: `https://your-site.pages.dev/api/webhook`
   - 选择事件: `checkout.session.completed`
   - 复制新的 Webhook Secret

3. **更新环境变量**
   - 将新的 Webhook Secret 添加到 Cloudflare Pages
   - 触发重新部署

---

### 问题 5: 图片无法加载

**问题：** 商品图片显示不出来或显示损坏

**解决方案：**

1. **检查 next.config.js**
   ```javascript
   images: {
     remotePatterns: [
       {
         protocol: 'https',
         hostname: '**',  // 允许所有域名
       },
     ],
   },
   ```

2. **使用自托管图片**
   - 将图片放在 `public/images/` 目录
   - 使用 `/images/filename.jpg` 引用
   - 这样不需要配置 remotePatterns

3. **使用 CDN**
   - 上传图片到 Cloudflare Images
   - 使用 Cloudflare 的 CDN URL

---

### 问题 6: 构建超时

**错误信息：**
```
Build timed out after 15 minutes
```

**解决方案：**

1. **优化构建过程**
   - 减少不必要的依赖
   - 移除开发依赖的生产构建
   - 使用 `.npmignore` 排除不必要的文件

2. **使用预构建**
   - 在本地构建完成后部署
   - 使用 `wrangler pages deploy .next`

3. **联系 Cloudflare 支持**
   - 如果确实需要更多时间
   - 可以申请增加构建时间限制

---

### 问题 7: API 路由 404 错误

**错误信息：**
```
404 Not Found - /api/products
```

**解决方案：**

1. **检查文件路径**
   - 确保 API 路由文件在正确的位置
   - `src/app/api/products/route.ts`

2. **确认路由导出**
   - 确保导出了正确的 HTTP 方法
   ```typescript
   export async function GET() { ... }
   export async function POST() { ... }
   ```

3. **检查 Cloudflare Functions**
   - 确认 `functions/_middleware.js` 存在
   - 检查路由处理逻辑

---

### 问题 8: 环境变量未生效

**问题：** 应用无法读取环境变量

**解决方案：**

1. **检查环境变量配置**
   - 进入 **Settings** -> **Environment variables**
   - 确认所有必要的变量都已添加
   - 区分 Production 和 Preview 环境

2. **验证变量名称**
   - 确保变量名称完全匹配（区分大小写）
   - `NEXT_PUBLIC_` 开头的变量会暴露给浏览器

3. **重新部署**
   - 修改环境变量后必须重新部署
   - 在项目页面点击 **Retry deployment**

---

### 问题 9: TypeScript 类型错误

**错误信息：**
```
Type error: Cannot find module 'xxx'
```

**解决方案：**

1. **确保所有类型包都已安装**
   ```json
   {
     "devDependencies": {
       "@types/node": "...",
       "@types/react": "...",
       "@types/react-dom": "..."
     }
   }
   ```

2. **更新 tsconfig.json**
   - 确保 `paths` 配置正确
   - 检查 `include` 和 `exclude` 配置

3. **本地构建测试**
   ```bash
   npm run build
   ```
   - 先在本地解决所有类型错误

---

### 问题 10: 构建成功但网站无法访问

**问题：** 构建显示成功，但访问 URL 时出现错误

**解决方案：**

1. **检查域名配置**
   - 确认使用的是正确的 Pages URL
   - 如果使用自定义域名，检查 DNS 配置

2. **查看实时日志**
   - 进入 **Functions** -> **Real-time logs**
   - 访问网站，查看实时错误信息

3. **检查部署状态**
   - 进入 **Deployments** 标签
   - 查看最新部署的日志
   - 确认没有运行时错误

---

## 🚀 快速诊断检查清单

在遇到问题时，按以下顺序检查：

- [ ] 代码是否已成功推送到 GitHub
- [ ] Cloudflare Pages 是否已连接到正确的仓库
- [ ] 构建设置是否正确（Build command 和 Output directory）
- [ ] 所有环境变量是否已配置
- [ ] D1 数据库是否已创建并绑定
- [ ] 数据库迁移是否已执行
- [ ] 本地构建是否成功（`npm run build`）
- [ ] 查看构建日志，找到具体的错误信息

---

## 📞 获取更多帮助

### 查看日志

1. **构建日志**
   - 进入 **Deployments** -> 选择部署 -> 查看日志

2. **实时日志**
   - 进入 **Functions** -> **Real-time logs**

3. **本地测试**
   ```bash
   # 在本地模拟 Cloudflare 环境
   npx wrangler pages dev .next
   ```

### 相关文档

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [Cloudflare Functions 文档](https://developers.cloudflare.com/pages/functions/)
- [Next.js 文档](https://nextjs.org/docs)

### 社区支持

- [Cloudflare Community](https://community.cloudflare.com/)
- [Next.js GitHub Discussions](https://github.com/vercel/next.js/discussions)
- [Stack Overflow](https://stackoverflow.com/)

---

## 💡 最佳实践

1. **本地测试后再部署**
   ```bash
   npm run build
   npm run start
   ```

2. **使用分支进行测试**
   - 创建 `dev` 或 `staging` 分支
   - 在 Preview 环境测试
   - 确认无误后合并到 `main`

3. **监控构建**
   - 启用构建通知
   - 定期检查构建状态

4. **保持依赖更新**
   ```bash
   npm update
   npm audit fix
   ```

5. **使用版本锁定**
   - 在 package.json 中使用固定版本
   - 避免使用 `^` 或 `~` 前缀

---

记住：大多数构建问题都可以通过查看详细的构建日志来定位。如果无法解决，记录完整的错误信息并寻求帮助。