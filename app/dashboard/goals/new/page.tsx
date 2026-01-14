"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { GoalForm } from "@/components/goal-form"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function NewGoalPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleCreateGoal = async (data: { title: string; targetCards: number; targetMinutes: number; type: string }) => {
        try {
            setIsLoading(true)
            const response = await fetch("/api/goals", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            const responseData = await response.json().catch(() => ({}))

            if (!response.ok) {
                throw new Error(responseData.error || "Failed to create goal")
            }

            router.push("/dashboard/goals")
            router.refresh()
        } catch (error) {
            console.error("Error creating goal:", error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-20">
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="text-muted-foreground hover:text-foreground transition-colors group"
            >
                <ChevronLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Goals
            </Button>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <GoalForm onSubmit={handleCreateGoal} isLoading={isLoading} />
            </div>
        </div>
    )
}
