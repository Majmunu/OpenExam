"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { ArrowLeft, Edit, Trash2, Bell, AlertTriangle, Info, CheckCircle, Users, Clock, Target } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Announcement {
  id: string
  title: string
  content: string
  type: string
  priority: number
  isActive: boolean
  isPinned: boolean
  startTime?: string
  endTime?: string
  targetRole?: string
  targetUsers?: string
  createdAt: string
  updatedAt: string
  creator: {
    id: string
    name: string
    email: string
  }
  reads: any[]
  _count: {
    reads: number
  }
}

export default function AnnouncementDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchAnnouncement()
    }
  }, [params.id])

  const fetchAnnouncement = async () => {
    try {
      const response = await fetch(`/api/announcements/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setAnnouncement(data)
      } else {
        toast.error("获取公告详情失败")
        router.push("/admin/announcements")
      }
    } catch (error) {
      console.error("Error fetching announcement:", error)
      toast.error("获取公告详情失败")
      router.push("/admin/announcements")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/announcements/${params.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("公告删除成功")
        router.push("/admin/announcements")
      } else {
        toast.error("删除失败")
      }
    } catch (error) {
      console.error("Error deleting announcement:", error)
      toast.error("删除失败")
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "urgent": return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "warning": return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "success": return <CheckCircle className="h-5 w-5 text-green-500" />
      default: return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getTypeVariant = (type: string) => {
    switch (type) {
      case "urgent": return "destructive"
      case "warning": return "secondary"
      case "success": return "default"
      default: return "outline"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "info": return "信息"
      case "warning": return "警告"
      case "urgent": return "紧急"
      case "success": return "成功"
      default: return type
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return "text-red-600"
    if (priority >= 3) return "text-yellow-600"
    return "text-green-600"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!announcement) {
    return (
      <div className="text-center py-8">
        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">公告不存在</p>
        <Button asChild className="mt-4">
          <Link href="/admin/announcements">返回公告列表</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="animate-fade-in-down">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/announcements">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">公告详情</h1>
              <p className="text-gray-600">查看和管理公告信息</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href={`/admin/announcements/${announcement.id}/edit`}>
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
                    您确定要删除这个公告吗？此操作不可撤销。
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主要内容 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {getTypeIcon(announcement.type)}
                  <div>
                    <CardTitle className="text-2xl">{announcement.title}</CardTitle>
                    <CardDescription>
                      创建于 {new Date(announcement.createdAt).toLocaleString("zh-CN")}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {announcement.isPinned && (
                    <Badge variant="destructive">置顶</Badge>
                  )}
                  <Badge variant={getTypeVariant(announcement.type)}>
                    {getTypeLabel(announcement.type)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {announcement.content}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 侧边栏信息 */}
        <div className="space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">状态</span>
                <Badge variant={announcement.isActive ? "default" : "secondary"}>
                  {announcement.isActive ? "激活" : "未激活"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">优先级</span>
                <span className={`font-medium ${getPriorityColor(announcement.priority)}`}>
                  {announcement.priority}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">目标角色</span>
                <span className="text-sm">
                  {announcement.targetRole === "ALL" ? "所有用户" :
                    announcement.targetRole === "ADMIN" ? "仅管理员" : "仅普通用户"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">阅读数</span>
                <span className="text-sm">{announcement._count.reads} 人已读</span>
              </div>
            </CardContent>
          </Card>

          {/* 时间信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                时间信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-500">创建时间</div>
                <div className="text-sm">
                  {new Date(announcement.createdAt).toLocaleString("zh-CN")}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">更新时间</div>
                <div className="text-sm">
                  {new Date(announcement.updatedAt).toLocaleString("zh-CN")}
                </div>
              </div>

              {announcement.startTime && (
                <div>
                  <div className="text-sm font-medium text-gray-500">开始时间</div>
                  <div className="text-sm">
                    {new Date(announcement.startTime).toLocaleString("zh-CN")}
                  </div>
                </div>
              )}

              {announcement.endTime && (
                <div>
                  <div className="text-sm font-medium text-gray-500">结束时间</div>
                  <div className="text-sm">
                    {new Date(announcement.endTime).toLocaleString("zh-CN")}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 创建者信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                创建者
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="font-medium">{announcement.creator.name}</div>
                <div className="text-sm text-gray-500">{announcement.creator.email}</div>
              </div>
            </CardContent>
          </Card>

          {/* 目标用户 */}
          {announcement.targetUsers && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  指定用户
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  {announcement.targetUsers}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
