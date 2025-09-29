"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  BookOpen,
  LogOut,
  Home,
  Clock,
  FileText
} from "lucide-react"
import { toast } from "sonner"
import { logLogout } from "@/lib/login-logger"
import { PageTransition } from "@/components/ui/page-transition"

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/login")
      return
    }
    if (session.user.role !== "USER") {
      router.push("/admin")
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

  if (!session || session.user.role !== "USER") {
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
    if (href === "/user") {
      return pathname === "/user"
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
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/user" className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">考试系统</span>
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

      <div className="flex h-[calc(100vh-4rem)]">
        {/* 侧边栏 - 固定宽度 */}
        <div className="w-64 sidebar-modern shadow-sm border-r flex-shrink-0">
          <div className="p-4">
            <nav className="space-y-2">
              <Link
                href="/user"
                className={getNavItemClass("/user")}
              >
                <Home className="h-4 w-4" />
                <span>首页</span>
              </Link>

              <Link
                href="/user/exams"
                className={getNavItemClass("/user/exams")}
              >
                <FileText className="h-4 w-4" />
                <span>我的考试</span>
              </Link>

              <Link
                href="/user/history"
                className={getNavItemClass("/user/history")}
              >
                <Clock className="h-4 w-4" />
                <span>考试记录</span>
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
