import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { generateFullDeck } from "@/lib/gemini-client"
import { FlashcardService } from "@/lib/flashcard-service"

export async function POST(request: NextRequest) {
    console.log("Deck Generator API called");
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { topic } = await request.json()

        if (!topic || topic.trim().length === 0) {
            return NextResponse.json({ error: "Topic or text is required" }, { status: 400 })
        }

        // 1. Generate deck content using Gemini
        const aiDeck = await generateFullDeck(topic)

        // 2. Create the deck in S3
        const deck = await FlashcardService.createDeck(userId, aiDeck.name, aiDeck.description)

        // 3. Create the cards in S3 (Batch)
        await FlashcardService.createFlashcardsBatch(
            userId,
            deck.id,
            aiDeck.cards.map(card => ({
                question: card.question,
                answer: card.answer,
                difficulty: "medium"
            }))
        )

        return NextResponse.json({
            success: true,
            deckId: deck.id,
            name: deck.name,
            cardCount: aiDeck.cards.length
        })
    } catch (error: any) {
        console.error("Error generating full deck:", error)
        const message = error.message || "Failed to generate AI deck"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
