# GitHub 原生部署方案


## 🚀 GitHub 原生部署选项

### 1. **GitHub Container Registry + 自托管服务器** (推荐)

**文件**: `.github/workflows/deploy-github-container.yml`

**优势**:
- 使用 GitHub 的容器注册表 (ghcr.io)
- 完全免费的容器存储
- 与 GitHub 生态系统完美集成
- 支持多架构构建 (AMD64/ARM64)

**需要配置的 Secrets**:
```bash
HOST=your_server_ip
USERNAME=your_server_username
SSH_KEY=your_ssh_private_key
DATABASE_URL=your_database_url
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_secret_key
```

### 2. **GitHub Actions + 服务器部署**

**文件**: `.github/workflows/deploy-github-actions.yml`

**优势**:
- 使用 GitHub Actions 构建和测试
- 自动部署到您的服务器
- 包含完整的 CI/CD 流程
- 支持 PostgreSQL 测试数据库

**特点**:
- 在 Actions 中运行 PostgreSQL 进行测试
- 创建部署工件
- 自动部署到服务器

### 3. **GitHub Codespaces 开发环境**

**文件**: `.github/workflows/deploy-github-codespaces.yml`

**优势**:
- 在 GitHub Codespaces 中运行应用
- 完全基于 GitHub 的云开发环境
- 无需配置服务器
- 适合开发和演示

## 📋 部署配置对比

| 方案 | 成本 | 复杂度 | 适用场景 |
|------|------|--------|----------|
| Container Registry | 免费 | 中等 | 生产环境 |
| Actions + 服务器 | 免费 | 高 | 企业级部署 |
| Codespaces | 免费额度 | 低 | 开发/演示 |

## 🔧 推荐配置

### 生产环境 (推荐)
使用 **GitHub Container Registry** 方案:

#### 选项 1: SQLite (简单部署)
```bash
HOST=your_server_ip
USERNAME=your_server_username  
SSH_KEY=your_ssh_private_key
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_secret_key
# 注意：不需要 DATABASE_URL，使用默认 SQLite
```

#### 选项 2: PostgreSQL (企业级)
```bash
HOST=your_server_ip
USERNAME=your_server_username  
SSH_KEY=your_ssh_private_key
DATABASE_URL=postgresql://user:pass@host:5432/db
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_secret_key
```

2. **启用工作流**:
   - 推送到 main 分支自动触发
   - 构建 Docker 镜像并推送到 ghcr.io
   - 自动部署到您的服务器

### 开发环境
使用 **GitHub Codespaces** 方案:

1. **无需额外配置**
2. **在 Codespaces 中直接运行**
3. **适合开发和测试**

## 🎯 优势总结

### GitHub 原生部署的优势:

1. **完全免费**: 不需要第三方服务
2. **集成度高**: 与 GitHub 生态系统完美集成
3. **安全性好**: 使用 GitHub 的安全机制
4. **可扩展**: 支持从开发到生产的完整流程
5. **社区支持**: 丰富的 GitHub Actions 生态

### 与传统部署平台对比:

| 特性 | GitHub 原生 | Vercel | Netlify | Railway |
|------|-------------|--------|---------|---------|
| 成本 | 免费 | 免费额度 | 免费额度 | 免费额度 |
| 控制度 | 完全控制 | 有限 | 有限 | 有限 |
| 自定义 | 完全自定义 | 受限 | 受限 | 受限 |
| 数据库 | 自选 | 限制 | 限制 | 限制 |

## 🚀 快速开始

1. **选择部署方案** (推荐 Container Registry)
2. **配置服务器** (如果有)
3. **设置 GitHub Secrets**
4. **推送代码到 GitHub**
5. **享受自动部署！**

## 📝 注意事项

- GitHub Container Registry 有存储限制，但通常足够使用
- 自托管服务器需要您自己维护
- Codespaces 有使用时间限制，但适合开发
- 所有方案都支持私有仓库

