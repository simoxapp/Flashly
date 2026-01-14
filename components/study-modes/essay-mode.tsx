"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { Flashcard } from "@/lib/types"

interface EssayModeProps {
  cards: Flashcard[]
  onComplete: (correctCount: number, totalCount: number) => void
  deckName: string
}

export function EssayMode({ cards, onComplete, deckName }: EssayModeProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [essayAnswer, setEssayAnswer] = useState("")
  const [showAnswer, setShowAnswer] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [sessionEnded, setSessionEnded] = useState(false)

  const currentCard = cards[currentIndex]
  const progress = ((currentIndex + 1) / cards.length) * 100

  const handleMarkCorrect = () => {
    const newCount = correctCount + 1
    setCorrectCount(newCount)
    handleNext(newCount)
  }

  const handleNext = (overrideCount?: number) => {
    // If overrideCount is provided, use it. Otherwise use state (which might be stale if called immediately after set state)
    // But for "Next Question" button clicks, state is fresh.
    const currentCorrectCount = typeof overrideCount === 'number' ? overrideCount : correctCount

    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setEssayAnswer("")
      setShowAnswer(false)
    } else {
      setSessionEnded(true)
      onComplete(currentCorrectCount, cards.length)
    }
  }

  if (!currentCard) {
    return <div className="text-center text-muted-foreground">No cards available</div>
  }

  if (sessionEnded) {
    const accuracy = Math.round((correctCount / cards.length) * 100)

    return (
      <div className="max-w-2xl mx-auto">
        <Card className="card-gradient border-primary/50 overflow-hidden">
          <CardContent className="pt-12 pb-12 text-center space-y-6">
            <div className="text-6xl bounce-celebration">📝</div>
            <div>
              <div className="text-7xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                {accuracy}%
              </div>
              <p className="text-muted-foreground text-lg">Essay Session Complete!</p>
            </div>
            <div className="space-y-2 bg-secondary/30 rounded-xl p-6">
              <p className="text-lg">
                You completed <span className="font-semibold text-accent">{correctCount}</span> out of{" "}
                <span className="font-semibold">{cards.length}</span> essays
              </p>
              {accuracy >= 80 && <Badge className="mt-2 bg-accent text-accent-foreground">Outstanding!</Badge>}
            </div>
            <Button
              onClick={() => router.push('/dashboard')}
              className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg text-white w-full interactive-element"
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold text-foreground">{deckName}</h2>
          <Badge variant="secondary" className="text-xs">
            {currentIndex + 1} / {cards.length}
          </Badge>
        </div>
        <div className="w-full bg-secondary/50 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary via-secondary to-accent h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <Card className="card-gradient border-primary/20 hover:border-primary/50">
        <CardContent className="pt-8">
          <p className="text-lg font-semibold text-balance text-foreground">{currentCard.question}</p>
        </CardContent>
      </Card>

      {/* Essay Input */}
      <Card className="card-gradient border-secondary/20 hover:border-secondary/50">
        <CardContent className="pt-6">
          <label className="text-sm font-medium text-foreground block mb-2">Your Answer:</label>
          <Textarea
            value={essayAnswer}
            onChange={(e) => setEssayAnswer(e.target.value)}
            placeholder="Write your answer here..."
            className="mt-2 min-h-40 resize-none bg-card/50 border-2 border-secondary/30 focus:border-primary/50 text-foreground"
          />
          <p className="text-xs text-muted-foreground mt-2">{essayAnswer.length} characters</p>
        </CardContent>
      </Card>

      {/* Reference Answer */}
      {showAnswer && (
        <Card className="card-gradient border-accent/50 bg-accent/10">
          <CardContent className="pt-6">
            <label className="text-sm font-medium text-accent block mb-3 uppercase tracking-wide">
              Expected Answer:
            </label>
            <p className="mt-2 text-foreground leading-relaxed p-4 bg-card/50 rounded-lg">{currentCard.answer}</p>
            <p className="text-xs text-muted-foreground mt-3 italic">
              Compare your answer with the expected answer above
            </p>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <div className="space-y-3">
        {!showAnswer ? (
          <Button
            onClick={() => {
              const isMatch = essayAnswer.trim().toLowerCase() === currentCard.answer.trim().toLowerCase()
              if (isMatch) {
                setCorrectCount((prev) => prev + 1)
              }
              setShowAnswer(true)
            }}
            disabled={!essayAnswer.trim()}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg text-white disabled:opacity-50 interactive-element disabled:cursor-not-allowed"
          >
            Submit Answer
          </Button>
        ) : (
          <div className="space-y-3">
            {essayAnswer.trim().toLowerCase() === currentCard.answer.trim().toLowerCase() ? (
              <div className="space-y-3">
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 text-center">
                  <p className="text-accent font-bold text-lg">✨ Exact Match!</p>
                </div>
                <Button
                  onClick={() => handleNext()}
                  className="w-full bg-gradient-to-r from-accent to-accent/70 hover:shadow-lg hover:shadow-accent/50 text-white interactive-element"
                >
                  Next Question
                </Button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleNext()}
                  className="flex-1 bg-transparent border-muted-foreground/30 hover:border-muted-foreground hover:bg-muted/30 interactive-element"
                >
                  Incorrect
                </Button>
                <Button
                  onClick={handleMarkCorrect}
                  className="flex-1 bg-gradient-to-r from-accent to-accent/70 hover:shadow-lg hover:shadow-accent/50 text-white interactive-element"
                >
                  Mark Correct
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <Card className="card-gradient border-accent/20 hover:border-accent/50">
        <CardContent className="pt-6 pb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-accent/10">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Completed</p>
              <p className="text-3xl font-bold text-accent">{correctCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Remaining</p>
              <p className="text-3xl font-bold text-primary">{cards.length - currentIndex - 1}</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/10">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Progress</p>
              <p className="text-3xl font-bold text-secondary">{Math.round(progress)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
