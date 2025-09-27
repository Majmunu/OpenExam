"use client"

import { useEffect, useState, useRef, use } from "react"

// 扩展 Window 接口以包含自定义属性
declare global {
  interface Window {
    behaviorCleanup?: () => void
  }
}
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, Save, CheckCircle } from "lucide-react"
import ExamForm from "@/components/ExamForm"

interface Exam {
  id: string
  title: string
  description: string | null
  startTime: string
  endTime: string
  duration: number | null
  questions: Question[]
}

interface Question {
  id: string
  type: string
  title: string
  options: string | null
  points: number
}

interface Answer {
  questionId: string
  response: string
}

export default function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [exam, setExam] = useState<Exam | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [examStartTime, setExamStartTime] = useState<Date | null>(null)
  const router = useRouter()

  // 日志记录相关状态
  const [behaviorLog, setBehaviorLog] = useState<Record<string, any>>({})
  const startTimeRef = useRef<Date>(new Date())
  const focusTimeRef = useRef<number>(0)
  const blurTimeRef = useRef<number>(0)
  const keystrokesRef = useRef<number>(0)
  const mouseClicksRef = useRef<number>(0)
  const scrollEventsRef = useRef<number>(0)
  const switchCountRef = useRef<number>(0)

  useEffect(() => {
    fetchExam()
    fetchAnswers()
    setupBehaviorTracking()

    return () => {
      cleanupBehaviorTracking()
    }
  }, [resolvedParams.id])

  // 设置行为跟踪
  const setupBehaviorTracking = () => {
    // 页面焦点事件
    const handleFocus = () => {
      focusTimeRef.current = Date.now()
    }

    const handleBlur = () => {
      if (focusTimeRef.current > 0) {
        blurTimeRef.current += Date.now() - focusTimeRef.current
        focusTimeRef.current = 0
      }
    }

    // 键盘事件
    const handleKeydown = () => {
      keystrokesRef.current++
    }

    // 鼠标点击事件
    const handleClick = () => {
      mouseClicksRef.current++
    }

    // 滚动事件
    const handleScroll = () => {
      scrollEventsRef.current++
    }

    // 页面可见性变化（切屏检测）
    const handleVisibilityChange = () => {
      if (document.hidden) {
        switchCountRef.current++
      }
    }

    // 添加事件监听器
    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)
    document.addEventListener('keydown', handleKeydown)
    document.addEventListener('click', handleClick)
    document.addEventListener('scroll', handleScroll)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // 保存清理函数
    window.behaviorCleanup = () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('keydown', handleKeydown)
      document.removeEventListener('click', handleClick)
      document.removeEventListener('scroll', handleScroll)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }

  // 清理行为跟踪
  const cleanupBehaviorTracking = () => {
    if (window.behaviorCleanup) {
      window.behaviorCleanup()
    }
  }

  // 获取设备信息
  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent
    let browserName = 'Unknown'
    let browserVersion = 'Unknown'
    let osName = 'Unknown'
    let osVersion = 'Unknown'
    let deviceType = 'desktop'

    // 检测浏览器
    if (userAgent.includes('Chrome')) {
      browserName = 'Chrome'
      const match = userAgent.match(/Chrome\/(\d+)/)
      if (match) browserVersion = match[1]
    } else if (userAgent.includes('Firefox')) {
      browserName = 'Firefox'
      const match = userAgent.match(/Firefox\/(\d+)/)
      if (match) browserVersion = match[1]
    } else if (userAgent.includes('Safari')) {
      browserName = 'Safari'
      const match = userAgent.match(/Version\/(\d+)/)
      if (match) browserVersion = match[1]
    }

    // 检测操作系统
    if (userAgent.includes('Windows')) {
      osName = 'Windows'
      const match = userAgent.match(/Windows NT (\d+\.\d+)/)
      if (match) osVersion = match[1]
    } else if (userAgent.includes('Mac')) {
      osName = 'macOS'
      const match = userAgent.match(/Mac OS X (\d+_\d+)/)
      if (match) osVersion = match[1].replace('_', '.')
    } else if (userAgent.includes('Linux')) {
      osName = 'Linux'
    }

    // 检测设备类型
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      deviceType = 'mobile'
    } else if (/iPad|Android/i.test(userAgent)) {
      deviceType = 'tablet'
    }

    return {
      browserName,
      browserVersion,
      osName,
      osVersion,
      deviceType
    }
  }

  // 生成设备指纹
  const generateFingerprint = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillText('Fingerprint', 2, 2)
    }

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.platform,
      canvas.toDataURL()
    ].join('|')

    return btoa(fingerprint).substring(0, 32)
  }

  useEffect(() => {
    if (exam) {
      // 如果还没有设置考试开始时间，设置为当前时间
      if (!examStartTime) {
        setExamStartTime(new Date())
      }

      const timer = setInterval(() => {
        const now = new Date()

        if (exam.duration && examStartTime) {
          // 使用真正的考试时长
          const examDurationMs = exam.duration * 60 * 1000 // 转换为毫秒
          const elapsed = now.getTime() - examStartTime.getTime()
          const remaining = Math.max(0, examDurationMs - elapsed)
          setTimeLeft(remaining)

          if (remaining === 0) {
            handleSubmit()
          }
        } else {
          // 回退到使用结束时间（兼容没有设置duration的考试）
          const endTime = new Date(exam.endTime)
          const remaining = Math.max(0, endTime.getTime() - now.getTime())
          setTimeLeft(remaining)

          if (remaining === 0) {
            handleSubmit()
          }
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [exam, examStartTime])

  const fetchExam = async () => {
    try {
      const response = await fetch(`/api/exams/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setExam(data)
      } else {
        router.push("/user")
      }
    } catch (error) {
      console.error("Error fetching exam:", error)
      router.push("/user")
    } finally {
      setLoading(false)
    }
  }

  const fetchAnswers = async () => {
    try {
      const response = await fetch(`/api/answers?examId=${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        const answerMap: Record<string, string> = {}
        data.forEach((answer: any) => {
          answerMap[answer.questionId] = answer.response
        })
        setAnswers(answerMap)
      }
    } catch (error) {
      console.error("Error fetching answers:", error)
    }
  }

  const handleAnswerChange = async (questionId: string, response: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: response
    }))

    // 自动保存答案并记录日志
    try {
      const deviceInfo = getDeviceInfo()
      const currentTime = new Date()
      const duration = Math.floor((currentTime.getTime() - startTimeRef.current.getTime()) / 1000)

      const logData = {
        browserName: deviceInfo.browserName,
        browserVersion: deviceInfo.browserVersion,
        osName: deviceInfo.osName,
        osVersion: deviceInfo.osVersion,
        deviceType: deviceInfo.deviceType,
        fingerprint: generateFingerprint(),
        switchCount: switchCountRef.current,
        duration: duration,
        focusTime: Math.floor(focusTimeRef.current / 1000),
        blurTime: Math.floor(blurTimeRef.current / 1000),
        keystrokes: keystrokesRef.current,
        mouseClicks: mouseClicksRef.current,
        scrollEvents: scrollEventsRef.current,
        startTime: startTimeRef.current.toISOString(),
        endTime: currentTime.toISOString()
      }

      await fetch("/api/answers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId,
          response,
          logData
        }),
      })
    } catch (error) {
      console.error("Error auto-saving answer:", error)
    }
  }

  const handleSave = async () => {
    setSubmitting(true)
    try {
      // 准备日志数据
      const deviceInfo = getDeviceInfo()
      const currentTime = new Date()
      const duration = Math.floor((currentTime.getTime() - startTimeRef.current.getTime()) / 1000)

      const logData = {
        browserName: deviceInfo.browserName,
        browserVersion: deviceInfo.browserVersion,
        osName: deviceInfo.osName,
        osVersion: deviceInfo.osVersion,
        deviceType: deviceInfo.deviceType,
        fingerprint: generateFingerprint(),
        switchCount: switchCountRef.current,
        duration: duration,
        focusTime: Math.floor(focusTimeRef.current / 1000),
        blurTime: Math.floor(blurTimeRef.current / 1000),
        keystrokes: keystrokesRef.current,
        mouseClicks: mouseClicksRef.current,
        scrollEvents: scrollEventsRef.current,
        startTime: startTimeRef.current.toISOString(),
        endTime: currentTime.toISOString()
      }

      const promises = Object.entries(answers).map(([questionId, response]) =>
        fetch("/api/answers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            questionId,
            response,
            logData
          }),
        })
      )

      await Promise.all(promises)
      alert("答案已保存")
    } catch (error) {
      console.error("Error saving answers:", error)
      alert("保存失败")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      // 先保存所有答案
      await handleSave()

      // 提交考试
      alert("考试已提交")
      router.push("/user")
    } catch (error) {
      console.error("Error submitting exam:", error)
      alert("提交失败")
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const answeredCount = Object.keys(answers).length
  const totalQuestions = exam?.questions.length || 0
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">考试不存在或已结束</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 考试头部信息 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{exam.title}</CardTitle>
              <CardDescription className="mt-2">
                {exam.description || "暂无描述"}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 text-lg font-medium">
                <Clock className="h-5 w-5" />
                <span className={timeLeft < 300000 ? "text-red-600" : ""}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">剩余时间</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">答题进度</span>
              <span className="text-sm text-gray-500">
                {answeredCount} / {totalQuestions}
              </span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* 题目列表 */}
      <div className="space-y-6">
        {exam.questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    第 {index + 1} 题
                    <Badge variant="outline" className="ml-2">
                      {question.points} 分
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-2 text-base">
                    {question.title}
                  </CardDescription>
                </div>
                {answers[question.id] && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ExamForm
                question={question}
                value={answers[question.id] || ""}
                onChange={(value) => handleAnswerChange(question.id, value)}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handleSave} disabled={submitting}>
          <Save className="h-4 w-4 mr-2" />
          {submitting ? "保存中..." : "保存草稿"}
        </Button>

        <Button onClick={handleSubmit} disabled={submitting}>
          <CheckCircle className="h-4 w-4 mr-2" />
          {submitting ? "提交中..." : "提交考试"}
        </Button>
      </div>
    </div>
  )
}
