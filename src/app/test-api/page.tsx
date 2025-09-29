"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function TestApiPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const testAnswersApi = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/answers")
      console.log("Response status:", response.status)
      console.log("Response headers:", response.headers)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("API Response:", data)
      console.log("Is Array:", Array.isArray(data))
      console.log("Data length:", Array.isArray(data) ? data.length : "Not an array")

      setResults({
        isArray: Array.isArray(data),
        length: Array.isArray(data) ? data.length : "N/A",
        data: data
      })

      toast.success("API测试成功")
    } catch (error) {
      console.error("API Error:", error)
      toast.error(`API测试失败: ${error instanceof Error ? error.message : "未知错误"}`)
    } finally {
      setLoading(false)
    }
  }

  const testExamsApi = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/exams")
      console.log("Exams Response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Exams API Response:", data)

      toast.success("考试API测试成功")
    } catch (error) {
      console.error("Exams API Error:", error)
      toast.error(`考试API测试失败: ${error instanceof Error ? error.message : "未知错误"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API测试页面</h1>
          <p className="text-gray-600">测试API响应和数据结构</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>答案API测试</CardTitle>
              <CardDescription>测试 /api/answers 端点</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={testAnswersApi} disabled={loading} className="w-full">
                {loading ? "测试中..." : "测试答案API"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>考试API测试</CardTitle>
              <CardDescription>测试 /api/exams 端点</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={testExamsApi} disabled={loading} className="w-full">
                {loading ? "测试中..." : "测试考试API"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {results && (
          <Card>
            <CardHeader>
              <CardTitle>测试结果</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>是否为数组:</strong> {results.isArray ? "是" : "否"}</p>
                <p><strong>数据长度:</strong> {results.length}</p>
                <details className="mt-4">
                  <summary className="cursor-pointer font-medium">查看原始数据</summary>
                  <pre className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-auto max-h-96">
                    {JSON.stringify(results.data, null, 2)}
                  </pre>
                </details>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
