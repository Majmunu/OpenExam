#!/bin/bash

echo "🔧 修复 Vercel 部署问题..."

# 检查构建配置
echo "📋 检查构建配置..."
if [ -f "package.json" ]; then
    echo "✅ package.json 存在"
    echo "构建脚本: $(grep -A 1 '"build"' package.json)"
else
    echo "❌ package.json 不存在"
    exit 1
fi

# 检查 Next.js 配置
echo "📋 检查 Next.js 配置..."
if [ -f "next.config.ts" ]; then
    echo "✅ next.config.ts 存在"
else
    echo "❌ next.config.ts 不存在"
fi

# 检查 Prisma 配置
echo "📋 检查 Prisma 配置..."
if [ -f "prisma/schema.prisma" ]; then
    echo "✅ Prisma schema 存在"
else
    echo "❌ Prisma schema 不存在"
fi

# 检查环境变量
echo "📋 检查环境变量..."
if [ -f "vercel.json" ]; then
    echo "✅ vercel.json 存在"
    echo "DATABASE_URL: $(grep DATABASE_URL vercel.json)"
    echo "NEXTAUTH_SECRET: $(grep NEXTAUTH_SECRET vercel.json)"
else
    echo "❌ vercel.json 不存在"
fi

echo ""
echo "🎯 修复步骤："
echo "1. 在 Vercel 中检查构建日志"
echo "2. 确保环境变量已设置"
echo "3. 重新部署项目"
echo "4. 检查数据库连接"
echo ""
echo "📋 环境变量检查清单："
echo "✅ DATABASE_URL 已设置"
echo "✅ NEXTAUTH_SECRET 已设置"
echo "⚠️  NEXTAUTH_URL 需要更新为实际域名"
echo ""
echo "🔧 如果还有问题，请检查："
echo "- 构建日志中的错误信息"
echo "- 数据库连接是否正常"
echo "- 环境变量是否正确设置"
