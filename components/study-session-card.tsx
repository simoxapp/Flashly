"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface StudySessionCardProps {
  deckName: string
  cardsStudied: number
  accuracy: number
  duration: number
  date: Date
  mode: "flip" | "multiple-choice" | "essay"
}

export function StudySessionCard({ deckName, cardsStudied, accuracy, duration, date, mode }: StudySessionCardProps) {
  const modeIcons = {
    flip: "🔄",
    "multiple-choice": "✓",
    essay: "✍️",
  }

  const accuracyColor =
    accuracy >= 80
      ? "bg-accent/20 text-accent"
      : accuracy >= 60
        ? "bg-secondary/20 text-secondary"
        : "bg-destructive/20 text-destructive"

  return (
    <Card className="card-interactive card-gradient border-primary/20 hover:border-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{deckName}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{new Date(date).toLocaleDateString()}</p>
          </div>
          <div className="text-2xl">{modeIcons[mode]}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-bold text-primary">{cardsStudied}</p>
            <p className="text-xs text-muted-foreground">Cards</p>
          </div>
          <div>
            <p className={`text-2xl font-bold ${accuracyColor.split(" ")[1]}`}>{Math.round(accuracy)}%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-secondary">{Math.round(duration)}m</p>
            <p className="text-xs text-muted-foreground">Duration</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Badge variant="secondary" className="text-xs">
            {mode.replace("-", " ")}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
