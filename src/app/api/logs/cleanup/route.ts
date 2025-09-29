import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/logs/cleanup - 清理过期日志
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { days = 30, dryRun = false } = await request.json()

    // 计算过期时间
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    if (dryRun) {
      // 预览模式：只返回将要删除的记录数量
      const count = await prisma.answerLog.count({
        where: {
          createdAt: {
            lt: cutoffDate
          }
        }
      })

      return NextResponse.json({
        message: `预览模式：将删除 ${count} 条超过 ${days} 天的日志记录`,
        count,
        cutoffDate: cutoffDate.toISOString()
      })
    }

    // 执行清理
    const result = await prisma.answerLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    })

    return NextResponse.json({
      message: `成功清理 ${result.count} 条超过 ${days} 天的日志记录`,
      deletedCount: result.count,
      cutoffDate: cutoffDate.toISOString()
    })

  } catch (error) {
    console.error("Error cleaning up logs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET /api/logs/cleanup - 获取日志统计信息
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get("days") || "30")

    // 计算过期时间
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    // 获取统计信息
    const [totalLogs, expiredLogs, recentLogs] = await Promise.all([
      prisma.answerLog.count(),
      prisma.answerLog.count({
        where: {
          createdAt: {
            lt: cutoffDate
          }
        }
      }),
      prisma.answerLog.count({
        where: {
          createdAt: {
            gte: cutoffDate
          }
        }
      })
    ])

    // 获取数据库大小估算
    const oldestLog = await prisma.answerLog.findFirst({
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true }
    })

    return NextResponse.json({
      totalLogs,
      expiredLogs,
      recentLogs,
      cutoffDate: cutoffDate.toISOString(),
      oldestLogDate: oldestLog?.createdAt || null,
      stats: {
        expiredPercentage: totalLogs > 0 ? Math.round((expiredLogs / totalLogs) * 100) : 0,
        canCleanup: expiredLogs > 0
      }
    })

  } catch (error) {
    console.error("Error getting log stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
