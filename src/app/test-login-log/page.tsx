"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function TestLoginLogPage() {
  const [loading, setLoading] = useState(false)

  const testLoginLog = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/login-logs")
      if (response.ok) {
        const data = await response.json()
        toast.success(`获取到 ${data.count} 条登录日志`)
        console.log("Login logs:", data.data)
      } else {
        const errorData = await response.json()
        toast.error(`获取登录日志失败: ${errorData.error}`)
        console.error("Error response:", errorData)
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("测试失败")
    } finally {
      setLoading(false)
    }
  }

  const testLogLogin = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/log-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "test-user-id",
          userEmail: "test@example.com",
          userName: "测试用户"
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success("登录日志记录成功")
        console.log("Login log created:", data.data)
      } else {
        const errorData = await response.json()
        toast.error(`记录登录日志失败: ${errorData.error}`)
        console.error("Error response:", errorData)
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("测试失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>登录日志功能测试</CardTitle>
            <CardDescription>测试登录日志记录和查询功能</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button onClick={testLogLogin} disabled={loading} className="w-full">
                {loading ? "测试中..." : "测试记录登录日志"}
              </Button>
              <Button onClick={testLoginLog} disabled={loading} className="w-full">
                {loading ? "测试中..." : "测试获取登录日志"}
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              <p>此页面用于测试登录日志功能：</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>测试记录登录日志</li>
                <li>测试获取登录日志</li>
                <li>检查数据库连接</li>
                <li>验证API接口</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
