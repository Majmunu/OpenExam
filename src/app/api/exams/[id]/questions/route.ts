import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/exams/[id]/questions - 添加题目到考试
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
    const { questionIds } = await request.json()

    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json({ error: "Missing questionIds" }, { status: 400 })
    }

    // 检查考试是否存在
    const exam = await prisma.exam.findUnique({
      where: { id }
    })

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    // 检查题目是否存在
    const questions = await prisma.question.findMany({
      where: {
        id: {
          in: questionIds
        }
      }
    })

    if (questions.length !== questionIds.length) {
      return NextResponse.json({ error: "Some questions not found" }, { status: 404 })
    }

    // 创建新的题目副本并关联到当前考试
    const newQuestions = await Promise.all(
      questions.map(question =>
        prisma.question.create({
          data: {
            type: question.type,
            title: question.title,
            options: question.options,
            answer: question.answer,
            points: question.points,
            examId: id
          }
        })
      )
    )

    return NextResponse.json({
      message: "Questions added successfully",
      questions: newQuestions
    })
  } catch (error) {
    console.error("Error adding questions to exam:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
