#!/bin/bash

echo "🚀 一键部署到 Vercel..."

# 生成 NEXTAUTH_SECRET
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "生成的 NEXTAUTH_SECRET: $NEXTAUTH_SECRET"

# 更新 vercel.json 中的密钥
sed -i "s/your-secret-key-here/$NEXTAUTH_SECRET/g" vercel.json

echo "✅ 配置文件已更新"
echo "📋 当前配置："
echo "DATABASE_URL: postgres://1460dc61d1f2f8486556ff4d6511917bdc8e4292670592d6912d8e2fa7237a85:sk_aJDkOTelEHCDyaXXgVK2G@db.prisma.io:5432/postgres?sslmode=require"
echo "NEXTAUTH_SECRET: $NEXTAUTH_SECRET"

echo ""
echo "🎯 部署步骤："
echo "1. 推送代码到 GitHub:"
echo "   git add ."
echo "   git commit -m 'Ready for Vercel deployment'"
echo "   git push origin main"
echo ""
echo "2. 在 Vercel 中部署:"
echo "   - 访问 https://vercel.com"
echo "   - 点击 'New Project'"
echo "   - 选择您的仓库"
echo "   - 点击 'Deploy'"
echo ""
echo "3. 部署完成后，更新 NEXTAUTH_URL:"
echo "   - 在 Vercel 项目设置中"
echo "   - 更新 NEXTAUTH_URL 为您的实际域名"
echo ""
echo "🎉 部署完成后，您的应用将完全公开访问！"
