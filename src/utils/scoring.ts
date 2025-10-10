/**
 * 自动判分工具函数
 */

export interface Question {
  id: string
  type: string
  title: string
  options: string | null
  answer: string
  points: number
}

export interface UserAnswer {
  questionId: string
  response: string
}

/**
 * 比较两个字符串是否相等（忽略大小写和空格）
 */
function normalizeString(str: string): string {
  return str.toLowerCase().trim()
}

/**
 * 比较两个字符串数组是否相等（忽略顺序）
 */
function arraysEqual(arr1: string[], arr2: string[]): boolean {
  if (arr1.length !== arr2.length) return false

  const sorted1 = [...arr1].sort()
  const sorted2 = [...arr2].sort()

  return sorted1.every((item, index) => normalizeString(item) === normalizeString(sorted2[index]))
}

/**
 * 单选题判分
 */
function scoreSingleChoice(correctAnswer: string, userAnswer: string): number {
  // 现在correctAnswer和userAnswer都是选项内容，直接比较
  const normalizedCorrect = normalizeString(correctAnswer)
  const normalizedUser = normalizeString(userAnswer)
  const isCorrect = normalizedCorrect === normalizedUser

  console.log('Single Choice Scoring:', {
    correctAnswer,
    userAnswer,
    normalizedCorrect,
    normalizedUser,
    isCorrect
  })

  return isCorrect ? 1 : 0
}

/**
 * 多选题判分
 */
function scoreMultipleChoice(correctAnswer: string, userAnswer: string): number {
  if (!userAnswer) return 0

  // 现在correctAnswer和userAnswer都是选项内容，用逗号分隔
  const correctAnswers = correctAnswer.split(',').map(ans => normalizeString(ans.trim()))
  const userAnswers = userAnswer.split(',').map(ans => normalizeString(ans.trim()))

  console.log('Multiple Choice Scoring:', {
    correctAnswer,
    userAnswer,
    correctAnswers,
    userAnswers,
    isEqual: arraysEqual(correctAnswers, userAnswers)
  })

  // 多选题：必须完全匹配才算正确
  return arraysEqual(correctAnswers, userAnswers) ? 1 : 0
}

/**
 * 填空题判分（支持多个正确答案，用逗号分隔）
 */
function scoreFillBlank(correctAnswer: string, userAnswer: string): number {
  if (!userAnswer) return 0

  const correctAnswers = correctAnswer.split(',').map(ans => normalizeString(ans))
  const normalizedUserAnswer = normalizeString(userAnswer)

  return correctAnswers.includes(normalizedUserAnswer) ? 1 : 0
}

/**
 * 简答题判分（基于关键词匹配）
 */
function scoreShortAnswer(correctAnswer: string, userAnswer: string): number {
  if (!userAnswer) return 0

  const correctKeywords = correctAnswer.split(',').map(keyword => normalizeString(keyword))
  const normalizedUserAnswer = normalizeString(userAnswer)

  // 计算匹配的关键词数量
  const matchedKeywords = correctKeywords.filter(keyword =>
    normalizedUserAnswer.includes(keyword)
  )

  // 如果匹配的关键词数量达到总关键词数量的一定比例，则给分
  const matchRatio = matchedKeywords.length / correctKeywords.length
  return matchRatio >= 0.6 ? 1 : 0
}

/**
 * 自动判分主函数
 */
export function autoScore(question: Question, userAnswer: UserAnswer): {
  score: number
  maxScore: number
  isCorrect: boolean
} {
  const { type, answer, points } = question
  const { response } = userAnswer

  let score = 0

  switch (type) {
    case 'SINGLE_CHOICE':
      score = scoreSingleChoice(answer, response)
      break

    case 'MULTIPLE_CHOICE':
      score = scoreMultipleChoice(answer, response)
      break

    case 'FILL_BLANK':
      score = scoreFillBlank(answer, response)
      break

    case 'SHORT_ANSWER':
      score = scoreShortAnswer(answer, response)
      break

    default:
      // 不支持的题目类型，返回0分
      score = 0
  }

  return {
    score: score * points,
    maxScore: points,
    isCorrect: score === 1
  }
}

/**
 * 批量判分
 */
export function batchScore(questions: Question[], userAnswers: UserAnswer[]): {
  totalScore: number
  maxTotalScore: number
  results: Array<{
    questionId: string
    score: number
    maxScore: number
    isCorrect: boolean
  }>
} {
  const results = userAnswers.map(userAnswer => {
    const question = questions.find(q => q.id === userAnswer.questionId)
    if (!question) {
      return {
        questionId: userAnswer.questionId,
        score: 0,
        maxScore: 0,
        isCorrect: false
      }
    }

    const scoring = autoScore(question, userAnswer)
    return {
      questionId: userAnswer.questionId,
      ...scoring
    }
  })

  const totalScore = results.reduce((sum, result) => sum + result.score, 0)
  const maxTotalScore = questions.reduce((sum, question) => sum + question.points, 0)

  return {
    totalScore,
    maxTotalScore,
    results
  }
}

/**
 * 获取判分统计信息
 */
export function getScoringStats(results: Array<{
  questionId: string
  score: number
  maxScore: number
  isCorrect: boolean
}>) {
  const totalQuestions = results.length
  const correctQuestions = results.filter(r => r.isCorrect).length
  const totalScore = results.reduce((sum, r) => sum + r.score, 0)
  const maxScore = results.reduce((sum, r) => sum + r.maxScore, 0)
  const accuracy = totalQuestions > 0 ? (correctQuestions / totalQuestions) * 100 : 0
  const scorePercentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0

  return {
    totalQuestions,
    correctQuestions,
    totalScore,
    maxScore,
    accuracy: Math.round(accuracy * 100) / 100,
    scorePercentage: Math.round(scorePercentage * 100) / 100
  }
}
