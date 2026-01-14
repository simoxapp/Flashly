"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, Coffee, Zap } from "lucide-react"
import { POMODORO_CONFIG, formatTimeRemaining } from "@/lib/pomodoro"
import { toast } from "sonner"

export function PomodoroTimer() {
    const [timeLeft, setTimeLeft] = useState(POMODORO_CONFIG.focusDuration * 60)
    const [isActive, setIsActive] = useState(false)
    const [mode, setMode] = useState<"focus" | "break">("focus")
    const [sessionsCompleted, setSessionsCompleted] = useState(0)

    const toggleTimer = () => setIsActive(!isActive)

    const resetTimer = useCallback(() => {
        setIsActive(false)
        const duration = mode === "focus"
            ? POMODORO_CONFIG.focusDuration
            : (sessionsCompleted % POMODORO_CONFIG.sessionsBeforeLongBreak === 0 && sessionsCompleted > 0
                ? POMODORO_CONFIG.longBreakDuration
                : POMODORO_CONFIG.breakDuration)
        setTimeLeft(duration * 60)
    }, [mode, sessionsCompleted])

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1)
            }, 1000)
        } else if (timeLeft === 0) {
            setIsActive(false)
            if (mode === "focus") {
                setSessionsCompleted((prev) => prev + 1)
                setMode("break")
                toast.success("Focus session complete! Time for a break.")
            } else {
                setMode("focus")
                toast.info("Break finished! Let's get back to work.")
            }
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [isActive, timeLeft, mode])

    useEffect(() => {
        resetTimer()
    }, [mode, resetTimer])

    const progress = mode === "focus"
        ? ((POMODORO_CONFIG.focusDuration * 60 - timeLeft) / (POMODORO_CONFIG.focusDuration * 60)) * 100
        : ((POMODORO_CONFIG.breakDuration * 60 - timeLeft) / (POMODORO_CONFIG.breakDuration * 60)) * 100

    return (
        <Card className="card-gradient border-primary/20 relative overflow-hidden bg-background/50 backdrop-blur-md">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        {mode === "focus" ? <Zap className="h-5 w-5 text-primary" /> : <Coffee className="h-5 w-5 text-secondary" />}
                        {mode === "focus" ? "Focus Session" : "Break Time"}
                    </CardTitle>
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                        Session #{sessionsCompleted + 1}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="text-center space-y-2">
                    <div className="text-6xl font-mono font-bold tracking-tighter text-foreground drop-shadow-sm">
                        {formatTimeRemaining(timeLeft / 60)}
                    </div>
                    <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium">
                        {mode === "focus" ? "Stay Productive" : "Relax & Recharge"}
                    </p>
                </div>

                <Progress value={progress} className="h-2 bg-muted transition-all duration-1000" />

                <div className="flex items-center justify-center gap-4">
                    <Button
                        size="icon"
                        variant="outline"
                        className="rounded-full border-primary/20 hover:bg-primary/10"
                        onClick={resetTimer}
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                        size="lg"
                        className={`rounded-full px-8 ${isActive ? 'bg-secondary hover:bg-secondary/90' : 'bg-primary hover:bg-primary/90'} text-white shadow-lg`}
                        onClick={toggleTimer}
                    >
                        {isActive ? <Pause className="mr-2 h-5 w-5 fill-current" /> : <Play className="mr-2 h-5 w-5 fill-current" />}
                        {isActive ? "Pause" : "Start"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
