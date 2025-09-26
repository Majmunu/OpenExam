import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { autoScore } from "@/utils/scoring"

// POST /api/rescore - 重新判分所有答案
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { examId } = await request.json()

    // 获取用户的所有答案
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
            type: true,
            title: true,
            answer: true,
            points: true
          }
        }
      }
    })

    console.log(`Found ${answers.length} answers to rescore`)

    // 重新判分每个答案
    const results = []
    for (const answer of answers) {
      try {
        const scoring = autoScore(answer.question, {
          questionId: answer.questionId,
          response: answer.response
        })

        // 更新分数
        await prisma.answer.update({
          where: {
            id: answer.id
          },
          data: {
            score: scoring.score
          }
        })

        results.push({
          questionId: answer.questionId,
          questionTitle: answer.question.title,
          questionType: answer.question.type,
          userAnswer: answer.response,
          correctAnswer: answer.question.answer,
          oldScore: answer.score,
          newScore: scoring.score,
          isCorrect: scoring.isCorrect
        })

        console.log('Rescored answer:', {
          questionId: answer.questionId,
          userAnswer: answer.response,
          correctAnswer: answer.question.answer,
          oldScore: answer.score,
          newScore: scoring.score,
          isCorrect: scoring.isCorrect
        })
      } catch (error) {
        console.error('Error rescoring answer:', answer.id, error)
      }
    }

    return NextResponse.json({
      success: true,
      rescored: results.length,
      results
    })
  } catch (error) {
    console.error("Error in rescoring:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
