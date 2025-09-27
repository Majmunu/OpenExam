#!/bin/bash

echo "🚀 启动智能考试系统..."

# 检查 Node.js
echo "📋 检查环境..."
node --version
npm --version

# 安装依赖
echo "📦 安装依赖..."
npm install

# 设置数据库
echo "🗄️ 设置数据库..."
npx prisma generate
npx prisma db push
npm run db:seed

# 启动应用
echo "🎉 启动应用..."
echo "访问地址: https://your-codespace-name-3000.github.dev"
echo "管理员账号: admin@example.com / admin123"
echo "用户账号: user@example.com / user123"

npm run dev
