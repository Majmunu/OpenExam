import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/announcements - 获取公告列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 检查公告表是否存在
    try {
      await prisma.announcement.count()
    } catch (error) {
      // 如果表不存在，直接返回空数据
      console.log("Announcement table does not exist, returning empty data")
      return NextResponse.json({
        announcements: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        }
      })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const type = searchParams.get("type")
    const isActive = searchParams.get("isActive")

    const where: any = {}

    // 根据用户角色过滤公告
    if (session.user.role === "USER") {
      where.OR = [
        { targetRole: "ALL" },
        { targetRole: "USER" },
        { targetUsers: { contains: session.user.id } }
      ]
    }

    if (type) {
      where.type = type
    }

    if (isActive !== null) {
      where.isActive = isActive === "true"
    }

    // 时间过滤
    const now = new Date()
    where.OR = [
      { startTime: null },
      { startTime: { lte: now } }
    ]
    where.AND = [
      { OR: [{ endTime: null }, { endTime: { gte: now } }] }
    ]

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          reads: {
            where: {
              userId: session.user.id
            }
          },
          _count: {
            select: {
              reads: true
            }
          }
        },
        orderBy: [
          { isPinned: "desc" },
          { priority: "desc" },
          { createdAt: "desc" }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.announcement.count({ where })
    ])

    return NextResponse.json({
      announcements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching announcements:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

// POST /api/announcements - 创建公告
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 检查公告表是否存在
    try {
      await prisma.announcement.count()
    } catch (error) {
      // 如果表不存在，返回友好错误
      console.log("Announcement table does not exist, cannot create announcement")
      return NextResponse.json({ 
        error: "公告功能暂未启用，请联系管理员" 
      }, { status: 503 })
    }

    const body = await request.json()
    const {
      title,
      content,
      type = "info",
      priority = 1,
      isActive = true,
      isPinned = false,
      startTime,
      endTime,
      targetRole = "ALL",
      targetUsers
    } = body

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        type,
        priority,
        isActive,
        isPinned,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        targetRole,
        targetUsers: targetUsers ? JSON.stringify(targetUsers) : null,
        createdBy: session.user.id
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(announcement)
  } catch (error) {
    console.error("Error creating announcement:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
