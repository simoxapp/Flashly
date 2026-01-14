"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, Plus, Trash2, Calendar, BookOpen, Clock, Loader2 } from "lucide-react"
import Link from "next/link"
import type { StudyGoal } from "@/lib/types"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { GoalForm } from "@/components/goal-form"
import { Pencil } from "lucide-react"

export default function GoalsPage() {
    const [goals, setGoals] = useState<StudyGoal[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchGoals = async () => {
            try {
                const response = await fetch("/api/goals")
                if (response.ok) {
                    const data = await response.json()
                    setGoals(data)
                }
            } catch (error) {
                console.error("Error fetching goals:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchGoals()
    }, [])

    const [editingGoal, setEditingGoal] = useState<StudyGoal | null>(null)
    const [deletingGoal, setDeletingGoal] = useState<StudyGoal | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)

    const handleDeleteGoal = async () => {
        if (!deletingGoal) return

        try {
            setIsDeleting(true)
            const response = await fetch(`/api/goals?id=${deletingGoal.id}`, {
                method: "DELETE",
            })

            if (response.ok) {
                setGoals(goals.filter(g => g.id !== deletingGoal.id))
                setDeletingGoal(null)
            }
        } catch (error) {
            console.error("Error deleting goal:", error)
        } finally {
            setIsDeleting(false)
        }
    }

    const handleUpdateGoal = async (data: { title: string; targetCards: number; targetMinutes: number; type: string }) => {
        if (!editingGoal) return

        try {
            setIsUpdating(true)
            const response = await fetch("/api/goals", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: editingGoal.id,
                    ...data
                }),
            })

            if (response.ok) {
                const updatedGoal = await response.json()
                setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g))
                setEditingGoal(null)
            }
        } catch (error) {
            console.error("Error updating goal:", error)
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Study Goals
                    </h1>
                    <p className="text-muted-foreground mt-2">Set objectives to track your learning progress</p>
                </div>
                <Link href="/dashboard/goals/new">
                    <Button className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/50 text-white interactive-element">
                        <Plus className="mr-2 h-4 w-4" /> New Goal
                    </Button>
                </Link>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
            ) : goals.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-muted rounded-3xl">
                    <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <h3 className="text-xl font-semibold">No Goals Found</h3>
                    <p className="text-muted-foreground mb-6">Create a goal to start tracking your achievements</p>
                    <Link href="/dashboard/goals/new">
                        <Button className="bg-gradient-to-r from-primary to-secondary text-white">
                            Create Your First Goal
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {goals.map((goal) => {
                        const cardProgress = (goal.progress.cardsStudied / goal.targetCards) * 100
                        const timeProgress = (goal.progress.minutesSpent / goal.targetMinutes) * 100

                        return (
                            <Card key={goal.id} className="card-gradient border-primary/20 hover:border-primary/50 transition-all overflow-hidden relative group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Target className="h-24 w-24" />
                                </div>

                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                            {goal.type.toUpperCase()}
                                        </Badge>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-primary z-10"
                                                onClick={() => setEditingGoal(goal)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-destructive z-10"
                                                onClick={() => setDeletingGoal(goal)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardTitle className="text-2xl font-bold mt-2">{goal.title}</CardTitle>
                                    <CardDescription className="flex items-center gap-2">
                                        <Calendar className="h-3 w-3" />
                                        Started {new Date(goal.startDate).toLocaleDateString()}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <BookOpen className="h-4 w-4" />
                                                    Cards Mastered
                                                </div>
                                                <span className="font-semibold">{goal.progress.cardsStudied} / {goal.targetCards}</span>
                                            </div>
                                            <Progress value={cardProgress} className="h-2 bg-muted transition-all" />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Clock className="h-4 w-4" />
                                                    Time Studied
                                                </div>
                                                <span className="font-semibold">{goal.progress.minutesSpent}m / {goal.targetMinutes}m</span>
                                            </div>
                                            <Progress value={timeProgress} className="h-2 bg-muted transition-all" />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-border/50 flex justify-between items-center">
                                        <div className="text-xs text-muted-foreground italic">
                                            Keep going! You're almost there.
                                        </div>
                                        <Button variant="outline" size="sm" className="bg-transparent border-primary/20 hover:bg-primary/5">
                                            Update Progress
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={!!editingGoal} onOpenChange={(open) => !open && setEditingGoal(null)}>
                <DialogContent className="max-w-2xl bg-transparent border-none p-0">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Edit Goal</DialogTitle>
                    </DialogHeader>
                    {editingGoal && (
                        <GoalForm
                            initialData={editingGoal}
                            onSubmit={handleUpdateGoal}
                            isLoading={isUpdating}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingGoal} onOpenChange={(open) => !open && setDeletingGoal(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete your study goal "{deletingGoal?.title}". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={(e) => {
                                e.preventDefault()
                                handleDeleteGoal()
                            }}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete Goal"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
