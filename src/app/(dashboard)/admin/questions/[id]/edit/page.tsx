"use client"

import { useState, useEffect, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import QuestionEditor from "@/components/QuestionEditor"

interface Exam {
  id: string
  title: string
}

interface Question {
  id: string
  examId: string
  type: string
  title: string
  options: string | null
  answer: string
  points: number
}

export default function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
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
  const fromExam = searchParams.get("fromExam")

  useEffect(() => {
    fetchExams()
    fetchQuestion()
  }, [resolvedParams.id])

  const fetchExams = async () => {
    try {
      const response = await fetch("/api/exams?role=admin")
      const data = await response.json()
      setExams(data)
    } catch (error) {
      console.error("Error fetching exams:", error)
    }
  }

  const fetchQuestion = async () => {
    try {
      const response = await fetch(`/api/questions/${resolvedParams.id}`)
      if (response.ok) {
        const question: Question = await response.json()
        setFormData({
          examId: question.examId,
          type: question.type,
          title: question.title,
          options: question.options ? JSON.parse(question.options).join('\n') : "",
          answer: question.answer,
          points: question.points,
        })
      } else {
        router.push("/admin/questions")
      }
    } catch (error) {
      console.error("Error fetching question:", error)
      router.push("/admin/questions")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/questions/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          options: formData.options ? formData.options.split('\n').filter(opt => opt.trim()) : null,
        }),
      })

      if (response.ok) {
        toast.success("题目更新成功")
        // 根据来源决定跳转位置
        if (fromExam) {
          router.push(`/admin/exams/${fromExam}`)
        } else {
          router.push("/admin/questions")
        }
      } else {
        const error = await response.json()
        toast.error(error.error || "更新失败")
      }
    } catch (error) {
      console.error("Error updating question:", error)
      toast.error("更新失败")
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
          <Link href={fromExam ? `/admin/exams/${fromExam}` : "/admin/questions"}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">编辑题目</h1>
          <p className="text-gray-600">修改题目信息</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>题目信息</CardTitle>
          <CardDescription>
            修改题目的基本信息
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

            <QuestionEditor
              question={{
                id: formData.id,
                type: formData.type,
                title: formData.title,
                options: formData.options ? formData.options.split('\n').filter(opt => opt.trim()) : [],
                answer: formData.answer,
                points: formData.points
              }}
              onUpdate={(updatedQuestion) => {
                setFormData(prev => ({
                  ...prev,
                  title: updatedQuestion.title,
                  options: updatedQuestion.options.join('\n'),
                  answer: updatedQuestion.answer
                }))
              }}
            />

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" asChild>
                <Link href={fromExam ? `/admin/exams/${fromExam}` : "/admin/questions"}>取消</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Save className="h-4 w-4 mr-2 animate-spin" />}
                更新题目
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
