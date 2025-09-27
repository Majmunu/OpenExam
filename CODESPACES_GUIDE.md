# GitHub Codespaces 部署指南

使用 GitHub Codespaces 是最简单的部署方式，无需配置服务器，完全基于 GitHub 的云开发环境。

## 🚀 快速开始

### 方法 1: 通过 GitHub 界面 (推荐)

1. **打开您的 GitHub 仓库**
2. **点击绿色的 "Code" 按钮**
3. **选择 "Codespaces" 标签**
4. **点击 "Create codespace on main"**
5. **等待 Codespace 启动完成**

### 方法 2: 通过 VS Code

1. **安装 GitHub Codespaces 扩展**
2. **在 VS Code 中打开您的仓库**
3. **按 Ctrl+Shift+P，输入 "Codespaces: Create New Codespace"**
4. **选择配置并创建**

## ⚙️ 自动配置

### 环境变量 (自动设置)
```bash
DATABASE_URL=file:./prisma/dev.db
NEXTAUTH_URL=https://your-codespace-name-3000.github.dev
NEXTAUTH_SECRET=codespaces-development-secret
```

### 自动执行的步骤
1. ✅ 安装 Node.js 20
2. ✅ 安装项目依赖
3. ✅ 生成 Prisma 客户端
4. ✅ 创建 SQLite 数据库
5. ✅ 填充测试数据
6. ✅ 构建应用
7. ✅ 启动开发服务器

## 🎯 访问应用

### 自动端口转发
- **应用地址**: `https://your-codespace-name-3000.github.dev`
- **端口**: 3000 (自动转发)
- **协议**: HTTPS (自动配置)

### 测试账号
```
管理员: admin@example.com / admin123
用户: user@example.com / user123
```

## 📋 功能特性

### ✅ 完全免费
- **个人账户**: 每月 120 小时免费
- **团队账户**: 每月 180 小时免费
- **学生**: 每月 180 小时免费

### ✅ 零配置
- 无需安装任何软件
- 无需配置服务器
- 无需设置环境变量
- 自动数据库初始化

### ✅ 完整功能
- 智能考试系统
- 行为分析
- 防作弊检测
- 实时数据可视化
- 权限管理

## 🔧 开发环境

### 预装工具
- **Node.js 20**
- **Docker** (用于容器化)
- **Git**
- **VS Code 扩展**:
  - TypeScript
  - Tailwind CSS
  - Prettier
  - Prisma

### 数据库管理
```bash
# 打开 Prisma Studio
npx prisma studio

# 重置数据库
npx prisma db push --force-reset

# 重新填充数据
npm run db:seed
```

## 🚀 部署到生产环境

### 当您准备部署到生产环境时：

#### 选项 1: 继续使用 Codespaces
- 适合演示和小型应用
- 完全免费
- 零维护成本

#### 选项 2: 部署到云服务器
- 使用我们创建的 GitHub Actions 工作流
- 自动部署到您的服务器
- 适合生产环境

## 📊 性能限制

### Codespaces 限制
- **CPU**: 2 核心
- **内存**: 4GB
- **存储**: 32GB
- **网络**: 1Gbps

### 适用场景
- ✅ 开发环境
- ✅ 演示和测试
- ✅ 小型应用 (< 100 用户)
- ✅ 原型开发

## 🔍 故障排除

### 常见问题

#### 1. Codespace 启动失败
```bash
# 检查日志
gh codespace logs

# 重新创建
gh codespace delete
gh codespace create
```

#### 2. 端口转发问题
- 检查防火墙设置
- 确保端口 3000 已转发
- 尝试重新启动 Codespace

#### 3. 数据库问题
```bash
# 重置数据库
npx prisma db push --force-reset
npm run db:seed
```

#### 4. 依赖安装失败
```bash
# 清理缓存
rm -rf node_modules package-lock.json
npm install
```

## 💡 最佳实践

### 开发建议
1. **定期提交代码**: 避免数据丢失
2. **使用分支**: 为不同功能创建分支
3. **备份数据**: 定期导出数据库
4. **监控使用时间**: 避免超出免费额度

### 性能优化
1. **关闭不必要的扩展**
2. **定期重启 Codespace**
3. **清理临时文件**
4. **使用轻量级编辑器**

## 🎉 开始使用

### 立即开始：
1. **打开您的 GitHub 仓库**
2. **点击 "Code" → "Codespaces"**
3. **创建新的 Codespace**
4. **等待自动配置完成**
5. **访问应用地址**

### 享受开发：
- 🚀 零配置启动
- 💻 完整的开发环境
- 🗄️ 自动数据库设置
- 🔒 安全的 HTTPS 访问
- 📱 响应式设计

GitHub Codespaces 让您的开发体验变得前所未有的简单！
