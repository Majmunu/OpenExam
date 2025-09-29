import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // 首先获取一个存在的用户ID
    const existingUser = await prisma.user.findFirst()
    if (!existingUser) {
      return NextResponse.json({
        success: false,
        error: "没有找到任何用户，请先创建用户"
      }, { status: 400 })
    }

    // 创建一个测试登录日志
    const loginLog = await prisma.loginLog.create({
      data: {
        userId: existingUser.id, // 使用存在的用户ID
        userEmail: existingUser.email,
        userName: existingUser.name,
        ipAddress: "127.0.0.1",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        browserName: "Chrome",
        browserVersion: "120.0.0.0",
        osName: "Windows",
        osVersion: "10",
        deviceType: "desktop",
        fingerprint: "test-fingerprint-" + Date.now(),
        loginType: "web",
        isActive: true,
        isSuspicious: false,
        riskLevel: "low"
      }
    })

    return NextResponse.json({
      success: true,
      message: "登录日志创建成功",
      data: loginLog
    })
  } catch (error) {
    console.error("Create login log error:", error)
    return NextResponse.json({
      success: false,
      error: "创建登录日志失败",
      details: error instanceof Error ? error.message : "未知错误"
    }, { status: 500 })
  }
}

export async function POST() {
  return GET()
}
