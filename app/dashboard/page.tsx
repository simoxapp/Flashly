"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ProgressRing } from "@/components/progress-ring"
import { AchievementBadge } from "@/components/achievement-badge"
import { StudySessionCard } from "@/components/study-session-card"
import { XPProgression } from "@/components/xp-progression"
import { PomodoroTimer } from "@/components/pomodoro-timer"
import { StudyGoalsWidget } from "@/components/study-goals-widget"
import { ThemeToggle } from "@/components/theme-toggle"
import { Zap, Clock, Trophy, Loader2 } from "lucide-react"
import type { StudyGoal, UserProgress, Deck, StudySession } from "@/lib/types"

export default function DashboardOverview() {
  const { user } = useUser()
  const [goals, setGoals] = useState<StudyGoal[]>([])
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [decks, setDecks] = useState<Deck[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [goalsRes, progressRes, decksRes] = await Promise.all([
          fetch("/api/goals"),
          fetch("/api/progress"),
          fetch("/api/decks"),
        ])

        if (goalsRes.ok) setGoals(await goalsRes.json())
        if (progressRes.ok) setProgress(await progressRes.json())
        if (decksRes.ok) setDecks(await decksRes.json())
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate stats
  const totalCardsCreated = decks.reduce((acc, deck) => acc + (deck.cardCount || 0), 0)
  const accuracyRate = progress?.averageAccuracy ? Math.round(progress.averageAccuracy) : 0

  // Overall Mastery: Combined score of accuracy and volume
  // Targets: 80% accuracy + 500 cards studied = 100% Mastery for this phase
  const volumeScore = Math.min(100, ((progress?.totalCardsStudied || 0) / 500) * 100)
  const masteryScore = Math.round((accuracyRate + volumeScore) / 2)

  // Calculate streak - simple logic
  const calculateStreak = () => {
    if (!progress?.sessionHistory?.length) return 0
    const dates = progress.sessionHistory.map(s => new Date(s.started).toDateString())
    const uniqueDates = Array.from(new Set(dates))
    return uniqueDates.length
  }

  const streakDays = calculateStreak()

  const stats = [
    { label: "Total Cards", value: totalCardsCreated.toString(), icon: "📝", change: `${decks.length} decks` },
    { label: "Decks Created", value: decks.length.toString(), icon: "📚", change: "active" },
    { label: "Study Streak", value: streakDays.toString(), icon: "🔥", change: "days" },
    { label: "Accuracy Rate", value: `${accuracyRate}%`, icon: "✅", change: "average" },
  ]

  const recentSessions = progress?.sessionHistory
    ? [...progress.sessionHistory]
      .sort((a, b) => b.started - a.started)
      .slice(0, 3)
      .map(s => {
        // Find deck name safely
        const deck = decks.find(d => d.id === s.deckId)
        return {
          id: s.id,
          deckId: s.deckId,
          mode: s.mode,
          cardsStudied: s.totalCards,
          date: new Date(s.started),
          deckName: deck ? deck.name : "Unknown Deck",
          duration: s.completed ? Math.max(1, Math.round((s.completed - s.started) / 60000)) : 1,
          accuracy: s.totalCards > 0 ? Math.round((s.correctAnswers / s.totalCards) * 100) : 0
        }
      })
    : []

  // Calculated XP (Mock logic based on stats since XP isn't persisted yet)
  const currentXp = (progress?.totalCardsStudied || 0) * 10 + (progress?.totalSessions || 0) * 50

  // Achievements (Calculated)
  const achievements = [
    {
      icon: "🎯",
      title: "First Card",
      description: "Created your first flashcard",
      unlocked: totalCardsCreated > 0,
      unlockedAt: undefined
    },
    {
      icon: "🔥",
      title: "Week Warrior",
      description: "7 day study streak",
      unlocked: streakDays >= 7,
    },
    {
      icon: "📚",
      title: "Collection",
      description: "Create 5 decks",
      unlocked: decks.length >= 5,
    },
    {
      icon: "🏆",
      title: "Master",
      description: "Achieve 80%+ average accuracy",
      unlocked: accuracyRate >= 80 && (progress?.totalSessions || 0) > 5,
    },
    { icon: "🚀", title: "Speed Learner", description: "Complete 50 cards in one session", unlocked: false },
    { icon: "💯", title: "Perfect Score", description: "100% accuracy in a session", unlocked: false },
  ]

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Welcome Back, {user?.firstName || 'Learner'}!
          </h1>
          <p className="text-muted-foreground mt-2">Ready to master some new cards today?</p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/dashboard/library/new">
            <Button className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/50 text-white interactive-element">
              New Deck
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="card-interactive card-gradient border-primary/20 hover:border-primary/50 group"
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <span className="text-3xl group-hover:scale-125 transition-transform">{stat.icon}</span>
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-2">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <XPProgression currentXp={currentXp} animate />
        <PomodoroTimer />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-accent" />
            Study Goals
          </h2>
          <Link href="/dashboard/goals">
            <Button variant="outline" size="sm">
              Manage Goals
            </Button>
          </Link>
        </div>
        <StudyGoalsWidget goals={goals} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-gradient border-secondary/20 hover:border-secondary/50 md:col-span-1">
          <CardHeader>
            <CardTitle className="text-center">Overall Mastery</CardTitle>
            <p className="text-center text-xs text-muted-foreground">Accuracy + Study Volume</p>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ProgressRing percent={masteryScore} label="Mastery Level" />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="card-interactive card-gradient border-accent/20 hover:border-accent/50 md:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Link href="/dashboard/study">
                <Button className="w-full bg-gradient-to-r from-primary to-primary/70 hover:shadow-lg text-white">
                  <Zap className="mr-2 h-4 w-4" />
                  Study Now
                </Button>
              </Link>
              <Link href="/dashboard/library/new">
                <Button variant="outline" className="w-full border-primary/50 hover:bg-primary/10 bg-transparent">
                  New Deck
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/dashboard/analytics">
                <Button variant="outline" className="w-full border-secondary/50 hover:bg-secondary/10 bg-transparent">
                  <Clock className="mr-2 h-4 w-4" />
                  View Progress
                </Button>
              </Link>
              <Link href="/dashboard/insights">
                <Button variant="outline" className="w-full border-accent/50 hover:bg-accent/10 bg-transparent">
                  AI Insights
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Recent Study Sessions</h2>
        {recentSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentSessions.map((session, idx) => (
              <Link key={idx} href={`/dashboard/study?deckId=${session.deckId}&mode=${session.mode}`}>
                <StudySessionCard {...session} />
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center text-muted-foreground border-dashed">
            Start studying to see your recent sessions here!
          </Card>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Achievements</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {achievements.map((achievement, idx) => (
            <AchievementBadge key={idx} {...achievement} />
          ))}
        </div>
      </div>

      {/* Learning Tips */}
      <Card className="card-interactive card-gradient border-primary/20 hover:border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">💡</span> Learning Tip
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-3">
            Studies show that spacing out your review sessions improves long-term retention by up to 50%. Try studying
            the same deck with 1 day, 3 day, and 7 day intervals for best results.
          </p>
          <Badge variant="secondary">Spaced Repetition Tips</Badge>
        </CardContent>
      </Card>
    </div>
  )
}
