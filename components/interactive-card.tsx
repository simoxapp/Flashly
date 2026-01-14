"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface InteractiveCardProps {
  front: string
  back: string
  onFlip?: (isFlipped: boolean) => void
}

export function InteractiveCard({ front, back, onFlip }: InteractiveCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
    onFlip?.(!isFlipped)
  }

  return (
    <div
      onClick={handleFlip}
      className="perspective cursor-pointer h-80 group"
      style={{
        perspective: "1000px",
      }}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 flip-animation ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        <Card
          className="absolute inset-0 card-gradient border-2 border-primary/50 flex items-center justify-center group-hover:border-primary group-hover:shadow-xl shadow-lg"
          style={{ backfaceVisibility: "hidden" }}
        >
          <CardContent className="text-center p-8">
            <p className="text-xl font-semibold text-foreground">{front}</p>
            <p className="text-xs text-muted-foreground mt-4">Click to reveal</p>
          </CardContent>
        </Card>

        {/* Back */}
        <Card
          className="absolute inset-0 card-gradient border-2 border-secondary/50 flex items-center justify-center group-hover:border-secondary group-hover:shadow-xl shadow-lg"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <CardContent className="text-center p-8">
            <p className="text-xl font-semibold text-foreground">{back}</p>
            <p className="text-xs text-muted-foreground mt-4">Click to flip back</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
