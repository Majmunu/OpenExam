"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function NewUserPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/admin/users")
      } else {
        const error = await response.json()
        alert(error.error || "创建失败")
      }
    } catch (error) {
      console.error("Error creating user:", error)
      alert("创建失败")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">新建用户</h1>
          <p className="text-gray-600">创建新的系统用户</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>用户信息</CardTitle>
          <CardDescription>
            填写用户的基本信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">姓名 *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="请输入姓名"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">邮箱 *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="请输入邮箱"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">密码 *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="请输入密码"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">角色 *</Label>
                <Select value={formData.role} onValueChange={handleSelectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择角色" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">管理员</SelectItem>
                    <SelectItem value="USER">用户</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/users">取消</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Save className="h-4 w-4 mr-2 animate-spin" />}
                创建用户
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
