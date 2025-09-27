"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Search,
  Filter,
  Download,
  AlertTriangle,
  Eye,
  Clock,
  MousePointer,
  Keyboard,
  Monitor,
  Smartphone,
  Tablet
} from "lucide-react"
import { format } from "date-fns"

interface AnswerLog {
  id: string
  answerId: string
  userId: string
  questionId: string
  examId: string
  ipAddress: string | null
  userAgent: string | null
  browserName: string | null
  browserVersion: string | null
  osName: string | null
  osVersion: string | null
  deviceType: string | null
  fingerprint: string | null
  switchCount: number
  duration: number
  focusTime: number
  blurTime: number
  keystrokes: number
  mouseClicks: number
  scrollEvents: number
  startTime: string
  endTime: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
  question: {
    id: string
    title: string
    type: string
    points: number
  }
  exam: {
    id: string
    title: string
  }
}

interface LogStats {
  summary: {
    totalLogs: number
    totalUsers: number
    totalExams: number
    averageDuration: number
    averageSwitchCount: number
  }
  browserStats: Array<{ name: string; count: number }>
  osStats: Array<{ name: string; count: number }>
  deviceStats: Array<{ name: string; count: number }>
  behaviorStats: {
    averageKeystrokes: number
    averageMouseClicks: number
    averageScrollEvents: number
    averageFocusTime: number
    averageBlurTime: number
  }
  trendData: Array<{
    date: string
    totalLogs: number
    averageDuration: number
    averageSwitchCount: number
    totalKeystrokes: number
    totalMouseClicks: number
  }>
  suspiciousLogs: AnswerLog[]
}

