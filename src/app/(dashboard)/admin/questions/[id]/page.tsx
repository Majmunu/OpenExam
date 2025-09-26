"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface Question {
  id: string
  type: string
  title: string
  options: string | null
  answer: string
  points: number
  exam: {
    id: string
    title: string
  }
}

export default function QuestionDetailPage({ params }: { params: { id: string } }) {
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchQuestion()
  }, [params.id])

  const fetchQuestion = async () => {
    try {
      const response = await fetch(`/api/questions/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setQuestion(data)
      } else {
        router.push("/admin/questions")
      }
    } catch (error) {
      console.error("Error fetching question:", error)
      router.push("/admin/questions")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/questions/${params.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/admin/questions")
      } else {
        alert("删除失败")
      }
    } catch (error) {
      console.error("Error deleting question:", error)
      alert("删除失败")
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

  const getQuestionTypeVariant = (type: string) => {
    const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      SINGLE_CHOICE: "default",
      MULTIPLE_CHOICE: "secondary",
      SHORT_ANSWER: "destructive",
      FILL_BLANK: "outline",
    }
    return variantMap[type] || "default"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">题目不存在</p>
      </div>
    )
  }

  const options = question.options ? JSON.parse(question.options) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/questions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">题目详情</h1>
            <p className="text-gray-600">查看题目详细信息</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/questions/${question.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              编辑
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <Trash2 className="h-4 w-4 mr-2" />
                删除
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认删除</AlertDialogTitle>
                <AlertDialogDescription>
                  您确定要删除这道题目吗？此操作不可撤销。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  删除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">题目内容</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant={getQuestionTypeVariant(question.type)}>
                    {getQuestionTypeLabel(question.type)}
                  </Badge>
                  <Badge variant="outline">{question.points} 分</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-lg leading-relaxed">{question.title}</p>
              </div>
            </CardContent>
          </Card>

          {options.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>选项</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {options.map((option: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                      <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                      <span>{option}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>正确答案</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">{question.answer}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>题目信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">所属考试</label>
                <p className="text-sm">{question.exam.title}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">题目类型</label>
                <p className="text-sm">{getQuestionTypeLabel(question.type)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">分值</label>
                <p className="text-sm">{question.points} 分</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">选项数量</label>
                <p className="text-sm">{options.length} 个选项</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
