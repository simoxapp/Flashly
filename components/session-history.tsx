"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { StudySession } from "@/lib/types"

interface SessionHistoryProps {
  sessions: StudySession[]
  isLoading: boolean
}

export function SessionHistory({ sessions, isLoading }: SessionHistoryProps) {
  const modeEmoji = {
    flip: "🔄",
    "multiple-choice": "✓",
    essay: "✍️",
  }

  if (isLoading) {
    return <div className="text-muted-foreground text-center py-8">Loading sessions...</div>
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Recent Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No study sessions yet</p>
        ) : (
          <div className="space-y-4">
            {sessions
              .slice()
              .reverse()
              .slice(0, 10)
              .map((session) => {
                const accuracy = (session.correctAnswers / session.totalCards) * 100
                const mode = session.mode as "flip" | "multiple-choice" | "essay"

                return (
                  <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl">{modeEmoji[mode]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm capitalize">{mode.replace("-", " ")} Mode</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(session.completed || 0).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        {session.correctAnswers}/{session.totalCards}
                      </p>
                      <p className="text-xs text-muted-foreground">{Math.round(accuracy)}%</p>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
