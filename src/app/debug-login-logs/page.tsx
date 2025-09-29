"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface LoginLog {
  id: string
  userId: string
  userEmail: string
  userName: string
  loginTime: string
  ipAddress?: string
  userAgent?: string
  browserName?: string
  osName?: string
  deviceType?: string
  isActive: boolean
}

export default function DebugLoginLogsPage() {
  const [logs, setLogs] = useState<LoginLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/login-logs")
      if (response.ok) {
        const data = await response.json()
        setLogs(data.data)
        toast.success(`获取到 ${data.count} 条登录日志`)
      } else {
        const errorData = await response.json()
        toast.error(`获取失败: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("获取登录日志失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">登录日志调试</h1>
            <p className="text-gray-600">查看数据库中的登录日志记录</p>
          </div>
          <Button onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>登录日志列表</CardTitle>
            <CardDescription>共 {logs.length} 条记录</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span className="ml-2">加载中...</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                暂无登录日志记录
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{log.userName}</h3>
                        <Badge variant="outline">{log.userEmail}</Badge>
                        {log.isActive && <Badge variant="default">在线</Badge>}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(log.loginTime).toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">IP地址:</span> {log.ipAddress || '未知'}
                      </div>
                      <div>
                        <span className="font-medium">浏览器:</span> {log.browserName || '未知'}
                      </div>
                      <div>
                        <span className="font-medium">系统:</span> {log.osName || '未知'}
                      </div>
                      <div>
                        <span className="font-medium">设备:</span> {log.deviceType || '未知'}
                      </div>
                    </div>
                    {log.userAgent && (
                      <div className="mt-2 text-xs text-gray-500 font-mono">
                        {log.userAgent}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
