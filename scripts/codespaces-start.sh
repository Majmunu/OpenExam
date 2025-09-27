#!/bin/bash

# GitHub Codespaces 启动脚本
echo "🚀 启动智能考试系统..."

# 检查环境变量
echo "📋 检查环境配置..."
echo "DATABASE_URL: $DATABASE_URL"
echo "NEXTAUTH_URL: $NEXTAUTH_URL"
echo "NEXTAUTH_SECRET: $NEXTAUTH_SECRET"

# 安装依赖
echo "📦 安装依赖..."
npm install

# 生成 Prisma 客户端
echo "🗄️ 设置数据库..."
npx prisma generate
npx prisma db push

# 填充种子数据
echo "🌱 填充测试数据..."
npm run db:seed

# 构建应用
echo "🔨 构建应用..."
npm run build

# 启动应用
echo "🎉 启动应用..."
echo "访问地址: $NEXTAUTH_URL"
echo "管理员账号: admin@example.com / admin123"
echo "用户账号: user@example.com / user123"

npm start
