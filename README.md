# 智能考试系统

[English](README_EN.md) | 中文

一个基于 Next.js 15 + TypeScript + TailwindCSS + Prisma 的智能在线考试管理系统，具备行为分析、防作弊检测和高级权限管理功能。

## 功能特性

### 管理员功能
- 🔐 管理员登录和权限管理
- 📝 创建、编辑、删除考试
- ❓ 管理题目（单选题、多选题、简答题、填空题）
- 👥 用户管理
- 📊 考试统计和数据分析
- 🔍 行为分析和防作弊检测
- ⚙️ 考试权限精细化管理
- 📈 实时数据可视化分析

### 用户功能
- 🔐 用户登录
- 📚 查看可用考试
- ✍️ 在线答题（支持多种题型）
- ⏰ 考试倒计时
- 💾 自动保存草稿
- 📈 查看考试成绩和历史记录
- 🎯 考试通过标准显示

### 技术特性
- 🚀 Next.js 15 App Router
- 🎨 TailwindCSS + shadcn/ui
- 🗄️ Prisma ORM + SQLite
- 🔒 NextAuth.js 认证
- 📱 响应式设计
- 🤖 智能自动判分系统
- 🔍 行为监控和异常检测
- 📊 实时数据分析和可视化

## 技术栈

- **前端**: Next.js 15, React 19, TypeScript, TailwindCSS
- **UI组件**: shadcn/ui, Radix UI, Recharts
- **后端**: Next.js API Routes
- **数据库**: SQLite + Prisma ORM
- **认证**: NextAuth.js
- **样式**: TailwindCSS
- **数据分析**: Recharts, 自定义行为分析算法

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env` 文件：

```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### 3. 初始化数据库

```bash
# 生成 Prisma 客户端
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev

# 创建测试数据
npm run db:seed
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 测试账号

系统已预置以下测试账号：

- **管理员**: admin@example.com / admin123
- **用户**: user@example.com / user123

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 认证相关页面
│   │   └── login/         # 登录页面
│   ├── (dashboard)/       # 仪表板页面
│   │   ├── admin/         # 管理员后台
│   │   └── student/       # 用户界面
│   └── api/               # API 路由
├── components/            # React 组件
│   ├── ui/               # UI 组件库
│   └── providers/        # Context 提供者
├── lib/                  # 工具库
│   ├── auth.ts          # NextAuth 配置
│   └── prisma.ts        # Prisma 客户端
├── types/               # TypeScript 类型定义
└── utils/               # 工具函数
    └── scoring.ts       # 自动判分逻辑
```

## 数据模型

### User (用户)
- id: 用户ID
- name: 姓名
- email: 邮箱
- passwordHash: 密码哈希
- role: 角色 (ADMIN/USER)

### Exam (考试)
- id: 考试ID
- title: 考试标题
- description: 考试描述
- startTime: 开始时间
- endTime: 结束时间
- duration: 考试时长（分钟）
- isPublic: 是否公开给所有用户
- passingScore: 通过分数（百分比）
- passingCriteria: 通过标准描述

### Question (题目)
- id: 题目ID
- examId: 所属考试ID
- type: 题目类型 (SINGLE_CHOICE/MULTIPLE_CHOICE/SHORT_ANSWER/FILL_BLANK)
- title: 题目内容
- options: 选项 (JSON字符串)
- answer: 正确答案
- points: 分值

### Answer (答案)
- id: 答案ID
- questionId: 题目ID
- userId: 用户ID
- response: 用户答案
- score: 得分

### ExamPermission (考试权限)
- id: 权限ID
- examId: 考试ID
- userId: 用户ID

### AnswerLog (答题日志)
- id: 日志ID
- answerId: 关联答案ID
- userId: 用户ID
- questionId: 题目ID
- examId: 考试ID
- ipAddress: IP地址
- userAgent: 浏览器信息
- browserName: 浏览器名称
- browserVersion: 浏览器版本
- osName: 操作系统名称
- osVersion: 操作系统版本
- deviceType: 设备类型
- fingerprint: 设备指纹
- switchCount: 切屏次数
- duration: 答题时长
- focusTime: 专注时间
- blurTime: 失焦时间
- keystrokes: 按键次数
- mouseClicks: 鼠标点击次数
- scrollEvents: 滚动事件次数
- startTime: 开始答题时间
- endTime: 结束答题时间

## API 接口

### 认证相关
- `POST /api/auth/signin` - 用户登录
- `POST /api/auth/signout` - 用户登出

### 用户管理
- `GET /api/users` - 获取用户列表
- `POST /api/users` - 创建用户
- `PUT /api/users/[id]` - 更新用户
- `DELETE /api/users/[id]` - 删除用户

### 考试管理
- `GET /api/exams` - 获取考试列表
- `POST /api/exams` - 创建考试
- `GET /api/exams/[id]` - 获取考试详情
- `PUT /api/exams/[id]` - 更新考试
- `DELETE /api/exams/[id]` - 删除考试

### 题目管理
- `GET /api/questions` - 获取题目列表
- `POST /api/questions` - 创建题目
- `GET /api/questions/[id]` - 获取题目详情
- `PUT /api/questions/[id]` - 更新题目
- `DELETE /api/questions/[id]` - 删除题目

### 答案管理
- `GET /api/answers` - 获取用户答案
- `POST /api/answers` - 提交答案

