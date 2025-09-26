# 考试系统

一个基于 Next.js 14 + TypeScript + TailwindCSS + Prisma 的在线考试管理系统。

## 功能特性

### 管理员功能
- 🔐 管理员登录和权限管理
- 📝 创建、编辑、删除考试
- ❓ 管理题目（单选题、多选题、简答题、填空题）
- 👥 用户管理
- 📊 考试统计和数据分析

### 学生功能
- 🔐 学生登录
- 📚 查看可用考试
- ✍️ 在线答题（支持多种题型）
- ⏰ 考试倒计时
- 💾 自动保存草稿
- 📈 查看考试成绩

### 技术特性
- 🚀 Next.js 14 App Router
- 🎨 TailwindCSS + shadcn/ui
- 🗄️ Prisma ORM + SQLite
- 🔒 NextAuth.js 认证
- 📱 响应式设计
- 🤖 自动判分系统

## 技术栈

- **前端**: Next.js 14, React, TypeScript, TailwindCSS
- **UI组件**: shadcn/ui, Radix UI
- **后端**: Next.js API Routes
- **数据库**: SQLite + Prisma ORM
- **认证**: NextAuth.js
- **样式**: TailwindCSS

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
- **学生**: student@example.com / student123

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 认证相关页面
│   │   └── login/         # 登录页面
│   ├── (dashboard)/       # 仪表板页面
│   │   ├── admin/         # 管理员后台
│   │   └── student/       # 学生界面
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
- role: 角色 (ADMIN/STUDENT)

### Exam (考试)
- id: 考试ID
- title: 考试标题
- description: 考试描述
- startTime: 开始时间
- endTime: 结束时间

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

## 功能说明

### 自动判分系统

系统支持以下题型的自动判分：

1. **单选题**: 精确匹配答案
2. **多选题**: 答案顺序无关，完全匹配
3. **填空题**: 支持多个正确答案（逗号分隔）
4. **简答题**: 基于关键词匹配（60%以上匹配即得分）

### 权限控制

- 管理员可以访问所有功能
- 学生只能访问考试相关功能
- 使用 NextAuth.js 中间件进行路由保护

### 响应式设计

- 支持桌面端和移动端
- 使用 TailwindCSS 实现响应式布局
- 优化的移动端体验

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

## 许可证

MIT License