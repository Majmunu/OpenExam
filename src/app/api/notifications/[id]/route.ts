import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PUT /api/notifications/[id] - 更新通知（标记为已读）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const notification = await prisma.notification.update({
      where: {
        id,
        userId: session.user.id // 确保只能更新自己的通知
      },
      data: {
        isRead: body.isRead ?? true,
        readAt: body.isRead ? new Date() : null
      }
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/notifications/[id] - 删除通知
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await prisma.notification.delete({
      where: {
        id,
        userId: session.user.id // 确保只能删除自己的通知
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
