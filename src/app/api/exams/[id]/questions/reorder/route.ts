import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PUT /api/exams/[id]/questions/reorder - 更新题目顺序
export async function PUT(
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

    if (!questionIds || !Array.isArray(questionIds)) {
      return NextResponse.json({ error: "Missing questionIds" }, { status: 400 })
    }

    // 检查考试是否存在
    const exam = await prisma.exam.findUnique({
      where: { id }
    })

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    // 由于当前schema没有order字段，我们使用一个简单的方法：
    // 通过删除和重新创建题目来保持顺序
    // 这不是最优解，但可以工作
    
    // 获取所有题目数据
    const questions = await prisma.question.findMany({
      where: { examId: id },
      orderBy: { createdAt: 'asc' }
    })
    
    // 按照新的顺序重新排列题目
    const reorderedQuestions = questionIds.map(id => 
      questions.find(q => q.id === id)
    ).filter(Boolean)
    
    // 删除所有题目
    await prisma.question.deleteMany({
      where: { examId: id }
    })
    
    // 按照新顺序重新创建题目
    for (let i = 0; i < reorderedQuestions.length; i++) {
      const question = reorderedQuestions[i]
      await prisma.question.create({
        data: {
          examId: question.examId,
          type: question.type,
          title: question.title,
          options: question.options,
          answer: question.answer,
          points: question.points,
        }
      })
    }

    return NextResponse.json({
      message: "Questions reordered successfully",
      questionIds
    })
  } catch (error) {
    console.error("Error reordering questions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

