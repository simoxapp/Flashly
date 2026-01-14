import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { FlashcardService, ServiceError } from "@/lib/flashcard-service"

export async function GET() {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const goals = await FlashcardService.getUserGoals(userId)
        return NextResponse.json(goals)
    } catch (error) {
        console.error("[GOALS_GET]", error)
        return NextResponse.json({ error: "Internal Error" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            console.warn("[GOALS_POST] Unauthorized access attempt")
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { title, targetCards, targetMinutes, type } = body

        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 })
        }

        const goal = await FlashcardService.createGoal(userId, title, targetCards, targetMinutes, type)
        console.log(`[GOALS_POST] Goal created successfully: ${goal.id} for user ${userId}`)
        return NextResponse.json(goal)
    } catch (error: any) {
        console.error("[GOALS_POST] Error creating goal:", error)

        // Handle specific service errors
        if (error.name === "ServiceError" || error instanceof ServiceError) {
            return NextResponse.json({
                error: error.message,
                code: error.code
            }, { status: 400 })
        }

        // Catch-all for other errors
        return NextResponse.json({
            error: "Internal Server Error",
            message: error.message || "Failed to create goal"
        }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { id, title, targetCards, targetMinutes, type } = body

        if (!id) {
            return NextResponse.json({ error: "Goal ID is required" }, { status: 400 })
        }

        const updatedGoal = await FlashcardService.updateGoal(userId, id, {
            title,
            targetCards,
            targetMinutes,
            type
        })

        if (!updatedGoal) {
            return NextResponse.json({ error: "Goal not found" }, { status: 404 })
        }

        return NextResponse.json(updatedGoal)
    } catch (error: any) {
        console.error("[GOALS_PATCH]", error)
        return NextResponse.json({ error: "Internal Error" }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ error: "Goal ID is required" }, { status: 400 })
        }

        await FlashcardService.deleteGoal(userId, id)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("[GOALS_DELETE]", error)
        return NextResponse.json({ error: "Internal Error" }, { status: 500 })
    }
}
