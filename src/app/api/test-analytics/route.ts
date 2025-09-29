import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // 检查各个表的数据
    const userCount = await prisma.user.count()
    const examCount = await prisma.exam.count()
    const questionCount = await prisma.question.count()
    const answerCount = await prisma.answer.count()
    const loginLogCount = await prisma.loginLog.count()
    const answerLogCount = await prisma.answerLog.count()

    // 获取一些示例数据
    const users = await prisma.user.findMany({ take: 3 })
    const exams = await prisma.exam.findMany({ take: 3 })
    const answers = await prisma.answer.findMany({ take: 3 })

    return NextResponse.json({
      success: true,
      data: {
        counts: {
          users: userCount,
          exams: examCount,
          questions: questionCount,
          answers: answerCount,
          loginLogs: loginLogCount,
          answerLogs: answerLogCount
        },
        samples: {
          users: users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })),
          exams: exams.map(e => ({ id: e.id, title: e.title, passingScore: e.passingScore })),
          answers: answers.map(a => ({ id: a.id, userId: a.userId, questionId: a.questionId, score: a.score }))
        }
      }
    })
  } catch (error) {
    console.error("Test analytics error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "未知错误"
    }, { status: 500 })
  }
}
