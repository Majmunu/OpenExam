"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, Users, Target, Clock, AlertTriangle, CheckCircle, XCircle, Smartphone, Monitor } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts"

interface HRAnalytics {
  participationStats: any[]
  candidatePerformance: any[]
  questionDifficulty: any[]
  timeDistribution: any[]
  deviceAnalysis: any[]
  behaviorAnalysis: any[]
  passRateTrend: any[]
}

export default function HRAnalyticsPage() {
  const [analytics, setAnalytics] = useState<HRAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedExam, setSelectedExam] = useState<string>("all")

  useEffect(() => {
    fetchAnalytics()
  }, [selectedExam])

  const fetchAnalytics = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedExam !== "all") params.append("examId", selectedExam)

      const response = await fetch(`/api/analytics?${params}`)
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getPerformanceBadge = (score: number) => {
    if (score >= 80) return <Badge variant="default" className="bg-green-100 text-green-800">优秀</Badge>
    if (score >= 60) return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">良好</Badge>
    return <Badge variant="destructive">待提升</Badge>
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="h-4 w-4" />
      case 'desktop': return <Monitor className="h-4 w-4" />
      default: return <Monitor className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="animate-fade-in-down">
        <h1 className="text-3xl font-bold text-gray-900">数据分析</h1>
        <p className="text-gray-600">系统数据统计和用户表现分析</p>
      </div>

      <div className="flex justify-between items-center">
        <Select value={selectedExam} onValueChange={setSelectedExam}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="选择面试筛选" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有面试</SelectItem>
            {/* 这里可以添加具体的面试选项 */}
          </SelectContent>
        </Select>
      </div>

      {/* 关键指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">总参与人数</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {analytics?.participationStats?.[0]?.totalParticipants || 0}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              参与考试的用户总数
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">通过率</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {analytics?.participationStats?.[0] && analytics.participationStats[0].totalParticipants > 0 ?
                Math.round((analytics.participationStats[0].passedCount / analytics.participationStats[0].totalParticipants) * 100) : 0}%
            </div>
            <p className="text-xs text-gray-600 mt-1">
              考试通过率
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">平均分</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {analytics?.participationStats?.[0]?.averageScore?.toFixed(1) || 0}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              用户平均得分
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">异常行为</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {analytics?.behaviorAnalysis?.length || 0}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              检测到异常行为的用户
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 用户表现分析 */}
      <Card>
        <CardHeader>
          <CardTitle>用户表现排名</CardTitle>
          <CardDescription>按平均分排序的用户表现</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户</TableHead>
                  <TableHead>参与考试数</TableHead>
                  <TableHead>得分</TableHead>
                  <TableHead>正确题目数</TableHead>
                  <TableHead>最后考试时间</TableHead>
                  <TableHead>表现评级</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics?.candidatePerformance?.slice(0, 10).map((candidate: any, index: number) => (
                  <TableRow key={candidate.userId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{candidate.userName}</div>
                        <div className="text-sm text-gray-500">{candidate.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>{candidate.examsTaken}</TableCell>
                    <TableCell>
                      <span className={`font-medium ${getPerformanceColor(candidate.totalScore)}`}>
                        {candidate.totalScore || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600">{candidate.correctAnswers || 0}</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-600">{candidate.totalAnswers || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {candidate.lastExamDate ?
                        new Date(candidate.lastExamDate).toLocaleDateString("zh-CN") :
                        "无"
                      }
                    </TableCell>
                    <TableCell>
                      {getPerformanceBadge(candidate.averageScore)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 题目难度分析 */}
      <Card>
        <CardHeader>
          <CardTitle>题目难度分析</CardTitle>
          <CardDescription>各题目的正确率和难度分布</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.questionDifficulty || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="questionTitle"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="successRate" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 设备类型分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>设备类型分布</CardTitle>
            <CardDescription>候选人使用的设备类型统计</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics?.deviceAnalysis || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ deviceType, userCount }) => `${deviceType}: ${userCount}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="userCount"
                  >
                    {analytics?.deviceAnalysis?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#3b82f6" : index === 1 ? "#10b981" : "#f59e0b"} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>异常行为检测</CardTitle>
            <CardDescription>检测到异常行为的候选人</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.behaviorAnalysis?.slice(0, 5).map((behavior: any, index: number) => (
                <div key={behavior.userId} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                      <div className="font-medium">{behavior.userName}</div>
                      <div className="text-sm text-gray-600">
                        切屏 {behavior.maxSwitchCount} 次，异常日志 {behavior.suspiciousLogs} 条
                      </div>
                    </div>
                  </div>
                  <Badge variant="destructive">高风险</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 通过率趋势 */}
      <Card>
        <CardHeader>
          <CardTitle>面试通过率趋势</CardTitle>
          <CardDescription>按日期统计的通过率变化</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.passRateTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="passRate" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
