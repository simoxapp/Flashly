"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Flashcard } from "@/lib/types"

interface MultipleChoiceModeProps {
  cards: Flashcard[]
  onComplete: (correctCount: number, totalCount: number) => void
  deckName: string
}

export function MultipleChoiceMode({ cards, onComplete, deckName }: MultipleChoiceModeProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [sessionEnded, setSessionEnded] = useState(false)

  // Memoize options so they don't shuffle on every render
  const options = useMemo(() => {
    if (!cards[currentIndex]) return []
    const card = cards[currentIndex]
    const opts = [card.answer]

    // Add incorrect options from other cards
    for (let i = 0; i < cards.length && opts.length < 4; i++) {
      if (i !== currentIndex && !opts.includes(cards[i].answer)) {
        opts.push(cards[i].answer)
      }
    }

    // Shuffle options
    return opts.sort(() => Math.random() - 0.5)
  }, [currentIndex, cards])

  const currentCard = cards[currentIndex]
  const correctOptionIndex = options.indexOf(currentCard.answer)
  const progress = ((currentIndex + 1) / cards.length) * 100

  const handleSelectAnswer = (index: number) => {
    setSelectedAnswer(index)
    setShowFeedback(true)

    if (index === correctOptionIndex) {
      setCorrectCount((prev) => prev + 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    } else {
      setSessionEnded(true)
      // correctCount is already updated when they selected the answer
      onComplete(correctCount, cards.length)
    }
  }

  if (!currentCard) {
    return <div className="text-center text-muted-foreground">No cards available</div>
  }

  if (sessionEnded) {
    // correctCount is already final
    const finalCorrect = correctCount
    const accuracy = Math.round((finalCorrect / cards.length) * 100)

    return (
      <div className="max-w-2xl mx-auto">
        <Card className="card-gradient border-primary/50 overflow-hidden">
          <CardContent className="pt-12 pb-12 text-center space-y-6">
            <div className="text-6xl bounce-celebration">🏆</div>
            <div>
              <div className="text-7xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                {accuracy}%
              </div>
              <p className="text-muted-foreground text-lg">Quiz Completed!</p>
            </div>
            <div className="space-y-2 bg-secondary/30 rounded-xl p-6">
              <p className="text-lg">
                You got <span className="font-semibold text-accent">{finalCorrect}</span> out of{" "}
                <span className="font-semibold">{cards.length}</span> questions correct
              </p>
              {accuracy >= 80 && <Badge className="mt-2 bg-accent text-accent-foreground">Excellent!</Badge>}
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
          <p className="text-xl font-semibold text-center text-balance text-foreground">{currentCard.question}</p>
        </CardContent>
      </Card>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option, index) => {
          const isCorrect = index === correctOptionIndex
          const isSelected = index === selectedAnswer

          let buttonClass = "bg-transparent border-border/50 hover:border-primary/50 hover:bg-primary/5"
          if (showFeedback) {
            if (isSelected && isCorrect) {
              buttonClass = "bg-accent/20 border-accent/50 text-accent hover:bg-accent/30 border-2"
            } else if (isSelected && !isCorrect) {
              buttonClass = "bg-destructive/20 border-destructive/50 text-destructive hover:bg-destructive/30 border-2"
            } else if (!isSelected && isCorrect) {
              buttonClass = "bg-accent/10 border-accent/50 text-accent border-2"
            }
          }

          return (
            <Button
              key={index}
              onClick={() => !showFeedback && handleSelectAnswer(index)}
              disabled={showFeedback}
              className={`w-full justify-start h-auto p-4 border-2 transition-all duration-200 interactive-element text-foreground ${buttonClass}`}
            >
              <span className="mr-3 font-bold text-lg min-w-6">{String.fromCharCode(65 + index)}.</span>
              <span className="text-left flex-1">{option}</span>
              {isSelected &&
                showFeedback &&
                (isCorrect ? <span className="ml-2 text-xl">✓</span> : <span className="ml-2 text-xl">✗</span>)}
            </Button>
          )
        })}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <Card
          className={`border-2 ${selectedAnswer === correctOptionIndex
            ? "card-gradient border-accent/50 bg-accent/10"
            : "bg-destructive/10 border-destructive/50"
            }`}
        >
          <CardContent className="pt-6">
            <p
              className={`font-bold text-lg mb-2 ${selectedAnswer === correctOptionIndex ? "text-accent" : "text-destructive"}`}
            >
              {selectedAnswer === correctOptionIndex ? "✓ Correct!" : "✗ Incorrect"}
            </p>
            {selectedAnswer !== correctOptionIndex && (
              <p className="text-sm text-foreground mt-2 p-3 bg-card rounded-lg">
                The correct answer is: <span className="font-semibold text-accent">{currentCard.answer}</span>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Next Button */}
      {showFeedback && (
        <Button
          onClick={handleNext}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg text-white interactive-element"
        >
          {currentIndex < cards.length - 1 ? "Next Question" : "Finish Quiz"}
        </Button>
      )}

      {/* Stats */}
      <Card className="card-gradient border-accent/20 hover:border-accent/50">
        <CardContent className="pt-6 pb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-accent/10">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Correct</p>
              <p className="text-3xl font-bold text-accent">
                {correctCount + (selectedAnswer === correctOptionIndex && showFeedback ? 1 : 0)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Remaining</p>
              <p className="text-3xl font-bold text-primary">{cards.length - currentIndex - 1}</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/10">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Accuracy</p>
              <p className="text-3xl font-bold text-secondary">
                {currentIndex + 1 > 0
                  ? Math.round(
                    ((correctCount + (selectedAnswer === correctOptionIndex && showFeedback ? 1 : 0)) /
                      (currentIndex + 1)) *
                    100,
                  )
                  : 0}
                %
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
