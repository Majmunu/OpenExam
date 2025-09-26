import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/answer-logs - 获取答题日志列表（仅管理员）
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const examId = searchParams.get("examId")
    const userId = searchParams.get("userId")
    const questionId = searchParams.get("questionId")

    const skip = (page - 1) * limit

    // 构建查询条件
    const where: any = {}
    if (examId) where.examId = examId
    if (userId) where.userId = userId
    if (questionId) where.questionId = questionId

    const [logs, total] = await Promise.all([
      prisma.answerLog.findMany({
        where,
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
              title: true,
              type: true,
              points: true
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
        skip,
        take: limit
      }),
      prisma.answerLog.count({ where })
    ])

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching answer logs:", error)
    return NextResponse.json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// POST /api/answer-logs - 创建答题日志
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      answerId,
      questionId,
      examId,
      ipAddress,
      userAgent,
      browserName,
      browserVersion,
      osName,
      osVersion,
      deviceType,
      fingerprint,
      switchCount,
      duration,
      focusTime,
      blurTime,
      keystrokes,
      mouseClicks,
      scrollEvents,
      startTime,
      endTime
    } = await request.json()

    if (!answerId || !questionId || !examId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const log = await prisma.answerLog.create({
      data: {
        answerId,
        userId: session.user.id,
        questionId,
        examId,
        ipAddress,
        userAgent,
        browserName,
        browserVersion,
        osName,
        osVersion,
        deviceType,
        fingerprint,
        switchCount: switchCount || 0,
        duration: duration || 0,
        focusTime: focusTime || 0,
        blurTime: blurTime || 0,
        keystrokes: keystrokes || 0,
        mouseClicks: mouseClicks || 0,
        scrollEvents: scrollEvents || 0,
        startTime: startTime ? new Date(startTime) : new Date(),
        endTime: endTime ? new Date(endTime) : new Date()
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
            title: true,
            type: true
          }
        },
        exam: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    console.error("Error creating answer log:", error)
    return NextResponse.json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
