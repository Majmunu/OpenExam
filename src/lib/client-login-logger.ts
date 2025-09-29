// 客户端登录日志记录器
export interface ClientDeviceInfo {
  userAgent: string
  screenWidth: number
  screenHeight: number
  colorDepth: number
  pixelRatio: number
  timezone: string
  language: string
  platform: string
  cookieEnabled: boolean
  doNotTrack: string | null
  hardwareConcurrency: number
  maxTouchPoints: number
  deviceMemory?: number
  connectionType?: string
  fingerprint: string
}

export function getClientDeviceInfo(): ClientDeviceInfo {
  const userAgent = navigator.userAgent
  const screen = window.screen
  const nav = navigator

  // 生成设备指纹
  const fingerprint = generateClientFingerprint()

  return {
    userAgent,
    screenWidth: screen.width,
    screenHeight: screen.height,
    colorDepth: screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: nav.language,
    platform: nav.platform,
    cookieEnabled: nav.cookieEnabled,
    doNotTrack: nav.doNotTrack,
    hardwareConcurrency: nav.hardwareConcurrency,
    maxTouchPoints: nav.maxTouchPoints,
    deviceMemory: (nav as any).deviceMemory,
    connectionType: (nav as any).connection?.effectiveType,
    fingerprint
  }
}

function generateClientFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.platform,
    navigator.hardwareConcurrency,
    navigator.maxTouchPoints
  ]

  // 简单的哈希函数
  const str = components.join('|')
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转换为32位整数
  }
  return Math.abs(hash).toString(36)
}

export async function logClientLogin(userId: string, userEmail: string, userName: string) {
  try {
    const deviceInfo = getClientDeviceInfo()

    const response = await fetch('/api/auth/log-client-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        userEmail,
        userName,
        deviceInfo
      })
    })

    if (!response.ok) {
      console.error('Failed to log client login:', response.statusText)
    }
  } catch (error) {
    console.error('Error logging client login:', error)
  }
}
