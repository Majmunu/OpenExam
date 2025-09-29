"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function TestDbPage() {
  const [loading, setLoading] = useState(false)

  const testDbConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-db")
      if (response.ok) {
        const data = await response.json()
        toast.success("数据库连接成功")
        console.log("Database test result:", data)
      } else {
        try {
          const errorData = await response.json()
          toast.error(`数据库连接失败: ${errorData.error}`)
          console.error("Error response:", errorData)
        } catch (jsonError) {
          const text = await response.text()
          toast.error(`数据库连接失败: ${response.status} ${response.statusText}`)
          console.error("Error response (not JSON):", text)
        }
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("测试失败")
    } finally {
      setLoading(false)
    }
  }

  const testCreateLoginLog = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-create-login-log")
      if (response.ok) {
        const data = await response.json()
        toast.success("创建登录日志成功")
        console.log("Login log created:", data)
      } else {
        try {
          const errorData = await response.json()
          toast.error(`创建失败: ${errorData.error}`)
          console.error("Error response:", errorData)
        } catch (jsonError) {
          const text = await response.text()
          toast.error(`创建失败: ${response.status} ${response.statusText}`)
          console.error("Error response (not JSON):", text)
        }
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("测试失败")
    } finally {
      setLoading(false)
    }
  }

  const testManualLoginLog = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/manual-login-log", {
        method: "POST"
      })
      if (response.ok) {
        const data = await response.json()
        toast.success("手动创建登录日志成功")
        console.log("Manual login log created:", data)
      } else {
        try {
          const errorData = await response.json()
          toast.error(`手动创建失败: ${errorData.error}`)
          console.error("Error response:", errorData)
        } catch (jsonError) {
          const text = await response.text()
          toast.error(`手动创建失败: ${response.status} ${response.statusText}`)
          console.error("Error response (not JSON):", text)
        }
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("测试失败")
    } finally {
      setLoading(false)
    }
  }

  const checkLoginLogs = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/check-login-logs")
      if (response.ok) {
        const data = await response.json()
        toast.success(`LoginLogs表检查成功，共 ${data.data.count} 条记录`)
        console.log("Login logs check result:", data)
      } else {
        try {
          const errorData = await response.json()
          toast.error(`检查失败: ${errorData.error}`)
          console.error("Error response:", errorData)
        } catch (jsonError) {
          const text = await response.text()
          toast.error(`检查失败: ${response.status} ${response.statusText}`)
          console.error("Error response (not JSON):", text)
        }
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("测试失败")
    } finally {
      setLoading(false)
    }
  }

  const debugDatabase = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug-db")
      if (response.ok) {
        const data = await response.json()
        toast.success(`数据库调试成功 - 用户: ${data.data.userCount}, 登录日志: ${data.data.loginLogCount}`)
        console.log("Database debug result:", data)
      } else {
        try {
          const errorData = await response.json()
          toast.error(`调试失败: ${errorData.error}`)
          console.error("Error response:", errorData)
        } catch (jsonError) {
          const text = await response.text()
          toast.error(`调试失败: ${response.status} ${response.statusText}`)
          console.error("Error response (not JSON):", text)
        }
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("测试失败")
    } finally {
      setLoading(false)
    }
  }

  const checkDbSafety = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/check-db-safety")
      if (response.ok) {
        const data = await response.json()
        const { existingData, safety, recommendations } = data.data

        if (safety.isSafe) {
          toast.success(`数据库安全 - 现有数据: 用户${existingData.users}个, 考试${existingData.exams}个, 题目${existingData.questions}个`)
        } else {
          toast.error("数据库安全检查失败")
        }

        console.log("Database safety check:", data)
      } else {
        try {
          const errorData = await response.json()
          toast.error(`安全检查失败: ${errorData.error}`)
          console.error("Error response:", errorData)
        } catch (jsonError) {
          const text = await response.text()
          toast.error(`安全检查失败: ${response.status} ${response.statusText}`)
          console.error("Error response (not JSON):", text)
        }
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
            <CardTitle>数据库连接测试</CardTitle>
            <CardDescription>测试数据库连接和登录日志创建</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button onClick={testDbConnection} disabled={loading} className="w-full">
                {loading ? "测试中..." : "测试数据库连接"}
              </Button>
              <Button onClick={checkDbSafety} disabled={loading} className="w-full">
                {loading ? "测试中..." : "数据库安全检查"}
              </Button>
              <Button onClick={debugDatabase} disabled={loading} className="w-full">
                {loading ? "测试中..." : "数据库调试信息"}
              </Button>
              <Button onClick={checkLoginLogs} disabled={loading} className="w-full">
                {loading ? "测试中..." : "检查LoginLogs表"}
              </Button>
              <Button onClick={testCreateLoginLog} disabled={loading} className="w-full">
                {loading ? "测试中..." : "测试创建登录日志"}
              </Button>
              <Button onClick={testManualLoginLog} disabled={loading} className="w-full">
                {loading ? "测试中..." : "手动创建登录日志"}
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              <p>此页面用于测试数据库功能：</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>测试数据库连接</li>
                <li>测试创建登录日志</li>
                <li>检查Prisma客户端</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
