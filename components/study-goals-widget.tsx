"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Target, CheckCircle2, Circle } from "lucide-react"
import type { StudyGoal } from "@/lib/types"

interface StudyGoalsWidgetProps {
    goals: StudyGoal[]
}

export function StudyGoalsWidget({ goals }: StudyGoalsWidgetProps) {
    if (!goals || goals.length === 0) {
        return (
            <div className="text-center p-8 border-2 border-dashed border-muted rounded-xl">
                <Target className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-20" />
                <p className="text-muted-foreground">No active goals. Set one to stay motivated!</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => {
                const cardProgress = Math.min(100, (goal.progress.cardsStudied / goal.targetCards) * 100)
                const timeProgress = Math.min(100, (goal.progress.minutesSpent / goal.targetMinutes) * 100)
                const isCompleted = goal.progress.cardsStudied >= goal.targetCards && goal.progress.minutesSpent >= goal.targetMinutes

                return (
                    <Card key={goal.id} className="card-interactive card-gradient border-accent/20 bg-background/50 backdrop-blur-md">
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg">{goal.title}</h3>
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest">{goal.type} Objective</p>
                                </div>
                                {isCompleted ? (
                                    <div className="bg-green-500/10 p-2 rounded-full">
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    </div>
                                ) : (
                                    <div className="bg-accent/10 p-2 rounded-full">
                                        <Circle className="h-5 w-5 text-accent animate-pulse" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-muted-foreground">Cards Mastered</span>
                                        <span className="text-foreground">{goal.progress.cardsStudied} / {goal.targetCards}</span>
                                    </div>
                                    <Progress value={cardProgress} className="h-1.5 bg-muted" />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-muted-foreground">Time Studied</span>
                                        <span className="text-foreground">{goal.progress.minutesSpent}m / {goal.targetMinutes}m</span>
                                    </div>
                                    <Progress value={timeProgress} className="h-1.5 bg-muted" />
                                </div>
                            </div>

                            <div className="pt-2 flex items-center gap-2 text-[10px] text-muted-foreground bg-accent/5 p-2 rounded-md">
                                <Target className="h-3 w-3" />
                                <span>Expires in {Math.floor((goal.startDate + (24 * 60 * 60 * 1000) - Date.now()) / (60 * 60 * 1000))} hours</span>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
