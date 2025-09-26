import { NextRequest, NextResponse } from "next/server"
import { autoScore } from "@/utils/scoring"

export async function POST(request: NextRequest) {
  try {
    const { question, userAnswer } = await request.json()

    console.log('Test scoring input:', {
      question,
      userAnswer
    })

    const result = autoScore(question, userAnswer)

    console.log('Test scoring result:', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in test scoring:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
