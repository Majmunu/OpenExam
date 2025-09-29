import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/cron/cleanup-logs - 定时清理日志任务
export async function GET(request: NextRequest) {
  try {
    // 验证请求来源（可选：添加API密钥验证）
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET || 'default-secret'

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 默认清理30天前的日志
    const days = 30
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    // 执行清理
    const result = await prisma.answerLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    })

    console.log(`[CRON] 清理了 ${result.count} 条超过 ${days} 天的日志记录`)

    return NextResponse.json({
      success: true,
      message: `清理了 ${result.count} 条超过 ${days} 天的日志记录`,
      deletedCount: result.count,
      cutoffDate: cutoffDate.toISOString(),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("[CRON] Error cleaning up logs:", error)
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 })
  }
}
