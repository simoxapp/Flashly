import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { uploadFile } from "@/lib/s3-client"
import { generateFullDeckFromPDF } from "@/lib/gemini-client"
import { FlashcardService } from "@/lib/flashcard-service"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        console.log("PDF Generation Request Started (Direct Gemini Mode)");
        const formData = await request.formData()
        const file = formData.get("file") as File

        if (!file) {
            console.error("No file in form data");
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
        }

        console.log("File received:", file.name, "Type:", file.type, "Size:", file.size);

        if (file.type !== "application/pdf") {
            return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())

        // 1. Upload PDF to S3 - Always do this first as requested
        const fileId = uuidv4()
        const fileKey = `pdfs/${userId}/${fileId}-${file.name}`
        console.log("Uploading PDF to S3:", fileKey);
        try {
            await uploadFile(fileKey, buffer, "application/pdf")
            console.log("S3 Upload successful");
        } catch (s3Err) {
            console.error("S3 Upload Failed:", s3Err);
            return NextResponse.json({ error: "Failed to store PDF on S3" }, { status: 500 })
        }

        // 2. Generate Deck DIRECTLY from PDF using Gemini
        // This avoids local parsing issues with buggy libraries
        console.log("Sending PDF directly to Gemini for processing...");
        let aiDeck;
        try {
            aiDeck = await generateFullDeckFromPDF(buffer)
            console.log("Gemini deck generation successful. Card count:", aiDeck.cards.length);
        } catch (aiErr: any) {
            console.error("Gemini PDF Processing Error:", aiErr);
            return NextResponse.json({ error: `AI failed to process PDF: ${aiErr.message}` }, { status: 500 })
        }

        // 3. Create Deck in DB/S3
        const description = `Generated from PDF: ${file.name}. ${aiDeck.description}`
        console.log("Creating deck in service...");
        const deck = await FlashcardService.createDeck(userId, aiDeck.name, description)
        console.log("Deck created. ID:", deck.id);

        // 4. Create Cards
        console.log("Creating cards batch...");
        await FlashcardService.createFlashcardsBatch(
            userId,
            deck.id,
            aiDeck.cards.map(card => ({
                question: card.question,
                answer: card.answer,
                difficulty: "medium"
            }))
        )
        console.log("Cards created successfully");

        return NextResponse.json({
            success: true,
            deckId: deck.id,
            name: deck.name,
            cardCount: aiDeck.cards.length
        })

    } catch (error: any) {
        console.error("CRITICAL ERROR PROCESSING PDF:", error)
        return NextResponse.json({ error: error.message || "Failed to process PDF" }, { status: 500 })
    }
}
