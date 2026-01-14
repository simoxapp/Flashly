"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Flashcard } from "@/lib/types"

interface FlipCardModeProps {
  cards: Flashcard[]
  onComplete: (correctCount: number, totalCount: number) => void
  deckName: string
}

export function FlipCardMode({ cards, onComplete, deckName }: FlipCardModeProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [sessionEnded, setSessionEnded] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  const currentCard = cards[currentIndex]
  const progress = ((currentIndex + 1) / cards.length) * 100

  const handleMarkCorrect = () => {
    setShowCelebration(true)
    setCorrectCount((prev) => prev + 1)
    setTimeout(() => {
      setShowCelebration(false)
      handleNext(true)
    }, 800)
  }

  const handleNext = (isRefCorrect: boolean = false) => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setIsFlipped(false)
    } else {
      setSessionEnded(true)
      // correctCount is current state. If this was a correct answer (isRefCorrect), add 1.
      // But wait, if handleMarkCorrect called this, state update setCorrectCount(prev+1) might not have propagated yet to this closure?
      // Actually, if we pass isRefCorrect=true, we can just calculate total.
      // However, handleMarkCorrect calls setCorrectCount.
      // If we assume handleMarkCorrect was called, we should ideally use correctCount.
      // BUT, checking logic in EssayMode: we passed the explicit NEW count.
      // Here, handleNext is unrelated to state update if we just pass the result.

      // Let's use standard logic: 
      // Total Correct = (Current stored Correct Count) + (1 if this move was correct AND count hasn't updated yet?)
      // Actually, if we use the same pattern as EssayMode (pass the final count), it's safer.

      // But wait, handleMarkCorrect updates state.
      // Let's just blindly use correctCount + (isRefCorrect ? 1 : 0) ?
      // No, if state updated, we double count.
      // If state didn't update, we count correctly.

      // Better approach: handleMarkCorrect passes the *new* total?
      // No, handleMarkCorrect doesn't know the previous total reliably without functional update.

      // Safest: onComplete(correctCount + (isRefCorrect ? 1 : 0)) IS RISKY if state updates fast.

      // Alternative: Don't update state for the last card?
      // Or rely on the fact that handleNext is called inside setTimeout?
      // Inside setTimeout, setCorrectCount has definitely run.
      // Does that mean `correctCount` in scope is updated? NO. Scope is stale.
      // So `correctCount` is the OLD value (N).
      // So `correctCount + 1` is correct for the updated total.

      onComplete(correctCount + (isRefCorrect ? 1 : 0), cards.length)
    }
  }

  const handleSkip = () => {
    handleNext(false)
  }

  if (!currentCard) {
    return <div className="text-center text-muted-foreground">No cards available</div>
  }

  if (sessionEnded) {
    // We can't easily trust `correctCount` here for display if we relied on passing it to onComplete.
    // However, the component re-renders when sessionEnded becomes true.
    // In that re-render, `correctCount` SHOULD be up to date (N+1).
    // So for Display, `correctCount` is fine.

    // Correction: onComplete needs `correctCount + 1` because it uses the stale closure.
    // The render uses fresh state.

    const accuracy = Math.round((correctCount / cards.length) * 100)
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="card-gradient border-primary/50 overflow-hidden">
          <CardContent className="pt-12 pb-12 text-center space-y-6">
            <div className="text-6xl bounce-celebration">🎉</div>
            <div>
              <div className="text-7xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                {accuracy}%
              </div>
              <p className="text-muted-foreground text-lg">Session Completed!</p>
            </div>
            <div className="space-y-2 bg-secondary/30 rounded-xl p-6">
              <p className="text-lg">
                You got <span className="font-semibold text-accent">{correctCount}</span> out of{" "}
                <span className="font-semibold">{cards.length}</span> cards correct
              </p>
              {accuracy >= 80 && <Badge className="mt-2 bg-accent text-accent-foreground">Great Job!</Badge>}
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Bar with animated background */}
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

      {/* Flashcard with enhanced flip animation */}
      <div className="perspective cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
        <Card
          className={`card-interactive border-2 h-96 flex items-center justify-center transition-all duration-500 ${isFlipped
            ? "border-secondary/50 bg-gradient-to-br from-secondary/20 to-accent/20"
            : "border-primary/50 bg-gradient-to-br from-primary/20 to-secondary/20"
            } ${showCelebration ? "bounce-celebration shadow-2xl shadow-accent/50" : ""}`}
        >
          <CardContent className="text-center p-8 w-full h-full flex flex-col items-center justify-center">
            <div className="mb-6">
              <Badge variant="outline" className="text-xs uppercase tracking-widest">
                {isFlipped ? "Answer" : "Question"}
              </Badge>
            </div>
            <p className="text-2xl sm:text-3xl font-semibold leading-relaxed text-balance text-foreground">
              {isFlipped ? currentCard.answer : currentCard.question}
            </p>
            <div className="mt-10 text-sm text-muted-foreground group-hover:text-primary transition-colors">
              {isFlipped ? "Click to flip back" : "Click to reveal answer"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex gap-3 justify-center">
        <Button
          variant="outline"
          onClick={handleSkip}
          className="flex-1 bg-transparent border-muted-foreground/30 hover:border-muted-foreground hover:bg-muted/30 interactive-element"
        >
          Skip
        </Button>
        <Button
          onClick={handleMarkCorrect}
          disabled={!isFlipped}
          className="flex-1 bg-gradient-to-r from-accent to-accent/70 hover:shadow-lg hover:shadow-accent/50 text-white disabled:opacity-50 interactive-element"
        >
          Got it Right
        </Button>
      </div>

      {/* Enhanced Stats with gradient */}
      <Card className="card-gradient border-accent/20 hover:border-accent/50">
        <CardContent className="pt-6 pb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-accent/10">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Correct</p>
              <p className="text-3xl font-bold text-accent">{correctCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Remaining</p>
              <p className="text-3xl font-bold text-primary">{cards.length - currentIndex - 1}</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/10">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Accuracy</p>
              <p className="text-3xl font-bold text-secondary">
                {cards.length > 0 ? Math.round((correctCount / (currentIndex + 1)) * 100) : 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
