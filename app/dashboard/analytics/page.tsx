"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StreakTracker } from "@/components/streak-tracker"
import { ProgressCharts } from "@/components/progress-charts"
import { SessionHistory } from "@/components/session-history"
import { XPProgression } from "@/components/xp-progression"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { TrendingUp, BarChart3, History, Award } from "lucide-react"
import type { UserProgress } from "@/lib/types"

export default function ProgressAnalyticsPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentXp] = useState(3200)

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch("/api/progress")
        if (response.ok) {
          const data = await response.json()
          setProgress(data)
        }
      } catch (error) {
        console.error("Error fetching progress:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [])

  const learningCurveData = [
    { week: "Week 1", cardsLearned: 45, accuracy: 65, timeSpent: 180 },
    { week: "Week 2", cardsLearned: 78, accuracy: 72, timeSpent: 240 },
    { week: "Week 3", cardsLearned: 95, accuracy: 78, timeSpent: 280 },
    { week: "Week 4", cardsLearned: 124, accuracy: 82, timeSpent: 320 },
  ]

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Performance Analytics
          </h1>
          <p className="text-muted-foreground mt-2">Deep insights into your learning patterns and mastery</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
          <TrendingUp className="h-4 w-4" /> Live Tracking Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <XPProgression currentXp={currentXp} animate />
        <StreakTracker progress={progress} />
      </div>

      {/* Main Chart */}
      <Card className="card-gradient border-border/50 bg-card/20 backdrop-blur-md rounded-[2rem] overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Learning Mastery Curve
            </CardTitle>
            <CardDescription>Performance tracking over the last 30 days</CardDescription>
          </div>
          <div className="flex gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
              <div className="w-2 h-2 rounded-full bg-primary" /> Cards Learned
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-accent bg-accent/5 px-3 py-1.5 rounded-lg border border-accent/10">
              <div className="w-2 h-2 rounded-full bg-accent" /> Accuracy Rate
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 pb-6 pr-6">
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={learningCurveData}>
              <defs>
                <linearGradient id="colorCards" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} opacity={0.2} />
              <XAxis
                dataKey="week"
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(10, 10, 10, 0.8)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "16px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
                }}
                itemStyle={{ color: "#fff", fontSize: '12px', fontWeight: 'bold' }}
              />
              <Area
                type="monotone"
                dataKey="cardsLearned"
                stroke="var(--color-primary)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorCards)"
                name="Cards"
              />
              <Area
                type="monotone"
                dataKey="accuracy"
                stroke="var(--color-accent)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorAccuracy)"
                name="Accuracy %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-gradient border-primary/20 bg-background/50 hover:border-primary/50 transition-all rounded-2xl group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Session Avg</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary group-hover:scale-105 transition-transform origin-left">18 min</div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" /> +2 min from last week
            </p>
          </CardContent>
        </Card>

        <Card className="card-gradient border-secondary/20 bg-background/50 hover:border-secondary/50 transition-all rounded-2xl group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Velocity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-secondary group-hover:scale-105 transition-transform origin-left">24 cards</div>
            <p className="text-xs text-muted-foreground mt-2">Consistent daily output</p>
          </CardContent>
        </Card>

        <Card className="card-gradient border-accent/20 bg-background/50 hover:border-accent/50 transition-all rounded-2xl group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Focus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-accent group-hover:scale-105 transition-transform origin-left">42 hours</div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Award className="h-3 w-3" /> Top 5% of learners
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grid of Components */}
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <History className="h-6 w-6 text-primary" />
            Recent Activity
          </h2>
          {progress && <SessionHistory sessions={progress.sessionHistory} isLoading={loading} />}
        </section>

        <ProgressCharts progress={progress} loading={loading} />
      </div>
    </div>
  )
}
