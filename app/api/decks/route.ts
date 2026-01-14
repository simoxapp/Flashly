import { auth } from "@clerk/nextjs/server"
import { type NextRequest, NextResponse } from "next/server"
import { FlashcardService, ServiceError } from "@/lib/flashcard-service"

export async function GET(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const decks = await FlashcardService.getUserDecks(userId)
    return NextResponse.json(decks)
  } catch (error) {
    console.error("Error fetching decks:", error)
    return NextResponse.json({ error: "Failed to fetch decks" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const deck = await FlashcardService.createDeck(userId, name, description || "")
    return NextResponse.json(deck, { status: 201 })
  } catch (error) {
    console.error("Error creating deck:", error)
    const message = error instanceof Error ? error.message : "Failed to create deck"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
