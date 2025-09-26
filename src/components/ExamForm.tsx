"use client"

import { useState, useEffect } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Question {
  id: string
  type: string
  title: string
  options: string | null
  points: number
}

interface ExamFormProps {
  question: Question
  value: string
  onChange: (value: string) => void
}

export default function ExamForm({ question, value, onChange }: ExamFormProps) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (newValue: string) => {
    setLocalValue(newValue)
    onChange(newValue)
  }

  const handleMultipleChoiceChange = (option: string, checked: boolean) => {
    const currentAnswers = localValue ? localValue.split(',') : []
    let newAnswers: string[]

    if (checked) {
      newAnswers = [...currentAnswers, option]
    } else {
      newAnswers = currentAnswers.filter(ans => ans !== option)
    }

    const newValue = newAnswers.join(',')
    setLocalValue(newValue)
    onChange(newValue)
  }

  const isMultipleChoiceSelected = (option: string) => {
    if (!localValue) return false
    return localValue.split(',').includes(option)
  }

  const renderQuestion = () => {
    switch (question.type) {
      case 'SINGLE_CHOICE':
        const singleOptions = question.options ? JSON.parse(question.options) : []
        return (
          <RadioGroup value={localValue} onValueChange={handleChange}>
            {singleOptions.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                <Label htmlFor={`${question.id}-${index}`} className="flex-1">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'MULTIPLE_CHOICE':
        const multipleOptions = question.options ? JSON.parse(question.options) : []
        return (
          <div className="space-y-3">
            {multipleOptions.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${index}`}
                  checked={isMultipleChoiceSelected(option)}
                  onCheckedChange={(checked) =>
                    handleMultipleChoiceChange(option, checked as boolean)
                  }
                />
                <Label htmlFor={`${question.id}-${index}`} className="flex-1">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )

      case 'SHORT_ANSWER':
        return (
          <Textarea
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="请输入您的答案..."
            rows={6}
            className="w-full"
          />
        )

      case 'FILL_BLANK':
        return (
          <Input
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="请输入答案..."
            className="w-full"
          />
        )

      default:
        return (
          <div className="text-gray-500">
            不支持的题目类型
          </div>
        )
    }
  }

  return (
    <div className="space-y-4">
      {renderQuestion()}

      {question.type === 'MULTIPLE_CHOICE' && (
        <div className="text-sm text-gray-500">
          提示：多选题可以选择多个选项
        </div>
      )}
    </div>
  )
}
