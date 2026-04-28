# 创建 Cloudflare D1 数据库指南

由于当前环境无法进行浏览器交互，你需要在自己的电脑上执行以下步骤。

## 方法一：通过 Cloudflare Dashboard（推荐，最简单）

### 步骤 1：登录 Cloudflare

1. 访问 https://dash.cloudflare.com/
2. 使用你的 Cloudflare 账户登录（如果没有，先注册）

### 步骤 2：创建 D1 数据库

1. 在左侧菜单中，找到并点击 **Workers & Pages**
2. 点击 **D1** 标签（在 R2 存储旁边）
3. 点击 **Create database** 按钮
4. 填写以下信息：
   - **Database name**: `shop-database`
   - 点击 **Create database**

### 步骤 3：获取 Database ID

创建成功后，你会看到类似这样的信息：

```
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**重要：** 复制这个 `database_id`！

### 步骤 4：更新 wrangler.toml

在你的项目目录中，打开 `wrangler.toml` 文件，更新 `database_id`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "shop-database"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # 替换为实际的 ID
```

### 步骤 5：执行数据库迁移

现在你可以在本地执行迁移命令了：

```bash
cd /path/to/your/shop
npx wrangler d1 execute shop-database --file=./prisma/migrations/0001_init.sql
```

如果成功，你会看到类似这样的输出：

```
🌀 Executing on shop-database (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx):
✅ Executed 1 command(s) in 0.123ms
```

---

## 方法二：通过 Wrangler CLI（需要浏览器登录）

### 步骤 1：安装 Wrangler

```bash
npm install -g wrangler
```

### 步骤 2：登录 Cloudflare

```bash
npx wrangler login
```

这会打开浏览器让你授权。登录成功后，终端会显示：

```
✅ Successfully logged in with your Cloudflare account
```

### 步骤 3：创建 D1 数据库

```bash
npx wrangler d1 create shop-database
```

你会看到类似这样的输出：

```
✅ Successfully created DB 'shop-database'

[[d1_databases]]
binding = "DB"
database_name = "shop-database"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 步骤 4：更新 wrangler.toml

复制上面的配置，更新你的 `wrangler.toml` 文件。

### 步骤 5：执行数据库迁移

```bash
npx wrangler d1 execute shop-database --file=./prisma/migrations/0001_init.sql
```

---

## 验证数据库是否创建成功

### 方法一：通过 Wrangler CLI

```bash
# 列出所有数据库
npx wrangler d1 list

# 查看数据库详情
npx wrangler d1 info shop-database

# 查询数据库（测试连接）
npx wrangler d1 execute shop-database --command="SELECT COUNT(*) as count FROM Product"
```

### 方法二：通过 Cloudflare Dashboard

1. 访问 https://dash.cloudflare.com/
2. 进入 **Workers & Pages** -> **D1**
3. 你应该能看到 `shop-database` 在列表中
4. 点击数据库名称，可以查看详情和执行查询

---

## 常见问题

### Q: 提示 "Couldn't find a D1 DB with the name or binding 'shop-database'"

**A:** 这意味着数据库还没有创建，或者 `wrangler.toml` 中的配置不正确。请检查：

1. 数据库是否真的创建成功？
2. `wrangler.toml` 中的 `database_name` 和 `database_id` 是否正确？
3. 是否已经登录了 Cloudflare 账户？

### Q: 执行迁移时提示 "no such table: Product"

**A:** 迁移脚本没有成功执行。重新运行：

```bash
npx wrangler d1 execute shop-database --file=./prisma/migrations/0001_init.sql
```

### Q: 如何查看数据库中的数据？

**A:** 使用 Wrangler 查询：

```bash
# 查看所有商品
npx wrangler d1 execute shop-database --command="SELECT * FROM Product"

# 查看所有订单
npx wrangler d1 execute shop-database --command="SELECT * FROM \"Order\""

# 打开交互式控制台
npx wrangler d1 console shop-database
```

### Q: 我想删除数据库重新创建

**A:** ⚠️ **警告：这会永久删除所有数据！**

```bash
npx wrangler d1 delete shop-database
```

或者通过 Cloudflare Dashboard：
1. 进入 **Workers & Pages** -> **D1**
2. 点击数据库名称
3. 点击 **Settings**
4. 滚动到底部，点击 **Delete database**

---

## 下一步

数据库创建成功后，继续部署步骤：

1. ✅ 创建 D1 数据库
2. ✅ 执行数据库迁移
3. ⏭️ 推送代码到 GitHub
4. ⏭️ 在 Cloudflare Pages 创建项目
5. ⏭️ 配置环境变量
6. ⏭️ 绑定 D1 数据库
7. ⏭️ 部署并测试

详细步骤请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)。

---

## 获取帮助

- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Dashboard](https://dash.cloudflare.com/)