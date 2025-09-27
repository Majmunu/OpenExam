# Intelligent Examination System

[中文](README.md) | English

An intelligent online examination management system built with Next.js 15 + TypeScript + TailwindCSS + Prisma, featuring behavioral analysis, anti-cheating detection, and advanced permission management.

## Features

### Administrator Features
- 🔐 Administrator login and permission management
- 📝 Create, edit, and delete examinations
- ❓ Manage questions (single choice, multiple choice, short answer, fill-in-the-blank)
- 👥 User management
- 📊 Examination statistics and data analysis
- 🔍 Behavioral analysis and anti-cheating detection
- ⚙️ Fine-grained examination permission management
- 📈 Real-time data visualization and analysis

### User Features
- 🔐 User login
- 📚 View available examinations
- ✍️ Online answering (supports multiple question types)
- ⏰ Examination countdown timer
- 💾 Auto-save drafts
- 📈 View examination results and history
- 🎯 Display examination passing criteria

### Technical Features
- 🚀 Next.js 15 App Router
- 🎨 TailwindCSS + shadcn/ui
- 🗄️ Prisma ORM + SQLite
- 🔒 NextAuth.js authentication
- 📱 Responsive design
- 🤖 Intelligent automatic scoring system
- 🔍 Behavioral monitoring and anomaly detection
- 📊 Real-time data analysis and visualization

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS
- **UI Components**: shadcn/ui, Radix UI, Recharts
- **Backend**: Next.js API Routes
- **Database**: SQLite + Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: TailwindCSS
- **Data Analysis**: Recharts, custom behavioral analysis algorithms

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env` file:

```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### 3. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Create test data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## Test Accounts

The system comes with the following test accounts:

- **Administrator**: admin@example.com / admin123
- **User**: user@example.com / user123

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication related pages
│   │   └── login/         # Login page
│   ├── (dashboard)/       # Dashboard pages
│   │   ├── admin/         # Administrator backend
│   │   └── user/          # User interface
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # UI component library
│   └── providers/        # Context providers
├── lib/                  # Utility libraries
│   ├── auth.ts          # NextAuth configuration
│   └── prisma.ts        # Prisma client
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
    └── scoring.ts       # Automatic scoring logic
