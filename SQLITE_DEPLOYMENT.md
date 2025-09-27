# SQLite 部署指南

使用 SQLite 作为生产数据库的部署配置，适合中小型应用。

## 🗄️ SQLite 的优势

### ✅ 优点
- **零配置**: 无需安装和配置数据库服务器
- **轻量级**: 单个文件存储所有数据
- **快速**: 读写性能优秀
- **便携**: 数据库文件可以轻松备份和迁移
- **免费**: 完全开源免费

### ⚠️ 限制
- **并发限制**: 适合中小型应用（< 1000 并发用户）
- **网络访问**: 不支持网络访问，只能本地访问
- **备份**: 需要定期备份数据库文件

## 🚀 GitHub Container Registry + SQLite 部署

### 📋 需要配置的 GitHub Secrets

```bash
# 服务器连接信息
HOST=your_server_ip_address
USERNAME=your_server_username
SSH_KEY=your_ssh_private_key

# 应用配置
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_secret_key_here

# 注意：不需要 DATABASE_URL，使用默认的 SQLite 配置
```

### 🔧 服务器准备

#### 1. 安装 Docker
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io
sudo systemctl start docker
sudo systemctl enable docker

# 将用户添加到 docker 组
sudo usermod -aG docker $USER
```

#### 2. 创建数据目录
```bash
# 创建应用数据目录
sudo mkdir -p /opt/exam-system/data
sudo chown $USER:$USER /opt/exam-system/data
```

#### 3. 配置防火墙
```bash
# 开放必要端口
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3000  # 应用端口
sudo ufw enable
```

### 🔧 部署配置

#### 1. 数据库文件位置
- **容器内**: `/app/prisma/prod.db`
- **宿主机**: `/opt/exam-system/data/prod.db`
- **备份位置**: `/opt/exam-system/backups/`

#### 2. 数据持久化
```bash
# 数据卷挂载
-v /opt/exam-system/data:/app/prisma
```

#### 3. 自动初始化
容器启动时会自动：
1. 运行数据库迁移
2. 执行种子数据
3. 启动应用

### 📊 性能优化

#### 1. SQLite 配置优化
```sql
-- 在 Prisma schema 中添加
-- 或者通过环境变量配置
PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
PRAGMA cache_size=10000;
PRAGMA temp_store=MEMORY;
```

#### 2. 服务器资源建议
- **CPU**: 1-2 核心
- **内存**: 1-2GB
- **存储**: 10GB+ (包含备份)
- **网络**: 10Mbps+

### 🔄 备份策略

#### 1. 自动备份脚本
```bash
#!/bin/bash
# 创建备份目录
mkdir -p /opt/exam-system/backups

# 备份数据库
cp /opt/exam-system/data/prod.db /opt/exam-system/backups/prod-$(date +%Y%m%d-%H%M%S).db

# 保留最近 7 天的备份
find /opt/exam-system/backups -name "prod-*.db" -mtime +7 -delete
```

#### 2. 定时备份 (Crontab)
```bash
# 编辑 crontab
crontab -e

# 添加每日备份任务
0 2 * * * /opt/exam-system/backup.sh
```

### 🚀 部署流程

#### 1. 首次部署
```bash
# 1. 推送代码到 GitHub
git push origin main

# 2. GitHub Actions 自动执行：
#    - 构建 Docker 镜像
#    - 推送到 GitHub Container Registry
#    - 部署到服务器

# 3. 检查部署状态
docker ps
docker logs exam-system
```

#### 2. 更新部署
```bash
# 推送新代码即可自动更新
git push origin main
```

### 🔍 监控和维护

#### 1. 查看应用状态
```bash
# 查看容器状态
docker ps

# 查看应用日志
docker logs exam-system

# 查看数据库文件
ls -la /opt/exam-system/data/
```

#### 2. 数据库管理
```bash
# 进入容器
docker exec -it exam-system sh

# 运行 Prisma 命令
npx prisma studio  # 打开数据库管理界面
npx prisma db seed # 重新填充种子数据
```

#### 3. 性能监控
```bash
# 查看容器资源使用
docker stats exam-system

# 查看数据库文件大小
du -h /opt/exam-system/data/prod.db
```

### 📈 扩展建议

#### 当应用增长时：
1. **监控性能**: 使用 `docker stats` 监控资源使用
2. **定期备份**: 设置自动备份策略
3. **升级服务器**: 增加 CPU 和内存
4. **考虑迁移**: 当用户量超过 1000 时考虑 PostgreSQL

### 🎯 适用场景

#### ✅ 适合：
- 中小型考试系统 (< 1000 用户)
- 内部使用系统
- 原型和演示
- 预算有限的项目

#### ❌ 不适合：
- 大型企业应用
- 高并发场景 (> 1000 用户)
- 需要复杂查询的应用
- 多服务器部署

### 💡 最佳实践

1. **定期备份**: 设置自动备份策略
2. **监控性能**: 定期检查资源使用情况
3. **版本控制**: 使用 Git 管理代码版本
4. **日志管理**: 定期清理应用日志
5. **安全更新**: 定期更新 Docker 镜像

使用 SQLite 可以让您的部署更加简单和轻量，特别适合中小型应用！
