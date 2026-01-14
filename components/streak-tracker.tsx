"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { UserProgress } from "@/lib/types"

interface StreakTrackerProps {
  progress: UserProgress | null
}

export function StreakTracker({ progress }: StreakTrackerProps) {
  const [streak, setStreak] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)

  useEffect(() => {
    if (!progress?.sessionHistory) return

    const sessions = progress.sessionHistory.sort((a, b) => (b.completed || 0) - (a.completed || 0))

    let currentStreak = 0
    let maxStreak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let tempStreak = 0
    for (let i = 0; i < sessions.length; i++) {
      const sessionDate = new Date(sessions[i].completed || 0)
      sessionDate.setHours(0, 0, 0, 0)

      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() - i)

      if (sessionDate.getTime() === expectedDate.getTime()) {
        currentStreak++
        tempStreak++
      } else {
        maxStreak = Math.max(maxStreak, tempStreak)
        tempStreak = 0
      }
    }
    maxStreak = Math.max(maxStreak, tempStreak)

    setStreak(currentStreak)
    setLongestStreak(maxStreak)
  }, [progress])

  const accuracy = Math.min(100, Math.max(0, Math.round(progress?.averageAccuracy || 0)))
  const totalSessions = progress?.totalSessions || 0
  const totalCards = progress?.totalCardsStudied || 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="border-border bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground font-medium">Study Streak</p>
          <p className="text-4xl font-bold text-primary mt-2">{streak}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {streak === 0 ? "Start studying today!" : "days in a row"}
          </p>
          {longestStreak > streak && longestStreak > 0 && (
            <p className="text-xs text-muted-foreground mt-2">Best: {longestStreak} days</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-gradient-to-br from-accent/10 to-accent/5">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground font-medium">Accuracy</p>
          <p className="text-4xl font-bold text-accent mt-2">{accuracy}%</p>
          <Progress value={accuracy} className="mt-3 h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {accuracy >= 80 ? "Excellent work!" : accuracy >= 60 ? "Good progress" : "Keep practicing"}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground font-medium">Sessions</p>
          <p className="text-4xl font-bold text-primary mt-2">{totalSessions}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {totalSessions === 0 ? "Start your first session" : "sessions completed"}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border bg-gradient-to-br from-accent/10 to-accent/5">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground font-medium">Cards Studied</p>
          <p className="text-4xl font-bold text-accent mt-2">{totalCards}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {totalCards === 0 ? "No cards studied" : "total cards reviewed"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
