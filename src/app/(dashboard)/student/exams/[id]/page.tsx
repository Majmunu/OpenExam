"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, Save, CheckCircle } from "lucide-react"
import ExamForm from "@/components/ExamForm"

interface Exam {
  id: string
  title: string
  description: string | null
  startTime: string
  endTime: string
  questions: Question[]
}

interface Question {
  id: string
  type: string
  title: string
  options: string | null
  points: number
}

interface Answer {
  questionId: string
  response: string
}

export default function ExamPage({ params }: { params: { id: string } }) {
  const [exam, setExam] = useState<Exam | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const router = useRouter()

  useEffect(() => {
    fetchExam()
    fetchAnswers()
  }, [params.id])

  useEffect(() => {
    if (exam) {
      const timer = setInterval(() => {
        const now = new Date()
        const endTime = new Date(exam.endTime)
        const remaining = Math.max(0, endTime.getTime() - now.getTime())
        setTimeLeft(remaining)

        if (remaining === 0) {
          handleSubmit()
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [exam])

  const fetchExam = async () => {
    try {
      const response = await fetch(`/api/exams/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setExam(data)
      } else {
        router.push("/student")
      }
    } catch (error) {
      console.error("Error fetching exam:", error)
      router.push("/student")
    } finally {
      setLoading(false)
    }
  }

  const fetchAnswers = async () => {
    try {
      const response = await fetch(`/api/answers?examId=${params.id}`)
      if (response.ok) {
        const data = await response.json()
        const answerMap: Record<string, string> = {}
        data.forEach((answer: any) => {
          answerMap[answer.questionId] = answer.response
        })
        setAnswers(answerMap)
      }
    } catch (error) {
      console.error("Error fetching answers:", error)
    }
  }

  const handleAnswerChange = (questionId: string, response: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: response
    }))
  }

  const handleSave = async () => {
    setSubmitting(true)
    try {
      const promises = Object.entries(answers).map(([questionId, response]) =>
        fetch("/api/answers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ questionId, response }),
        })
      )

      await Promise.all(promises)
      alert("答案已保存")
    } catch (error) {
      console.error("Error saving answers:", error)
      alert("保存失败")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      // 先保存所有答案
      await handleSave()

      // 提交考试
      alert("考试已提交")
      router.push("/student")
    } catch (error) {
      console.error("Error submitting exam:", error)
      alert("提交失败")
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const answeredCount = Object.keys(answers).length
  const totalQuestions = exam?.questions.length || 0
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">考试不存在或已结束</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 考试头部信息 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{exam.title}</CardTitle>
              <CardDescription className="mt-2">
                {exam.description || "暂无描述"}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 text-lg font-medium">
                <Clock className="h-5 w-5" />
                <span className={timeLeft < 300000 ? "text-red-600" : ""}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">剩余时间</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">答题进度</span>
              <span className="text-sm text-gray-500">
                {answeredCount} / {totalQuestions}
              </span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* 题目列表 */}
      <div className="space-y-6">
        {exam.questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    第 {index + 1} 题
                    <Badge variant="outline" className="ml-2">
                      {question.points} 分
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-2 text-base">
                    {question.title}
                  </CardDescription>
                </div>
                {answers[question.id] && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ExamForm
                question={question}
                value={answers[question.id] || ""}
                onChange={(value) => handleAnswerChange(question.id, value)}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handleSave} disabled={submitting}>
          <Save className="h-4 w-4 mr-2" />
          {submitting ? "保存中..." : "保存草稿"}
        </Button>

        <Button onClick={handleSubmit} disabled={submitting}>
          <CheckCircle className="h-4 w-4 mr-2" />
          {submitting ? "提交中..." : "提交考试"}
        </Button>
      </div>
    </div>
  )
}
