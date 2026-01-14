"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"

interface AchievementBadgeProps {
  icon: string
  title: string
  description: string
  unlockedAt?: Date
  unlocked?: boolean
}

export function AchievementBadge({ icon, title, description, unlockedAt, unlocked = false }: AchievementBadgeProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (unlocked && unlockedAt) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [unlocked, unlockedAt])

  return (
    <Card
      className={`p-4 text-center transition-all duration-300 cursor-pointer hover:scale-105 ${
        unlocked
          ? "bg-gradient-to-br from-accent/20 to-secondary/20 border-accent/50 hover:border-accent shadow-lg"
          : "bg-muted/30 border-muted opacity-50"
      } ${isAnimating ? "bounce-celebration" : ""}`}
    >
      <div className={`text-5xl mb-2 transition-transform duration-300 ${isAnimating ? "scale-125" : ""}`}>{icon}</div>
      <h3 className="font-semibold text-sm">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
      {unlocked && unlockedAt && (
        <p className="text-xs text-accent mt-2">Unlocked {new Date(unlockedAt).toLocaleDateString()}</p>
      )}
    </Card>
  )
}
