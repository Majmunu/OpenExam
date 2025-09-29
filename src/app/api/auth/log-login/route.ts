import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logLogin } from "@/lib/login-logger"
import { getServerDeviceInfo } from "@/lib/device-info"

// POST /api/auth/log-login - 记录登录日志
export async function POST(request: NextRequest) {
  try {
    // 获取设备信息
    const deviceInfo = getServerDeviceInfo(request)

    // 尝试从请求体获取用户信息，如果没有则从session获取
    let userInfo
    try {
      const body = await request.json()
      userInfo = {
        userId: body.userId,
        userEmail: body.userEmail,
        userName: body.userName
      }
    } catch {
      // 如果请求体解析失败，尝试从session获取
      const session = await getServerSession(authOptions)
      if (!session) {
        return NextResponse.json({ error: "No user information provided" }, { status: 400 })
      }
      userInfo = {
        userId: session.user.id,
        userEmail: session.user.email,
        userName: session.user.name
      }
    }

    // 记录登录日志
    const loginLog = await logLogin({
      ...userInfo,
      ...deviceInfo
    })

    return NextResponse.json({
      success: true,
      data: loginLog
    })
  } catch (error) {
    console.error("Error logging login:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
