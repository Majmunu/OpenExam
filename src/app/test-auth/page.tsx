"use client"

import { useState } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function TestAuthPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    setLoading(true)
    try {
      const result = await signIn("credentials", {
        email: "admin@example.com",
        password: "admin123",
        redirect: false,
      })

      if (result?.error) {
        toast.error("登录失败: " + result.error)
      } else {
        toast.success("登录成功")
      }
    } catch (error) {
      toast.error("登录过程中发生错误")
      console.error("Login error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false })
      toast.success("已退出登录")
    } catch (error) {
      toast.error("退出登录失败")
      console.error("Logout error:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>NextAuth.js 测试页面</CardTitle>
            <CardDescription>测试认证功能和会话状态</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 会话状态 */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">会话状态</h3>
              <div className="flex items-center space-x-2">
                <span>状态:</span>
                <Badge variant={status === "authenticated" ? "default" : "secondary"}>
                  {status === "loading" ? "加载中..." : status === "authenticated" ? "已登录" : "未登录"}
                </Badge>
              </div>
            </div>

            {/* 用户信息 */}
            {session && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">用户信息</h3>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p><strong>ID:</strong> {session.user?.id}</p>
                  <p><strong>邮箱:</strong> {session.user?.email}</p>
                  <p><strong>姓名:</strong> {session.user?.name}</p>
                  <p><strong>角色:</strong> {session.user?.role}</p>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">操作</h3>
              <div className="flex space-x-2">
                {!session ? (
                  <Button onClick={handleSignIn} disabled={loading}>
                    {loading ? "登录中..." : "测试登录"}
                  </Button>
                ) : (
                  <Button onClick={handleSignOut} variant="outline">
                    退出登录
                  </Button>
                )}
              </div>
            </div>

            {/* 调试信息 */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">调试信息</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify({ session, status }, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
