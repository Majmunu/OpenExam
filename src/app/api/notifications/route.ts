import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/notifications - 获取用户通知
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const isRead = searchParams.get("isRead")
    const type = searchParams.get("type")

    const where: any = {
      userId: session.user.id
    }

    if (isRead !== null) {
      where.isRead = isRead === "true"
    }

    if (type) {
      where.type = type
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId: session.user.id,
          isRead: false
        }
      })
    ])

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/notifications - 创建通知
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      content,
      type = "info",
      isImportant = false,
      userId,
      relatedId,
      relatedType
    } = body

    const notification = await prisma.notification.create({
      data: {
        title,
        content,
        type,
        isImportant,
        userId,
        relatedId,
        relatedType
      }
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
