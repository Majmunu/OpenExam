"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, FileText, Clock } from "lucide-react"

interface DashboardStats {
  totalExams: number
  totalQuestions: number
  totalUsers: number
  activeExams: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalExams: 0,
    totalQuestions: 0,
    totalUsers: 0,
    activeExams: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [examsRes, questionsRes, usersRes] = await Promise.all([
          fetch("/api/exams"),
          fetch("/api/questions"),
          fetch("/api/users"),
        ])

        const exams = await examsRes.json()
        const questions = await questionsRes.json()
        const users = await usersRes.json()

        const now = new Date()
        const activeExams = exams.filter((exam: any) => {
          const startTime = new Date(exam.startTime)
          const endTime = new Date(exam.endTime)
          return startTime <= now && endTime >= now
        }).length

        setStats({
          totalExams: exams.length,
          totalQuestions: questions.length,
          totalUsers: users.length,
          activeExams,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">管理员仪表板</h1>
        <p className="text-gray-600">欢迎来到考试管理系统后台</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总考试数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExams}</div>
            <p className="text-xs text-muted-foreground">
              系统中所有考试
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总题目数</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuestions}</div>
            <p className="text-xs text-muted-foreground">
              所有考试中的题目
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总用户数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              注册用户总数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">进行中考试</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeExams}</div>
            <p className="text-xs text-muted-foreground">
              当前可参加的考试
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
            <CardDescription>
              常用的管理操作
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <a
                href="/admin/exams"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="h-6 w-6 mb-2" />
                <h3 className="font-medium">考试管理</h3>
                <p className="text-sm text-gray-600">创建和管理考试</p>
              </a>

              <a
                href="/admin/questions"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BookOpen className="h-6 w-6 mb-2" />
                <h3 className="font-medium">题目管理</h3>
                <p className="text-sm text-gray-600">添加和编辑题目</p>
              </a>

              <a
                href="/admin/users"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="h-6 w-6 mb-2" />
                <h3 className="font-medium">用户管理</h3>
                <p className="text-sm text-gray-600">管理用户账号</p>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>系统状态</CardTitle>
            <CardDescription>
              当前系统运行状态
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">数据库连接</span>
                <Badge variant="default">正常</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">认证系统</span>
                <Badge variant="default">正常</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API服务</span>
                <Badge variant="default">正常</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
