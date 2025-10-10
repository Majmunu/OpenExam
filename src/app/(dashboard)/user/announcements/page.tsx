"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, AlertCircle, Info, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"

interface Announcement {
  id: string
  title: string
  content: string
  type: string
  priority: number
  isPinned: boolean
  isActive: boolean
  startTime: string | null
  endTime: string | null
  targetRole: string
  createdAt: string
  creator: {
    id: string
    name: string
    email: string
  }
  reads: Array<{
    id: string
    readAt: string
  }>
  _count: {
    reads: number
  }
}

export default function UserAnnouncementsPage() {
  const { data: session } = useSession()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/announcements?page=${page}&limit=10`)
      
      if (!response.ok) {
        throw new Error('获取公告失败')
      }
      
      const data = await response.json()
      setAnnouncements(data.announcements || [])
      setTotalPages(data.pagination?.pages || 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取公告失败')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (announcementId: string) => {
    try {
      const response = await fetch(`/api/announcements/${announcementId}/read`, {
        method: 'POST'
      })
      
      if (response.ok) {
        // 更新本地状态
        setAnnouncements(prev => 
          prev.map(announcement => 
            announcement.id === announcementId 
              ? { ...announcement, reads: [{ id: 'temp', readAt: new Date().toISOString() }] }
              : announcement
          )
        )
      }
    } catch (err) {
      console.error('标记已读失败:', err)
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [page])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'success':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 3) return 'bg-red-100 text-red-800'
    if (priority >= 2) return 'bg-orange-100 text-orange-800'
    return 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>{error}</p>
              <Button onClick={fetchAnnouncements} className="mt-4">
                重试
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">公告中心</h1>
        <p className="text-gray-600 mt-1">查看最新公告和通知</p>
      </div>

      {announcements.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <Info className="h-8 w-8 mx-auto mb-2" />
              <p>暂无公告</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => {
            const isRead = announcement.reads.length > 0
            const isExpired = announcement.endTime && new Date(announcement.endTime) < new Date()
            const isNotStarted = announcement.startTime && new Date(announcement.startTime) > new Date()
            
            return (
              <Card 
                key={announcement.id} 
                className={`transition-all hover:shadow-md ${
                  isRead ? 'opacity-75' : 'border-l-4 border-l-blue-500'
                } ${isExpired ? 'opacity-50' : ''}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(announcement.type)}
                      <CardTitle className={`text-lg ${isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                        {announcement.title}
                        {announcement.isPinned && (
                          <Badge variant="secondary" className="ml-2">置顶</Badge>
                        )}
                      </CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getTypeColor(announcement.type)}>
                        {announcement.type}
                      </Badge>
                      <Badge className={getPriorityColor(announcement.priority)}>
                        优先级 {announcement.priority}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{announcement.creator.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(announcement.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                      </span>
                    </div>
                    {announcement.startTime && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          开始: {format(new Date(announcement.startTime), 'MM-dd HH:mm', { locale: zhCN })}
                        </span>
                      </div>
                    )}
                    {announcement.endTime && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          结束: {format(new Date(announcement.endTime), 'MM-dd HH:mm', { locale: zhCN })}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="prose max-w-none">
                    <div 
                      className="text-gray-700 whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ 
                        __html: announcement.content.replace(/\n/g, '<br>') 
                      }}
                    />
                  </div>
                  
                  {isExpired && (
                    <div className="mt-3 p-2 bg-gray-100 rounded text-sm text-gray-600">
                      此公告已过期
                    </div>
                  )}
                  
                  {isNotStarted && (
                    <div className="mt-3 p-2 bg-blue-100 rounded text-sm text-blue-600">
                      此公告尚未开始
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-500">
                      阅读量: {announcement._count.reads}
                    </div>
                    
                    {!isRead && !isExpired && !isNotStarted && (
                      <Button 
                        size="sm" 
                        onClick={() => markAsRead(announcement.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        标记已读
                      </Button>
                    )}
                    
                    {isRead && (
                      <div className="text-sm text-green-600 flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4" />
                        <span>已读</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              上一页
            </Button>
            <span className="flex items-center px-3 py-2 text-sm text-gray-700">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              下一页
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}


