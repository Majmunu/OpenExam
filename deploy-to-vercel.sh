#!/bin/bash

echo "🚀 一键部署到 Vercel..."

# 检查 Git 状态
echo "📋 检查 Git 状态..."
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  有未提交的更改，正在提交..."
    git add .
    git commit -m "Ready for Vercel deployment"
else
    echo "✅ 没有未提交的更改"
fi

# 推送到 GitHub
echo "📤 推送到 GitHub..."
git push origin main

echo "✅ 代码已推送到 GitHub"
echo ""
echo "🎯 现在在 Vercel 中部署："
echo "1. 访问 https://vercel.com"
echo "2. 点击 'New Project'"
echo "3. 选择您的 GitHub 仓库"
echo "4. 点击 'Import'"
echo "5. 等待部署完成"
echo ""
echo "📋 环境变量配置："
echo "DATABASE_URL=postgres://1460dc61d1f2f8486556ff4d6511917bdc8e4292670592d6912d8e2fa7237a85:sk_aJDkOTelEHCDyaXXgVK2G@db.prisma.io:5432/postgres?sslmode=require"
echo "NEXTAUTH_SECRET=363x34mVUiUxmzB7m3huYjB8TjourJ346sYdJIz71Rc="
echo "NEXTAUTH_URL=https://your-project-name.vercel.app"
echo ""
echo "🎉 部署完成后，您的应用将完全公开访问！"
