"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  BookOpen,
  Users,
  FileText,
  LogOut,
  Home,
  Settings
} from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/login")
      return
    }
    if (session.user.role !== "ADMIN") {
      router.push("/student")
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session || session.user.role !== "ADMIN") {
    return null
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin" className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">考试管理系统</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                欢迎，{session.user.name}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                退出
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 侧边栏 */}
          <div className="lg:w-64">
            <Card>
              <div className="p-4">
                <nav className="space-y-2">
                  <Link
                    href="/admin"
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <Home className="h-4 w-4" />
                    <span>仪表板</span>
                  </Link>

                  <Link
                    href="/admin/exams"
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <FileText className="h-4 w-4" />
                    <span>考试管理</span>
                  </Link>

                  <Link
                    href="/admin/questions"
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>题目管理</span>
                  </Link>

                  <Link
                    href="/admin/users"
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <Users className="h-4 w-4" />
                    <span>用户管理</span>
                  </Link>

                  <Link
                    href="/admin/results"
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <FileText className="h-4 w-4" />
                    <span>成绩管理</span>
                  </Link>
                </nav>
              </div>
            </Card>
          </div>

          {/* 主内容区 */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
