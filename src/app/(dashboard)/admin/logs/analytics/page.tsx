"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts"
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  AlertTriangle,
  TrendingUp,
  Clock,
  MousePointer,
  Keyboard
} from "lucide-react"

interface LogAnalytics {
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
  suspiciousLogs: Array<{
    id: string
    user: { name: string; email: string }
    exam: { title: string }
    question: { title: string }
    switchCount: number
    duration: number
    blurTime: number
    keystrokes: number
  }>
}

export default function LogAnalyticsPage() {
  const [analytics, setAnalytics] = useState<LogAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/log-stats")
      if (!response.ok) {
        throw new Error("Failed to fetch analytics")
      }
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />
      case 'tablet':
        return <Tablet className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">暂无数据</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">日志分析</h1>
        <p className="text-gray-600">用户答题行为数据分析和可视化</p>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">总日志数</CardTitle>
            <div className="p-2 bg-blue-500 rounded-lg">
              <Globe className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{analytics.summary.totalLogs}</div>
            <p className="text-xs text-gray-600 mt-1">所有答题记录</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">参与用户</CardTitle>
            <div className="p-2 bg-green-500 rounded-lg">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{analytics.summary.totalUsers}</div>
            <p className="text-xs text-gray-600 mt-1">活跃用户数</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">平均时长</CardTitle>
            <div className="p-2 bg-purple-500 rounded-lg">
              <Clock className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{formatDuration(analytics.summary.averageDuration)}</div>
            <p className="text-xs text-gray-600 mt-1">答题平均时长</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">平均切屏</CardTitle>
            <div className="p-2 bg-orange-500 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{analytics.summary.averageSwitchCount}</div>
            <p className="text-xs text-gray-600 mt-1">平均切屏次数</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">异常行为</CardTitle>
            <div className="p-2 bg-red-500 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{analytics.suspiciousLogs.length}</div>
            <p className="text-xs text-gray-600 mt-1">可疑行为记录</p>
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 浏览器分布 */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl font-bold text-gray-800">
              <div className="p-2 bg-indigo-500 rounded-lg mr-3">
                <Globe className="h-5 w-5 text-white" />
              </div>
              浏览器分布
            </CardTitle>
            <CardDescription className="text-gray-600">
              用户使用的浏览器类型统计
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.browserStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="browserGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      fontSize: '14px'
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="url(#browserGradient)"
                    name="使用次数"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 设备类型分布 */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-50 to-rose-100">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl font-bold text-gray-800">
              <div className="p-2 bg-pink-500 rounded-lg mr-3">
                <Monitor className="h-5 w-5 text-white" />
              </div>
              设备类型分布
            </CardTitle>
            <CardDescription className="text-gray-600">
              用户使用的设备类型统计
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.deviceStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={80}
                    innerRadius={30}
                    fill="#8884d8"
                    dataKey="count"
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {analytics.deviceStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b'][index % 3]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      fontSize: '14px'
                    }}
                    formatter={(value, name) => [`${value}`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* 自定义图例 */}
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {analytics.deviceStats.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {getDeviceIcon(item.name)}
                  <span className="text-sm font-medium text-gray-700">
                    {item.name}: {item.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 行为趋势图 */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-teal-100">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-xl font-bold text-gray-800">
            <div className="p-2 bg-cyan-500 rounded-lg mr-3">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            行为趋势分析
          </CardTitle>
          <CardDescription className="text-gray-600">
            最近7天的用户行为数据变化趋势
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="logsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    fontSize: '14px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="totalLogs"
                  stroke="#06b6d4"
                  fill="url(#logsGradient)"
                  name="答题次数"
                  strokeWidth={3}
                />
                <Area
                  type="monotone"
                  dataKey="averageDuration"
                  stroke="#10b981"
                  fill="url(#durationGradient)"
                  name="平均时长(秒)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 异常行为列表 */}
      {analytics.suspiciousLogs.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl font-bold text-gray-800">
              <div className="p-2 bg-red-500 rounded-lg mr-3">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              异常行为检测
            </CardTitle>
            <CardDescription className="text-gray-600">
              检测到的可疑答题行为记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.suspiciousLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{log.user.name}</div>
                    <div className="text-sm text-gray-600">{log.exam.title} - {log.question.title}</div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span>{log.switchCount} 切屏</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span>{formatDuration(log.duration)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Keyboard className="h-4 w-4 text-blue-500" />
                      <span>{log.keystrokes} 按键</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
