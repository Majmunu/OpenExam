import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/exams - 获取考试列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")

    let exams
    if (role === "admin") {
      // 管理员可以看到所有考试
      exams = await prisma.exam.findMany({
        include: {
          questions: {
            select: {
              id: true,
              type: true,
              title: true,
              points: true,
            }
          },
          permissions: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          _count: {
            select: {
              questions: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      })
    } else {
      // 用户只能看到有权限的考试
      const now = new Date()
      exams = await prisma.exam.findMany({
        where: {
          OR: [
            { isPublic: true }, // 公开考试
            {
              permissions: {
                some: {
                  userId: session.user.id
                }
              }
            }
          ],
          startTime: {
            lte: now
          },
          endTime: {
            gte: now
          }
        },
        include: {
          _count: {
            select: {
              questions: true
            }
          }
        },
        orderBy: {
          startTime: "asc"
        }
      })
    }

    console.log("Returning exams:", exams.length, "exams")
    return NextResponse.json(exams)
  } catch (error) {
    console.error("Error fetching exams:", error)
    return NextResponse.json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// POST /api/exams - 创建新考试（仅管理员）
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, startTime, endTime, duration, isPublic, passingScore, passingCriteria } = await request.json()

    if (!title || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const exam = await prisma.exam.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        duration,
        isPublic: isPublic || false,
        passingScore: passingScore || 60,
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

    return NextResponse.json(exam, { status: 201 })
  } catch (error) {
    console.error("Error creating exam:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
