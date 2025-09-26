"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Search, Filter } from "lucide-react"
import Link from "next/link"

interface Question {
  id: string
  type: string
  title: string
  points: number
  exam: {
    id: string
    title: string
  }
  createdAt: string
}

export default function SelectQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const router = useRouter()
  const searchParams = useSearchParams()
  const examId = searchParams.get("examId")

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/questions")
      if (response.ok) {
        const data = await response.json()
        setQuestions(data)
      }
    } catch (error) {
      console.error("Error fetching questions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuestionSelect = (questionId: string) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    )
  }

  const handleAddSelected = async () => {
    if (selectedQuestions.length === 0) {
      alert("请选择至少一个题目")
      return
    }

    try {
      const response = await fetch(`/api/exams/${examId}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ questionIds: selectedQuestions }),
      })

      if (response.ok) {
        router.push(`/admin/exams/${examId}`)
      } else {
        const error = await response.json()
        alert(error.error || "添加失败")
      }
    } catch (error) {
      console.error("Error adding questions:", error)
      alert("添加失败")
    }
  }

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || question.type === typeFilter
    return matchesSearch && matchesType
  })

  const getTypeLabel = (type: string) => {
    const labels = {
      SINGLE_CHOICE: "单选题",
      MULTIPLE_CHOICE: "多选题",
      SHORT_ANSWER: "简答题",
      FILL_BLANK: "填空题"
    }
    return labels[type as keyof typeof labels] || type
  }

  const getTypeColor = (type: string) => {
    const colors = {
      SINGLE_CHOICE: "bg-blue-100 text-blue-800",
      MULTIPLE_CHOICE: "bg-green-100 text-green-800",
      SHORT_ANSWER: "bg-purple-100 text-purple-800",
      FILL_BLANK: "bg-orange-100 text-orange-800"
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
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
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/exams/${examId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">选择题目</h1>
          <p className="text-gray-600">从已有题目中选择添加到考试中</p>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <CardTitle>筛选条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">搜索题目</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="输入题目关键词"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">题目类型</Label>
              <select
                id="type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全部类型</option>
                <option value="SINGLE_CHOICE">单选题</option>
                <option value="MULTIPLE_CHOICE">多选题</option>
                <option value="SHORT_ANSWER">简答题</option>
                <option value="FILL_BLANK">填空题</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setTypeFilter("all")
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                重置筛选
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 题目列表 */}
      <Card>
        <CardHeader>
          <CardTitle>题目列表</CardTitle>
          <CardDescription>
            已选择 {selectedQuestions.length} 个题目
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">没有找到符合条件的题目</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question) => (
                <div
                  key={question.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedQuestions.includes(question.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                    }`}
                  onClick={() => handleQuestionSelect(question.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          checked={selectedQuestions.includes(question.id)}
                          onChange={() => handleQuestionSelect(question.id)}
                        />
                        <Badge className={getTypeColor(question.type)}>
                          {getTypeLabel(question.type)}
                        </Badge>
                        <Badge variant="outline">
                          {question.points}分
                        </Badge>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1">
                        {question.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        来自考试：{question.exam.title}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex justify-between items-center">
        <Button variant="outline" asChild>
          <Link href={`/admin/exams/${examId}`}>取消</Link>
        </Button>

        <Button
          onClick={handleAddSelected}
          disabled={selectedQuestions.length === 0}
        >
          添加选中的题目 ({selectedQuestions.length})
        </Button>
      </div>
    </div>
  )
}
