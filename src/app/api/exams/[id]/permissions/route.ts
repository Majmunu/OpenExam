import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/exams/[id]/permissions - 获取试卷权限
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const permissions = await prisma.examPermission.findMany({
      where: { examId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(permissions)
  } catch (error) {
    console.error("Error fetching exam permissions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/exams/[id]/permissions - 添加试卷权限
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
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // 检查权限是否已存在
    const existingPermission = await prisma.examPermission.findUnique({
      where: {
        examId_userId: {
          examId: id,
          userId
        }
      }
    })

    if (existingPermission) {
      return NextResponse.json({ error: "Permission already exists" }, { status: 400 })
    }

    const permission = await prisma.examPermission.create({
      data: {
        examId: id,
        userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(permission, { status: 201 })
  } catch (error) {
    console.error("Error creating exam permission:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/exams/[id]/permissions - 删除试卷权限
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
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    await prisma.examPermission.delete({
      where: {
        examId_userId: {
          examId: id,
          userId
        }
      }
    })

    return NextResponse.json({ message: "Permission deleted successfully" })
  } catch (error) {
    console.error("Error deleting exam permission:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
