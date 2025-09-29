import { prisma } from './prisma'
import { getDeviceInfoFromHeaders } from './device-info'

export interface LoginLogData {
  userId: string
  userEmail: string
  userName: string
  ipAddress?: string
  userAgent?: string
  browserName?: string
  browserVersion?: string
  osName?: string
  osVersion?: string
  deviceType?: string
  fingerprint?: string
  country?: string
  region?: string
  city?: string
  loginType?: string
  isSuspicious?: boolean
  riskLevel?: string
}

export async function logLogin(data: LoginLogData) {
  try {
    // 获取设备信息 - 从传入的数据中获取
    const deviceInfo = {
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      browserName: data.browserName,
      browserVersion: data.browserVersion,
      osName: data.osName,
      osVersion: data.osVersion,
      deviceType: data.deviceType,
      fingerprint: data.fingerprint
    }

    // 检查是否有可疑登录（简单检测）
    const isSuspicious = await checkSuspiciousLogin(data.userId, data.ipAddress, data.fingerprint)

    // 创建登录日志
    const loginLog = await prisma.loginLog.create({
      data: {
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        ipAddress: data.ipAddress || deviceInfo.ipAddress,
        userAgent: data.userAgent || deviceInfo.userAgent,
        browserName: data.browserName || deviceInfo.browserName,
        browserVersion: data.browserVersion || deviceInfo.browserVersion,
        osName: data.osName || deviceInfo.osName,
        osVersion: data.osVersion || deviceInfo.osVersion,
        deviceType: data.deviceType || deviceInfo.deviceType,
        fingerprint: data.fingerprint || deviceInfo.fingerprint,
        country: data.country,
        region: data.region,
        city: data.city,
        loginType: data.loginType || 'web',
        isSuspicious,
        riskLevel: isSuspicious ? 'high' : 'low'
      }
    })

    return loginLog
  } catch (error) {
    console.error('Error logging login:', error)
    return null
  }
}

export async function logLogout(userId: string) {
  try {
    // 更新最近的活跃登录记录为已退出
    const activeLogin = await prisma.loginLog.findFirst({
      where: {
        userId,
        isActive: true
      },
      orderBy: {
        loginTime: 'desc'
      }
    })

    if (activeLogin) {
      const logoutTime = new Date()
      const sessionDuration = Math.floor(
        (logoutTime.getTime() - activeLogin.loginTime.getTime()) / (1000 * 60)
      )

      await prisma.loginLog.update({
        where: { id: activeLogin.id },
        data: {
          logoutTime,
          sessionDuration,
          isActive: false
        }
      })
    }
  } catch (error) {
    console.error('Error logging logout:', error)
  }
}

async function checkSuspiciousLogin(userId: string, ipAddress?: string, fingerprint?: string): Promise<boolean> {
  try {
    // 检查最近24小时内的登录记录
    const recentLogins = await prisma.loginLog.findMany({
      where: {
        userId,
        loginTime: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      orderBy: {
        loginTime: 'desc'
      },
      take: 10
    })

    // 检查IP地址变化
    if (ipAddress && recentLogins.length > 0) {
      const lastLogin = recentLogins[0]
      if (lastLogin.ipAddress && lastLogin.ipAddress !== ipAddress) {
        return true // IP地址变化，可能可疑
      }
    }

    // 检查设备指纹变化
    if (fingerprint && recentLogins.length > 0) {
      const lastLogin = recentLogins[0]
      if (lastLogin.fingerprint && lastLogin.fingerprint !== fingerprint) {
        return true // 设备指纹变化，可能可疑
      }
    }

    // 检查频繁登录
    if (recentLogins.length > 5) {
      return true // 24小时内登录超过5次，可能可疑
    }

    return false
  } catch (error) {
    console.error('Error checking suspicious login:', error)
    return false
  }
}

export async function getLoginLogs(userId?: string, limit: number = 50) {
  try {
    const where = userId ? { userId } : {}

    const logs = await prisma.loginLog.findMany({
      where,
      orderBy: {
        loginTime: 'desc'
      },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    return logs
  } catch (error) {
    console.error('Error fetching login logs:', error)
    return []
  }
}

export async function getActiveSessions() {
  try {
    const activeSessions = await prisma.loginLog.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        loginTime: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    return activeSessions
  } catch (error) {
    console.error('Error fetching active sessions:', error)
    return []
  }
}
