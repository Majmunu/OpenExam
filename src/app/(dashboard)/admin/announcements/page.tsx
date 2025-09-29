"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Eye, Bell, AlertTriangle, Info, CheckCircle } from "lucide-react"
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
  createdAt: string
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

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  useEffect(() => {
    fetchAnnouncements()
  }, [selectedType, selectedStatus])

  const fetchAnnouncements = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedType !== "all") params.append("type", selectedType)
      if (selectedStatus !== "all") params.append("isActive", selectedStatus)

      const response = await fetch(`/api/announcements?${params}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setAnnouncements(data.announcements || [])
    } catch (error) {
      console.error("Error fetching announcements:", error)
      toast.error("获取公告失败")
      setAnnouncements([]) // 确保设置为空数组
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (announcementId: string) => {
    try {
      const response = await fetch(`/api/announcements/${announcementId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setAnnouncements(prev => prev.filter(a => a.id !== announcementId))
        toast.success("公告删除成功")
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
      case "urgent": return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />
      default: return <Info className="h-4 w-4 text-blue-500" />
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

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="animate-fade-in-down">
        <h1 className="text-3xl font-bold text-gray-900">公告管理</h1>
        <p className="text-gray-600">管理系统公告和通知</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="类型筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="info">信息</SelectItem>
              <SelectItem value="warning">警告</SelectItem>
              <SelectItem value="urgent">紧急</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="状态筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="true">激活</SelectItem>
              <SelectItem value="false">未激活</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button asChild className="btn-animate">
          <Link href="/admin/announcements/new">
            <Plus className="h-4 w-4 mr-2" />
            新建公告
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>公告列表</CardTitle>
          <CardDescription>
            管理所有系统公告
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!announcements || announcements.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">暂无公告</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">标题</TableHead>
                    <TableHead className="min-w-[100px]">类型</TableHead>
                    <TableHead className="min-w-[80px]">优先级</TableHead>
                    <TableHead className="min-w-[100px]">状态</TableHead>
                    <TableHead className="min-w-[120px]">创建者</TableHead>
                    <TableHead className="min-w-[100px]">阅读数</TableHead>
                    <TableHead className="min-w-[150px]">创建时间</TableHead>
                    <TableHead className="min-w-[150px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.map((announcement) => (
                    <TableRow key={announcement.id}>
                      <TableCell className="max-w-md">
                        <div className="flex items-center space-x-2">
                          {announcement.isPinned && (
                            <Badge variant="destructive" className="text-xs">置顶</Badge>
                          )}
                          <div className="truncate" title={announcement.title}>
                            {announcement.title}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(announcement.type)}
                          <Badge variant={getTypeVariant(announcement.type)}>
                            {announcement.type === "info" ? "信息" :
                              announcement.type === "warning" ? "警告" :
                                announcement.type === "urgent" ? "紧急" : announcement.type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${getPriorityColor(announcement.priority)}`}>
                          {announcement.priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={announcement.isActive ? "default" : "secondary"}>
                          {announcement.isActive ? "激活" : "未激活"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{announcement.creator.name}</div>
                          <div className="text-sm text-gray-500">{announcement.creator.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {announcement._count.reads} 人已读
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(announcement.createdAt).toLocaleString("zh-CN")}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/announcements/${announcement.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/announcements/${announcement.id}/edit`}>
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
                                  您确定要删除这个公告吗？此操作不可撤销。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(announcement.id)}
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
