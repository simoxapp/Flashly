"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Target, Trophy, Clock, BookOpen, Sparkles } from "lucide-react"

interface GoalFormProps {
    onSubmit: (data: { title: string; targetCards: number; targetMinutes: number; type: string }) => Promise<void>
    isLoading?: boolean
    initialData?: {
        title: string
        targetCards: number
        targetMinutes: number
        type: string
    }
}

export function GoalForm({ onSubmit, isLoading, initialData }: GoalFormProps) {
    const [title, setTitle] = useState(initialData?.title || "")
    const [targetCards, setTargetCards] = useState(initialData?.targetCards.toString() || "50")
    const [targetMinutes, setTargetMinutes] = useState(initialData?.targetMinutes.toString() || "60")
    const [type, setType] = useState(initialData?.type || "daily")
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!title.trim()) {
            setError("Please give your goal a name")
            return
        }

        try {
            await onSubmit({
                title: title.trim(),
                targetCards: parseInt(targetCards),
                targetMinutes: parseInt(targetMinutes),
                type
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create goal")
        }
    }

    return (
        <Card className="card-gradient border-primary/20 bg-background backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl">
            <CardHeader className="p-10 pb-6">
                <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 border border-accent/20">
                    <Target className="h-7 w-7 text-accent" />
                </div>
                <CardTitle className="text-3xl font-bold">{initialData ? "Edit Study Goal" : "New Study Goal"}</CardTitle>
                <CardDescription className="text-lg">Define your path to mastery</CardDescription>
            </CardHeader>
            <CardContent className="p-10 pt-0">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                        <Alert className="border-destructive/20 bg-destructive/10 backdrop-blur-md rounded-2xl">
                            <AlertDescription className="text-destructive font-medium">{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-3">
                        <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Trophy className="h-4 w-4" /> Goal Subject
                        </label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Master 100 React hooks"
                            className="h-14 bg-background/50 border-border/50 text-lg rounded-2xl focus:ring-accent focus:border-accent transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <BookOpen className="h-4 w-4" /> Target Cards
                            </label>
                            <Input
                                type="number"
                                value={targetCards}
                                onChange={(e) => setTargetCards(e.target.value)}
                                className="h-14 bg-background/50 border-border/50 text-lg rounded-2xl focus:ring-accent focus:border-accent transition-all"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Clock className="h-4 w-4" /> Target Minutes
                            </label>
                            <Input
                                type="number"
                                value={targetMinutes}
                                onChange={(e) => setTargetMinutes(e.target.value)}
                                className="h-14 bg-background/50 border-border/50 text-lg rounded-2xl focus:ring-accent focus:border-accent transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Goal Recurrence</label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="h-14 bg-background/50 border-border/50 text-lg rounded-2xl focus:ring-accent">
                                <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent className="bg-background/90 backdrop-blur-xl border-border/50 rounded-2xl">
                                <SelectItem value="daily" className="h-12 rounded-xl">Daily Objective</SelectItem>
                                <SelectItem value="weekly" className="h-12 rounded-xl">Weekly Challenge</SelectItem>
                                <SelectItem value="custom" className="h-12 rounded-xl">One-time Milestone</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={isLoading || !title.trim()}
                            className="w-full h-16 bg-gradient-to-r from-accent to-primary text-white text-xl font-bold rounded-2xl shadow-xl shadow-accent/20 hover:scale-[1.01] transition-all"
                        >
                            {isLoading ? "Saving..." : (
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5" />
                                    {initialData ? "Update Goal" : "Lock In Goal"}
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