### 判分系统
- `POST /api/scoring` - 自动判分
- `GET /api/scoring` - 获取判分结果

### 行为分析
- `GET /api/log-stats` - 获取行为分析数据
- `POST /api/answer-logs` - 记录答题行为日志

### 考试权限
- `GET /api/exams/[id]/permissions` - 获取考试权限
- `POST /api/exams/[id]/permissions` - 设置考试权限
- `DELETE /api/exams/[id]/permissions` - 删除考试权限

### 统计分析
- `GET /api/stats` - 获取系统统计
- `GET /api/grade-stats` - 获取成绩统计

## 功能说明

### 自动判分系统

系统支持以下题型的自动判分：

1. **单选题**: 精确匹配答案
2. **多选题**: 答案顺序无关，完全匹配
3. **填空题**: 支持多个正确答案（逗号分隔）
4. **简答题**: 基于关键词匹配（60%以上匹配即得分）

### 权限控制

- 管理员可以访问所有功能
- 用户只能访问考试相关功能
- 使用 NextAuth.js 中间件进行路由保护

### 响应式设计

- 支持桌面端和移动端
- 使用 TailwindCSS 实现响应式布局
- 优化的移动端体验

### 行为监控和防作弊

系统具备强大的行为监控功能：

1. **设备指纹识别**: 记录用户设备信息，防止账号共享
2. **切屏检测**: 监控用户切屏次数，识别异常行为
3. **答题时长分析**: 分析答题时间模式，检测异常快速答题
4. **行为数据收集**: 记录按键、鼠标点击、滚动等交互数据
5. **异常行为预警**: 自动标记可疑答题行为

### 权限管理系统

- **考试权限控制**: 管理员可精确控制哪些用户能访问特定考试
- **公开考试**: 支持设置公开考试，所有用户均可参与
- **通过标准**: 可设置考试通过分数和标准描述
- **时长控制**: 支持设置考试时长限制

### 数据分析功能

- **实时统计**: 考试参与人数、完成率等实时数据
- **行为分析**: 用户答题行为模式分析
- **设备统计**: 浏览器、操作系统、设备类型分布
- **趋势分析**: 答题行为变化趋势
- **异常检测**: 自动识别可疑答题行为

## 部署

### 生产环境配置

1. 更新 `.env` 文件中的环境变量
2. 配置生产数据库
3. 设置 NextAuth.js 密钥

```bash
npm run build
npm start
```

## 开发指南

### 添加新题型

1. 在 `prisma/schema.prisma` 中添加新的 `QuestionType`
2. 在 `src/utils/scoring.ts` 中实现判分逻辑
3. 在 `src/components/ExamForm.tsx` 中添加渲染逻辑

### 自定义样式

项目使用 TailwindCSS，可以通过修改 `tailwind.config.js` 来自定义主题。

## 数据库迁移指南

### 当前数据库
系统目前使用 **SQLite** 作为默认数据库，适合开发和小规模部署。

### 迁移到其他数据库

#### 1. 迁移到 PostgreSQL

```bash
# 1. 安装 PostgreSQL 客户端
npm install pg @types/pg

# 2. 更新 .env 文件
DATABASE_URL="postgresql://username:password@localhost:5432/exam_system"

# 3. 更新 prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

# 4. 生成新的迁移
npx prisma migrate dev --name init_postgresql

# 5. 生成 Prisma 客户端
npx prisma generate
```

#### 2. 迁移到 MySQL

```bash
# 1. 安装 MySQL 客户端
npm install mysql2

# 2. 更新 .env 文件
DATABASE_URL="mysql://username:password@localhost:3306/exam_system"

# 3. 更新 prisma/schema.prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

# 4. 生成新的迁移
npx prisma migrate dev --name init_mysql

# 5. 生成 Prisma 客户端
npx prisma generate
```

#### 3. 迁移到 MongoDB

```bash
# 1. 安装 MongoDB 客户端
npm install mongodb

# 2. 更新 .env 文件
DATABASE_URL="mongodb://localhost:27017/exam_system"

# 3. 更新 prisma/schema.prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

# 4. 生成 Prisma 客户端
npx prisma generate
```

#### 4. 数据迁移步骤

1. **备份现有数据**:
   ```bash
   # 导出 SQLite 数据
   sqlite3 prisma/dev.db .dump > backup.sql
   ```

2. **设置新数据库**:
   - 创建目标数据库
   - 配置连接字符串

3. **运行迁移**:
   ```bash
   npx prisma migrate deploy
   ```

4. **数据导入** (如需要):
   - 使用 Prisma 数据导入工具
   - 或编写自定义迁移脚本

#### 5. 生产环境建议

- **小规模部署 (< 1000 用户)**: SQLite 或 PostgreSQL
- **中等规模部署 (1000-10000 用户)**: PostgreSQL 或 MySQL
- **大规模部署 (> 10000 用户)**: PostgreSQL + 读写分离

#### 6. 性能优化建议

- **PostgreSQL**: 使用连接池，配置索引
- **MySQL**: 优化 InnoDB 配置，使用读写分离
- **MongoDB**: 配置分片，使用副本集

## 语言切换 / Language Switch

- [English Documentation](README_EN.md) - Complete English documentation
- [中文文档](README.md) - 完整的中文文档

## 许可证

MIT License