```

## Data Models

### User
- id: User ID
- name: Full name
- email: Email address
- passwordHash: Password hash
- role: Role (ADMIN/USER)

### Exam
- id: Examination ID
- title: Examination title
- description: Examination description
- startTime: Start time
- endTime: End time
- duration: Examination duration (minutes)
- isPublic: Whether public to all users
- passingScore: Passing score (percentage)
- passingCriteria: Passing criteria description

### Question
- id: Question ID
- examId: Associated examination ID
- type: Question type (SINGLE_CHOICE/MULTIPLE_CHOICE/SHORT_ANSWER/FILL_BLANK)
- title: Question content
- options: Options (JSON string)
- answer: Correct answer
- points: Points value

### Answer
- id: Answer ID
- questionId: Question ID
- userId: User ID
- response: User's answer
- score: Score

### ExamPermission
- id: Permission ID
- examId: Examination ID
- userId: User ID

### AnswerLog
- id: Log ID
- answerId: Associated answer ID
- userId: User ID
- questionId: Question ID
- examId: Examination ID
- ipAddress: IP address
- userAgent: Browser information
- browserName: Browser name
- browserVersion: Browser version
- osName: Operating system name
- osVersion: Operating system version
- deviceType: Device type
- fingerprint: Device fingerprint
- switchCount: Screen switching count
- duration: Answering duration
- focusTime: Focus time
- blurTime: Blur time
- keystrokes: Keystroke count
- mouseClicks: Mouse click count
- scrollEvents: Scroll event count
- startTime: Answer start time
- endTime: Answer end time

## API Endpoints

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### User Management
- `GET /api/users` - Get user list
- `POST /api/users` - Create user
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Examination Management
- `GET /api/exams` - Get examination list
- `POST /api/exams` - Create examination
- `GET /api/exams/[id]` - Get examination details
- `PUT /api/exams/[id]` - Update examination
- `DELETE /api/exams/[id]` - Delete examination

### Question Management
- `GET /api/questions` - Get question list
- `POST /api/questions` - Create question
- `GET /api/questions/[id]` - Get question details
- `PUT /api/questions/[id]` - Update question
- `DELETE /api/questions/[id]` - Delete question

### Answer Management
- `GET /api/answers` - Get user answers
- `POST /api/answers` - Submit answers

### Scoring System
- `POST /api/scoring` - Automatic scoring
- `GET /api/scoring` - Get scoring results

### Behavioral Analysis
- `GET /api/log-stats` - Get behavioral analysis data
- `POST /api/answer-logs` - Record answering behavior logs

### Examination Permissions
- `GET /api/exams/[id]/permissions` - Get examination permissions
- `POST /api/exams/[id]/permissions` - Set examination permissions
- `DELETE /api/exams/[id]/permissions` - Delete examination permissions

### Statistics
- `GET /api/stats` - Get system statistics
- `GET /api/grade-stats` - Get grade statistics

## Feature Descriptions

### Automatic Scoring System

The system supports automatic scoring for the following question types:

1. **Single Choice**: Exact answer matching
2. **Multiple Choice**: Order-independent complete matching
3. **Fill-in-the-blank**: Supports multiple correct answers (comma-separated)
4. **Short Answer**: Keyword-based matching (60%+ match for scoring)

### Permission Control

- Administrators can access all features
- Users can only access examination-related features
- Route protection using NextAuth.js middleware

### Responsive Design

- Supports desktop and mobile devices
- Responsive layout using TailwindCSS
- Optimized mobile experience

### Behavioral Monitoring and Anti-Cheating

The system features powerful behavioral monitoring:

1. **Device Fingerprinting**: Records user device information to prevent account sharing
2. **Screen Switching Detection**: Monitors user screen switching to identify abnormal behavior
3. **Answering Duration Analysis**: Analyzes answering time patterns to detect abnormally fast responses
4. **Behavioral Data Collection**: Records keystrokes, mouse clicks, scrolling, and other interaction data
5. **Abnormal Behavior Alerts**: Automatically flags suspicious answering behavior

### Permission Management System

- **Examination Permission Control**: Administrators can precisely control which users can access specific examinations
- **Public Examinations**: Support for setting public examinations accessible to all users
- **Passing Criteria**: Ability to set examination passing scores and criteria descriptions
- **Duration Control**: Support for setting examination time limits

### Data Analysis Features

- **Real-time Statistics**: Real-time data on examination participation, completion rates, etc.
- **Behavioral Analysis**: Analysis of user answering behavior patterns
- **Device Statistics**: Distribution of browsers, operating systems, and device types
- **Trend Analysis**: Analysis of answering behavior trends
- **Anomaly Detection**: Automatic identification of suspicious answering behavior

## Deployment

### Production Environment Configuration

1. Update environment variables in `.env` file
2. Configure production database
3. Set NextAuth.js secret key

```bash
npm run build
npm start
```

## Development Guide

### Adding New Question Types

1. Add new `QuestionType` in `prisma/schema.prisma`
2. Implement scoring logic in `src/utils/scoring.ts`
3. Add rendering logic in `src/components/ExamForm.tsx`

### Custom Styling

The project uses TailwindCSS. You can customize the theme by modifying `tailwind.config.js`.

## Database Migration Guide

### Current Database
The system currently uses **SQLite** as the default database, suitable for development and small-scale deployments.

### Migration to Other Databases

#### 1. Migration to PostgreSQL

```bash
# 1. Install PostgreSQL client
npm install pg @types/pg

# 2. Update .env file
DATABASE_URL="postgresql://username:password@localhost:5432/exam_system"

# 3. Update prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

# 4. Generate new migration
npx prisma migrate dev --name init_postgresql

# 5. Generate Prisma client
npx prisma generate
```

#### 2. Migration to MySQL

```bash
# 1. Install MySQL client
npm install mysql2

# 2. Update .env file
DATABASE_URL="mysql://username:password@localhost:3306/exam_system"

# 3. Update prisma/schema.prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

# 4. Generate new migration
npx prisma migrate dev --name init_mysql

# 5. Generate Prisma client
npx prisma generate
```

#### 3. Migration to MongoDB

```bash
# 1. Install MongoDB client
npm install mongodb

# 2. Update .env file
DATABASE_URL="mongodb://localhost:27017/exam_system"

# 3. Update prisma/schema.prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

# 4. Generate Prisma client
npx prisma generate
```

#### 4. Data Migration Steps

1. **Backup existing data**:
   ```bash
   # Export SQLite data
   sqlite3 prisma/dev.db .dump > backup.sql
   ```

2. **Set up new database**:
   - Create target database
   - Configure connection string

3. **Run migration**:
   ```bash
   npx prisma migrate deploy
   ```

4. **Data import** (if needed):
   - Use Prisma data import tools
   - Or write custom migration scripts

#### 5. Production Environment Recommendations

- **Small-scale deployment (< 1000 users)**: SQLite or PostgreSQL
- **Medium-scale deployment (1000-10000 users)**: PostgreSQL or MySQL
- **Large-scale deployment (> 10000 users)**: PostgreSQL + read/write splitting

#### 6. Performance Optimization Recommendations

- **PostgreSQL**: Use connection pooling, configure indexes
- **MySQL**: Optimize InnoDB configuration, use read/write splitting
- **MongoDB**: Configure sharding, use replica sets

## Language Switch / 语言切换

- [English Documentation](README_EN.md) - Complete English documentation
- [中文文档](README.md) - 完整的中文文档

## License

MIT License
