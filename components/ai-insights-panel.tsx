"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Insights {
  insights: string
  weakAreas: string[]
  lastUpdated: string
}

export function AIInsightsPanel() {
  const [insights, setInsights] = useState<Insights | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInsights = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ai/insights")
      const data = await response.json()

      if (response.ok) {
        setInsights(data)
      } else {
        setError(data.error || "Failed to fetch insights")
      }
    } catch (err) {
      setError("An error occurred while fetching insights")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInsights()
  }, [])

  if (loading) {
    return <div className="text-muted-foreground text-center py-8">Loading insights...</div>
  }

  return (
    <div className="space-y-4">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🧠</span> AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : insights ? (
            <>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{insights.insights}</p>

              {insights.weakAreas.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Focus on these areas:</p>
                  <ul className="space-y-2">
                    {insights.weakAreas.map((area, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-accent">•</span>
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button onClick={fetchInsights} variant="outline" className="w-full bg-transparent mt-4">
                Refresh Insights
              </Button>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
