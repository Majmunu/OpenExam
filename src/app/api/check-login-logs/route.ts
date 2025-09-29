import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // 检查login_logs表是否存在并获取记录数
    const count = await prisma.loginLog.count()

    // 获取最新的几条记录
    const recentLogs = await prisma.loginLog.findMany({
      take: 5,
      orderBy: {
        loginTime: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      message: "LoginLogs表检查成功",
      data: {
        count,
        recentLogs
      }
    })
  } catch (error) {
    console.error("Check login logs error:", error)
    return NextResponse.json({
      success: false,
      error: "检查LoginLogs表失败",
      details: error instanceof Error ? error.message : "未知错误"
    }, { status: 500 })
  }
}