export default function LogsPage() {
  const [logs, setLogs] = useState<AnswerLog[]>([])
  const [stats, setStats] = useState<LogStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    examId: "",
    userId: "",
    questionId: "",
    search: ""
  })
  const [exams, setExams] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchLogs()
    fetchStats()
  }, [page])

  useEffect(() => {
    fetchExams()
    fetchUsers()
  }, [])

  // 防抖搜索
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    const timeout = setTimeout(() => {
      fetchLogs()
    }, 500) // 500ms 防抖

    setSearchTimeout(timeout)

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [filters])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20"
      })

      if (filters.examId) params.append("examId", filters.examId)
      if (filters.userId) params.append("userId", filters.userId)
      if (filters.questionId) params.append("questionId", filters.questionId)

      const response = await fetch(`/api/answer-logs?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch logs")
      }

      const data = await response.json()
      setLogs(data.logs)
      setTotalPages(data.pagination.pages)
    } catch (error) {
      console.error("Error fetching logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/log-stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const fetchExams = async () => {
    try {
      const response = await fetch("/api/exams?role=admin")
      if (response.ok) {
        const data = await response.json()
        setExams(data)
      }
    } catch (error) {
      console.error("Error fetching exams:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.filter((user: any) => user.role === "USER"))
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />
      case 'tablet':
        return <Tablet className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const getSuspiciousLevel = (log: AnswerLog) => {
    let level = 0
    let reasons: string[] = []

    // 切屏次数过多（>10次）
    if (log.switchCount > 10) {
      level += 2
      reasons.push(`切屏${log.switchCount}次`)
    }

    // 答题时间过短（<10秒）
    if (log.duration < 10) {
      level += 2
      reasons.push(`答题仅${log.duration}秒`)
    }

    // 失焦时间过长（>60秒）
    if (log.blurTime > 60) {
      level += 1
      reasons.push(`失焦${log.blurTime}秒`)
    }

    // 交互行为异常（按键和点击都很少）
    if (log.keystrokes < 3 && log.mouseClicks < 1) {
      level += 1
      reasons.push(`交互异常`)
    }

    // 答题时间过长（>30分钟）
    if (log.duration > 1800) {
      level += 1
      reasons.push(`答题时间过长`)
    }

    if (level >= 4) return {
      label: "高风险",
      variant: "destructive" as const,
      reasons: reasons.slice(0, 2) // 只显示前2个原因
    }
    if (level >= 2) return {
      label: "中风险",
      variant: "default" as const,
      reasons: reasons.slice(0, 1)
    }
    return {
      label: "正常",
      variant: "secondary" as const,
      reasons: []
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">答题日志管理</h1>
        <p className="text-gray-600">查看和分析用户答题行为数据</p>
      </div>

      {/* 统计概览 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总日志数</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.summary.totalLogs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">参与用户</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.summary.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">平均时长</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(stats.summary.averageDuration)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">平均切屏</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.summary.averageSwitchCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">异常行为</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.suspiciousLogs.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 过滤器 */}
      <Card>
        <CardHeader>
          <CardTitle>筛选条件</CardTitle>
          <CardDescription>
            使用以下条件筛选答题日志，支持多条件组合筛选
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">选择考试</label>
              <Select
                value={filters.examId || "all"}
                onValueChange={(value) => setFilters({ ...filters, examId: value === "all" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="全部考试" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部考试</SelectItem>
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">选择用户</label>
              <Select
                value={filters.userId || "all"}
                onValueChange={(value) => setFilters({ ...filters, userId: value === "all" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="全部用户" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部用户</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">题目ID</label>
              <Input
                placeholder="输入题目ID"
                value={filters.questionId}
                onChange={(e) => setFilters({ ...filters, questionId: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">关键词搜索</label>
              <Input
                placeholder="搜索用户、考试或题目"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={() => setFilters({ examId: "", userId: "", questionId: "", search: "" })}
            >
              清除筛选
            </Button>
            <div className="text-sm text-gray-500">
              当前筛选: {Object.values(filters).filter(v => v).length} 个条件
            </div>
          </div>

          {/* 风险等级说明 */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">风险等级判定标准：</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
              <div>
                <span className="font-medium text-red-600">高风险：</span>
                <ul className="mt-1 space-y-1">
                  <li>• 切屏次数 &gt; 10次</li>
                  <li>• 答题时间 &lt; 10秒</li>
                  <li>• 失焦时间 &gt; 60秒</li>
                </ul>
              </div>
              <div>
                <span className="font-medium text-orange-600">中风险：</span>
                <ul className="mt-1 space-y-1">
                  <li>• 切屏次数 5-10次</li>
                  <li>• 答题时间 10-30秒</li>
                  <li>• 交互行为异常</li>
                </ul>
              </div>
              <div>
                <span className="font-medium text-green-600">正常：</span>
                <ul className="mt-1 space-y-1">
                  <li>• 切屏次数 &lt; 5次</li>
                  <li>• 答题时间 &gt; 30秒</li>
                  <li>• 交互行为正常</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 日志列表 */}
      <Card>
        <CardHeader>
          <CardTitle>答题日志</CardTitle>
          <CardDescription>
            用户答题行为详细记录
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户</TableHead>
                  <TableHead>考试/题目</TableHead>
                  <TableHead>设备信息</TableHead>
                  <TableHead>行为数据</TableHead>
                  <TableHead>时长</TableHead>
                  <TableHead>风险等级</TableHead>
                  <TableHead>时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  const suspicious = getSuspiciousLevel(log)
                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.user.name}</div>
                          <div className="text-sm text-gray-500">{log.user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.exam.title}</div>
                          <div className="text-sm text-gray-500">{log.question.title}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getDeviceIcon(log.deviceType)}
                          <div>
                            <div className="text-sm">{log.browserName} {log.browserVersion}</div>
                            <div className="text-xs text-gray-500">{log.osName} {log.osVersion}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center space-x-1">
                            <MousePointer className="h-3 w-3" />
                            <span>{log.mouseClicks} 点击</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Keyboard className="h-3 w-3" />
                            <span>{log.keystrokes} 按键</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{log.switchCount} 切屏</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>总时长: {formatDuration(log.duration)}</div>
                          <div className="text-gray-500">专注: {formatDuration(log.focusTime)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant={suspicious.variant}>
                            {suspicious.label}
                          </Badge>
                          {suspicious.reasons.length > 0 && (
                            <div className="text-xs text-gray-500">
                              {suspicious.reasons.join(', ')}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(log.createdAt), "MM-dd HH:mm")}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* 分页 */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              第 {page} 页，共 {totalPages} 页
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
              >
                上一页
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
