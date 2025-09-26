"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"

interface Question {
  id: string
  type: string
  title: string
  points: number
  createdAt: string
  exam: {
    id: string
    title: string
  }
}

interface Exam {
  id: string
  title: string
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [selectedExamId, setSelectedExamId] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExams()
    fetchQuestions()
  }, [])

  useEffect(() => {
    if (selectedExamId && selectedExamId !== "all") {
      fetchQuestions(selectedExamId)
    } else {
      fetchQuestions()
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

  const fetchQuestions = async (examId?: string) => {
    try {
      const url = examId && examId !== "all" ? `/api/questions?examId=${examId}` : "/api/questions"
      const response = await fetch(url)
      const data = await response.json()
      setQuestions(data)
    } catch (error) {
      console.error("Error fetching questions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (questionId: string) => {
    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setQuestions(questions.filter(question => question.id !== questionId))
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">题目管理</h1>
          <p className="text-gray-600">管理所有题目</p>
        </div>
        <Button asChild>
          <Link href="/admin/questions/new">
            <Plus className="h-4 w-4 mr-2" />
            新建题目
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>题目列表</CardTitle>
          <CardDescription>
            系统中所有题目的列表
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
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

          {questions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">暂无题目</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[300px]">题目</TableHead>
                    <TableHead className="min-w-[100px]">类型</TableHead>
                    <TableHead className="min-w-[80px]">分值</TableHead>
                    <TableHead className="min-w-[150px]">所属考试</TableHead>
                    <TableHead className="min-w-[150px]">创建时间</TableHead>
                    <TableHead className="min-w-[150px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell className="max-w-md">
                        <div className="truncate" title={question.title}>
                          {question.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getQuestionTypeVariant(question.type)}>
                          {getQuestionTypeLabel(question.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>{question.points}</TableCell>
                      <TableCell>{question.exam.title}</TableCell>
                      <TableCell>
                        {new Date(question.createdAt).toLocaleString("zh-CN")}
                      </TableCell>
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
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
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
                                  onClick={() => handleDelete(question.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  删除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
