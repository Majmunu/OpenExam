# 部署指南

本指南将帮助您将智能考试系统部署到各种平台。

## 支持的部署平台

### 1. Vercel (推荐)

Vercel 是 Next.js 应用的理想部署平台，提供零配置部署。

#### 自动部署
1. 将代码推送到 GitHub
2. 在 Vercel 中连接 GitHub 仓库
3. 配置环境变量
4. 自动部署完成

#### 环境变量配置
```env
DATABASE_URL=your_database_url
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_secret_key
```

#### 手动部署
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署
vercel --prod
```

### 2. Netlify

#### 自动部署
1. 连接 GitHub 仓库到 Netlify
2. 配置构建设置：
   - Build command: `npm run build`
   - Publish directory: `out`
3. 设置环境变量
4. 部署

#### 环境变量
```env
DATABASE_URL=your_database_url
NEXTAUTH_URL=https://your-domain.netlify.app
NEXTAUTH_SECRET=your_secret_key
```

### 3. Railway

#### 部署步骤
1. 连接 GitHub 仓库
2. 配置环境变量
3. 自动部署

#### 环境变量
```env
DATABASE_URL=your_database_url
NEXTAUTH_URL=https://your-domain.railway.app
NEXTAUTH_SECRET=your_secret_key
```

### 4. Docker 部署

#### 本地 Docker 部署
```bash
# 构建镜像
docker build -t exam-system .

# 运行容器
docker run -p 3000:3000 \
  -e DATABASE_URL="your_database_url" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  -e NEXTAUTH_SECRET="your_secret_key" \
  exam-system
```

#### Docker Compose 部署
```bash
# 启动所有服务
docker-compose up -d

# 运行数据库迁移
docker-compose exec app npx prisma migrate deploy

# 查看日志
docker-compose logs -f
```

### 5. 服务器部署

#### 使用 PM2
```bash
# 安装 PM2
npm install -g pm2

# 构建应用
npm run build

# 启动应用
pm2 start npm --name "exam-system" -- start

# 保存 PM2 配置
pm2 save
pm2 startup
```

#### 使用 Nginx 反向代理
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 数据库配置

### SQLite (开发环境)
```env
DATABASE_URL="file:./prisma/dev.db"
```

### PostgreSQL (生产环境)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/exam_system"
```

### MySQL (生产环境)
```env
DATABASE_URL="mysql://username:password@localhost:3306/exam_system"
```

### MongoDB (生产环境)
```env
DATABASE_URL="mongodb://localhost:27017/exam_system"
```

## 环境变量配置

### 必需变量
- `DATABASE_URL`: 数据库连接字符串
- `NEXTAUTH_URL`: 应用访问地址
- `NEXTAUTH_SECRET`: NextAuth.js 密钥

### 可选变量
- `CUSTOM_KEY`: 自定义配置项

## GitHub Actions 部署

### 配置 Secrets

在 GitHub 仓库设置中添加以下 Secrets：

#### Vercel 部署
- `VERCEL_TOKEN`: Vercel API Token
- `VERCEL_ORG_ID`: Vercel Organization ID
- `VERCEL_PROJECT_ID`: Vercel Project ID

#### Netlify 部署
- `NETLIFY_AUTH_TOKEN`: Netlify API Token
- `NETLIFY_SITE_ID`: Netlify Site ID

#### Railway 部署
- `RAILWAY_TOKEN`: Railway API Token
- `RAILWAY_SERVICE_ID`: Railway Service ID

#### Docker 部署
- `DOCKER_USERNAME`: Docker Hub 用户名
- `DOCKER_PASSWORD`: Docker Hub 密码
- `HOST`: 服务器地址
- `USERNAME`: 服务器用户名
- `SSH_KEY`: SSH 私钥

### 数据库 Secrets
- `DATABASE_URL`: 生产数据库连接字符串
- `NEXTAUTH_URL`: 生产环境 URL
- `NEXTAUTH_SECRET`: 生产环境密钥

## 部署检查清单

### 部署前检查
- [ ] 环境变量配置正确
- [ ] 数据库连接正常
- [ ] 构建成功
- [ ] 测试通过

### 部署后检查
- [ ] 应用正常启动
- [ ] 数据库迁移完成
- [ ] 用户注册/登录正常
- [ ] 考试功能正常
- [ ] 行为分析功能正常

## 性能优化

### 生产环境优化
1. 启用 Next.js 生产模式
2. 配置 CDN
3. 数据库连接池
4. 缓存策略
5. 监控和日志

### 安全配置
1. 使用 HTTPS
2. 环境变量安全
3. 数据库访问控制
4. API 速率限制
5. 输入验证

## 故障排除

### 常见问题
1. **构建失败**: 检查 Node.js 版本和依赖
2. **数据库连接失败**: 检查 DATABASE_URL 配置
3. **认证问题**: 检查 NEXTAUTH_SECRET 配置
4. **部署失败**: 检查环境变量和权限

### 日志查看
```bash
# Docker 日志
docker logs exam-system

# PM2 日志
pm2 logs exam-system

# Nginx 日志
tail -f /var/log/nginx/error.log
```

## 监控和维护

### 健康检查
- 应用状态监控
- 数据库连接监控
- 性能指标监控
- 错误日志监控

### 备份策略
- 数据库定期备份
- 代码版本控制
- 配置文件备份
- 日志文件管理
