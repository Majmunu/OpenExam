import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getLoginLogs, getActiveSessions } from "@/lib/login-logger"

// GET /api/login-logs - 获取登录日志
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const limit = parseInt(searchParams.get("limit") || "50")
    const type = searchParams.get("type") || "all" // all, active

    let logs
    if (type === "active") {
      logs = await getActiveSessions()
    } else {
      logs = await getLoginLogs(userId || undefined, limit)
    }

    return NextResponse.json({
      success: true,
      data: logs,
      count: logs.length
    })
  } catch (error) {
    console.error("Error fetching login logs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
