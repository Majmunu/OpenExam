"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, FileText, Clock, TrendingUp, Award, CheckCircle, AlertCircle } from "lucide-react"
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

interface DashboardStats {
  totalExams: number
  totalQuestions: number
  totalUsers: number
  activeExams: number
  completedExams: number
  upcomingExams: number
}

interface ExamData {
  name: string
  questions: number
  participants: number
  completionRate: number
}

interface UserActivity {
  date: string
  logins: number
  exams: number
}

interface GradeStats {
  examGradeChartData: any[]
  userGradeChartData: any[]
  overallGradeDistribution: any[]
  gradeTrendData: any[]
  summary: {
    totalAnswers: number
    totalExams: number
    totalUsers: number
    overallAverageScore: number
    overallPassRate: number
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalExams: 0,
    totalQuestions: 0,
    totalUsers: 0,
    activeExams: 0,
    completedExams: 0,
    upcomingExams: 0,
  })
  const [examData, setExamData] = useState<ExamData[]>([])
  const [userActivity, setUserActivity] = useState<UserActivity[]>([])
  const [gradeStats, setGradeStats] = useState<GradeStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsResponse, gradeResponse] = await Promise.all([
          fetch("/api/stats"),
          fetch("/api/grade-stats")
        ])

        if (!statsResponse.ok) {
          throw new Error("Failed to fetch stats")
        }

        const statsData = await statsResponse.json()
        setStats(statsData.stats)
        setExamData(statsData.examChartData)
        setUserActivity(statsData.activityData)

        if (gradeResponse.ok) {
          const gradeData = await gradeResponse.json()
          setGradeStats(gradeData)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

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
        <h1 className="text-3xl font-bold text-gray-900">管理员仪表板</h1>
        <p className="text-gray-600">欢迎来到考试管理系统后台</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">总考试数</CardTitle>
            <div className="p-2 bg-slate-500 rounded-lg">
              <FileText className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stats.totalExams}</div>
            <p className="text-xs text-gray-600 mt-1">
              系统中所有考试
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">进行中考试</CardTitle>
            <div className="p-2 bg-blue-500 rounded-lg">
              <Clock className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.activeExams}</div>
            <p className="text-xs text-gray-600 mt-1">
              当前可参加的考试
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">已完成考试</CardTitle>
            <div className="p-2 bg-green-500 rounded-lg">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.completedExams}</div>
            <p className="text-xs text-gray-600 mt-1">
              已结束的考试
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">总用户数</CardTitle>
            <div className="p-2 bg-purple-500 rounded-lg">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.totalUsers}</div>
            <p className="text-xs text-gray-600 mt-1">
              注册用户总数
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 图表展示区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 考试统计柱状图 */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl font-bold text-gray-800">
              <div className="p-2 bg-blue-500 rounded-lg mr-3">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              考试统计
            </CardTitle>
            <CardDescription className="text-gray-600">
              各考试的题目数量和参与情况
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={examData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="questionsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.8} />
                    </linearGradient>
                    <linearGradient id="participantsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.8} />
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
                    dataKey="questions"
                    fill="url(#questionsGradient)"
                    name="题目数"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="participants"
                    fill="url(#participantsGradient)"
                    name="参与人数"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 考试状态饼图 */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl font-bold text-gray-800">
              <div className="p-2 bg-green-500 rounded-lg mr-3">
                <Award className="h-5 w-5 text-white" />
              </div>
              考试状态分布
            </CardTitle>
            <CardDescription className="text-gray-600">
              考试进行状态统计
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: '进行中', value: stats.activeExams, color: '#3b82f6' },
                      { name: '已完成', value: stats.completedExams, color: '#10b981' },
                      { name: '未开始', value: stats.upcomingExams, color: '#f59e0b' },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={80}
                    innerRadius={30}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {[
                      { name: '进行中', value: stats.activeExams, color: '#3b82f6' },
                      { name: '已完成', value: stats.completedExams, color: '#10b981' },
                      { name: '未开始', value: stats.upcomingExams, color: '#f59e0b' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
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
              {[
                { name: '进行中', value: stats.activeExams, color: '#3b82f6' },
                { name: '已完成', value: stats.completedExams, color: '#10b981' },
                { name: '未开始', value: stats.upcomingExams, color: '#f59e0b' },
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 用户活动趋势图 */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-100">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-xl font-bold text-gray-800">
            <div className="p-2 bg-purple-500 rounded-lg mr-3">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            用户活动趋势
          </CardTitle>
          <CardDescription className="text-gray-600">
            最近7天的用户登录和考试参与情况
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userActivity} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="loginsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="examsGradient" x1="0" y1="0" x2="0" y2="1">
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
                  dataKey="logins"
                  stroke="#3b82f6"
                  fill="url(#loginsGradient)"
                  name="登录次数"
                  strokeWidth={3}
                />
                <Area
                  type="monotone"
                  dataKey="exams"
                  stroke="#10b981"
                  fill="url(#examsGradient)"
                  name="考试次数"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 成绩管理图表区域 */}
      {gradeStats && (
        <>
          {/* 成绩统计概览 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100 hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">总答题数</CardTitle>
                <div className="p-2 bg-green-500 rounded-lg">
                  <Award className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{gradeStats.summary.totalAnswers}</div>
                <p className="text-xs text-gray-600 mt-1">
                  所有用户提交的答案总数
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">平均分</CardTitle>
                <div className="p-2 bg-blue-500 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{gradeStats.summary.overallAverageScore}</div>
                <p className="text-xs text-gray-600 mt-1">
                  系统整体平均分
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">及格率</CardTitle>
                <div className="p-2 bg-purple-500 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{gradeStats.summary.overallPassRate}%</div>
                <p className="text-xs text-gray-600 mt-1">
                  系统整体及格率
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">参与用户</CardTitle>
                <div className="p-2 bg-orange-500 rounded-lg">
                  <Users className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{gradeStats.summary.totalUsers}</div>
                <p className="text-xs text-gray-600 mt-1">
                  参与考试的用户数
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 成绩分析图表 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 考试成绩分析 */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                  <div className="p-2 bg-indigo-500 rounded-lg mr-3">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  考试成绩分析
                </CardTitle>
                <CardDescription className="text-gray-600">
                  各考试的平均分和及格率对比
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gradeStats.examGradeChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="averageScoreGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.8} />
                        </linearGradient>
                        <linearGradient id="passRateGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#059669" stopOpacity={0.8} />
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
                        dataKey="averageScore"
                        fill="url(#averageScoreGradient)"
                        name="平均分"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="passRate"
                        fill="url(#passRateGradient)"
                        name="及格率(%)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* 成绩分布饼图 */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-50 to-rose-100">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                  <div className="p-2 bg-pink-500 rounded-lg mr-3">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  成绩分布
                </CardTitle>
                <CardDescription className="text-gray-600">
                  整体成绩等级分布情况
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={gradeStats.overallGradeDistribution}
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
                        {gradeStats.overallGradeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
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
                  {gradeStats.overallGradeDistribution.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {item.grade}: {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 成绩趋势图 */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-teal-100">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                <div className="p-2 bg-cyan-500 rounded-lg mr-3">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                成绩趋势分析
              </CardTitle>
              <CardDescription className="text-gray-600">
                最近7天的平均分和及格率变化趋势
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gradeStats.gradeTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="passGradient" x1="0" y1="0" x2="0" y2="1">
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
                    <Line
                      type="monotone"
                      dataKey="averageScore"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      name="平均分"
                      dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="passRate"
                      stroke="#10b981"
                      strokeWidth={3}
                      name="及格率(%)"
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* 快速操作和系统状态 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
            <CardDescription>
              常用的管理操作
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <a
                href="/admin/exams"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="h-6 w-6 mb-2" />
                <h3 className="font-medium">考试管理</h3>
                <p className="text-sm text-gray-600">创建和管理考试</p>
              </a>

              <a
                href="/admin/questions"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BookOpen className="h-6 w-6 mb-2" />
                <h3 className="font-medium">题目管理</h3>
                <p className="text-sm text-gray-600">添加和编辑题目</p>
              </a>

              <a
                href="/admin/users"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="h-6 w-6 mb-2" />
                <h3 className="font-medium">用户管理</h3>
                <p className="text-sm text-gray-600">管理用户账号</p>
              </a>

              <a
                href="/admin/results"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Award className="h-6 w-6 mb-2" />
                <h3 className="font-medium">成绩管理</h3>
                <p className="text-sm text-gray-600">查看考试结果</p>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>系统状态</CardTitle>
            <CardDescription>
              当前系统运行状态
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">数据库连接</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  正常
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">认证系统</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  正常
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API服务</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  正常
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">在线用户</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-800">
                  {stats.totalUsers} 人
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
