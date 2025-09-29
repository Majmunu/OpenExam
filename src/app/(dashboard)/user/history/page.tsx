"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

interface ExamResult {
  examId: string
  examTitle: string
  totalScore: number
  maxScore: number
  correctCount: number
  totalQuestions: number
  scorePercentage: number
  submittedAt: string
}

export default function HistoryPage() {
  const [results, setResults] = useState<ExamResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      // 获取所有考试
      const examsResponse = await fetch("/api/exams")

      if (!examsResponse.ok) {
        throw new Error(`Failed to fetch exams: ${examsResponse.statusText}`)
      }

      const examsData = await examsResponse.json()
      const exams = Array.isArray(examsData) ? examsData : []

      // 获取所有答案
      const answersResponse = await fetch("/api/answers")

      if (!answersResponse.ok) {
        throw new Error(`Failed to fetch answers: ${answersResponse.statusText}`)
      }

      const answersData = await answersResponse.json()

      // 确保answers是数组
      const answers = Array.isArray(answersData) ? answersData : []

      console.log("Answers data:", answersData) // 调试日志

      // 按考试分组计算成绩
      const examResults: Record<string, ExamResult> = {}

      if (Array.isArray(answers)) {
        answers.forEach((answer: any) => {
          const examId = answer.question.exam.id
          const examTitle = answer.question.exam.title

          if (!examResults[examId]) {
            examResults[examId] = {
              examId,
              examTitle,
              totalScore: 0,
              maxScore: 0,
              correctCount: 0,
              totalQuestions: 0,
              scorePercentage: 0,
              submittedAt: answer.updatedAt
            }
          }

          examResults[examId].totalScore += answer.score || 0
          examResults[examId].maxScore += answer.question.points
          examResults[examId].totalQuestions += 1
          if (answer.score === answer.question.points) {
            examResults[examId].correctCount += 1
          }
        })
      }

      // 计算百分比
      Object.values(examResults).forEach(result => {
        result.scorePercentage = result.maxScore > 0
          ? Math.round((result.totalScore / result.maxScore) * 100 * 100) / 100
          : 0
      })

      setResults(Object.values(examResults))
    } catch (error) {
      console.error("Error fetching history:", error)
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">考试记录</h1>
        <p className="text-gray-600">查看您的考试历史和成绩</p>
      </div>

      {results.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无考试记录</h3>
            <p className="text-gray-500">您还没有参加过任何考试。</p>
            <Button asChild className="mt-4">
              <Link href="/user">去参加考试</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>考试历史</CardTitle>
            <CardDescription>
              您参加过的所有考试记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>考试名称</TableHead>
                  <TableHead>得分</TableHead>
                  <TableHead>正确率</TableHead>
                  <TableHead>提交时间</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.examId}>
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
                      <div className="flex items-center space-x-1">
                        {result.scorePercentage >= 60 ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-green-600">通过</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span className="text-red-600">未通过</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/user/exams/${result.examId}/result`}>
                          <Eye className="h-4 w-4 mr-2" />
                          查看详情
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
