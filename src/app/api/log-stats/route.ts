import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/log-stats - 获取日志统计数据（仅管理员）
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const examId = searchParams.get("examId")
    const userId = searchParams.get("userId")

    // 构建查询条件
    const where: any = {}
    if (examId) where.examId = examId
    if (userId) where.userId = userId

    // 获取基础统计
    const [
      totalLogs,
      totalUsers,
      totalExams,
      averageDuration,
      averageSwitchCount,
      browserStats,
      osStats,
      deviceStats,
      behaviorStats
    ] = await Promise.all([
      // 总日志数
      prisma.answerLog.count({ where }),

      // 参与用户数
      prisma.answerLog.findMany({
        where,
        select: { userId: true },
        distinct: ['userId']
      }).then(result => result.length),

      // 涉及考试数
      prisma.answerLog.findMany({
        where,
        select: { examId: true },
        distinct: ['examId']
      }).then(result => result.length),

      // 平均答题时长
      prisma.answerLog.aggregate({
        where,
        _avg: { duration: true }
      }),

      // 平均切屏次数
      prisma.answerLog.aggregate({
        where,
        _avg: { switchCount: true }
      }),

      // 浏览器统计
      prisma.answerLog.groupBy({
        by: ['browserName'],
        where: { ...where, browserName: { not: null } },
        _count: { browserName: true },
        orderBy: { _count: { browserName: 'desc' } },
        take: 5
      }),

      // 操作系统统计
      prisma.answerLog.groupBy({
        by: ['osName'],
        where: { ...where, osName: { not: null } },
        _count: { osName: true },
        orderBy: { _count: { osName: 'desc' } },
        take: 5
      }),

      // 设备类型统计
      prisma.answerLog.groupBy({
        by: ['deviceType'],
        where: { ...where, deviceType: { not: null } },
        _count: { deviceType: true },
        orderBy: { _count: { deviceType: 'desc' } }
      }),

      // 行为统计
      prisma.answerLog.aggregate({
        where,
        _avg: {
          keystrokes: true,
          mouseClicks: true,
          scrollEvents: true,
          focusTime: true,
          blurTime: true
        }
      })
    ])

    // 时间趋势数据（最近7天）
    const trendData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      const dayLogs = await prisma.answerLog.findMany({
        where: {
          ...where,
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
        select: {
          duration: true,
          switchCount: true,
          keystrokes: true,
          mouseClicks: true
        }
      })

      const dayStats = {
        date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        totalLogs: dayLogs.length,
        averageDuration: dayLogs.length > 0
          ? Math.round(dayLogs.reduce((sum, log) => sum + log.duration, 0) / dayLogs.length)
          : 0,
        averageSwitchCount: dayLogs.length > 0
          ? Math.round(dayLogs.reduce((sum, log) => sum + log.switchCount, 0) / dayLogs.length)
          : 0,
        totalKeystrokes: dayLogs.reduce((sum, log) => sum + log.keystrokes, 0),
        totalMouseClicks: dayLogs.reduce((sum, log) => sum + log.mouseClicks, 0)
      }

      trendData.push(dayStats)
    }

    // 异常行为检测
    const suspiciousLogs = await prisma.answerLog.findMany({
      where: {
        ...where,
        OR: [
          { switchCount: { gt: 10 } }, // 切屏次数过多
          { duration: { lt: 5 } }, // 答题时间过短
          { blurTime: { gt: 30 } } // 失焦时间过长
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        question: {
          select: {
            id: true,
            title: true
          }
        },
        exam: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 20
    })

    return NextResponse.json({
      summary: {
        totalLogs,
        totalUsers,
        totalExams,
        averageDuration: Math.round(averageDuration._avg.duration || 0),
        averageSwitchCount: Math.round(averageSwitchCount._avg.switchCount || 0)
      },
      browserStats: browserStats.map(stat => ({
        name: stat.browserName || '未知',
        count: stat._count.browserName
      })),
      osStats: osStats.map(stat => ({
        name: stat.osName || '未知',
        count: stat._count.osName
      })),
      deviceStats: deviceStats.map(stat => ({
        name: stat.deviceType || '未知',
        count: stat._count.deviceType
      })),
      behaviorStats: {
        averageKeystrokes: Math.round(behaviorStats._avg.keystrokes || 0),
        averageMouseClicks: Math.round(behaviorStats._avg.mouseClicks || 0),
        averageScrollEvents: Math.round(behaviorStats._avg.scrollEvents || 0),
        averageFocusTime: Math.round(behaviorStats._avg.focusTime || 0),
        averageBlurTime: Math.round(behaviorStats._avg.blurTime || 0)
      },
      trendData,
      suspiciousLogs
    })
  } catch (error) {
    console.error("Error fetching log stats:", error)
    return NextResponse.json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
