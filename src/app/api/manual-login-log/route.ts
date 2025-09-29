import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST() {
  try {
    // 首先获取一个存在的用户ID
    const existingUser = await prisma.user.findFirst()
    if (!existingUser) {
      return NextResponse.json({
        success: false,
        error: "没有找到任何用户，请先创建用户"
      }, { status: 400 })
    }

    // 手动创建一个登录日志记录
    const loginLog = await prisma.loginLog.create({
      data: {
        userId: existingUser.id, // 使用存在的用户ID
        userEmail: existingUser.email,
        userName: existingUser.name,
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        browserName: "Chrome",
        browserVersion: "120.0.0.0",
        osName: "Windows",
        osVersion: "10",
        deviceType: "desktop",
        fingerprint: "manual-test-" + Date.now(),
        loginType: "web",
        isActive: true,
        isSuspicious: false,
        riskLevel: "low"
      }
    })

    return NextResponse.json({
      success: true,
      message: "手动创建登录日志成功",
      data: loginLog
    })
  } catch (error) {
    console.error("Manual login log creation error:", error)
    return NextResponse.json({
      success: false,
      error: "创建登录日志失败",
      details: error instanceof Error ? error.message : "未知错误"
    }, { status: 500 })
  }
}
