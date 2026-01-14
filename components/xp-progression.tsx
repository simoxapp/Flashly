"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Sparkles } from "lucide-react"

interface XPProgressionProps {
    currentXp: number
    animate?: boolean
}

export function XPProgression({ currentXp, animate = true }: XPProgressionProps) {
    const [displayXp, setDisplayXp] = useState(0)

    const level = Math.floor(currentXp / 1000) + 1
    const xpInLevel = currentXp % 1000
    const progress = (xpInLevel / 1000) * 100

    useEffect(() => {
        if (animate) {
            const timer = setTimeout(() => {
                setDisplayXp(currentXp)
            }, 500)
            return () => clearTimeout(timer)
        } else {
            setDisplayXp(currentXp)
        }
    }, [currentXp, animate])

    return (
        <Card className="card-gradient border-secondary/20 bg-background/50 backdrop-blur-md overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="h-24 w-24 text-secondary rotate-12" />
            </div>

            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-secondary" />
                        Progression
                    </CardTitle>
                    <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">
                        Rank: Scholar
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="flex items-end justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Level</p>
                        <div className="text-5xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                            {level}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1 text-secondary mb-1">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="font-bold">{displayXp} Total XP</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{1000 - xpInLevel} XP to Level {level + 1}</p>
                    </div>
                </div>

                <div className="relative pt-2">
                    <Progress value={animate ? (displayXp % 1000) / 10 : progress} className="h-3 bg-muted" />
                    <AnimatePresence>
                        {animate && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute -top-1 left-0 transform -translate-y-full"
                                style={{ left: `${progress}%` }}
                            >
                                <div className="bg-secondary text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-lg">
                                    Lvl {level}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-card/50 rounded-lg p-3 border border-border/50">
                        <p className="text-[10px] text-muted-foreground uppercase mb-1">Next Milestone</p>
                        <p className="text-sm font-semibold">Master Flashcards</p>
                    </div>
                    <div className="bg-card/50 rounded-lg p-3 border border-border/50">
                        <p className="text-[10px] text-muted-foreground uppercase mb-1">Level Reward</p>
                        <p className="text-sm font-semibold">New Deck Theme</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
