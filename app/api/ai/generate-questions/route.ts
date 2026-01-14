// API route for AI-powered question generation
import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { generateAIQuestion } from "@/lib/gemini-client"

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { topic, difficulty } = await request.json()

    if (!topic) {
      return NextResponse.json({ error: "topic is required" }, { status: 400 })
    }

    // Generate question using Gemini
    const question = await generateAIQuestion(topic, difficulty || "medium")

    if (!question.question) {
      return NextResponse.json({ error: "Failed to generate question" }, { status: 400 })
    }

    return NextResponse.json(question)
  } catch (error) {
    console.error("Error generating question:", error)
    return NextResponse.json({ error: "Failed to generate question" }, { status: 500 })
  }
}
