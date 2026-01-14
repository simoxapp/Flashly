// API route for AI-powered learning insights
import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getAIInsights } from "@/lib/gemini-client"
import { FlashcardService } from "@/lib/flashcard-service"

export async function GET(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get user progress to identify weak areas
    const progress = await FlashcardService.getUserProgress(userId)

    if (!progress || progress.weakAreas.length === 0) {
      return NextResponse.json({
        insights: "Keep studying consistently to build your weak areas!",
        weakAreas: [],
      })
    }

    // Generate insights for weak areas
    const insights = await getAIInsights(progress.weakAreas)

    // Save insights
    await FlashcardService.updateUserProgress(userId, {
      weakAreas: progress.weakAreas,
    })

    return NextResponse.json({
      insights,
      weakAreas: progress.weakAreas,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error getting insights:", error)
    return NextResponse.json({ error: "Failed to get insights" }, { status: 500 })
  }
}
