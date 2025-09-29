"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Eye } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function NewAnnouncementPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "info",
    priority: 1,
    isActive: true,
    isPinned: false,
    startTime: "",
    endTime: "",
    targetRole: "ALL",
    targetUsers: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          targetUsers: formData.targetUsers ? formData.targetUsers.split(",").map(id => id.trim()) : null
        }),
      })

      if (response.ok) {
        toast.success("公告创建成功")
        router.push("/admin/announcements")
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "创建失败")
      }
    } catch (error) {
      console.error("Error creating announcement:", error)
      toast.error("创建失败")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "urgent": return "text-red-600 bg-red-100"
      case "warning": return "text-yellow-600 bg-yellow-100"
      case "success": return "text-green-600 bg-green-100"
      default: return "text-blue-600 bg-blue-100"
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

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="animate-fade-in-down">
        <div className="flex items-center space-x-4 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/announcements">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">新建公告</h1>
        </div>
        <p className="text-gray-600">创建新的系统公告</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主要内容 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>公告内容</CardTitle>
              <CardDescription>
                填写公告的基本信息和内容
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">公告标题 *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="请输入公告标题"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">公告内容 *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleInputChange("content", e.target.value)}
                    placeholder="请输入公告内容"
                    rows={8}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">公告类型</Label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择公告类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">信息</SelectItem>
                        <SelectItem value="warning">警告</SelectItem>
                        <SelectItem value="urgent">紧急</SelectItem>
                        <SelectItem value="success">成功</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">优先级</Label>
                    <Select value={formData.priority.toString()} onValueChange={(value) => handleInputChange("priority", parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择优先级" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - 低</SelectItem>
                        <SelectItem value="2">2 - 较低</SelectItem>
                        <SelectItem value="3">3 - 中等</SelectItem>
                        <SelectItem value="4">4 - 较高</SelectItem>
                        <SelectItem value="5">5 - 高</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">开始时间</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => handleInputChange("startTime", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime">结束时间</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => handleInputChange("endTime", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetRole">目标角色</Label>
                  <Select value={formData.targetRole} onValueChange={(value) => handleInputChange("targetRole", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择目标角色" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">所有用户</SelectItem>
                      <SelectItem value="ADMIN">仅管理员</SelectItem>
                      <SelectItem value="USER">仅普通用户</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetUsers">指定用户ID</Label>
                  <Input
                    id="targetUsers"
                    value={formData.targetUsers}
                    onChange={(e) => handleInputChange("targetUsers", e.target.value)}
                    placeholder="多个用户ID用逗号分隔"
                  />
                  <p className="text-sm text-gray-500">
                    如果指定了用户ID，将覆盖目标角色设置
                  </p>
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" disabled={loading} className="btn-animate">
                    {loading ? "创建中..." : "创建公告"}
                    <Save className="h-4 w-4 ml-2" />
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/admin/announcements">
                      取消
                    </Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 公告设置 */}
          <Card>
            <CardHeader>
              <CardTitle>公告设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">立即激活</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isPinned">置顶显示</Label>
                <Switch
                  id="isPinned"
                  checked={formData.isPinned}
                  onCheckedChange={(checked) => handleInputChange("isPinned", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* 预览 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                预览
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className={getTypeColor(formData.type)}>
                      {getTypeLabel(formData.type)}
                    </Badge>
                    {formData.isPinned && (
                      <Badge variant="destructive">置顶</Badge>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    优先级: {formData.priority}
                  </span>
                </div>

                {formData.title && (
                  <h3 className="font-semibold text-lg">{formData.title}</h3>
                )}

                {formData.content && (
                  <div className="text-sm text-gray-600 whitespace-pre-wrap">
                    {formData.content}
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  <div>目标: {formData.targetRole === "ALL" ? "所有用户" :
                    formData.targetRole === "ADMIN" ? "仅管理员" : "仅普通用户"}</div>
                  {formData.startTime && (
                    <div>开始: {new Date(formData.startTime).toLocaleString("zh-CN")}</div>
                  )}
                  {formData.endTime && (
                    <div>结束: {new Date(formData.endTime).toLocaleString("zh-CN")}</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
