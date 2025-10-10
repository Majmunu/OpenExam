"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'

interface QuestionEditorProps {
  question: {
    id: string
    type: string
    title: string
    options: string[]
    answer: string
    points: number
  }
  onUpdate: (question: any) => void
  showTitle?: boolean
  showTypeAndPoints?: boolean
}

export default function QuestionEditor({ question, onUpdate, showTitle = true, showTypeAndPoints = false }: QuestionEditorProps) {
  const [localQuestion, setLocalQuestion] = useState(question)

  useEffect(() => {
    setLocalQuestion(question)
  }, [question])

  const updateQuestion = (field: string, value: any) => {
    const updated = { ...localQuestion, [field]: value }
    setLocalQuestion(updated)
    onUpdate(updated)
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...localQuestion.options]
    newOptions[index] = value
    updateQuestion('options', newOptions)
  }

  const addOption = () => {
    updateQuestion('options', [...localQuestion.options, ''])
  }

  const removeOption = (index: number) => {
    if (localQuestion.options.length > 2) {
      const newOptions = localQuestion.options.filter((_, i) => i !== index)
      updateQuestion('options', newOptions)
    }
  }

  const handleAnswerChange = (value: string) => {
    updateQuestion('answer', value)
  }

  const handleMultipleChoiceChange = (option: string, checked: boolean) => {
    const currentAnswers = localQuestion.answer ? localQuestion.answer.split(',').filter(a => a.trim()) : []
    let newAnswers
    if (checked) {
      newAnswers = [...currentAnswers, option]
    } else {
      newAnswers = currentAnswers.filter(a => a !== option)
    }
    updateQuestion('answer', newAnswers.join(','))
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
    <div className="space-y-6">
      {showTypeAndPoints && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">题目类型 *</Label>
            <Select
              value={localQuestion.type}
              onValueChange={(value) => {
                const updated = { ...localQuestion, type: value, answer: '', options: value === 'SINGLE_CHOICE' || value === 'MULTIPLE_CHOICE' ? ['', '', '', ''] : [] }
                setLocalQuestion(updated)
                onUpdate(updated)
              }}
            >
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
              type="number"
              min="1"
              value={localQuestion.points}
              onChange={(e) => updateQuestion('points', parseInt(e.target.value) || 1)}
              placeholder="1"
            />
          </div>
        </div>
      )}

      {showTitle && (
        <div className="space-y-2">
          <Label htmlFor="title">题目内容 *</Label>
          <Textarea
            id="title"
            value={localQuestion.title}
            onChange={(e) => updateQuestion('title', e.target.value)}
            placeholder="请输入题目内容..."
            rows={4}
            className="resize-none"
          />
        </div>
      )}

      {(localQuestion.type === 'SINGLE_CHOICE' || localQuestion.type === 'MULTIPLE_CHOICE') && (
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
            {localQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  {index === 0 && (
                    <span className="text-sm text-gray-600 w-16">正确答案:</span>
                  )}
                  {index > 0 && <div className="w-16"></div>}
                  {localQuestion.type === 'SINGLE_CHOICE' ? (
                    <input
                      type="radio"
                      name={`answer-${localQuestion.id}`}
                      value={option.trim()}
                      checked={localQuestion.answer === option.trim()}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      className="h-4 w-4 text-blue-600"
                    />
                  ) : (
                    <input
                      type="checkbox"
                      checked={localQuestion.answer ? localQuestion.answer.split(',').includes(option.trim()) : false}
                      onChange={(e) => handleMultipleChoiceChange(option.trim(), e.target.checked)}
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
                {localQuestion.options.length > 2 && (
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
      )}

      {(localQuestion.type === 'SHORT_ANSWER' || localQuestion.type === 'FILL_BLANK') && (
        <div className="space-y-2">
          <Label htmlFor="answer">正确答案 *</Label>
          <Input
            id="answer"
            value={localQuestion.answer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="请输入正确答案..."
            className="h-10"
          />
        </div>
      )}
    </div>
  )
}
