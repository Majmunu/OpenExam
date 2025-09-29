import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { parseUserAgent, generateFingerprint } from "@/lib/device-info"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userEmail, userName, deviceInfo } = body

    // 获取真实的IP地址
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ipAddress = forwarded?.split(',')[0] || realIp || '127.0.0.1'

    // 解析用户代理
    const browserInfo = parseUserAgent(deviceInfo.userAgent)

    // 生成设备指纹
    const fingerprint = generateFingerprint(deviceInfo.userAgent, ipAddress)

    // 检测设备类型
    const deviceType = detectDeviceType(deviceInfo)

    // 检测可疑登录
    const isSuspicious = await checkSuspiciousLogin(userId, ipAddress, fingerprint)

    // 创建登录日志
    const loginLog = await prisma.loginLog.create({
      data: {
        userId,
        userEmail,
        userName,
        ipAddress,
        userAgent: deviceInfo.userAgent,
        browserName: browserInfo.browserName,
        browserVersion: browserInfo.browserVersion,
        osName: browserInfo.osName,
        osVersion: browserInfo.osVersion,
        deviceType,
        fingerprint,
        loginType: 'web',
        isActive: true,
        isSuspicious,
        riskLevel: isSuspicious ? 'medium' : 'low'
      }
    })

    return NextResponse.json({ success: true, data: loginLog })
  } catch (error) {
    console.error("Error logging client login:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function detectDeviceType(deviceInfo: any): string {
  const { userAgent, screenWidth, screenHeight, maxTouchPoints } = deviceInfo

  // 检测移动设备
  if (maxTouchPoints > 0 || /Mobile|Android|iPhone|iPad/.test(userAgent)) {
    if (/iPad|Tablet/.test(userAgent)) {
      return 'tablet'
    }
    return 'mobile'
  }

  // 检测桌面设备
  if (screenWidth >= 1024) {
    return 'desktop'
  }

  return 'unknown'
}

async function checkSuspiciousLogin(userId: string, ipAddress: string, fingerprint: string): Promise<boolean> {
  try {
    // 检查最近是否有不同的IP地址登录
    const recentLogs = await prisma.loginLog.findMany({
      where: {
        userId,
        loginTime: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24小时内
        }
      },
      orderBy: { loginTime: 'desc' },
      take: 5
    })

    // 如果IP地址不同，标记为可疑
    const hasDifferentIp = recentLogs.some(log => log.ipAddress !== ipAddress)

    // 如果设备指纹不同，标记为可疑
    const hasDifferentFingerprint = recentLogs.some(log => log.fingerprint !== fingerprint)

    return hasDifferentIp || hasDifferentFingerprint
  } catch (error) {
    console.error("Error checking suspicious login:", error)
    return false
  }
}
