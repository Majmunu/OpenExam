import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/questions - 获取题目列表（仅管理员）
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const examId = searchParams.get("examId")

    const questions = await prisma.question.findMany({
      where: examId ? { examId } : {},
      include: {
        exam: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    })

    return NextResponse.json(questions)
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/questions - 创建新题目（仅管理员）
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { examId, type, title, options, answer, points } = await request.json()

    if (!examId || !type || !title || !answer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const question = await prisma.question.create({
      data: {
        examId,
        type,
        title,
        options: options ? JSON.stringify(options) : null,
        answer,
        points: points || 1,
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

    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    console.error("Error creating question:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
