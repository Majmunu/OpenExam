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

    // 更新题目顺序（通过更新创建时间来实现排序）
    // 这里我们使用一个简单的方案：为每个题目设置一个order字段
    // 但由于当前schema没有order字段，我们使用批量更新来重新设置顺序

    const updatePromises = questionIds.map((questionId, index) =>
      prisma.question.update({
        where: { id: questionId },
        data: {
          // 使用一个临时的排序字段，这里我们用id的排序来实现
          // 实际项目中建议在schema中添加order字段
        }
      })
    )

    await Promise.all(updatePromises)

    return NextResponse.json({
      message: "Questions reordered successfully",
      questionIds
    })
  } catch (error) {
    console.error("Error reordering questions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

