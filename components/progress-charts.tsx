"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import type { UserProgress } from "@/lib/types"

interface ProgressChartsProps {
  progress: UserProgress | null
  loading: boolean
}

export function ProgressCharts({ progress, loading }: ProgressChartsProps) {
  const [accuracyData, setAccuracyData] = useState<Array<{ session: number; accuracy: number; date: string }>>([])
  const [sessionData, setSessionData] = useState<Array<{ date: string; count: number }>>([])

  useEffect(() => {
    if (!progress?.sessionHistory) return

    // Prepare accuracy trend data
    const accuracy = progress.sessionHistory
      .slice(-10) // Last 10 sessions
      .map((session, idx) => ({
        session: idx + 1,
        accuracy: (session.correctAnswers / session.totalCards) * 100,
        date: new Date(session.completed || 0).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      }))

    setAccuracyData(accuracy)

    // Prepare sessions per day data
    const sessionsByDate: Record<string, number> = {}
    progress.sessionHistory.forEach((session) => {
      const date = new Date(session.completed || 0).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
      sessionsByDate[date] = (sessionsByDate[date] || 0) + 1
    })

    const sessions = Object.entries(sessionsByDate).map(([date, count]) => ({
      date,
      count,
    }))

    setSessionData(sessions)
  }, [progress])

  if (loading) {
    return <div className="text-muted-foreground text-center py-8">Loading analytics...</div>
  }

  return (
    <div className="space-y-6">
      {/* Accuracy Trend */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Accuracy Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {accuracyData.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Complete study sessions to see accuracy trends</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "4px",
                  }}
                  formatter={(value) => `${Math.round(value as number)}%`}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-primary)", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Sessions Per Day */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Study Sessions Per Day</CardTitle>
        </CardHeader>
        <CardContent>
          {sessionData.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No session data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sessionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "4px",
                  }}
                />
                <Bar dataKey="count" fill="var(--color-accent)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
