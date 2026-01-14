// API route for AI-powered flashcard generation
import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { generateFlashcardsFromText } from "@/lib/gemini-client"
import { FlashcardService } from "@/lib/flashcard-service"

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { text, deckId } = await request.json()

    if (!text || !deckId) {
      return NextResponse.json({ error: "text and deckId are required" }, { status: 400 })
    }

    // Generate flashcards using Gemini
    const generatedCards = await generateFlashcardsFromText(text)

    if (generatedCards.length === 0) {
      return NextResponse.json({ error: "Failed to generate flashcards" }, { status: 400 })
    }

    // Save generated cards to database
    const savedCards = await Promise.all(
      generatedCards.map((card) =>
        FlashcardService.createFlashcard(userId, deckId, card.question, card.answer, "medium"),
      ),
    )

    return NextResponse.json({
      success: true,
      cardsGenerated: savedCards.length,
      cards: savedCards,
    })
  } catch (error) {
    console.error("Error generating flashcards:", error)
    return NextResponse.json({ error: "Failed to generate flashcards" }, { status: 500 })
  }
}
