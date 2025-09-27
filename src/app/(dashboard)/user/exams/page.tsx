"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { BookOpen, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

interface Exam {
  id: string
  title: string
  description: string | null
  startTime: string
  endTime: string
  isPublic: boolean
  _count: {
    questions: number
  }
}

export default function UserExamsPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      const response = await fetch("/api/exams")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log("Fetched exams data:", data)

      if (Array.isArray(data)) {
        setExams(data)
      } else {
        console.error("API returned non-array data:", data)
        setExams([])
      }
    } catch (error) {
      console.error("Error fetching exams:", error)
      setError(error instanceof Error ? error.message : "Unknown error")
      setExams([])
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
        icon: XCircle,
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">我的考试</h1>
          <p className="text-gray-600">查看可参加的考试</p>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">我的考试</h1>
          <p className="text-gray-600">查看可参加的考试</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <Button onClick={fetchExams}>重试</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">我的考试</h1>
        <p className="text-gray-600">查看可参加的考试</p>
      </div>

      {exams.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无考试</h3>
              <p className="text-gray-500">当前没有可参加的考试</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => {
            const status = getExamStatus(exam.startTime, exam.endTime)
            const StatusIcon = status.icon

            return (
              <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{exam.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {exam.description || "无描述"}
                      </CardDescription>
                    </div>
                    <Badge variant={status.variant}>
                      {status.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>开始: {format(new Date(exam.startTime), "MM-dd HH:mm")}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>结束: {format(new Date(exam.endTime), "MM-dd HH:mm")}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <BookOpen className="h-4 w-4 mr-2" />
                      <span>题目数量: {exam._count.questions}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {exam.isPublic ? "公开考试" : "私有考试"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    {status.label === "进行中" ? (
                      <Button asChild className="w-full">
                        <Link href={`/user/exams/${exam.id}`}>
                          开始考试
                        </Link>
                      </Button>
                    ) : status.label === "未开始" ? (
                      <Button variant="outline" className="w-full" disabled>
                        等待开始
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        考试已结束
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
