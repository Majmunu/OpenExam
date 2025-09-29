import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/announcements/[id]/read - 标记公告为已读
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // 检查公告是否存在
    const announcement = await prisma.announcement.findUnique({
      where: { id }
    })

    if (!announcement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 })
    }

    // 创建或更新阅读记录
    await prisma.announcementRead.upsert({
      where: {
        announcementId_userId: {
          announcementId: id,
          userId: session.user.id
        }
      },
      update: {
        readAt: new Date()
      },
      create: {
        announcementId: id,
        userId: session.user.id,
        readAt: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking announcement as read:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
