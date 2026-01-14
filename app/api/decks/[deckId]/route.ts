// API routes for individual deck operations
import { auth } from "@clerk/nextjs/server"
import { type NextRequest, NextResponse } from "next/server"
import { FlashcardService } from "@/lib/flashcard-service"

export async function GET(request: NextRequest, { params }: { params: Promise<{ deckId: string }> }) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { deckId } = await params
    const deck = await FlashcardService.getDeck(userId, deckId)

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 })
    }

    return NextResponse.json(deck)
  } catch (error) {
    console.error("Error fetching deck:", error)
    return NextResponse.json({ error: "Failed to fetch deck" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ deckId: string }> }) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { deckId } = await params
    const body = await request.json()

    const deck = await FlashcardService.updateDeck(userId, deckId, body)

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 })
    }

    return NextResponse.json(deck)
  } catch (error) {
    console.error("Error updating deck:", error)
    return NextResponse.json({ error: "Failed to update deck" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ deckId: string }> }) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { deckId } = await params
    await FlashcardService.deleteDeck(userId, deckId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting deck:", error)
    return NextResponse.json({ error: "Failed to delete deck" }, { status: 500 })
  }
}
