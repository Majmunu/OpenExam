import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // 检查是否已经初始化
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      return NextResponse.json({ 
        message: '数据库已经初始化过了',
        success: true 
      })
    }

    // 创建管理员用户
    const hashedPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        passwordHash: hashedPassword,
        name: '管理员',
        role: 'ADMIN',
      },
    })

    // 创建测试用户
    const userPassword = await bcrypt.hash('user123', 10)
    const user = await prisma.user.create({
      data: {
        email: 'user@example.com',
        passwordHash: userPassword,
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
        type: 'SINGLE_CHOICE' as const,
        title: 'JavaScript中声明变量的关键字有哪些？',
        options: JSON.stringify(['var', 'let', 'const', '以上都是']),
        answer: '以上都是',
        points: 2,
        examId: exam.id,
      },
      {
        type: 'MULTIPLE_CHOICE' as const,
        title: '以下哪些是JavaScript的数据类型？',
        options: JSON.stringify(['string', 'number', 'boolean', 'object', 'function']),
        answer: 'string,number,boolean,object,function',
        points: 3,
        examId: exam.id,
      },
    ]

    for (const question of questions) {
      await prisma.question.create({
        data: question,
      })
    }

    return NextResponse.json({ 
      message: '数据库初始化成功',
      success: true,
      data: {
        admin: { email: admin.email, password: 'admin123' },
        user: { email: user.email, password: 'user123' }
      }
    })

  } catch (error) {
    console.error('数据库初始化失败:', error)
    return NextResponse.json({ 
      message: '数据库初始化失败',
      error: error instanceof Error ? error.message : '未知错误',
      success: false 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
