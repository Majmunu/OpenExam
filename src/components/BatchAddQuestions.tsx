"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Save } from 'lucide-react'
import { toast } from 'sonner'

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
    setQuestions(questions.map(q => {
      if (q.id === id) {
        const updatedQuestion = { ...q, [field]: value }

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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`type-${question.id}`}>题目类型</Label>
                  <Select
                    value={question.type}
                    onValueChange={(value) => updateQuestion(question.id, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                  <Label htmlFor={`points-${question.id}`}>分值</Label>
                  <Input
                    id={`points-${question.id}`}
                    type="number"
                    min="1"
                    value={question.points}
                    onChange={(e) => updateQuestion(question.id, 'points', parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>题目类型</Label>
                  <Badge variant="outline">
                    {getTypeLabel(question.type)}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`title-${question.id}`}>题目内容</Label>
                <Textarea
                  id={`title-${question.id}`}
                  value={question.title}
                  onChange={(e) => updateQuestion(question.id, 'title', e.target.value)}
                  placeholder="请输入题目内容..."
                  rows={3}
                />
              </div>

              {(question.type === 'SINGLE_CHOICE' || question.type === 'MULTIPLE_CHOICE') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>选项</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addOption(question.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      添加选项
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                          {optionIndex === 0 && (
                            <span className="text-sm text-gray-600 w-16">正确答案:</span>
                          )}
                          {optionIndex > 0 && <div className="w-16"></div>}
                          {question.type === 'SINGLE_CHOICE' ? (
                            <input
                              type="radio"
                              name={`answer-${question.id}`}
                              checked={question.answer === optionIndex.toString()}
                              onChange={(e) => {
                                console.log('批量添加-单选题答案改变:', e.target.value)
                                updateQuestion(question.id, 'answer', e.target.value)
                              }}
                              className="h-4 w-4 text-blue-600"
                            />
                          ) : (
                            <input
                              type="checkbox"
                              checked={question.answer ? question.answer.split(',').includes(optionIndex.toString()) : false}
                              onChange={(e) => {
                                const currentAnswers = question.answer ? question.answer.split(',').filter(a => a.trim()) : []
                                let newAnswers
                                if (e.target.checked) {
                                  newAnswers = [...currentAnswers, optionIndex.toString()]
                                } else {
                                  newAnswers = currentAnswers.filter(a => a !== optionIndex.toString())
                                }
                                console.log('批量添加-多选题答案改变:', newAnswers.join(','))
                                updateQuestion(question.id, 'answer', newAnswers.join(','))
                              }}
                              className="h-4 w-4 text-blue-600"
                            />
                          )}
                        </div>
                        <Input
                          value={option}
                          onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                          placeholder={`选项 ${optionIndex + 1}`}
                          className="flex-1"
                        />
                        {question.options.length > 2 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeOption(question.id, optionIndex)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(question.type === 'SHORT_ANSWER' || question.type === 'FILL_BLANK') && (
                <div className="space-y-2">
                  <Label htmlFor={`answer-${question.id}`}>正确答案</Label>
                  <Input
                    id={`answer-${question.id}`}
                    value={question.answer}
                    onChange={(e) => updateQuestion(question.id, 'answer', e.target.value)}
                    placeholder="请输入正确答案..."
                  />
                </div>
              )}
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
