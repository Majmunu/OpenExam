#!/bin/bash

echo "🔧 修复 Codespaces 配置..."

# 设置环境变量
export NEXTAUTH_URL="https://$(echo $CODESPACE_NAME)-3000.$(echo $GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN)"
export NEXTAUTH_SECRET="codespaces-secret-$(date +%s)"
export DATABASE_URL="file:./prisma/dev.db"

echo "📋 环境变量设置："
echo "NEXTAUTH_URL: $NEXTAUTH_URL"
echo "NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
echo "DATABASE_URL: $DATABASE_URL"

# 创建 .env.local 文件
cat > .env.local << EOF
NEXTAUTH_URL=$NEXTAUTH_URL
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
DATABASE_URL=$DATABASE_URL
EOF

echo "✅ 环境变量已保存到 .env.local"

# 重新生成 Prisma 客户端
echo "🗄️ 重新设置数据库..."
npx prisma generate
npx prisma db push --force-reset
npm run db:seed

echo "🎉 配置完成！现在可以启动应用了："
echo "npm run dev"
