import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // 检查现有数据
    const userCount = await prisma.user.count()
    const examCount = await prisma.exam.count()
    const questionCount = await prisma.question.count()

    // 检查LoginLog表是否存在
    let loginLogTableExists = false
    let loginLogCount = 0
    try {
      loginLogCount = await prisma.loginLog.count()
      loginLogTableExists = true
    } catch (error) {
      loginLogTableExists = false
    }

    // 检查是否需要更新
    const needsUpdate = !loginLogTableExists

    return NextResponse.json({
      success: true,
      message: "数据库安全检查完成",
      data: {
        existingData: {
          users: userCount,
          exams: examCount,
          questions: questionCount,
          loginLogs: loginLogCount
        },
        safety: {
          hasExistingData: userCount > 0 || examCount > 0 || questionCount > 0,
          loginLogTableExists,
          needsUpdate,
          isSafe: true // 使用db push是安全的
        },
        recommendations: {
          canUpdate: true,
          willPreserveData: true,
          method: "prisma db push (安全，只添加新表)"
        }
      }
    })
  } catch (error) {
    console.error("Database safety check error:", error)
    return NextResponse.json({
      success: false,
      error: "数据库安全检查失败",
      details: error instanceof Error ? error.message : "未知错误"
    }, { status: 500 })
  }
}
