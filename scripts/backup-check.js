const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    // 检查是否有现有数据
    const userCount = await prisma.user.count()
    const examCount = await prisma.exam.count()

    console.log(`数据库状态检查:`)
    console.log(`- 用户数量: ${userCount}`)
    console.log(`- 考试数量: ${examCount}`)

    if (userCount > 0 || examCount > 0) {
      console.log('⚠️  检测到现有数据，跳过种子数据初始化')
      return false
    }

    console.log('✅ 数据库为空，可以安全初始化')
    return true
  } catch (error) {
    console.error('数据库检查失败:', error)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

module.exports = { checkDatabase }
