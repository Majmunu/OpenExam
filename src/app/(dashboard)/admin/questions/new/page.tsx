"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
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
    options: [] as string[],
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
          options: formData.options.length > 0 ? formData.options : null,
        }),
      })

      if (response.ok) {
        toast.success("题目创建成功")
        // 如果是从试卷页面来的，创建成功后返回到试卷页面
        if (examId) {
          router.push(`/admin/exams/${examId}`)
        } else {
          router.push("/admin/questions")
        }
      } else {
        const error = await response.json()
        toast.error(error.error || "创建失败")
      }
    } catch (error) {
      console.error("Error creating question:", error)
      toast.error("创建失败")
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
    setFormData(prev => {
      const newData = { ...prev, [name]: value }

      // 当选择题目类型时，初始化选项数组并清空答案
      if (name === 'type') {
        newData.answer = '' // 清空答案
        if ((value === 'SINGLE_CHOICE' || value === 'MULTIPLE_CHOICE')) {
          if (prev.options.length === 0) {
            newData.options = ['', '', '', '']
          }
        } else {
          newData.options = [] // 非选择题清空选项
        }
      }

      return newData
    })
  }

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }))
  }

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }))
  }

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }))
    }
  }

  const renderOptionsField = () => {
    if (formData.type === "SINGLE_CHOICE" || formData.type === "MULTIPLE_CHOICE") {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>选项</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
            >
              <Plus className="h-4 w-4 mr-2" />
              添加选项
            </Button>
          </div>
          <div className="space-y-3">
            {formData.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  {index === 0 && (
                    <span className="text-sm text-gray-600 w-16">正确答案:</span>
                  )}
                  {index > 0 && <div className="w-16"></div>}
                  {formData.type === 'SINGLE_CHOICE' ? (
                    <input
                      type="radio"
                      name="answer"
                      value={index}
                      checked={formData.answer === index.toString()}
                      onChange={(e) => {
                        console.log('单选题答案改变:', e.target.value)
                        setFormData(prev => ({ ...prev, answer: e.target.value }))
                      }}
                      className="h-4 w-4 text-blue-600"
                    />
                  ) : (
                    <input
                      type="checkbox"
                      checked={formData.answer ? formData.answer.split(',').includes(index.toString()) : false}
                      onChange={(e) => {
                        const currentAnswers = formData.answer ? formData.answer.split(',').filter(a => a.trim()) : []
                        let newAnswers
                        if (e.target.checked) {
                          newAnswers = [...currentAnswers, index.toString()]
                        } else {
                          newAnswers = currentAnswers.filter(a => a !== index.toString())
                        }
                        console.log('多选题答案改变:', newAnswers.join(','))
                        setFormData(prev => ({ ...prev, answer: newAnswers.join(',') }))
                      }}
                      className="h-4 w-4 text-blue-600"
                    />
                  )}
                </div>
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`选项 ${index + 1}`}
                  className="flex-1"
                />
                {formData.options.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeOption(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
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

            {(formData.type === "SHORT_ANSWER" || formData.type === "FILL_BLANK") && (
              <div className="space-y-2">
                <Label htmlFor="answer">正确答案 *</Label>
                <Input
                  id="answer"
                  name="answer"
                  value={formData.answer}
                  onChange={handleChange}
                  required
                  placeholder="请输入正确答案..."
                />
              </div>
            )}

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
