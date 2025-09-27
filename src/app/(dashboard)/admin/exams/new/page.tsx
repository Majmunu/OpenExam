"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function NewExamPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    duration: "",
    isPublic: false,
    passingScore: 60,
    passingCriteria: "",
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          duration: formData.duration ? parseInt(formData.duration) : null,
        }),
      })

      if (response.ok) {
        const exam = await response.json()
        router.push(`/admin/exams/${exam.id}`)
      } else {
        const error = await response.json()
        alert(error.error || "创建失败")
      }
    } catch (error) {
      console.error("Error creating exam:", error)
      alert("创建失败")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/exams">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">新建考试</h1>
          <p className="text-gray-600">创建新的考试</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>考试信息</CardTitle>
          <CardDescription>
            填写考试的基本信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">考试名称 *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="请输入考试名称"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">开始时间 *</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">结束时间 *</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">考试时长（分钟）</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="例如：120（2小时）"
                />
                <p className="text-sm text-gray-500">
                  可选，用于设置考试的具体时长。如果不填写，将使用开始时间和结束时间的差值。
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isPublic: checked as boolean })
                  }
                />
                <Label htmlFor="isPublic">公开考试（所有用户都可以看到）</Label>
              </div>
              <p className="text-sm text-gray-500">
                如果不勾选，则需要手动分配权限给特定用户
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="passingScore">通过分数（百分比）*</Label>
                <Input
                  id="passingScore"
                  name="passingScore"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.passingScore}
                  onChange={handleChange}
                  required
                  placeholder="60"
                />
                <p className="text-sm text-gray-500">
                  用户需要达到此分数才能通过考试
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passingCriteria">通过标准描述</Label>
                <Input
                  id="passingCriteria"
                  name="passingCriteria"
                  value={formData.passingCriteria}
                  onChange={handleChange}
                  placeholder="例如：60分以上为及格，80分以上为良好，90分以上为优秀"
                />
                <p className="text-sm text-gray-500">
                  可选，用于说明通过标准
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">考试描述</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="请输入考试描述（可选）"
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/exams">取消</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Save className="h-4 w-4 mr-2 animate-spin" />}
                创建考试
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
