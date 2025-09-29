import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // 测试数据库连接
    const userCount = await prisma.user.count()
    const examCount = await prisma.exam.count()
    const questionCount = await prisma.question.count()

    // 检查login_logs表是否存在
    let loginLogCount = 0
    try {
      loginLogCount = await prisma.loginLog.count()
    } catch (error) {
      console.error("LoginLog table error:", error)
    }

    return NextResponse.json({
      success: true,
      message: "数据库连接正常",
      data: {
        userCount,
        examCount,
        questionCount,
        loginLogCount,
        loginLogTableExists: loginLogCount >= 0
      }
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json({
      success: false,
      error: "数据库连接失败",
      details: error instanceof Error ? error.message : "未知错误"
    }, { status: 500 })
  }
}
