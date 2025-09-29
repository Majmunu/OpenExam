"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RefreshCw, Shield, AlertTriangle, CheckCircle, Clock, Users, Monitor } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

interface LoginLog {
  id: string
  userId: string
  userEmail: string
  userName: string
  loginTime: string
  logoutTime?: string
  sessionDuration?: number
  ipAddress?: string
  userAgent?: string
  browserName?: string
  browserVersion?: string
  osName?: string
  osVersion?: string
  deviceType?: string
  fingerprint?: string
  country?: string
  region?: string
  city?: string
  isActive: boolean
  loginType: string
  isSuspicious: boolean
  riskLevel: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

export default function LoginLogsPage() {
  const [logs, setLogs] = useState<LoginLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    type: "all",
    userId: "",
    limit: "50"
  })

  useEffect(() => {
    fetchLogs()
  }, [filter])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter.type !== "all") params.append("type", filter.type)
      if (filter.userId) params.append("userId", filter.userId)
      params.append("limit", filter.limit)

      const response = await fetch(`/api/login-logs?${params}`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data.data)
      } else {
        toast.error("获取登录日志失败")
      }
    } catch (error) {
      console.error("Error fetching login logs:", error)
      toast.error("获取登录日志失败")
    } finally {
      setLoading(false)
    }
  }

  const getRiskLevelBadge = (riskLevel: string, isSuspicious: boolean) => {
    if (isSuspicious || riskLevel === "high") {
      return <Badge variant="destructive">高风险</Badge>
    } else if (riskLevel === "medium") {
      return <Badge variant="secondary">中风险</Badge>
    } else {
      return <Badge variant="outline">低风险</Badge>
    }
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "mobile":
        return <Monitor className="h-4 w-4" />
      case "tablet":
        return <Monitor className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const getStatusIcon = (isActive: boolean) => {
    if (isActive) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    } else {
      return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getSuspiciousIcon = (isSuspicious: boolean) => {
    if (isSuspicious) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    } else {
      return <Shield className="h-4 w-4 text-green-500" />
    }
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "未知"
    if (minutes < 60) return `${minutes}分钟`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}小时${remainingMinutes}分钟`
  }

  const getLocationText = (country?: string, region?: string, city?: string) => {
    if (city && region && country) {
      return `${city}, ${region}, ${country}`
    } else if (region && country) {
      return `${region}, ${country}`
    } else if (country) {
      return country
    } else {
      return "未知"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">登录日志管理</h1>
          <p className="text-gray-600">查看和管理用户登录记录</p>
        </div>
        <Button onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {/* 筛选器 */}
      <Card>
        <CardHeader>
          <CardTitle>筛选条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">日志类型</Label>
              <Select value={filter.type} onValueChange={(value) => setFilter(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部日志</SelectItem>
                  <SelectItem value="active">活跃会话</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="userId">用户ID</Label>
              <Input
                id="userId"
                placeholder="输入用户ID"
                value={filter.userId}
                onChange={(e) => setFilter(prev => ({ ...prev, userId: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="limit">显示数量</Label>
              <Select value={filter.limit} onValueChange={(value) => setFilter(prev => ({ ...prev, limit: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20条</SelectItem>
                  <SelectItem value="50">50条</SelectItem>
                  <SelectItem value="100">100条</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchLogs} className="w-full">
                应用筛选
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总登录次数</p>
                <p className="text-2xl font-bold">{logs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">活跃会话</p>
                <p className="text-2xl font-bold">{logs.filter(log => log.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">可疑登录</p>
                <p className="text-2xl font-bold">{logs.filter(log => log.isSuspicious).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Monitor className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">设备类型</p>
                <p className="text-sm text-gray-500">
                  {logs.filter(log => log.deviceType === 'mobile').length} 移动端
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 登录日志表格 */}
      <Card>
        <CardHeader>
          <CardTitle>登录日志详情</CardTitle>
          <CardDescription>查看详细的用户登录信息</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">加载中...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户信息</TableHead>
                    <TableHead>登录时间</TableHead>
                    <TableHead>会话时长</TableHead>
                    <TableHead>设备信息</TableHead>
                    <TableHead>网络信息</TableHead>
                    <TableHead>安全状态</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{log.userName}</p>
                          <p className="text-sm text-gray-500">{log.userEmail}</p>
                          <Badge variant="outline" className="mt-1">
                            {log.user.role === 'ADMIN' ? '管理员' : '用户'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{format(new Date(log.loginTime), 'yyyy-MM-dd HH:mm:ss')}</p>
                          {log.logoutTime && (
                            <p className="text-xs text-gray-500">
                              退出: {format(new Date(log.logoutTime), 'HH:mm:ss')}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDuration(log.sessionDuration)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getDeviceIcon(log.deviceType || 'desktop')}
                          <div>
                            <p className="text-sm">{log.browserName} {log.browserVersion}</p>
                            <p className="text-xs text-gray-500">{log.osName} {log.osVersion}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-mono">{log.ipAddress}</p>
                          <p className="text-xs text-gray-500">{getLocationText(log.country, log.region, log.city)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getSuspiciousIcon(log.isSuspicious)}
                          {getRiskLevelBadge(log.riskLevel, log.isSuspicious)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getStatusIcon(log.isActive)}
                          <span className="ml-2 text-sm">
                            {log.isActive ? '在线' : '离线'}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
