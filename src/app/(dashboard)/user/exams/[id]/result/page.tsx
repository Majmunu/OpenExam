"use client"

import { useEffect, useState, use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, XCircle, Home } from "lucide-react"
import Link from "next/link"

interface AnswerDetail {
  questionId: string
  questionTitle: string
  questionType: string
  userAnswer: string
  correctAnswer: string
  score: number
  maxScore: number
  isCorrect: boolean
}

interface ExamResult {
  examTitle: string
  totalScore: number
  maxScore: number
  scorePercentage: number
  submittedAt: string
  answers: AnswerDetail[]
}

export default function ExamResultPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const [result, setResult] = useState<ExamResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [rescoring, setRescoring] = useState(false)

  useEffect(() => {
    fetchResult()
  }, [resolvedParams.id])

  const fetchResult = async () => {
    try {
      const response = await fetch(`/api/scoring?examId=${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setResult({
          examTitle: data.answers[0]?.questionTitle || "考试",
          totalScore: data.totalScore,
          maxScore: data.maxScore,
          scorePercentage: data.scorePercentage,
          submittedAt: new Date().toISOString(),
          answers: data.answers.map((answer: any) => ({
            questionId: answer.questionId,
            questionTitle: answer.questionTitle,
            questionType: answer.questionType,
            userAnswer: answer.userAnswer,
            correctAnswer: answer.correctAnswer,
            score: answer.score,
            maxScore: answer.maxScore,
            isCorrect: answer.isCorrect
          }))
        })
      } else {
        console.error("Failed to fetch result")
      }
    } catch (error) {
      console.error("Error fetching result:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRescore = async () => {
    setRescoring(true)
    try {
      const response = await fetch('/api/rescore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ examId: resolvedParams.id }),
      })

      if (response.ok) {
        // 重新获取结果
        await fetchResult()
        alert('重新判分完成！')
      } else {
        alert('重新判分失败')
      }
    } catch (error) {
      console.error('Error rescoring:', error)
      alert('重新判分失败')
    } finally {
      setRescoring(false)
    }
  }

  const getQuestionTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      SINGLE_CHOICE: "单选题",
      MULTIPLE_CHOICE: "多选题",
      SHORT_ANSWER: "简答题",
      FILL_BLANK: "填空题",
    }
    return typeMap[type] || type
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">未找到考试结果</p>
        <Button asChild className="mt-4">
          <Link href="/user">返回首页</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/user">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">考试结果</h1>
          <p className="text-gray-600">查看您的考试成绩</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>考试信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">考试名称</label>
                <p className="text-sm">{result.examTitle}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">提交时间</label>
                <p className="text-sm">{new Date(result.submittedAt).toLocaleString("zh-CN")}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>答题详情</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {result.answers.map((answer, index) => (
                  <div key={answer.questionId} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-lg">
                          第 {index + 1} 题
                          <Badge variant="outline" className="ml-2">
                            {getQuestionTypeLabel(answer.questionType)}
                          </Badge>
                        </h4>
                        <p className="text-gray-700 mt-2">{answer.questionTitle}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {answer.isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className={`font-medium ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          {answer.score}/{answer.maxScore}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">您的答案</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded border">
                          <p className="text-sm">{answer.userAnswer || "未作答"}</p>
                        </div>
                      </div>

                      {answer.questionType !== "SHORT_ANSWER" && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">正确答案</label>
                          <div className="mt-1 p-3 bg-green-50 rounded border border-green-200">
                            <p className="text-sm text-green-800">{answer.correctAnswer}</p>
                          </div>
                        </div>
                      )}
                      {answer.questionType === "SHORT_ANSWER" && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">参考答案</label>
                          <div className="mt-1 p-3 bg-blue-50 rounded border border-blue-200">
                            <p className="text-sm text-blue-800">
                              简答题没有标准答案，请根据您的理解作答。
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>成绩统计</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">总分</label>
                <p className="text-2xl font-bold">
                  <span className={getScoreColor(result.scorePercentage)}>
                    {result.totalScore} / {result.maxScore}
                  </span>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">得分率</label>
                <p className="text-2xl font-bold">
                  <span className={getScoreColor(result.scorePercentage)}>
                    {result.scorePercentage}%
                  </span>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">正确题数</label>
                <p className="text-lg">
                  {result.answers.filter(a => a.isCorrect).length} / {result.answers.length}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">考试状态</label>
                <div className="mt-1">
                  <Badge variant={result.scorePercentage >= 60 ? "default" : "destructive"}>
                    {result.scorePercentage >= 60 ? "通过" : "未通过"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button
                  onClick={handleRescore}
                  disabled={rescoring}
                  className="w-full"
                  variant="outline"
                >
                  {rescoring ? "重新判分中..." : "重新判分"}
                </Button>

                <Button asChild className="w-full">
                  <Link href="/user">
                    <Home className="h-4 w-4 mr-2" />
                    返回首页
                  </Link>
                </Button>

                <Button variant="outline" asChild className="w-full">
                  <Link href="/user/history">
                    查看历史记录
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
