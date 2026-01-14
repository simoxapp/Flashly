"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { FlipCardMode } from "@/components/study-modes/flip-card-mode"
import { MultipleChoiceMode } from "@/components/study-modes/multiple-choice-mode"
import { EssayMode } from "@/components/study-modes/essay-mode"
import type { Flashcard, Deck } from "@/lib/types"

type StudyMode = "flip" | "multiple-choice" | "essay"

export default function StudyPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  const deckId = params.deckId as string
  const mode = (searchParams.get("mode") || "flip") as StudyMode

  const [cards, setCards] = useState<Flashcard[]>([])
  const [deck, setDeck] = useState<Deck | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch deck info
        const deckRes = await fetch(`/api/decks/${deckId}`)
        if (!deckRes.ok) throw new Error("Failed to fetch deck")
        const deckData = await deckRes.json()
        setDeck(deckData)

        // Fetch cards
        const cardsRes = await fetch(`/api/cards?deckId=${deckId}`)
        if (!cardsRes.ok) throw new Error("Failed to fetch cards")
        const cardsData = await cardsRes.json()

        if (cardsData.length === 0) {
          setError("This deck has no cards. Add some cards first!")
        } else {
          setCards(cardsData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [deckId])

  const handleSessionComplete = async (correctCount: number, totalCount: number) => {
    // Record session data
    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deckId,
          mode,
          correctCount,
          totalCount,
          accuracy: (correctCount / totalCount) * 100,
        }),
      })

      if (response.ok) {
        // Navigate back to dashboard
        router.push("/dashboard")
      }
    } catch (err) {
      console.error("Error recording session:", err)
      router.push("/dashboard")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading study session...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => router.back()} className="text-primary hover:underline">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!deck) {
    return <div className="text-center text-muted-foreground">Deck not found</div>
  }

  return (
    <div className="py-8">
      {mode === "flip" && <FlipCardMode cards={cards} onComplete={handleSessionComplete} deckName={deck.name} />}
      {mode === "multiple-choice" && (
        <MultipleChoiceMode cards={cards} onComplete={handleSessionComplete} deckName={deck.name} />
      )}
      {mode === "essay" && <EssayMode cards={cards} onComplete={handleSessionComplete} deckName={deck.name} />}
    </div>
  )
}
