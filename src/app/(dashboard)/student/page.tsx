"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

interface Exam {
  id: string
  title: string
  description: string | null
  startTime: string
  endTime: string
  _count: {
    questions: number
  }
}

export default function StudentDashboard() {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      const response = await fetch("/api/exams")
      const data = await response.json()
      setExams(data)
    } catch (error) {
      console.error("Error fetching exams:", error)
    } finally {
      setLoading(false)
    }
  }

  const getExamStatus = (startTime: string, endTime: string) => {
    const now = new Date()
    const start = new Date(startTime)
    const end = new Date(endTime)

    if (now < start) {
      return {
        label: "未开始",
        variant: "secondary" as const,
        icon: Clock,
        color: "text-gray-500"
      }
    } else if (now > end) {
      return {
        label: "已结束",
        variant: "destructive" as const,
        icon: AlertCircle,
        color: "text-red-500"
      }
    } else {
      return {
        label: "进行中",
        variant: "default" as const,
        icon: CheckCircle,
        color: "text-green-500"
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const availableExams = exams.filter(exam => {
    const now = new Date()
    const start = new Date(exam.startTime)
    const end = new Date(exam.endTime)
    return start <= now && end >= now
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">欢迎参加考试</h1>
        <p className="text-gray-600">选择您要参加的考试</p>
      </div>

      {availableExams.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无可用考试</h3>
            <p className="text-gray-500">当前没有可参加的考试，请稍后再试。</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableExams.map((exam) => {
            const status = getExamStatus(exam.startTime, exam.endTime)
            const StatusIcon = status.icon

            return (
              <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{exam.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {exam.description || "暂无描述"}
                      </CardDescription>
                    </div>
                    <Badge variant={status.variant}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>开始时间：{new Date(exam.startTime).toLocaleString("zh-CN")}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="h-4 w-4" />
                        <span>结束时间：{new Date(exam.endTime).toLocaleString("zh-CN")}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {exam._count.questions} 道题目
                      </span>

                      <Button asChild>
                        <Link href={`/student/exams/${exam.id}`}>
                          开始考试
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {exams.length > availableExams.length && (
        <Card>
          <CardHeader>
            <CardTitle>其他考试</CardTitle>
            <CardDescription>
              已结束或未开始的考试
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exams.filter(exam => {
                const now = new Date()
                const start = new Date(exam.startTime)
                const end = new Date(exam.endTime)
                return start > now || end < now
              }).map((exam) => {
                const status = getExamStatus(exam.startTime, exam.endTime)
                const StatusIcon = status.icon

                return (
                  <div key={exam.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <StatusIcon className={`h-5 w-5 ${status.color}`} />
                      <div>
                        <h4 className="font-medium">{exam.title}</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(exam.startTime).toLocaleDateString("zh-CN")} - {new Date(exam.endTime).toLocaleDateString("zh-CN")}
                        </p>
                      </div>
                    </div>
                    <Badge variant={status.variant}>
                      {status.label}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
