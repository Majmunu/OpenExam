import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/exams/[id]/questions/batch - 批量添加题目到考试
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { questions } = await request.json()

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "Missing questions" }, { status: 400 })
    }

    // 检查考试是否存在
    const exam = await prisma.exam.findUnique({
      where: { id }
    })

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    // 验证题目数据
    for (const question of questions) {
      if (!question.title || !question.answer || !question.type || !question.points) {
        return NextResponse.json({
          error: "Invalid question data: missing required fields"
        }, { status: 400 })
      }
    }

    // 批量创建题目
    const createdQuestions = await Promise.all(
      questions.map(question =>
        prisma.question.create({
          data: {
            type: question.type,
            title: question.title,
            options: question.options ? JSON.stringify(question.options) : null,
            answer: question.answer,
            points: question.points,
            examId: id
          }
        })
      )
    )

    return NextResponse.json({
      message: "Questions created successfully",
      questions: createdQuestions,
      count: createdQuestions.length
    })
  } catch (error) {
    console.error("Error creating batch questions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

