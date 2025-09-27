#!/bin/bash

echo "🔍 获取 Codespaces 配置信息..."

# 获取 Codespace 名称
CODESPACE_NAME=$(echo $CODESPACE_NAME)
echo "Codespace 名称: $CODESPACE_NAME"

# 获取端口转发域名
PORT_DOMAIN=$(echo $GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN)
echo "端口转发域名: $PORT_DOMAIN"

# 构建完整的 URL
if [ -n "$CODESPACE_NAME" ] && [ -n "$PORT_DOMAIN" ]; then
    NEXTAUTH_URL="https://${CODESPACE_NAME}-3000.${PORT_DOMAIN}"
else
    # 备用方法：从端口转发信息获取
    NEXTAUTH_URL="https://$(gh codespace list --json name,displayName --jq '.[0].name')-3000.$(gh codespace list --json name,displayName --jq '.[0].displayName' | cut -d'-' -f2-).github.dev"
fi

echo "NEXTAUTH_URL: $NEXTAUTH_URL"

# 生成 Secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "NEXTAUTH_SECRET: $NEXTAUTH_SECRET"

# 创建 .env.local 文件
cat > .env.local << EOF
NEXTAUTH_URL=$NEXTAUTH_URL
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
DATABASE_URL=file:./prisma/dev.db
EOF

echo "✅ 配置已保存到 .env.local"
echo "📋 配置内容："
cat .env.local

echo ""
echo "🎉 现在可以启动应用了："
echo "npm run dev"
