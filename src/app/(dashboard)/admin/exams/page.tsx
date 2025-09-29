"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, Eye, Users } from "lucide-react"
import Link from "next/link"

interface Exam {
  id: string
  title: string
  description: string | null
  startTime: string
  endTime: string
  isPublic: boolean
  createdAt: string
  _count: {
    questions: number
  }
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      // 使用绝对 URL 避免构建时的 URL 解析问题
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const apiUrl = `${baseUrl}/api/exams?role=admin`

      const response = await fetch(apiUrl)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`)
      }
      const data = await response.json()
      console.log("Fetched exams data:", data)

      // Ensure data is an array
      if (Array.isArray(data)) {
        setExams(data)
      } else {
        console.error("API returned non-array data:", data)
        setExams([])
      }
    } catch (error) {
      console.error("Error fetching exams:", error)
      setExams([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (examId: string) => {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const response = await fetch(`${baseUrl}/api/exams/${examId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setExams(exams.filter(exam => exam.id !== examId))
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center animate-fade-in-down">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">考试管理</h1>
          <p className="text-gray-600">管理所有考试</p>
        </div>
        <Button asChild className="btn-animate">
          <Link href="/admin/exams/new">
            <Plus className="h-4 w-4 mr-2" />
            新建考试
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>考试列表</CardTitle>
          <CardDescription>
            系统中所有考试的列表
          </CardDescription>
        </CardHeader>
        <CardContent>
          {exams.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">暂无考试</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">考试名称</TableHead>
                    <TableHead className="min-w-[150px]">描述</TableHead>
                    <TableHead className="min-w-[150px]">开始时间</TableHead>
                    <TableHead className="min-w-[150px]">结束时间</TableHead>
                    <TableHead className="min-w-[100px]">题目数量</TableHead>
                    <TableHead className="min-w-[80px]">权限</TableHead>
                    <TableHead className="min-w-[80px]">状态</TableHead>
                    <TableHead className="min-w-[200px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.map((exam) => {
                    const status = getExamStatus(exam.startTime, exam.endTime)
                    return (
                      <TableRow key={exam.id}>
                        <TableCell className="font-medium">{exam.title}</TableCell>
                        <TableCell>{exam.description || "-"}</TableCell>
                        <TableCell>
                          {new Date(exam.startTime).toLocaleString("zh-CN")}
                        </TableCell>
                        <TableCell>
                          {new Date(exam.endTime).toLocaleString("zh-CN")}
                        </TableCell>
                        <TableCell>{exam._count.questions}</TableCell>
                        <TableCell>
                          <Badge variant={exam.isPublic ? "default" : "secondary"}>
                            {exam.isPublic ? "公开" : "私有"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/admin/exams/${exam.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/admin/exams/${exam.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/admin/exams/${exam.id}/permissions`}>
                                <Users className="h-4 w-4" />
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
                                    您确定要删除考试 "{exam.title}" 吗？此操作不可撤销。
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>取消</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(exam.id)}
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
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
