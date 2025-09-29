import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // 获取所有用户
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    // 获取登录日志数量
    let loginLogCount = 0
    let recentLoginLogs = []

    try {
      loginLogCount = await prisma.loginLog.count()
      recentLoginLogs = await prisma.loginLog.findMany({
        take: 3,
        orderBy: {
          loginTime: 'desc'
        },
        select: {
          id: true,
          userId: true,
          userEmail: true,
          userName: true,
          loginTime: true,
          ipAddress: true,
          browserName: true,
          isActive: true
        }
      })
    } catch (error) {
      console.error("LoginLog table error:", error)
    }

    return NextResponse.json({
      success: true,
      message: "数据库调试信息",
      data: {
        users,
        userCount: users.length,
        loginLogCount,
        recentLoginLogs,
        hasUsers: users.length > 0,
        hasLoginLogs: loginLogCount > 0
      }
    })
  } catch (error) {
    console.error("Debug database error:", error)
    return NextResponse.json({
      success: false,
      error: "数据库调试失败",
      details: error instanceof Error ? error.message : "未知错误"
    }, { status: 500 })
  }
}
