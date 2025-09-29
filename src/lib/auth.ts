import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

// 简单的User Agent解析函数
function parseUserAgent(userAgent: string) {
  let browserName = 'Unknown'
  let browserVersion = 'Unknown'
  let osName = 'Unknown'
  let osVersion = 'Unknown'
  let deviceType = 'desktop'

  if (userAgent.includes('Chrome')) {
    browserName = 'Chrome'
    const match = userAgent.match(/Chrome\/(\d+\.\d+)/)
    browserVersion = match ? match[1] : 'Unknown'
  } else if (userAgent.includes('Firefox')) {
    browserName = 'Firefox'
    const match = userAgent.match(/Firefox\/(\d+\.\d+)/)
    browserVersion = match ? match[1] : 'Unknown'
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browserName = 'Safari'
    const match = userAgent.match(/Version\/(\d+\.\d+)/)
    browserVersion = match ? match[1] : 'Unknown'
  }

  if (userAgent.includes('Windows')) {
    osName = 'Windows'
    if (userAgent.includes('Windows NT 10.0')) osVersion = '10'
    else if (userAgent.includes('Windows NT 6.3')) osVersion = '8.1'
  } else if (userAgent.includes('Mac OS X')) {
    osName = 'macOS'
    const match = userAgent.match(/Mac OS X (\d+[._]\d+)/)
    osVersion = match ? match[1].replace('_', '.') : 'Unknown'
  } else if (userAgent.includes('Linux')) {
    osName = 'Linux'
  }

  if (userAgent.includes('Mobile')) {
    deviceType = 'mobile'
  } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
    deviceType = 'tablet'
  }

  return { browserName, browserVersion, osName, osVersion, deviceType }
}

// 简单的指纹生成函数
function generateFingerprint(userAgent: string, ipAddress: string): string {
  const fingerprintData = `${userAgent}-${ipAddress}`
  let hash = 0
  for (let i = 0; i < fingerprintData.length; i++) {
    const char = fingerprintData.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = user.role
        // 登录日志记录移到客户端处理，避免在JWT回调中执行数据库操作
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  }
}
