import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/results/[examId]/[userId] - 获取单个用户的考试详情（仅管理员）
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string; userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { examId, userId } = await params

    // 获取考试信息
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: {
        id: true,
        title: true
      }
    })

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // 获取用户的答案
    const answers = await prisma.answer.findMany({
      where: {
        userId,
        question: {
          examId
        }
      },
      include: {
        question: {
          select: {
            id: true,
            title: true,
            type: true,
            points: true,
            answer: true
          }
        }
      },
      orderBy: {
        question: {
          createdAt: "asc"
        }
      }
    })

    if (answers.length === 0) {
      return NextResponse.json({ error: "No answers found" }, { status: 404 })
    }

    // 计算统计信息
    const totalScore = answers.reduce((sum, answer) => sum + (answer.score || 0), 0)
    const maxScore = answers.reduce((sum, answer) => sum + answer.question.points, 0)
    const scorePercentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100 * 100) / 100 : 0
    const submittedAt = answers[0]?.updatedAt || new Date()

    // 格式化答案详情
    const answerDetails = answers.map(answer => ({
      questionId: answer.questionId,
      questionTitle: answer.question.title,
      questionType: answer.question.type,
      userAnswer: answer.response,
      correctAnswer: answer.question.answer,
      score: answer.score || 0,
      maxScore: answer.question.points,
      isCorrect: (answer.score || 0) === answer.question.points
    }))

    const result = {
      examTitle: exam.title,
      userName: user.name,
      userEmail: user.email,
      totalScore,
      maxScore,
      scorePercentage,
      submittedAt: submittedAt.toISOString(),
      answers: answerDetails
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching result detail:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
