# 日志清理功能使用指南

## 功能概述

系统现在支持自动清理过期的答题日志，避免数据库积累大量无用数据。

## 功能特性

### 1. 手动清理
- 在日志管理页面点击"日志清理"按钮
- 支持预览清理（dry run）模式
- 可选择清理天数：7天、30天、90天、180天、1年
- 显示清理统计信息

### 2. 自动清理
- 通过GitHub Actions定时任务自动清理
- 默认每天凌晨2点执行
- 清理30天前的日志记录

### 3. API接口

#### 获取清理统计
```bash
GET /api/logs/cleanup?days=30
```

#### 执行清理
```bash
POST /api/logs/cleanup
Content-Type: application/json

{
  "days": 30,
  "dryRun": false
}
```

#### 定时清理任务
```bash
GET /api/cron/cleanup-logs
Authorization: Bearer <CRON_SECRET>
```

## 环境变量配置

### 必需的环境变量

```bash
# 定时任务密钥（用于验证自动清理请求）
CRON_SECRET=your-secret-key-here
```

### GitHub Secrets 配置

在GitHub仓库的Settings > Secrets and variables > Actions中添加：

```
CRON_SECRET=your-secret-key-here
```

## 部署配置

### Vercel 部署
1. 在Vercel项目设置中添加环境变量：
   - `CRON_SECRET`: 你的密钥

2. 更新GitHub Actions工作流中的URL：
   ```yaml
   DEPLOY_URL="https://your-app.vercel.app"
   ```

### Railway 部署
1. 在Railway项目设置中添加环境变量：
   - `CRON_SECRET`: 你的密钥

2. 更新GitHub Actions工作流中的URL：
   ```yaml
   DEPLOY_URL="${{ secrets.RAILWAY_URL }}"
   ```

### 其他部署方式
根据你的部署平台，调整GitHub Actions工作流中的URL获取逻辑。

## 使用建议

### 1. 清理策略
- **开发环境**: 建议7-30天清理一次
- **生产环境**: 建议30-90天清理一次
- **高并发环境**: 建议更频繁的清理（7-14天）

### 2. 监控建议
- 定期检查日志数量
- 监控数据库大小
- 设置清理任务执行通知

### 3. 备份建议
- 重要日志可考虑导出备份
- 清理前建议先预览清理结果
- 可设置保留重要用户的详细日志

## 安全注意事项

1. **API密钥安全**: 确保`CRON_SECRET`密钥安全，不要泄露
2. **权限控制**: 清理功能仅限管理员使用
3. **数据备份**: 清理前建议备份重要数据
4. **测试环境**: 先在测试环境验证清理功能

## 故障排除

### 常见问题

1. **清理任务失败**
   - 检查`CRON_SECRET`是否正确设置
   - 验证部署URL是否正确
   - 查看GitHub Actions日志

2. **权限错误**
   - 确保用户具有管理员权限
   - 检查API认证是否正确

3. **数据库连接错误**
   - 检查数据库连接配置
   - 验证Prisma配置是否正确

### 日志查看

清理任务的执行日志可以在以下位置查看：
- GitHub Actions: 仓库的Actions页面
- 应用日志: 部署平台的应用日志
- 数据库日志: 数据库管理界面

## 性能优化

### 数据库优化
- 为`createdAt`字段添加索引
- 考虑分表存储历史日志
- 定期优化数据库

### 清理优化
- 分批清理大量数据
- 避免在高峰期执行清理
- 监控清理任务的执行时间
