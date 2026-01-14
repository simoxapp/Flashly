// API routes for flashcard management
import { auth } from "@clerk/nextjs/server"
import { type NextRequest, NextResponse } from "next/server"
import { FlashcardService } from "@/lib/flashcard-service"

export async function GET(request: NextRequest) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const deckId = request.nextUrl.searchParams.get("deckId")
        if (!deckId) return NextResponse.json({ error: "deckId is required" }, { status: 400 })

        const cards = await FlashcardService.getDeckCards(userId, deckId)
        return NextResponse.json(cards)
    } catch (error: any) {
        console.error("[API GET] Error:", error)
        return NextResponse.json({ error: "Failed to fetch cards" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const body = await request.json()
        const { deckId, question, answer } = body

        if (!deckId || !question || !answer) {
            return NextResponse.json({ error: "deckId, question, and answer are required" }, { status: 400 })
        }

        const card = await FlashcardService.createFlashcard(userId, deckId, question, answer, "medium")
        return NextResponse.json(card, { status: 201 })
    } catch (error: any) {
        console.error("[API POST] Error:", error)
        return NextResponse.json({ error: error.message || "Failed to create card" }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const { searchParams } = new URL(request.url)
        const deckId = searchParams.get("deckId")
        const cardId = searchParams.get("cardId")

        console.log(`[API PATCH] URL: ${request.url}`);
        console.log(`[API PATCH] Extracted Params - deckId: ${deckId}, cardId: ${cardId}`);

        if (!deckId || !cardId) {
            return NextResponse.json({ error: `deckId (${deckId}) and cardId (${cardId}) are required in query params` }, { status: 400 })
        }

        const body = await request.json()
        const card = await FlashcardService.updateFlashcard(userId, deckId, cardId, body)

        if (!card) {
            console.warn(`[API PATCH] Card ${cardId} NOT FOUND in deck ${deckId} for user ${userId}`);
            return NextResponse.json({ error: "Card not found on server" }, { status: 404 })
        }

        return NextResponse.json(card)
    } catch (error: any) {
        console.error("[API PATCH] Fatal Error:", error)
        return NextResponse.json({
            error: error.message || "Failed to update card"
        }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const { searchParams } = new URL(request.url)
        const deckId = searchParams.get("deckId")
        const cardId = searchParams.get("cardId")

        if (!deckId || !cardId) {
            return NextResponse.json({ error: "deckId and cardId are required" }, { status: 400 })
        }

        await FlashcardService.deleteFlashcard(userId, deckId, cardId)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("[API DELETE] Error:", error)
        return NextResponse.json({ error: error.message || "Failed to delete card" }, { status: 500 })
    }
}
