// Shared types for the flashcard app

export interface Flashcard {
  id: string
  userId: string
  question: string
  answer: string
  deckId: string
  created: number
  updated: number
  difficulty: "easy" | "medium" | "hard"
}

export interface Deck {
  id: string
  userId: string
  name: string
  description: string
  created: number
  updated: number
  cardCount: number
}

export interface StudySession {
  id: string
  userId: string
  deckId: string
  mode: "flip" | "multiple-choice" | "essay"
  started: number
  completed?: number
  cardsReviewed: string[]
  correctAnswers: number
  totalCards: number
}

export interface UserProgress {
  userId: string
  totalCardsStudied: number
  totalSessions: number
  averageAccuracy: number
  weakAreas: string[]
  lastUpdated: number
  sessionHistory: StudySession[]
}

export interface AIInsight {
  userId: string
  generated: number
  recommendations: string
  weakAreas: string[]
}

export interface UserStats {
  userId: string
  xp: number
  level: number
  streakDays: number
  longestStreak: number
  lastStudyDate: number
  totalStudyMinutes: number
  cardsLearned: number
  achievements: string[]
  totalSessions: number
}

export interface StudyGoal {
  id: string
  userId: string
  title: string
  targetCards: number
  targetMinutes: number
  targetDays: number
  startDate: number
  deadline?: number
  progress: {
    cardsStudied: number
    minutesSpent: number
    daysCompleted: number
    lastCheckin: number
  }
  type: "daily" | "weekly" | "custom"
}

export interface CardSchedule {
  cardId: string
  lastReview: number
  nextReview: number
  repetitions: number
  easeFactor: number
  interval: number
}
