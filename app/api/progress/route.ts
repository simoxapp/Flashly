// API route for tracking study progress
import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { FlashcardService } from "@/lib/flashcard-service"

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { deckId, mode, correctCount, totalCount, accuracy } = await request.json()

    // Get or create global user progress
    const currentProgress = await FlashcardService.getUserProgress(userId)

    const newSession = {
      id: `session_${Date.now()}`,
      userId,
      deckId,
      mode,
      started: Date.now(),
      completed: Date.now(),
      cardsReviewed: [],
      correctAnswers: correctCount,
      totalCards: totalCount,
    }

    const totalSessions = (currentProgress?.totalSessions || 0) + 1
    const totalCardsStudied = (currentProgress?.totalCardsStudied || 0) + totalCount
    const previousAverage = currentProgress?.averageAccuracy || 0
    const newAverage = (previousAverage * (totalSessions - 1) + accuracy) / totalSessions

    // Update global progress
    const updatedProgress = await FlashcardService.updateUserProgress(userId, {
      totalCardsStudied,
      totalSessions,
      averageAccuracy: newAverage,
      sessionHistory: [...(currentProgress?.sessionHistory || []), newSession],
    })

    return NextResponse.json({
      success: true,
      progress: updatedProgress,
    })
  } catch (error) {
    console.error("Error recording progress:", error)
    return NextResponse.json({ error: "Failed to record progress" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const progress = await FlashcardService.getUserProgress(userId)

    if (!progress) {
      return NextResponse.json({
        userId,
        totalCardsStudied: 0,
        totalSessions: 0,
        averageAccuracy: 0,
        weakAreas: [],
        lastUpdated: Date.now(),
        sessionHistory: [],
      })
    }

    return NextResponse.json(progress)
  } catch (error) {
    console.error("Error fetching progress:", error)
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 })
  }
}
