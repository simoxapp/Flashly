import type { Deck, Flashcard, UserProgress, StudyGoal } from "./types"
import { uploadJSON, downloadJSON, downloadJSONWithVersion, deleteJSON, listJSONFiles, S3Error } from "./s3-client"

export class ServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message)
    this.name = "ServiceError"
  }
}

export class FlashcardService {
  private static readonly DECKS_PREFIX = "decks/"
  private static readonly CARDS_PREFIX = "cards/"
  private static readonly PROGRESS_PREFIX = "progress/"
  private static readonly GOALS_PREFIX = "goals/"

  /**
   * Helper for atomic updates to shared JSON objects (like Decks) to prevent race conditions.
   * Implements Optimistic Concurrency Control using S3 ETags with retries.
   */
  private static async atomicUpdateDeck(
    userId: string,
    deckId: string,
    updateFn: (deck: Deck) => Deck
  ): Promise<Deck | null> {
    const maxRetries = 8;
    const baseDelay = 100;
    let retries = 0;

    const key = `${this.DECKS_PREFIX}${userId}/${deckId}.json`

    while (retries < maxRetries) {
      try {
        const { data: deck, etag } = await downloadJSONWithVersion<Deck>(key)
        if (!deck) return null

        const updated = updateFn(deck)
        updated.updated = Date.now()

        await uploadJSON(key, updated, etag)
        return updated
      } catch (error: any) {
        if (error.code === "CONFLICT" && retries < maxRetries - 1) {
          retries++;
          // Exponential backoff with jitter
          const delay = Math.random() * baseDelay * Math.pow(2, retries);
          console.warn(`[FlashcardService] Conflict updating deck ${deckId}, retry ${retries}/${maxRetries} after ${Math.round(delay)}ms`);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        throw error;
      }
    }
    throw new ServiceError("Failed to update deck after multiple retries due to high concurrency", "CONCURRENCY_ERROR")
  }

  /**
   * Create a new deck
   */
  static async createDeck(userId: string, name: string, description: string = ""): Promise<Deck> {
    if (!userId || !name) {
      throw new ServiceError("User ID and Name are required", "INVALID_INPUT")
    }

    try {
      const deckId = crypto.randomUUID()
      const deck: Deck = {
        id: deckId,
        userId,
        name: name.trim(),
        description: description.trim(),
        cardCount: 0,
        created: Date.now(),
        updated: Date.now(),
      }

      const key = `${this.DECKS_PREFIX}${userId}/${deckId}.json`
      await uploadJSON(key, deck)

      return deck
    } catch (error) {
      if (error instanceof S3Error) {
        throw new ServiceError(`Failed to create deck: ${error.message}`, "DECK_CREATION_FAILED")
      }
      throw error
    }
  }

  /**
   * Get all decks for a user
   */
  static async getUserDecks(userId: string): Promise<Deck[]> {
    if (!userId) {
      throw new ServiceError("User ID is required", "INVALID_INPUT")
    }

    try {
      const prefix = `${this.DECKS_PREFIX}${userId}/`
      const files = await listJSONFiles(prefix)
      const decks = await Promise.all(files.map((file) => downloadJSON<Deck>(file)))
      return decks.filter((deck): deck is Deck => deck !== null)
    } catch (error) {
      if (error instanceof S3Error) {
        throw new ServiceError(`Failed to list decks: ${error.message}`, "LIST_FAILED")
      }
      throw error
    }
  }

  /**
   * Get a single deck by ID
   */
  static async getDeck(userId: string, deckId: string): Promise<Deck | null> {
    if (!userId || !deckId) {
      throw new ServiceError("User ID and Deck ID are required", "INVALID_INPUT")
    }

    try {
      const key = `${this.DECKS_PREFIX}${userId}/${deckId}.json`
      return await downloadJSON<Deck>(key)
    } catch (error) {
      if (error instanceof S3Error) {
        console.error(`[FlashcardService] Failed to get deck:`, error)
        return null
      }
      throw error
    }
  }

  /**
   * Update deck metadata using atomic retries to prevent data loss.
   */
  static async updateDeck(
    userId: string,
    deckId: string,
    updates: Partial<Omit<Deck, "id" | "userId" | "created">>,
  ): Promise<Deck | null> {
    if (!userId || !deckId) {
      throw new ServiceError("User ID and Deck ID are required", "INVALID_INPUT")
    }

    try {
      return await this.atomicUpdateDeck(userId, deckId, (deck) => ({
        ...deck,
        ...updates
      }));
    } catch (error: any) {
      if (error instanceof S3Error || error instanceof ServiceError) {
        throw new ServiceError(`Failed to update deck: ${error.message}`, "UPDATE_FAILED")
      }
      throw error
    }
  }

  /**
   * Delete a deck and all its cards
   */
  static async deleteDeck(userId: string, deckId: string): Promise<void> {
    if (!userId || !deckId) {
      throw new ServiceError("User ID and Deck ID are required", "INVALID_INPUT")
    }

    try {
      // Delete deck metadata
      const deckKey = `${this.DECKS_PREFIX}${userId}/${deckId}.json`
      await deleteJSON(deckKey)

      // Delete all cards in the deck
      const cardFiles = await listJSONFiles(`${this.CARDS_PREFIX}${userId}/${deckId}/`)
      for (const file of cardFiles) {
        await deleteJSON(file)
      }
    } catch (error) {
      if (error instanceof S3Error) {
        throw new ServiceError(`Failed to delete deck: ${error.message}`, "DELETION_FAILED")
      }
      throw error
    }
  }

  /**
   * Create a flashcard with validation. Correctly updates card count atomically.
   */
  static async createFlashcard(
    userId: string,
    deckId: string,
    question: string,
    answer: string,
    difficulty: "easy" | "medium" | "hard" = "medium",
  ): Promise<Flashcard> {
    if (!userId || !deckId) throw new ServiceError("User ID and Deck ID are required", "INVALID_INPUT")
    if (!question || question.trim().length === 0) throw new ServiceError("Question is required", "INVALID_QUESTION")
    if (!answer || answer.trim().length === 0) throw new ServiceError("Answer is required", "INVALID_ANSWER")

    try {
      const cardId = crypto.randomUUID()
      const card: Flashcard = {
        id: cardId,
        userId,
        question: question.trim(),
        answer: answer.trim(),
        deckId,
        difficulty,
        created: Date.now(),
        updated: Date.now(),
      }

      const key = `${this.CARDS_PREFIX}${userId}/${deckId}/${cardId}.json`
      await uploadJSON(key, card)

      // Update deck card count ATOMICALLY
      await this.atomicUpdateDeck(userId, deckId, (deck) => ({
        ...deck,
        cardCount: deck.cardCount + 1
      }))

      return card
    } catch (error: any) {
      throw new ServiceError(`Failed to create flashcard: ${error.message}`, "CARD_CREATION_FAILED")
    }
  }

  /**
   * Batch create flashcards. Only updates deck count once at the end.
   */
  static async createFlashcardsBatch(
    userId: string,
    deckId: string,
    cards: Array<{ question: string; answer: string; difficulty?: "easy" | "medium" | "hard" }>
  ): Promise<void> {
    if (!userId || !deckId) throw new ServiceError("User ID and Deck ID are required", "INVALID_INPUT")

    try {
      const timestamp = Date.now()

      // 1. Upload all cards in parallel (these are separate files, no conflict)
      await Promise.all(cards.map(cardData => {
        const cardId = crypto.randomUUID()
        const card: Flashcard = {
          id: cardId,
          userId,
          question: cardData.question.trim(),
          answer: cardData.answer.trim(),
          deckId,
          difficulty: cardData.difficulty || "medium",
          created: timestamp,
          updated: timestamp,
        }
        return uploadJSON(`${this.CARDS_PREFIX}${userId}/${deckId}/${cardId}.json`, card)
      }))

      // 2. Update deck card count ATOMICALLY once
      await this.atomicUpdateDeck(userId, deckId, (deck) => ({
        ...deck,
        cardCount: deck.cardCount + cards.length
      }))
    } catch (error: any) {
      throw new ServiceError(`Failed to batch create cards: ${error.message}`, "BATCH_CREATION_FAILED")
    }
  }

  /**
   * Get all cards in a deck
   */
  static async getDeckCards(userId: string, deckId: string): Promise<Flashcard[]> {
    if (!userId || !deckId) {
      throw new ServiceError("User ID and Deck ID are required", "INVALID_INPUT")
    }

    try {
      const prefix = `${this.CARDS_PREFIX}${userId}/${deckId}/`
      const files = await listJSONFiles(prefix)
      const cards = await Promise.all(files.map((file) => downloadJSON<Flashcard>(file)))
      return cards
        .filter((card): card is Flashcard => card !== null)
        .sort((a, b) => b.created - a.created)
    } catch (error) {
      if (error instanceof S3Error) {
        throw new ServiceError(`Failed to list cards: ${error.message}`, "LIST_FAILED")
      }
      throw error
    }
  }

  /**
   * Update a flashcard
   */
  static async updateFlashcard(
    userId: string,
    deckId: string,
    cardId: string,
    updates: Partial<Omit<Flashcard, "id" | "userId" | "deckId" | "created">>,
  ): Promise<Flashcard | null> {
    if (!userId || !deckId || !cardId) {
      throw new ServiceError("User ID, Deck ID, and Card ID are required", "INVALID_INPUT")
    }

    try {
      const key = `${this.CARDS_PREFIX}${userId}/${deckId}/${cardId}.json`
      const card = await downloadJSON<Flashcard>(key)
      if (!card) return null

      const updated: Flashcard = {
        ...card,
        ...updates,
        updated: Date.now(),
      }

      await uploadJSON(key, updated)
      return updated
    } catch (error) {
      if (error instanceof S3Error) {
        throw new ServiceError(`Failed to update card: ${error.message}`, "UPDATE_FAILED")
      }
      throw error
    }
  }

  /**
   * Delete a flashcard. Updates deck count atomically.
   */
  static async deleteFlashcard(userId: string, deckId: string, cardId: string): Promise<void> {
    if (!userId || !deckId || !cardId) throw new ServiceError("User ID, Deck ID, and Card ID are required", "INVALID_INPUT")

    try {
      const key = `${this.CARDS_PREFIX}${userId}/${deckId}/${cardId}.json`
      await deleteJSON(key)

      // Update deck card count ATOMICALLY
      await this.atomicUpdateDeck(userId, deckId, (deck) => ({
        ...deck,
        cardCount: Math.max(0, deck.cardCount - 1)
      }))
    } catch (error: any) {
      throw new ServiceError(`Failed to delete card: ${error.message}`, "DELETION_FAILED")
    }
  }

  /**
   * Get user progress (global or per-deck)
   */
  static async getUserProgress(userId: string, deckId?: string): Promise<UserProgress | null> {
    if (!userId) return null

    try {
      const key = deckId
        ? `${this.PROGRESS_PREFIX}${userId}/${deckId}.json`
        : `${this.PROGRESS_PREFIX}${userId}/global.json`
      return await downloadJSON<UserProgress>(key)
    } catch (error) {
      return null
    }
  }

  /**
   * Update global user progress
   */
  static async updateUserProgress(userId: string, progress: Partial<UserProgress>): Promise<UserProgress> {
    if (!userId) throw new ServiceError("User ID is required", "INVALID_INPUT")

    const key = `${this.PROGRESS_PREFIX}${userId}/global.json`
    const current = await this.getUserProgress(userId) || {
      userId,
      totalCardsStudied: 0,
      totalSessions: 0,
      averageAccuracy: 0,
      weakAreas: [],
      lastUpdated: Date.now(),
      sessionHistory: []
    }

    const updated: UserProgress = {
      ...current,
      ...progress,
      lastUpdated: Date.now()
    }

    await uploadJSON(key, updated)
    return updated
  }

  /**
   * Update user progress for a deck
   */
  static async updateProgress(userId: string, deckId: string, progress: UserProgress): Promise<void> {
    if (!userId || !deckId) return

    try {
      const key = `${this.PROGRESS_PREFIX}${userId}/${deckId}.json`
      await uploadJSON(key, progress)
    } catch (error) {
      console.error("[FlashcardService] Failed to update progress:", error)
    }
  }

  /**
   * Get all goals for a user
   */
  static async getUserGoals(userId: string): Promise<any[]> {
    if (!userId) {
      throw new ServiceError("User ID is required", "INVALID_INPUT")
    }

    try {
      const prefix = `${this.GOALS_PREFIX}${userId}/`
      const files = await listJSONFiles(prefix)
      const goals = await Promise.all(files.map((file) => downloadJSON<any>(file)))
      return goals
        .filter((goal): goal is any => goal !== null)
        .sort((a, b) => b.startDate - a.startDate)
    } catch (error) {
      if (error instanceof S3Error) {
        throw new ServiceError(`Failed to list goals: ${error.message}`, "LIST_FAILED")
      }
      throw error
    }
  }

  /**
   * Create a new study goal
   */
  static async createGoal(
    userId: string,
    title: string,
    targetCards: number,
    targetMinutes: number,
    type: "daily" | "weekly" | "custom" = "custom"
  ): Promise<any> {
    if (!userId || !title) {
      throw new ServiceError("User ID and Title are required", "INVALID_INPUT")
    }

    try {
      const goalId = crypto.randomUUID()
      const goal: StudyGoal = {
        id: goalId,
        userId,
        title: title.trim(),
        targetCards,
        targetMinutes,
        targetDays: 7, // Default
        startDate: Date.now(),
        progress: {
          cardsStudied: 0,
          minutesSpent: 0,
          daysCompleted: 0,
          lastCheckin: Date.now(),
        },
        type,
      }

      const key = `${this.GOALS_PREFIX}${userId}/${goalId}.json`
      await uploadJSON(key, goal)

      return goal
    } catch (error: any) {
      console.error("[FlashcardService] Error creating goal:", error)
      if (error instanceof S3Error) {
        throw new ServiceError(`Failed to create goal: ${error.message}`, "GOAL_CREATION_FAILED")
      }
      throw new ServiceError(`Failed to create goal: ${error.message || 'Unknown error'}`, "GOAL_CREATION_FAILED")
    }
  }

  /**
   * Update a study goal
   */
  static async updateGoal(
    userId: string,
    goalId: string,
    updates: Partial<Omit<StudyGoal, "id" | "userId" | "startDate" | "progress">>
  ): Promise<StudyGoal | null> {
    if (!userId || !goalId) {
      throw new ServiceError("User ID and Goal ID are required", "INVALID_INPUT")
    }

    try {
      const key = `${this.GOALS_PREFIX}${userId}/${goalId}.json`
      const goal = await downloadJSON<StudyGoal>(key)
      if (!goal) return null

      const updated: StudyGoal = {
        ...goal,
        ...updates
      }

      await uploadJSON(key, updated)
      return updated
    } catch (error) {
      if (error instanceof S3Error) {
        throw new ServiceError(`Failed to update goal: ${error.message}`, "UPDATE_FAILED")
      }
      throw error
    }
  }

  /**
   * Delete a study goal
   */
  static async deleteGoal(userId: string, goalId: string): Promise<void> {
    if (!userId || !goalId) {
      throw new ServiceError("User ID and Goal ID are required", "INVALID_INPUT")
    }

    try {
      const key = `${this.GOALS_PREFIX}${userId}/${goalId}.json`
      await deleteJSON(key)
    } catch (error) {
      if (error instanceof S3Error) {
        throw new ServiceError(`Failed to delete goal: ${error.message}`, "DELETION_FAILED")
      }
      throw error
    }
  }
}
