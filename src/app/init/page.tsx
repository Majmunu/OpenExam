"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function InitPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleInit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/init-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: '初始化失败',
        error: error instanceof Error ? error.message : '未知错误'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>数据库初始化</CardTitle>
          <CardDescription>
            初始化数据库并创建测试用户
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleInit} 
            disabled={loading}
            className="w-full"
          >
            {loading ? '初始化中...' : '初始化数据库'}
          </Button>

          {result && (
            <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>状态:</strong> {result.success ? '成功' : '失败'}</p>
                  <p><strong>消息:</strong> {result.message}</p>
                  
                  {result.data && (
                    <div className="mt-4 space-y-2">
                      <p><strong>测试账号:</strong></p>
                      <div className="bg-gray-100 p-2 rounded text-sm">
                        <p><strong>管理员:</strong> {result.data.admin.email} / {result.data.admin.password}</p>
                        <p><strong>用户:</strong> {result.data.user.email} / {result.data.user.password}</p>
                      </div>
                    </div>
                  )}
                  
                  {result.error && (
                    <p className="text-red-600"><strong>错误:</strong> {result.error}</p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
