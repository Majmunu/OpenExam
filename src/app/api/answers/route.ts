import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/answers - 获取用户答案
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const examId = searchParams.get("examId")

    const answers = await prisma.answer.findMany({
      where: {
        userId: session.user.id,
        ...(examId && {
          question: {
            examId
          }
        })
      },
      include: {
        question: {
          select: {
            id: true,
            title: true,
            type: true,
            points: true,
            exam: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    })

    return NextResponse.json(answers)
  } catch (error) {
    console.error("Error fetching answers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/answers - 提交答案
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      questionId,
      response,
      logData
    } = await request.json()

    if (!questionId || !response) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 检查题目是否存在且考试时间是否有效
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        exam: {
          select: {
            startTime: true,
            endTime: true
          }
        }
      }
    })

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    const now = new Date()
    if (now < question.exam.startTime || now > question.exam.endTime) {
      return NextResponse.json({ error: "Exam not available" }, { status: 403 })
    }

    // 使用 upsert 来创建或更新答案
    const answer = await prisma.answer.upsert({
      where: {
        questionId_userId: {
          questionId,
          userId: session.user.id
        }
      },
      update: {
        response,
        updatedAt: new Date()
      },
      create: {
        questionId,
        userId: session.user.id,
        response,
      },
      include: {
        question: {
          select: {
            id: true,
            title: true,
            type: true,
            points: true,
            answer: true,
            options: true
          }
        }
      }
    })

    // 自动判分
    try {
      const { autoScore } = await import("@/utils/scoring")

      console.log('Before scoring - question:', {
        id: answer.question.id,
        type: answer.question.type,
        answer: answer.question.answer,
        points: answer.question.points
      })

      console.log('Before scoring - user answer:', {
        questionId,
        response
      })

      const scoring = autoScore(answer.question, { questionId, response })

      console.log('Scoring result:', scoring)

      // 更新分数
      await prisma.answer.update({
        where: {
          questionId_userId: {
            questionId,
            userId: session.user.id
          }
        },
        data: {
          score: scoring.score
        }
      })

      console.log('Updated score in database:', scoring.score)
    } catch (error) {
      console.error("Error in auto scoring:", error)
    }

    // 记录答题日志
    try {
      if (logData) {
        const headers = request.headers
        const userAgent = headers.get('user-agent') || ''
        const forwarded = headers.get('x-forwarded-for')
        const realIp = headers.get('x-real-ip')
        const ipAddress = forwarded?.split(',')[0] || realIp || 'unknown'

        await prisma.answerLog.create({
          data: {
            answerId: answer.id,
            userId: session.user.id,
            questionId: answer.questionId,
            examId: question.examId,
            ipAddress,
            userAgent,
            browserName: logData.browserName,
            browserVersion: logData.browserVersion,
            osName: logData.osName,
            osVersion: logData.osVersion,
            deviceType: logData.deviceType,
            fingerprint: logData.fingerprint,
            switchCount: logData.switchCount || 0,
            duration: logData.duration || 0,
            focusTime: logData.focusTime || 0,
            blurTime: logData.blurTime || 0,
            keystrokes: logData.keystrokes || 0,
            mouseClicks: logData.mouseClicks || 0,
            scrollEvents: logData.scrollEvents || 0,
            startTime: logData.startTime ? new Date(logData.startTime) : new Date(),
            endTime: logData.endTime ? new Date(logData.endTime) : new Date()
          }
        })
      }
    } catch (logError) {
      console.error("Error creating answer log:", logError)
      // 不阻止答案提交，只记录错误
    }

    return NextResponse.json(answer, { status: 201 })
  } catch (error) {
    console.error("Error submitting answer:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
