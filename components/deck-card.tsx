"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Deck } from "@/lib/types"

interface DeckCardProps {
  deck: Deck
  onDelete?: (deckId: string) => void
}

export function DeckCard({ deck, onDelete }: DeckCardProps) {
  return (
    <Card className="border-border hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="line-clamp-2">{deck.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{deck.description}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{deck.cardCount} cards</span>
          <span className="text-xs text-muted-foreground">{new Date(deck.updated).toLocaleDateString()}</span>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/library/${deck.id}`} className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              Open
            </Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={() => onDelete?.(deck.id)}>
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
