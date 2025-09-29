import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // 简单测试数据库连接
    const userCount = await prisma.user.count()

    // 测试是否存在announcements表
    let announcementCount = 0
    try {
      announcementCount = await prisma.announcement.count()
    } catch (e) {
      console.log("Announcement table does not exist:", e)
      return NextResponse.json({
        success: true,
        message: "数据库连接正常，但公告表不存在",
        data: {
          userCount,
          announcementCount: 0,
          hasAnnouncementTable: false,
          error: e instanceof Error ? e.message : "未知错误"
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: "数据库连接正常，公告表存在",
      data: {
        userCount,
        announcementCount,
        hasAnnouncementTable: true
      }
    })
  } catch (error) {
    console.error("Test announcements error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
      details: error
    }, { status: 500 })
  }
}
