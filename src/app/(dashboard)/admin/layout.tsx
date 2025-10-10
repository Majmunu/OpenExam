"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
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
  Settings,
  Shield,
  Bell,
  TrendingUp
} from "lucide-react"
import { toast } from "sonner"
import { logLogout } from "@/lib/login-logger"
import { PageTransition } from "@/components/ui/page-transition"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/login")
      return
    }
    if (session.user.role !== "ADMIN") {
      router.push("/user")
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

  const handleSignOut = async () => {
    if (session?.user?.id) {
      await logLogout(session.user.id)
    }
    toast.success("已退出登录")
    signOut({ callbackUrl: "/login" })
  }

  // 判断导航项是否选中
  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin"
    }
    return pathname.startsWith(href)
  }

  // 获取导航项的样式类
  const getNavItemClass = (href: string) => {
    const baseClass = "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium nav-item-animate"
    const activeClass = "active"
    const inactiveClass = "text-gray-600 hover:text-gray-900"

    return `${baseClass} ${isActive(href) ? activeClass : inactiveClass}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo区域 */}
            <Link href="/admin" className="flex items-center space-x-3 group">
              <div className="p-2 bg-purple-600 rounded-lg shadow-sm group-hover:shadow-md transition-all duration-200">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors duration-200">
                  考试管理系统
                </span>
                <span className="block text-xs text-gray-500">管理控制台</span>
              </div>
            </Link>

            {/* 用户信息区域 */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                <div className="w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {session.user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {session.user.name}
                </span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-1" />
                退出
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* 侧边栏 - 固定宽度 */}
        <div className="w-64 sidebar-modern shadow-sm border-r flex-shrink-0">
          <div className="p-4">
            <nav className="space-y-2">
              <Link
                href="/admin"
                className={getNavItemClass("/admin")}
              >
                <Home className="h-4 w-4" />
                <span>仪表板</span>
              </Link>

              <Link
                href="/admin/exams"
                className={getNavItemClass("/admin/exams")}
              >
                <FileText className="h-4 w-4" />
                <span>考试管理</span>
              </Link>

              <Link
                href="/admin/questions"
                className={getNavItemClass("/admin/questions")}
              >
                <BookOpen className="h-4 w-4" />
                <span>题目管理</span>
              </Link>

              <Link
                href="/admin/users"
                className={getNavItemClass("/admin/users")}
              >
                <Users className="h-4 w-4" />
                <span>用户管理</span>
              </Link>

              <Link
                href="/admin/results"
                className={getNavItemClass("/admin/results")}
              >
                <FileText className="h-4 w-4" />
                <span>成绩管理</span>
              </Link>

              <Link
                href="/admin/logs"
                className={getNavItemClass("/admin/logs")}
              >
                <FileText className="h-4 w-4" />
                <span>日志管理</span>
              </Link>

              <Link
                href="/admin/login-logs"
                className={getNavItemClass("/admin/login-logs")}
              >
                <Shield className="h-4 w-4" />
                <span>登录日志</span>
              </Link>
              <Link
                href="/admin/announcements"
                className={getNavItemClass("/admin/announcements")}
              >
                <Bell className="h-4 w-4" />
                <span>公告管理</span>
              </Link>
              <Link
                href="/admin/analytics"
                className={getNavItemClass("/admin/analytics")}
              >
                <TrendingUp className="h-4 w-4" />
                <span>数据分析</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* 主内容区 - 可滚动 */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <div className="p-6">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </div>
      </div>
    </div>
  )
}
