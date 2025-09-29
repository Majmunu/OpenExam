"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Users, FileText, TrendingUp } from "lucide-react"
import Link from "next/link"

interface ExamResult {
  examId: string
  examTitle: string
  userId: string
  userName: string
  userEmail: string
  totalScore: number
  maxScore: number
  correctCount: number
  totalQuestions: number
  scorePercentage: number
  submittedAt: string
}

interface Exam {
  id: string
  title: string
}

export default function ResultsPage() {
  const [results, setResults] = useState<ExamResult[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [selectedExamId, setSelectedExamId] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExams()
    fetchResults()
  }, [])

  useEffect(() => {
    if (selectedExamId && selectedExamId !== "all") {
      fetchResults(selectedExamId)
    } else {
      fetchResults()
    }
  }, [selectedExamId])

  const fetchExams = async () => {
    try {
      const response = await fetch("/api/exams?role=admin")
      const data = await response.json()
      setExams(data)
    } catch (error) {
      console.error("Error fetching exams:", error)
    }
  }

  const fetchResults = async (examId?: string) => {
    try {
      const url = examId && examId !== "all" ? `/api/results?examId=${examId}` : "/api/results"
      const response = await fetch(url)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Error fetching results:", error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (percentage: number) => {
    if (percentage >= 80) return "default" as const
    if (percentage >= 60) return "secondary" as const
    return "destructive" as const
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">成绩管理</h1>
          <p className="text-gray-600">查看所有用户的考试成绩</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总考试次数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.length}</div>
            <p className="text-xs text-muted-foreground">
              所有提交的考试
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">参与用户</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(results.map(r => r.userId)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              参与考试的用户数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均分</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {results.length > 0
                ? Math.round(results.reduce((sum, r) => sum + r.scorePercentage, 0) / results.length * 10) / 10
                : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">
              所有考试的平均分
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>考试成绩</CardTitle>
              <CardDescription>
                所有用户的考试成绩列表
              </CardDescription>
            </div>
            <Select value={selectedExamId} onValueChange={setSelectedExamId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="选择考试筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有考试</SelectItem>
                {exams.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id}>
                    {exam.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">暂无考试记录</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户</TableHead>
                  <TableHead>考试</TableHead>
                  <TableHead>得分</TableHead>
                  <TableHead>正确率</TableHead>
                  <TableHead>提交时间</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={`${result.examId}-${result.userId}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{result.userName}</div>
                        <div className="text-sm text-gray-500">{result.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{result.examTitle}</TableCell>
                    <TableCell>
                      <span className={getScoreColor(result.scorePercentage)}>
                        {result.totalScore} / {result.maxScore}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getScoreBadgeVariant(result.scorePercentage)}>
                        {result.scorePercentage}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(result.submittedAt).toLocaleString("zh-CN")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={result.scorePercentage >= 60 ? "default" : "destructive"}>
                        {result.scorePercentage >= 60 ? "通过" : "未通过"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/results/${result.examId}/${result.userId}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          查看详情
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
