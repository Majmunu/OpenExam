"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Trash2, Users } from "lucide-react"

interface Exam {
  id: string
  title: string
  isPublic: boolean
}

interface User {
  id: string
  name: string
  email: string
}

interface Permission {
  id: string
  user: User
}

export default function ExamPermissionsPage() {
  const params = useParams()
  const examId = params.id as string
  const router = useRouter()

  const [exam, setExam] = useState<Exam | null>(null)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState("")
  const [loading, setLoading] = useState(true)
  const [addingPermission, setAddingPermission] = useState(false)

  useEffect(() => {
    fetchData()
  }, [examId])

  const fetchData = async () => {
    try {
      // 获取考试信息
      const examResponse = await fetch(`/api/exams/${examId}`)
      if (examResponse.ok) {
        const examData = await examResponse.json()
        setExam(examData)
      }

      // 获取权限列表
      const permissionsResponse = await fetch(`/api/exams/${examId}/permissions`)
      if (permissionsResponse.ok) {
        const permissionsData = await permissionsResponse.json()
        setPermissions(permissionsData)
      }

      // 获取所有用户
      const usersResponse = await fetch("/api/users")
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.filter((user: any) => user.role === "STUDENT"))
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPermission = async () => {
    if (!selectedUserId) return

    setAddingPermission(true)
    try {
      const response = await fetch(`/api/exams/${examId}/permissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: selectedUserId }),
      })

      if (response.ok) {
        const newPermission = await response.json()
        setPermissions([...permissions, newPermission])
        setSelectedUserId("")
      } else {
        const errorData = await response.json()
        alert(errorData.error || "添加权限失败")
      }
    } catch (error) {
      console.error("Error adding permission:", error)
      alert("添加权限失败")
    } finally {
      setAddingPermission(false)
    }
  }

  const handleRemovePermission = async (userId: string) => {
    try {
      const response = await fetch(`/api/exams/${examId}/permissions?userId=${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setPermissions(permissions.filter(p => p.user.id !== userId))
      } else {
        alert("删除权限失败")
      }
    } catch (error) {
      console.error("Error removing permission:", error)
      alert("删除权限失败")
    }
  }

  if (loading) {
    return <div className="text-center py-8">加载中...</div>
  }

  if (!exam) {
    return <div className="text-center py-8">考试不存在</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> 返回
        </Button>
        <h1 className="text-3xl font-bold">试卷权限管理</h1>
        <div></div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>{exam.title}</span>
            {exam.isPublic && (
              <Badge variant="default">公开考试</Badge>
            )}
          </CardTitle>
          <CardDescription>
            {exam.isPublic
              ? "这是一个公开考试，所有用户都可以看到"
              : "这是一个私有考试，只有被分配权限的用户才能看到"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!exam.isPublic && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="选择用户" />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      .filter(user => !permissions.some(p => p.user.id === user.id))
                      .map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAddPermission}
                  disabled={!selectedUserId || addingPermission}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {addingPermission ? "添加中..." : "添加权限"}
                </Button>
              </div>

              {permissions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>用户</TableHead>
                      <TableHead>邮箱</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell className="font-medium">
                          {permission.user.name}
                        </TableCell>
                        <TableCell>{permission.user.email}</TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>确定要删除权限吗？</AlertDialogTitle>
                                <AlertDialogDescription>
                                  此操作将移除用户 "{permission.user.name}" 对此考试的访问权限。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemovePermission(permission.user.id)}
                                >
                                  删除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">暂无权限分配</p>
                </div>
              )}
            </div>
          )}

          {exam.isPublic && (
            <div className="text-center py-8">
              <p className="text-gray-500">这是公开考试，所有用户都可以访问</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
