"use client"

import React from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Question {
  id: string
  title: string
  type: string
  points: number
}

interface SortableQuestionsProps {
  questions: Question[]
  onReorder: (newOrder: Question[]) => void
  onEdit: (questionId: string) => void
  onDelete: (questionId: string) => void
  onView: (questionId: string) => void
}

interface SortableItemProps {
  question: Question
  onEdit: (questionId: string) => void
  onDelete: (questionId: string) => void
  onView: (questionId: string) => void
}

function SortableItem({ question, onEdit, onDelete, onView }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getQuestionTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      SINGLE_CHOICE: "单选题",
      MULTIPLE_CHOICE: "多选题",
      SHORT_ANSWER: "简答题",
      FILL_BLANK: "填空题",
    }
    return typeMap[type] || type
  }

  return (
    <TableRow ref={setNodeRef} style={style} className={isDragging ? "bg-gray-50" : ""}>
      <TableCell className="w-8">
        <Button
          variant="ghost"
          size="sm"
          className="cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </Button>
      </TableCell>
      <TableCell className="max-w-md">
        <div className="truncate" title={question.title}>
          {question.title}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">
          {getQuestionTypeLabel(question.type)}
        </Badge>
      </TableCell>
      <TableCell>{question.points}</TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => onView(question.id)}>
            查看
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(question.id)}>
            编辑
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(question.id)}
            className="text-red-600 hover:text-red-700"
          >
            删除
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

export default function SortableQuestions({
  questions,
  onReorder,
  onEdit,
  onDelete,
  onView
}: SortableQuestionsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((item) => item.id === active.id)
      const newIndex = questions.findIndex((item) => item.id === over.id)

      const newOrder = arrayMove(questions, oldIndex, newIndex)
      onReorder(newOrder)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">排序</TableHead>
              <TableHead>题目</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>分值</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((question) => (
              <SortableItem
                key={question.id}
                question={question}
                onEdit={onEdit}
                onDelete={onDelete}
                onView={onView}
              />
            ))}
          </TableBody>
        </Table>
      </SortableContext>
    </DndContext>
  )
}

