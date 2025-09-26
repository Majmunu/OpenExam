import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/questions/[id] - 获取单个题目
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true
          }
        }
      }
    })

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    // 如果是学生，检查考试时间
    if (session.user.role === "STUDENT") {
      const now = new Date()
      if (now < question.exam.startTime || now > question.exam.endTime) {
        return NextResponse.json({ error: "Exam not available" }, { status: 403 })
      }
    }

    return NextResponse.json(question)
  } catch (error) {
    console.error("Error fetching question:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/questions/[id] - 更新题目（仅管理员）
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
    const { type, title, options, answer, points } = await request.json()

    const question = await prisma.question.update({
      where: { id },
      data: {
        type,
        title,
        options: options ? JSON.stringify(options) : null,
        answer,
        points,
      },
      include: {
        exam: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    return NextResponse.json(question)
  } catch (error) {
    console.error("Error updating question:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/questions/[id] - 删除题目（仅管理员）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await prisma.question.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Question deleted successfully" })
  } catch (error) {
    console.error("Error deleting question:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
