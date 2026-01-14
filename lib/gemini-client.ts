import { GoogleGenerativeAI } from "@google/generative-ai"

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY not configured. AI features will be disabled.")
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export class AIError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message)
    this.name = "AIError"
  }
}

async function retryOperation<T>(operation: () => Promise<T>, maxRetries = 3, delayMs = 1000): Promise<T> {
  let lastError: Error | null = null

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, i)))
      }
    }
  }

  throw lastError || new AIError("Operation failed after retries", "MAX_RETRIES_EXCEEDED")
}

export async function generateFlashcardsFromText(text: string): Promise<Array<{ question: string; answer: string }>> {
  if (!process.env.GEMINI_API_KEY) {
    throw new AIError("Gemini API key not configured", "NO_API_KEY")
  }

  if (!text || text.trim().length === 0) {
    throw new AIError("Text input cannot be empty", "EMPTY_INPUT")
  }

  return retryOperation(async () => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-preview-02-05" })

    const prompt = `Convert the following text into 5-10 flashcards. Return a JSON array with objects containing "question" and "answer" fields. Make questions concise (5-15 words) and answers comprehensive but brief (20-50 words).

Text: ${text}

Return ONLY a valid JSON array, no other text. Example format: [{"question": "What is X?", "answer": "X is..."}]`

    const result = await model.generateContent(prompt)
    const response = result.response
    const content = response.text()

    // Parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new AIError("Invalid response format from Gemini", "PARSE_ERROR")
    }

    const parsed = JSON.parse(jsonMatch[0])
    if (!Array.isArray(parsed)) {
      throw new AIError("Response is not an array", "INVALID_FORMAT")
    }

    return parsed.filter((item) => item.question && item.answer)
  })
}

export async function generateAIQuestion(
  topic: string,
  difficulty: "easy" | "medium" | "hard" = "medium",
): Promise<{ question: string; options: string[]; correct: number; explanation: string }> {
  if (!process.env.GEMINI_API_KEY) {
    throw new AIError("Gemini API key not configured", "NO_API_KEY")
  }

  if (!topic || topic.trim().length === 0) {
    throw new AIError("Topic cannot be empty", "EMPTY_INPUT")
  }

  return retryOperation(async () => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-preview-02-05" })

    const difficultyText = difficulty === "easy" ? "beginner" : difficulty === "medium" ? "intermediate" : "advanced"

    const prompt = `Generate a ${difficultyText} level multiple choice question about "${topic}". 
Return a JSON object with:
- "question": the question text (2-3 sentences)
- "options": array of exactly 4 possible answers
- "correct": index (0-3) of the correct answer
- "explanation": brief explanation of why the answer is correct

Return ONLY valid JSON, no other text.`

    const result = await model.generateContent(prompt)
    const response = result.response
    const content = response.text()

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new AIError("Invalid response format from Gemini", "PARSE_ERROR")
    }

    const parsed = JSON.parse(jsonMatch[0])
    return {
      question: parsed.question || "Question not generated",
      options: parsed.options || ["Option 1", "Option 2", "Option 3", "Option 4"],
      correct: typeof parsed.correct === "number" ? parsed.correct : 0,
      explanation: parsed.explanation || "No explanation available",
    }
  })
}

export async function getAIInsights(weakAreas: string[]): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new AIError("Gemini API key not configured", "NO_API_KEY")
  }

  if (!weakAreas || weakAreas.length === 0) {
    return "Keep practicing consistently for better results!"
  }

  return retryOperation(async () => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-preview-02-05" })

    const areasText = weakAreas.slice(0, 5).join(", ")

    const prompt = `Based on these weak areas in a student's learning: ${areasText}

Generate 3-4 personalized study recommendations and insights. Keep it brief and actionable (max 200 words). Focus on:
1. Study techniques specific to these topics
2. Resource suggestions or practice methods
3. Tips for improvement`

    const result = await model.generateContent(prompt)
    return result.response.text()
  })
}

export async function generateFullDeck(topicOrText: string): Promise<{ name: string; description: string; cards: Array<{ question: string; answer: string }> }> {
  if (!process.env.GEMINI_API_KEY) {
    throw new AIError("Gemini API key not configured", "NO_API_KEY")
  }

  return retryOperation(async () => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-preview-02-05" })

    const prompt = `
    You are an expert educational content creator. Your task is to create a flashcard deck from the user's input.
    
    User Input (Topic or Text):
    """
    ${topicOrText}
    """
    
    Instructions:
    1. Analyze the input. If it is a broad topic (e.g., "History of Morocco"), generate key facts, dates, and concepts about that topic.
    2. If it is raw text/notes, extract the most important information directly from the text.
    3. Create a JSON object with:
       - "name": A concise, catchy title for the deck (max 50 chars).
       - "description": A brief summary of what the deck covers (max 200 chars).
       - "cards": An array of 8-15 flashcard objects, each with "question" and "answer" fields.
    
    4. Ensure questions are clear and specific. Answers should be accurate and concise.
    5. Return ONLY valid JSON.`

    const result = await model.generateContent(prompt)
    const response = result.response
    const content = response.text()

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new AIError("Invalid response format from Gemini", "PARSE_ERROR")
    }

    const parsed = JSON.parse(jsonMatch[0])
    return {
      name: parsed.name || "AI Generated Deck",
      description: parsed.description || "Generated by Gemini AI",
      cards: (parsed.cards || []).filter((c: any) => c.question && c.answer)
    }
  })
}

export async function generateFullDeckFromPDF(pdfBuffer: Buffer): Promise<{ name: string; description: string; cards: Array<{ question: string; answer: string }> }> {
  if (!process.env.GEMINI_API_KEY) {
    throw new AIError("Gemini API key not configured", "NO_API_KEY")
  }

  return retryOperation(async () => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-preview-02-05" })

    const prompt = `
    You are an expert educational content creator. Your task is to create a flashcard deck from the attached PDF document.
    
    Instructions:
    1. Analyze the content of the PDF.
    2. Extract the most important facts, concepts, and definitions.
    3. Create a JSON object with:
       - "name": A concise, catchy title for the deck (max 50 chars).
       - "description": A brief summary of what the deck covers (max 200 chars).
       - "cards": An array of 10-20 high-quality flashcard objects, each with "question" and "answer" fields.
    
    4. Ensure questions are clear and specific. Answers should be accurate and educational.
    5. Return ONLY valid JSON.`

    const result = await model.generateContent([
      {
        inlineData: {
          data: pdfBuffer.toString("base64"),
          mimeType: "application/pdf"
        }
      },
      prompt
    ])

    const response = result.response
    const content = response.text()

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new AIError("Invalid response format from Gemini", "PARSE_ERROR")
    }

    const parsed = JSON.parse(jsonMatch[0])
    return {
      name: parsed.name || "AI Generated Deck",
      description: parsed.description || "Generated from PDF by Gemini AI",
      cards: (parsed.cards || []).filter((c: any) => c.question && c.answer)
    }
  })
}
