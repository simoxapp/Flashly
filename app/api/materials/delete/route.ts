import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { deleteJSON } from "@/lib/s3-client"

export async function POST(request: NextRequest) {
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { key } = await request.json()

        if (!key) {
            return NextResponse.json({ error: "No key provided" }, { status: 400 })
        }

        // Verify that the key belongs to the current user
        if (!key.startsWith(`pdfs/${userId}/`)) {
            return NextResponse.json({ error: "Unauthorized access to material" }, { status: 403 })
        }

        await deleteJSON(key)

        return NextResponse.json({ success: true, message: "Material deleted successfully" })
    } catch (error: any) {
        console.error("Error deleting material:", error)
        return NextResponse.json({ error: error.message || "Failed to delete material" }, { status: 500 })
    }
}
