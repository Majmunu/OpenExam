import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/results - 获取所有考试成绩（仅管理员）
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const examId = searchParams.get("examId")

    // 获取所有答案，按用户和考试分组
    const answers = await prisma.answer.findMany({
      where: examId ? {
        question: {
          examId
        }
      } : {},
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
        updatedAt: "desc"
      }
    })

    // 按考试和用户分组计算成绩
    const resultsMap = new Map<string, any>()

    answers.forEach(answer => {
      const key = `${answer.question.exam.id}-${answer.userId}`

      if (!resultsMap.has(key)) {
        resultsMap.set(key, {
          examId: answer.question.exam.id,
          examTitle: answer.question.exam.title,
          userId: answer.userId,
          userName: answer.user.name,
          userEmail: answer.user.email,
          totalScore: 0,
          maxScore: 0,
          correctCount: 0,
          totalQuestions: 0,
          scorePercentage: 0,
          submittedAt: answer.updatedAt
        })
      }

      const result = resultsMap.get(key)
      result.totalScore += answer.score || 0
      result.maxScore += answer.question.points
      result.totalQuestions += 1
      if (answer.score === answer.question.points) {
        result.correctCount += 1
      }
    })

    // 计算百分比
    const results = Array.from(resultsMap.values()).map(result => ({
      ...result,
      scorePercentage: result.maxScore > 0
        ? Math.round((result.totalScore / result.maxScore) * 100 * 100) / 100
        : 0
    }))

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error fetching results:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
