import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/grade-stats - 获取成绩统计数据
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 获取所有答案和相关信息
    const answers = await prisma.answer.findMany({
      include: {
        question: {
          select: {
            examId: true,
            points: true,
            exam: {
              select: {
                title: true
              }
            }
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // 按考试分组统计成绩
    const examGradeStats = new Map<string, {
      examTitle: string,
      totalAnswers: number,
      totalScore: number,
      maxScore: number,
      averageScore: number,
      passRate: number,
      gradeDistribution: { grade: string, count: number }[]
    }>()

    // 按用户分组统计成绩
    const userGradeStats = new Map<string, {
      userName: string,
      userEmail: string,
      totalExams: number,
      totalScore: number,
      maxScore: number,
      averageScore: number,
      passRate: number
    }>()

    // 处理答案数据
    answers.forEach(answer => {
      const examId = answer.question.examId
      const examTitle = answer.question.exam.title
      const userId = answer.userId
      const userName = answer.user.name
      const userEmail = answer.user.email
      const score = answer.score || 0
      const maxScore = answer.question.points

      // 考试统计
      if (!examGradeStats.has(examId)) {
        examGradeStats.set(examId, {
          examTitle,
          totalAnswers: 0,
          totalScore: 0,
          maxScore: 0,
          averageScore: 0,
          passRate: 0,
          gradeDistribution: [
            { grade: '优秀(90-100)', count: 0 },
            { grade: '良好(80-89)', count: 0 },
            { grade: '中等(70-79)', count: 0 },
            { grade: '及格(60-69)', count: 0 },
            { grade: '不及格(0-59)', count: 0 }
          ]
        })
      }

      const examStats = examGradeStats.get(examId)!
      examStats.totalAnswers++
      examStats.totalScore += score
      examStats.maxScore += maxScore

      // 成绩分布统计
      const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0
      if (percentage >= 90) {
        examStats.gradeDistribution[0].count++
      } else if (percentage >= 80) {
        examStats.gradeDistribution[1].count++
      } else if (percentage >= 70) {
        examStats.gradeDistribution[2].count++
      } else if (percentage >= 60) {
        examStats.gradeDistribution[3].count++
      } else {
        examStats.gradeDistribution[4].count++
      }

      // 用户统计
      if (!userGradeStats.has(userId)) {
        userGradeStats.set(userId, {
          userName,
          userEmail,
          totalExams: 0,
          totalScore: 0,
          maxScore: 0,
          averageScore: 0,
          passRate: 0
        })
      }

      const userStats = userGradeStats.get(userId)!
      userStats.totalExams++
      userStats.totalScore += score
      userStats.maxScore += maxScore
    })

    // 计算平均分和及格率
    examGradeStats.forEach((stats, examId) => {
      stats.averageScore = stats.totalAnswers > 0 ? stats.totalScore / stats.totalAnswers : 0
      const passCount = stats.gradeDistribution.slice(0, 4).reduce((sum, grade) => sum + grade.count, 0)
      stats.passRate = stats.totalAnswers > 0 ? (passCount / stats.totalAnswers) * 100 : 0
    })

    userGradeStats.forEach((stats, userId) => {
      stats.averageScore = stats.totalExams > 0 ? stats.totalScore / stats.totalExams : 0
      const passCount = stats.totalScore >= stats.maxScore * 0.6 ? 1 : 0
      stats.passRate = stats.totalExams > 0 ? (passCount / stats.totalExams) * 100 : 0
    })

    // 生成图表数据
    const examGradeChartData = Array.from(examGradeStats.values()).slice(0, 5).map(stats => ({
      name: stats.examTitle.length > 10 ? stats.examTitle.substring(0, 10) + '...' : stats.examTitle,
      averageScore: Math.round(stats.averageScore * 10) / 10,
      passRate: Math.round(stats.passRate * 10) / 10,
      totalAnswers: stats.totalAnswers
    }))

    const userGradeChartData = Array.from(userGradeStats.values()).slice(0, 5).map(stats => ({
      name: stats.userName,
      averageScore: Math.round(stats.averageScore * 10) / 10,
      passRate: Math.round(stats.passRate * 10) / 10,
      totalExams: stats.totalExams
    }))

    // 整体成绩分布
    const overallGradeDistribution = [
      { grade: '优秀', count: 0, color: '#10b981' },
      { grade: '良好', count: 0, color: '#3b82f6' },
      { grade: '中等', count: 0, color: '#f59e0b' },
      { grade: '及格', count: 0, color: '#ef4444' },
      { grade: '不及格', count: 0, color: '#6b7280' }
    ]

    // 统计整体成绩分布
    answers.forEach(answer => {
      const maxScore = answer.question.points
      const score = answer.score || 0
      const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0

      if (percentage >= 90) {
        overallGradeDistribution[0].count++
      } else if (percentage >= 80) {
        overallGradeDistribution[1].count++
      } else if (percentage >= 70) {
        overallGradeDistribution[2].count++
      } else if (percentage >= 60) {
        overallGradeDistribution[3].count++
      } else {
        overallGradeDistribution[4].count++
      }
    })

    // 成绩趋势数据（最近7天）
    const gradeTrendData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      // 统计当天的成绩数据
      const dayAnswers = answers.filter(answer => {
        const answerDate = new Date(answer.createdAt).toISOString().split('T')[0]
        return answerDate === dateStr
      })

      const dayAverageScore = dayAnswers.length > 0
        ? dayAnswers.reduce((sum, answer) => sum + (answer.score || 0), 0) / dayAnswers.length
        : 0

      const dayPassCount = dayAnswers.filter(answer => {
        const maxScore = answer.question.points
        const score = answer.score || 0
        return maxScore > 0 && (score / maxScore) >= 0.6
      }).length

      const dayPassRate = dayAnswers.length > 0 ? (dayPassCount / dayAnswers.length) * 100 : 0

      gradeTrendData.push({
        date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        averageScore: Math.round(dayAverageScore * 10) / 10,
        passRate: Math.round(dayPassRate * 10) / 10,
        submissions: dayAnswers.length
      })
    }

    return NextResponse.json({
      examGradeChartData,
      userGradeChartData,
      overallGradeDistribution,
      gradeTrendData,
      summary: {
        totalAnswers: answers.length,
        totalExams: examGradeStats.size,
        totalUsers: userGradeStats.size,
        overallAverageScore: answers.length > 0
          ? Math.round((answers.reduce((sum, answer) => sum + (answer.score || 0), 0) / answers.length) * 10) / 10
          : 0,
        overallPassRate: answers.length > 0
          ? Math.round((answers.filter(answer => {
            const maxScore = answer.question.points
            const score = answer.score || 0
            return maxScore > 0 && (score / maxScore) >= 0.6
          }).length / answers.length) * 100 * 10) / 10
          : 0
      }
    })

  } catch (error) {
    console.error("Error fetching grade stats:", error)
    return NextResponse.json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
