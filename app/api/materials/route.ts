import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { listJSONFiles } from "@/lib/s3-client"

export async function GET(request: NextRequest) {
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const prefix = `pdfs/${userId}/`
        const files = await listJSONFiles(prefix)

        // Transform keys like "pdfs/user_123/uuid-filename.pdf" into objects
        const materials = files.map(key => {
            const parts = key.split("/")
            const filenameWithUUID = parts[parts.length - 1]
            // UUID is 36 chars + 1 for the dash
            const originalName = filenameWithUUID.substring(37)

            return {
                key,
                name: originalName,
                id: filenameWithUUID.split("-")[0],
                url: `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${key}`
            }
        })

        return NextResponse.json(materials)
    } catch (error: any) {
        console.error("Error listing materials:", error)
        return NextResponse.json({ error: "Failed to list materials" }, { status: 500 })
    }
}
