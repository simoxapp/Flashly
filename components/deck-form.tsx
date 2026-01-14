"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, Type, AlignLeft, Sparkles } from "lucide-react"

interface DeckFormProps {
  onSubmit: (name: string, description: string) => Promise<void>
  isLoading?: boolean
}

export function DeckForm({ onSubmit, isLoading }: DeckFormProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Please give your deck a name")
      return
    }

    try {
      await onSubmit(name.trim(), description.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create deck")
    }
  }

  return (
    <Card className="card-gradient border-primary/20 bg-card/10 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl">
      <CardHeader className="p-10 pb-6">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
          <BookOpen className="h-7 w-7 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold">New Flashcard Deck</CardTitle>
        <CardDescription className="text-lg">Set the foundation for your next study session</CardDescription>
      </CardHeader>
      <CardContent className="p-10 pt-0">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <Alert className="border-destructive/20 bg-destructive/10 backdrop-blur-md rounded-2xl animate-in fade-in zoom-in duration-300">
              <AlertDescription className="text-destructive font-medium">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Type className="h-4 w-4" /> Deck Title
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Quantum Physics Fundamentals"
              maxLength={100}
              className="h-14 bg-background/50 border-border/50 text-lg rounded-2xl focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <AlignLeft className="h-4 w-4" /> Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What topics will this deck cover? (Optional)"
              maxLength={500}
              className="min-h-[150px] bg-background/50 border-border/50 text-lg rounded-2xl focus:ring-primary focus:border-primary transition-all resize-none p-5"
            />
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="w-full h-16 bg-gradient-to-r from-primary to-secondary text-white text-xl font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Deck...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Build Deck
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
