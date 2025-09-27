const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('开始种子数据初始化...')

  // 创建管理员用户
  const hashedAdminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: hashedAdminPassword,
      name: '管理员',
      role: 'ADMIN',
    },
  })

  // 创建测试用户
  const hashedUserPassword = await bcrypt.hash('user123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      passwordHash: hashedUserPassword,
      name: '测试用户',
      role: 'USER',
    },
  })

  // 创建示例考试
  const exam = await prisma.exam.create({
    data: {
      title: 'JavaScript基础测试',
      description: '测试JavaScript基础知识的考试',
      startTime: new Date(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小时后结束
    },
  })

  // 创建示例题目
  const questions = [
    {
      type: 'SINGLE_CHOICE',
      title: 'JavaScript中声明变量的关键字有哪些？',
      options: JSON.stringify(['var', 'let', 'const', '以上都是']),
      answer: '以上都是',
      points: 2,
      examId: exam.id,
    },
    {
      type: 'MULTIPLE_CHOICE',
      title: '以下哪些是JavaScript的数据类型？',
      options: JSON.stringify(['string', 'number', 'boolean', 'object', 'function']),
      answer: 'string,number,boolean,object,function',
      points: 3,
      examId: exam.id,
    },
    {
      type: 'SHORT_ANSWER',
      title: '请简述JavaScript中闭包的概念和作用。',
      options: null,
      answer: '闭包是指有权访问另一个函数作用域中变量的函数。',
      points: 5,
      examId: exam.id,
    },
    {
      type: 'FILL_BLANK',
      title: 'JavaScript中，___ 关键字用于声明常量。',
      options: null,
      answer: 'const',
      points: 1,
      examId: exam.id,
    },
  ]

  for (const question of questions) {
    await prisma.question.create({
      data: question,
    })
  }

  console.log('种子数据初始化完成！')
  console.log('管理员账号:', admin.email, '/ admin123')
  console.log('测试用户:', user.email, '/ user123')
  console.log('示例考试:', exam.title)
}

main()
  .catch((e) => {
    console.error('种子数据初始化失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
