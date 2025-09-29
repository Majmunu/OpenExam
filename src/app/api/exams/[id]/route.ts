import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/exams/[id] - 获取单个考试详情
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
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    })

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    // 如果是用户，检查考试时间
    if (session.user.role === "USER") {
      const now = new Date()
      if (now < exam.startTime || now > exam.endTime) {
        return NextResponse.json({ error: "Exam not available" }, { status: 403 })
      }
    }

    return NextResponse.json(exam)
  } catch (error) {
    console.error("Error fetching exam:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/exams/[id] - 更新考试（仅管理员）
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
    const { title, description, startTime, endTime, duration, passingScore, passingCriteria } = await request.json()

    const exam = await prisma.exam.update({
      where: { id },
      data: {
        title,
        description,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        duration: duration ? parseInt(duration) : undefined,
        passingScore: passingScore !== undefined ? parseInt(passingScore) : undefined,
        passingCriteria,
      },
      include: {
        _count: {
          select: {
            questions: true
          }
        }
      }
    })

    return NextResponse.json(exam)
  } catch (error) {
    console.error("Error updating exam:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/exams/[id] - 删除考试（仅管理员）
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
    await prisma.exam.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Exam deleted successfully" })
  } catch (error) {
    console.error("Error deleting exam:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
