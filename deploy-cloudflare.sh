#!/bin/bash

echo "🚀 准备部署到 Cloudflare Pages..."

# 检查是否安装了 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查是否安装了 Wrangler
if ! command -v wrangler &> /dev/null; then
    echo "❓ Wrangler 未安装，正在安装..."
    npm install -g wrangler
fi

# 检查是否已登录
if ! wrangler whoami &> /dev/null; then
    echo "🔐 请先登录 Cloudflare..."
    wrangler login
fi

# 询问数据库名称
read -p "请输入数据库名称 (默认: shop-database): " DB_NAME
DB_NAME=${DB_NAME:-shop-database}

# 创建 D1 数据库
echo "🗄️  创建 D1 数据库..."
wrangler d1 create $DB_NAME

echo ""
echo "✅ 数据库创建成功！"
echo ""
echo "请复制上面的 database_id 并更新 wrangler.toml 文件中的 database_id"
echo ""
echo "然后运行以下命令来执行数据库迁移："
echo "wrangler d1 execute $DB_NAME --file=./prisma/migrations/0001_init.sql"
echo ""
echo "配置好环境变量后，运行以下命令部署："
echo "npm run build"
echo "wrangler pages deploy .next"