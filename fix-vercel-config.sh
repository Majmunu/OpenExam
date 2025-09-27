#!/bin/bash

echo "🔧 修复 Vercel 配置问题..."

# 检查当前配置
echo "📋 当前 vercel.json 配置："
cat vercel.json

echo ""
echo "✅ 已修复配置问题："
echo "- 移除了冲突的 builds 属性"
echo "- 保留了环境变量配置"
echo "- 简化了配置文件"
echo ""
echo "🚀 现在可以重新部署："
echo "vercel deploy"
echo ""
echo "📋 或者使用 Vercel CLI："
echo "vercel --prod"
echo ""
echo "🎯 部署完成后："
echo "1. 检查部署状态"
echo "2. 测试应用访问"
echo "3. 更新 NEXTAUTH_URL 为实际域名"
echo ""
echo "🎉 配置已修复，现在可以成功部署了！"
