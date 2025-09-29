export interface DeviceInfo {
  ipAddress: string
  userAgent: string
  browserName: string
  browserVersion: string
  osName: string
  osVersion: string
  deviceType: string
  fingerprint: string
}

export function getDeviceInfoFromHeaders(headers: Headers): Partial<DeviceInfo> {
  const userAgent = headers.get('user-agent') || ''
  const forwardedFor = headers.get('x-forwarded-for')
  const realIp = headers.get('x-real-ip')
  const cfConnectingIp = headers.get('cf-connecting-ip')
  
  // 获取IP地址
  const ipAddress = cfConnectingIp || realIp || forwardedFor?.split(',')[0] || 'unknown'
  
  // 解析User Agent
  const browserInfo = parseUserAgent(userAgent)
  
  return {
    ipAddress,
    userAgent,
    ...browserInfo,
    fingerprint: generateFingerprint(userAgent, ipAddress)
  }
}

export function parseUserAgent(userAgent: string) {
  // 浏览器检测
  let browserName = 'Unknown'
  let browserVersion = 'Unknown'

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
  } else if (userAgent.includes('Edge')) {
    browserName = 'Edge'
    const match = userAgent.match(/Edge\/(\d+\.\d+)/)
    browserVersion = match ? match[1] : 'Unknown'
  }

  // 操作系统检测
  let osName = 'Unknown'
  let osVersion = 'Unknown'

  if (userAgent.includes('Windows')) {
    osName = 'Windows'
    if (userAgent.includes('Windows NT 10.0')) osVersion = '10'
    else if (userAgent.includes('Windows NT 6.3')) osVersion = '8.1'
    else if (userAgent.includes('Windows NT 6.2')) osVersion = '8'
    else if (userAgent.includes('Windows NT 6.1')) osVersion = '7'
  } else if (userAgent.includes('Mac OS X')) {
    osName = 'macOS'
    const match = userAgent.match(/Mac OS X (\d+[._]\d+)/)
    osVersion = match ? match[1].replace('_', '.') : 'Unknown'
  } else if (userAgent.includes('Linux')) {
    osName = 'Linux'
  } else if (userAgent.includes('Android')) {
    osName = 'Android'
    const match = userAgent.match(/Android (\d+\.\d+)/)
    osVersion = match ? match[1] : 'Unknown'
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    osName = 'iOS'
    const match = userAgent.match(/OS (\d+[._]\d+)/)
    osVersion = match ? match[1].replace('_', '.') : 'Unknown'
  }

  // 设备类型检测
  let deviceType = 'desktop'
  if (userAgent.includes('Mobile')) {
    deviceType = 'mobile'
  } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
    deviceType = 'tablet'
  }

  return {
    browserName,
    browserVersion,
    osName,
    osVersion,
    deviceType
  }
}

export function generateFingerprint(userAgent: string, ipAddress: string): string {
  // 简单的设备指纹生成
  const canvas = 'canvas-fingerprint'
  const timezone = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC'
  const language = typeof navigator !== 'undefined' ? navigator.language : 'en'

  const fingerprintData = `${userAgent}-${ipAddress}-${canvas}-${timezone}-${language}`

  // 简单的哈希函数
  let hash = 0
  for (let i = 0; i < fingerprintData.length; i++) {
    const char = fingerprintData.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转换为32位整数
  }

  return Math.abs(hash).toString(36)
}

// 客户端设备信息获取
export function getClientDeviceInfo(): Partial<DeviceInfo> {
  if (typeof window === 'undefined') {
    return {}
  }
  
  const userAgent = navigator.userAgent
  const browserInfo = parseUserAgent(userAgent)
  
  return {
    userAgent,
    ...browserInfo,
    fingerprint: generateFingerprint(userAgent, 'client')
  }
}

// 服务器端设备信息获取（用于API路由）
export function getServerDeviceInfo(request: Request): Partial<DeviceInfo> {
  const headers = request.headers
  const userAgent = headers.get('user-agent') || ''
  const forwardedFor = headers.get('x-forwarded-for')
  const realIp = headers.get('x-real-ip')
  const cfConnectingIp = headers.get('cf-connecting-ip')
  
  // 获取IP地址
  const ipAddress = cfConnectingIp || realIp || forwardedFor?.split(',')[0] || 'unknown'
  
  // 解析User Agent
  const browserInfo = parseUserAgent(userAgent)
  
  return {
    ipAddress,
    userAgent,
    ...browserInfo,
    fingerprint: generateFingerprint(userAgent, ipAddress)
  }
}
