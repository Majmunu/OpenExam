"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Trash2, Plus, Eye } from "lucide-react"
import Link from "next/link"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface Exam {
  id: string
  title: string
  description: string | null
  startTime: string
  endTime: string
  duration: number | null
  questions: Array<{
    id: string
    type: string
    title: string
    points: number
  }>
}

export default function ExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [exam, setExam] = useState<Exam | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchExam()
  }, [resolvedParams.id])

  const fetchExam = async () => {
    try {
      const response = await fetch(`/api/exams/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setExam(data)
      } else {
        router.push("/admin/exams")
      }
    } catch (error) {
      console.error("Error fetching exam:", error)
      router.push("/admin/exams")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/exams/${resolvedParams.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/admin/exams")
      } else {
        alert("删除失败")
      }
    } catch (error) {
      console.error("Error deleting exam:", error)
      alert("删除失败")
    }
  }

  const getExamStatus = (startTime: string, endTime: string) => {
    const now = new Date()
    const start = new Date(startTime)
    const end = new Date(endTime)

    if (now < start) {
      return { label: "未开始", variant: "secondary" as const }
    } else if (now > end) {
      return { label: "已结束", variant: "destructive" as const }
    } else {
      return { label: "进行中", variant: "default" as const }
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
        <p className="text-gray-500">考试不存在</p>
      </div>
    )
  }

  const status = getExamStatus(exam.startTime, exam.endTime)
  const totalPoints = exam.questions.reduce((sum, q) => sum + q.points, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/exams">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{exam.title}</h1>
            <p className="text-gray-600">考试详情</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/exams/${exam.id}/edit`}>
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
                  您确定要删除考试 "{exam.title}" 吗？此操作不可撤销。
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
                <CardTitle>考试信息</CardTitle>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">考试描述</label>
                <p className="text-sm mt-1">{exam.description || "暂无描述"}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">开始时间</label>
                  <p className="text-sm mt-1">{new Date(exam.startTime).toLocaleString("zh-CN")}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">结束时间</label>
                  <p className="text-sm mt-1">{new Date(exam.endTime).toLocaleString("zh-CN")}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">考试时长</label>
                  <p className="text-sm mt-1">
                    {exam.duration
                      ? `${exam.duration} 分钟`
                      : `${Math.round((new Date(exam.endTime).getTime() - new Date(exam.startTime).getTime()) / (1000 * 60))} 分钟（自动计算）`
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>题目列表</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" asChild>
                    <Link href={`/admin/questions/select?examId=${exam.id}`}>
                      <Plus className="h-4 w-4 mr-2" />
                      选择已有题目
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href={`/admin/questions/new?examId=${exam.id}`}>
                      <Plus className="h-4 w-4 mr-2" />
                      新建题目
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {exam.questions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">暂无题目</p>
                  <Button asChild className="mt-4">
                    <Link href={`/admin/questions/new?examId=${exam.id}`}>添加第一道题目</Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>题目</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>分值</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exam.questions.map((question, index) => (
                      <TableRow key={question.id}>
                        <TableCell className="max-w-md">
                          <div className="truncate" title={question.title}>
                            {index + 1}. {question.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getQuestionTypeLabel(question.type)}
                          </Badge>
                        </TableCell>
                        <TableCell>{question.points}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/admin/questions/${question.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/admin/questions/${question.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>统计信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">题目数量</label>
                <p className="text-2xl font-bold">{exam.questions.length}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">总分值</label>
                <p className="text-2xl font-bold">{totalPoints}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">考试时长</label>
                <p className="text-sm">
                  {Math.round((new Date(exam.endTime).getTime() - new Date(exam.startTime).getTime()) / (1000 * 60 * 60))} 小时
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
