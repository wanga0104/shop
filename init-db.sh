#!/bin/bash

echo "🚀 初始化数据库..."

# 检查是否安装了 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 生成 Prisma Client
echo "🔧 生成 Prisma Client..."
npx prisma generate

# 推送数据库 schema
echo "🗄️  创建数据库表..."
npx prisma db push

echo "✅ 数据库初始化完成！"
echo ""
echo "现在可以运行 'npm run dev' 启动开发服务器"