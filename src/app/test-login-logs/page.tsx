"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RefreshCw, Shield, AlertTriangle, CheckCircle, Monitor, Smartphone, Tablet, Clock } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { logClientLogin } from "@/lib/client-login-logger"

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
  isActive: boolean
  isSuspicious: boolean
  riskLevel: string
  loginType: string
}

export default function TestLoginLogsPage() {
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    suspicious: 0,
    today: 0
  })

  const fetchLoginLogs = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/login-logs")
      if (response.ok) {
        const data = await response.json()
        setLoginLogs(data.data || [])
        setStats(data.stats || stats)
        toast.success("登录日志加载成功")
      } else {
        toast.error("加载登录日志失败")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("加载失败")
    } finally {
      setLoading(false)
    }
  }

  const testClientLogin = async () => {
    try {
      await logClientLogin("test-user-123", "test@example.com", "测试用户")
      toast.success("客户端登录日志测试完成")
      await fetchLoginLogs()
    } catch (error) {
      console.error("Error:", error)
      toast.error("测试失败")
    }
  }

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />
      case 'tablet':
        return <Tablet className="h-4 w-4" />
      case 'desktop':
        return <Monitor className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const getRiskBadge = (riskLevel: string, isSuspicious: boolean) => {
    if (isSuspicious) {
      return <Badge variant="destructive">高风险</Badge>
    }
    switch (riskLevel) {
      case 'high':
        return <Badge variant="destructive">高风险</Badge>
      case 'medium':
        return <Badge variant="secondary">中风险</Badge>
      default:
        return <Badge variant="outline">低风险</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MM-dd HH:mm")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">登录日志测试</h1>
            <p className="text-gray-600">测试和查看用户登录行为数据</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={testClientLogin} disabled={loading}>
              测试客户端登录
            </Button>
            <Button onClick={fetchLoginLogs} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新数据
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总登录次数</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">活跃会话</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">可疑登录</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.suspicious}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今日登录</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.today}</div>
            </CardContent>
          </Card>
        </div>

        {/* 登录日志表格 */}
        <Card>
          <CardHeader>
            <CardTitle>登录日志详情</CardTitle>
            <CardDescription>详细的用户登录行为记录</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户</TableHead>
                    <TableHead>网络信息</TableHead>
                    <TableHead>设备信息</TableHead>
                    <TableHead>浏览器</TableHead>
                    <TableHead>操作系统</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>风险等级</TableHead>
                    <TableHead>登录时间</TableHead>
                    <TableHead>会话时长</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loginLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{log.userName}</div>
                          <div className="text-sm text-gray-500">{log.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-mono text-sm">{log.ipAddress}</div>
                          {log.fingerprint && (
                            <div className="text-xs text-gray-500">
                              指纹: {log.fingerprint.substring(0, 12)}...
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getDeviceIcon(log.deviceType)}
                          <span className="capitalize">{log.deviceType}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{log.browserName} {log.browserVersion}</div>
                          <div className="text-xs text-gray-500 max-w-32 truncate">
                            {log.userAgent?.substring(0, 30)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{log.osName} {log.osVersion}</div>
                          <div className="text-xs text-gray-500">{log.loginType}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={log.isActive ? "default" : "secondary"}>
                          {log.isActive ? "活跃" : "已退出"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getRiskBadge(log.riskLevel, log.isSuspicious)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{formatDate(log.loginTime)}</div>
                          {log.logoutTime && (
                            <div className="text-xs text-gray-500">
                              退出: {formatDate(log.logoutTime)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.sessionDuration ? `${log.sessionDuration}分钟` : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
