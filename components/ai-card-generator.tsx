"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

interface AICardGeneratorProps {
  deckId: string
  onSuccess?: (cardCount: number) => void
}

export function AICardGenerator({ deckId, onSuccess }: AICardGeneratorProps) {
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; cardsGenerated?: number; error?: string } | null>(null)

  const handleGenerate = async () => {
    if (!text.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/ai/generate-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, deckId }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        setText("")
        setTimeout(() => onSuccess?.(data.cardsGenerated), 1500)
      } else {
        setResult({ error: data.error || "Failed to generate flashcards" })
      }
    } catch (error) {
      setResult({ error: "An error occurred while generating flashcards" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="card-gradient border-primary/20 bg-primary/5 backdrop-blur-xl rounded-3xl overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Sparkles className="h-20 w-20 text-primary" />
      </div>

      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>AI Magic Generator</CardTitle>
            <CardDescription>Paste your notes to generate cards instantly</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste lecture notes, articles, or any content to convert into flashcards..."
          className="min-h-[120px] bg-background/50 border-border/50 rounded-2xl focus:ring-primary focus:border-primary transition-all p-4"
        />

        {result && (
          <div className={`flex items-center gap-3 p-4 rounded-2xl animate-in fade-in zoom-in duration-300 ${result.success ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-destructive/10 text-destructive border border-destructive/20"
            }`}>
            {result.success ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <p className="text-sm font-medium">
              {result.success ? `${result.cardsGenerated} flashcards generated!` : result.error}
            </p>
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={loading || !text.trim()}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Content...
            </>
          ) : (
            <>Generate Flashcards with AI</>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
