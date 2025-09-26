"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

interface Exam {
  id: string
  title: string
}

export default function NewQuestionPage() {
  const [formData, setFormData] = useState({
    examId: "",
    type: "",
    title: "",
    options: "",
    answer: "",
    points: 1,
  })
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const examId = searchParams.get("examId")

  useEffect(() => {
    fetchExams()
    // 如果URL中有examId参数，自动设置到表单中
    if (examId) {
      setFormData(prev => ({ ...prev, examId }))
    }
  }, [examId])

  const fetchExams = async () => {
    try {
      const response = await fetch("/api/exams?role=admin")
      const data = await response.json()
      setExams(data)
    } catch (error) {
      console.error("Error fetching exams:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          options: formData.options ? formData.options.split('\n').filter(opt => opt.trim()) : null,
        }),
      })

      if (response.ok) {
        // 如果是从试卷页面来的，创建成功后返回到试卷页面
        if (examId) {
          router.push(`/admin/exams/${examId}`)
        } else {
          router.push("/admin/questions")
        }
      } else {
        const error = await response.json()
        alert(error.error || "创建失败")
      }
    } catch (error) {
      console.error("Error creating question:", error)
      alert("创建失败")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === "points" ? parseInt(value) || 1 : value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const renderOptionsField = () => {
    if (formData.type === "SINGLE_CHOICE" || formData.type === "MULTIPLE_CHOICE") {
      return (
        <div className="space-y-2">
          <Label htmlFor="options">选项（每行一个）</Label>
          <Textarea
            id="options"
            name="options"
            value={formData.options}
            onChange={handleChange}
            placeholder="选项1&#10;选项2&#10;选项3&#10;选项4"
            rows={4}
          />
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/questions">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">新建题目</h1>
          <p className="text-gray-600">创建新的考试题目</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>题目信息</CardTitle>
          <CardDescription>
            填写题目的基本信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="examId">所属考试 *</Label>
                <Select value={formData.examId} onValueChange={(value) => handleSelectChange("examId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择考试" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>
                        {exam.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">题目类型 *</Label>
                <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择题目类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SINGLE_CHOICE">单选题</SelectItem>
                    <SelectItem value="MULTIPLE_CHOICE">多选题</SelectItem>
                    <SelectItem value="SHORT_ANSWER">简答题</SelectItem>
                    <SelectItem value="FILL_BLANK">填空题</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="points">分值</Label>
                <Input
                  id="points"
                  name="points"
                  type="number"
                  min="1"
                  value={formData.points}
                  onChange={handleChange}
                  placeholder="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">题目内容 *</Label>
              <Textarea
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="请输入题目内容..."
                rows={4}
              />
            </div>

            {renderOptionsField()}

            <div className="space-y-2">
              <Label htmlFor="answer">正确答案 *</Label>
              {formData.type === "MULTIPLE_CHOICE" ? (
                <Textarea
                  id="answer"
                  name="answer"
                  value={formData.answer}
                  onChange={handleChange}
                  required
                  placeholder="多个答案用逗号分隔，如：选项1,选项2"
                  rows={2}
                />
              ) : (
                <Input
                  id="answer"
                  name="answer"
                  value={formData.answer}
                  onChange={handleChange}
                  required
                  placeholder="请输入正确答案..."
                />
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/questions">取消</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Save className="h-4 w-4 mr-2 animate-spin" />}
                创建题目
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
