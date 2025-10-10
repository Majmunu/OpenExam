"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Save } from 'lucide-react'
import { toast } from 'sonner'
import QuestionEditor from '@/components/QuestionEditor'

interface Question {
  id: string
  type: string
  title: string
  options: string[]
  answer: string
  points: number
}

interface BatchAddQuestionsProps {
  examId: string
  onSuccess: () => void
  onCancel: () => void
}

export default function BatchAddQuestions({ examId, onSuccess, onCancel }: BatchAddQuestionsProps) {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      type: 'SINGLE_CHOICE',
      title: '',
      options: ['', '', '', ''],
      answer: '',
      points: 1
    }
  ])
  const [loading, setLoading] = useState(false)

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'SINGLE_CHOICE',
      title: '',
      options: ['', '', '', ''],
      answer: '',
      points: 1
    }
    setQuestions([...questions, newQuestion])
  }

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id))
    }
  }

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    console.log('updateQuestion called:', { id, field, value })
    setQuestions(questions.map(q => {
      if (q.id === id) {
        const updatedQuestion = { ...q, [field]: value }
        console.log('Updated question:', updatedQuestion)

        // 当题目类型改变时，清空答案并重新初始化选项
        if (field === 'type') {
          updatedQuestion.answer = ''
          if (value === 'SINGLE_CHOICE' || value === 'MULTIPLE_CHOICE') {
            if (updatedQuestion.options.length === 0) {
              updatedQuestion.options = ['', '', '', '']
            }
          } else {
            updatedQuestion.options = []
          }
        }

        return updatedQuestion
      }
      return q
    }))
  }

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options]
        newOptions[optionIndex] = value
        return { ...q, options: newOptions }
      }
      return q
    }))
  }

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return { ...q, options: [...q.options, ''] }
      }
      return q
    }))
  }

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = q.options.filter((_, index) => index !== optionIndex)
        return { ...q, options: newOptions }
      }
      return q
    }))
  }

  const handleSubmit = async () => {
    // 验证所有题目
    const validQuestions = questions.filter(q =>
      q.title.trim() && q.answer.trim() && q.points > 0
    )

    if (validQuestions.length === 0) {
      toast.error('请至少填写一道完整的题目')
      return
    }

    if (validQuestions.length !== questions.length) {
      toast.error('请完善所有题目的信息')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/exams/${examId}/questions/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questions: validQuestions.map(q => ({
            type: q.type,
            title: q.title,
            options: q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE'
              ? q.options.filter(opt => opt.trim())
              : null,
            answer: q.answer,
            points: q.points
          }))
        }),
      })

      if (response.ok) {
        toast.success(`成功添加 ${validQuestions.length} 道题目`)
        onSuccess()
      } else {
        const error = await response.json()
        toast.error(error.error || '添加失败')
      }
    } catch (error) {
      console.error('Error adding questions:', error)
      toast.error('添加失败')
    } finally {
      setLoading(false)
    }
  }

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      SINGLE_CHOICE: "单选题",
      MULTIPLE_CHOICE: "多选题",
      SHORT_ANSWER: "简答题",
      FILL_BLANK: "填空题",
    }
    return typeMap[type] || type
  }

  return (
    <div className="min-h-0 flex flex-col">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h2 className="text-xl font-semibold">批量添加题目</h2>
          <p className="text-gray-600">一次性创建多道题目</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button onClick={addQuestion}>
            <Plus className="h-4 w-4 mr-2" />
            添加题目
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6">
        {questions.map((question, index) => (
          <Card key={question.id} className="relative mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">题目 {index + 1}</CardTitle>
                {questions.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeQuestion(question.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pb-6">
              <QuestionEditor
                question={question}
                onUpdate={(updatedQuestion) => {
                  setQuestions(questions.map(q =>
                    q.id === question.id ? updatedQuestion : q
                  ))
                }}
                showTitle={true}
                showTypeAndPoints={true}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <Button variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading && <Save className="h-4 w-4 mr-2 animate-spin" />}
          保存所有题目 ({questions.length} 道)
        </Button>
      </div>
    </div>
  )
}
