#!/bin/bash

echo "🚀 Vercel 构建开始..."

# 检查环境变量
echo "📋 检查环境变量..."
echo "DATABASE_URL: ${DATABASE_URL:0:20}..."

# 生成 Prisma 客户端
echo "🔧 生成 Prisma 客户端..."
npx prisma generate

# 运行数据库迁移
echo "🗄️ 运行数据库迁移..."
npx prisma db push

# 运行种子数据
echo "🌱 运行种子数据..."
npx prisma db seed

# 构建应用
echo "🏗️ 构建应用..."
next build

echo "✅ 构建完成！"
