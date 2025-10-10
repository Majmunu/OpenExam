import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { autoScore, batchScore, getScoringStats } from "@/utils/scoring"

// POST /api/scoring - 自动判分
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { examId, userId } = await request.json()

    if (!examId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 获取考试的所有题目
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: true
      }
    })

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    // 获取用户的所有答案
    const answers = await prisma.answer.findMany({
      where: {
        userId,
        question: {
          examId
        }
      }
    })

    // 转换为判分所需的格式
    const userAnswers = answers.map(answer => ({
      questionId: answer.questionId,
      response: answer.response
    }))

    // 执行自动判分
    const scoringResult = batchScore(exam.questions, userAnswers)
    const stats = getScoringStats(scoringResult.results)

    // 更新数据库中的分数
    for (const result of scoringResult.results) {
      await prisma.answer.updateMany({
        where: {
          questionId: result.questionId,
          userId
        },
        data: {
          score: result.score
        }
      })
    }

    return NextResponse.json({
      success: true,
      stats,
      results: scoringResult.results
    })
  } catch (error) {
    console.error("Error in auto scoring:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET /api/scoring - 获取判分结果
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const examId = searchParams.get("examId")
    const userId = searchParams.get("userId") || session.user.id

    if (!examId) {
      return NextResponse.json({ error: "Missing examId" }, { status: 400 })
    }

    // 获取用户的答案和分数
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
            answer: true,
            options: true
          }
        }
      }
    })

    // 计算统计信息
    const totalScore = answers.reduce((sum, answer) => sum + (answer.score || 0), 0)
    const maxScore = answers.reduce((sum, answer) => sum + answer.question.points, 0)
    const correctCount = answers.filter(answer => answer.score === answer.question.points).length
    const totalQuestions = answers.length

    return NextResponse.json({
      totalScore,
      maxScore,
      correctCount,
      totalQuestions,
      scorePercentage: maxScore > 0 ? Math.round((totalScore / maxScore) * 100 * 100) / 100 : 0,
      answers: answers.map(answer => {
        // 处理正确答案显示
        let correctAnswerDisplay = answer.question.answer

        // 现在answer.question.answer存储的是选项内容，直接显示即可
        if (answer.question.type === 'SINGLE_CHOICE') {
          // 单选题：直接显示选项内容
          correctAnswerDisplay = answer.question.answer
        } else if (answer.question.type === 'MULTIPLE_CHOICE') {
          // 多选题：选项内容用逗号分隔，直接显示
          correctAnswerDisplay = answer.question.answer
        }

        return {
          questionId: answer.questionId,
          questionTitle: answer.question.title,
          questionType: answer.question.type,
          userAnswer: answer.response,
          correctAnswer: correctAnswerDisplay,
          score: answer.score,
          maxScore: answer.question.points,
          isCorrect: answer.score === answer.question.points
        }
      })
    })
  } catch (error) {
    console.error("Error fetching scoring results:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
