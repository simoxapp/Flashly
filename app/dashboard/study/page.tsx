"use client"

import { Suspense, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Zap, Brain, PenTool, ChevronRight, Play } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import type { Deck } from "@/lib/types"

type StudyMode = "flip" | "multiple-choice" | "essay"

export default function StudySessions() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StudySessionsContent />
    </Suspense>
  )
}

function StudySessionsContent() {
  const searchParams = useSearchParams()
  const preSelectedDeckId = searchParams.get("deckId")
  const preSelectedMode = searchParams.get("mode") as StudyMode | null

  const [selectedMode, setSelectedMode] = useState<StudyMode | null>(preSelectedMode)
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(preSelectedDeckId)
  const [decks, setDecks] = useState<Deck[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadDecks()
  }, [])

  const loadDecks = async () => {
    try {
      setIsLoading(true)
      setError("")
      const response = await fetch("/api/decks")
      if (!response.ok) throw new Error("Failed to load decks")
      const data = await response.json()
      setDecks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load decks")
    } finally {
      setIsLoading(false)
    }
  }

  const modes: Array<{ id: StudyMode; name: string; description: string; icon: React.ReactNode; color: string }> = [
    {
      id: "flip",
      name: "Flashcard Flip",
      description: "Classic spaced repetition with card flipping",
      icon: <Zap className="h-6 w-6" />,
      color: "from-blue-500/20 to-blue-600/20 text-blue-500 border-blue-500/30",
    },
    {
      id: "multiple-choice",
      name: "Multiple Choice",
      description: "Interactive testing with adaptive difficulty",
      icon: <Brain className="h-6 w-6" />,
      color: "from-purple-500/20 to-purple-600/20 text-purple-500 border-purple-500/30",
    },
    {
      id: "essay",
      name: "Essay Mode",
      description: "Free text responses with AI feedback",
      icon: <PenTool className="h-6 w-6" />,
      color: "from-emerald-500/20 to-emerald-600/20 text-emerald-500 border-emerald-500/30",
    },
  ]

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Study Center
        </h1>
        <p className="text-muted-foreground mt-2">Personalize your study experience with AI-powered modes</p>
      </div>

      {error && (
        <Alert className="border-destructive/20 bg-destructive/10 backdrop-blur-md rounded-2xl">
          <AlertDescription className="text-destructive font-medium">{error}</AlertDescription>
        </Alert>
      )}

      {/* Mode Selection */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold px-1 flex items-center gap-2">
          Step 1: Choose Your Vibe
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modes.map((mode) => (
            <Card
              key={mode.id}
              className={`card-gradient group cursor-pointer border-2 transition-all duration-300 rounded-3xl overflow-hidden ${selectedMode === mode.id
                ? "border-primary scale-[1.02] shadow-2xl shadow-primary/10"
                : "border-transparent hover:border-primary/30"
                }`}
              onClick={() => setSelectedMode(selectedMode === mode.id ? null : mode.id)}
            >
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4 border transition-transform group-hover:scale-110 ${mode.color}`}>
                  {mode.icon}
                </div>
                <CardTitle className="text-xl font-bold">{mode.name}</CardTitle>
                <CardDescription className="text-sm line-clamp-2 mt-1 min-h-[2.5rem]">
                  {mode.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant={selectedMode === mode.id ? "default" : "secondary"}
                  className={`w-full rounded-xl pointer-events-none ${selectedMode === mode.id ? 'bg-primary text-white' : 'bg-muted/50 hover:bg-muted font-medium'}`}
                >
                  {selectedMode === mode.id ? "Active Mode" : "Select Mode"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Deck Selection */}
      {selectedMode && (
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-bold px-1 flex items-center gap-2">
            Step 2: Pick Your Content
          </h2>
          <Card className="card-gradient border-border/50 bg-card/20 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-8">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                  ))}
                </div>
              ) : decks.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground mb-6">You don't have any decks to study yet.</p>
                  <Link href="/dashboard/library">
                    <Button className="bg-primary text-white rounded-xl">Go to Library</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {decks.map((deck) => (
                    <Link key={deck.id} href={`/dashboard/study/${deck.id}?mode=${selectedMode}`}>
                      <div className="group flex items-center justify-between p-5 rounded-2xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            {deck.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-lg group-hover:text-primary transition-colors">{deck.name}</p>
                            <Badge variant="outline" className="text-[10px] h-5 bg-transparent border-border/50 mt-1">
                              {deck.cardCount} CARDS
                            </Badge>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-muted/20 group-hover:bg-primary group-hover:text-white transition-all">
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Quick Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-80">
        <div className="flex items-start gap-4 p-6 rounded-3xl bg-primary/5 border border-primary/10">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary flex-shrink-0">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-lg mb-1">Spaced Repetition</h4>
            <p className="text-sm text-muted-foreground">Our AI adjusts card intervals based on your recall performance to optimize memory retention.</p>
          </div>
        </div>
        <div className="flex items-start gap-4 p-6 rounded-3xl bg-secondary/5 border border-secondary/10">
          <div className="p-3 bg-secondary/10 rounded-2xl text-secondary flex-shrink-0">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-lg mb-1">Active Recall</h4>
            <p className="text-sm text-muted-foreground">Multiple choice and Essay modes force you to retrieve information, leading to deeper encoding.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
