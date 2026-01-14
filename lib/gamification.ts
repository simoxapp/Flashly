// Gamification system with XP, levels, and achievements

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
}

const XP_PER_LEVEL = 500
const STREAK_BONUS_XP = 50
const CARD_XP = 10
const SESSION_BONUS = 25

export function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

export function xpRequiredForLevel(level: number): number {
  return (level - 1) * XP_PER_LEVEL
}

export function xpUntilNextLevel(xp: number): number {
  const nextLevel = calculateLevel(xp) + 1
  const requiredXp = xpRequiredForLevel(nextLevel)
  return Math.max(0, requiredXp - xp)
}

export function addXp(currentXp: number, amount: number): number {
  return currentXp + amount
}

export function calculateSessionXp(correctAnswers: number, totalCards: number, streakDays: number): number {
  let xp = correctAnswers * CARD_XP
  if (correctAnswers === totalCards) {
    xp += SESSION_BONUS
  }
  if (streakDays > 0) {
    xp += Math.min(STREAK_BONUS_XP, streakDays * 5)
  }
  return xp
}

export function updateStreak(lastStudyDate: number): {
  streakDays: number
  broken: boolean
} {
  const now = new Date()
  const last = new Date(lastStudyDate)

  const daysDiff = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))

  if (daysDiff === 0) {
    return { streakDays: 0, broken: false } // Same day
  } else if (daysDiff === 1) {
    return { streakDays: 1, broken: false } // Streak continues
  } else {
    return { streakDays: 0, broken: true } // Streak broken
  }
}

export const ACHIEVEMENTS = {
  FIRST_CARD: { id: "first_card", name: "First Step", description: "Create your first flashcard", xp: 50 },
  TEN_CARDS: { id: "ten_cards", name: "Card Collector", description: "Create 10 flashcards", xp: 100 },
  FIRST_STUDY: { id: "first_study", name: "Let's Learn", description: "Complete your first study session", xp: 50 },
  FIVE_STREAK: { id: "five_streak", name: "On Fire", description: "Maintain a 5-day study streak", xp: 150 },
  TEN_STREAK: { id: "ten_streak", name: "Unstoppable", description: "Maintain a 10-day study streak", xp: 300 },
  PERFECT_SCORE: { id: "perfect_score", name: "Flawless", description: "Get 100% on a study session", xp: 100 },
  SPEED_READER: { id: "speed_reader", name: "Speed Reader", description: "Complete 50 cards in one session", xp: 150 },
  MASTER_LEARNER: { id: "master_learner", name: "Master Learner", description: "Reach level 10", xp: 500 },
} as const

export function checkAchievements(stats: UserStats, trigger: string, data?: any): string[] {
  const newAchievements: string[] = []

  if (trigger === "card_created" && !stats.achievements.includes("first_card")) {
    newAchievements.push("first_card")
  }
  if (trigger === "cards_created" && data?.totalCards >= 10 && !stats.achievements.includes("ten_cards")) {
    newAchievements.push("ten_cards")
  }
  if (trigger === "session_completed" && !stats.achievements.includes("first_study")) {
    newAchievements.push("first_study")
  }
  if (trigger === "streak_updated" && data?.streakDays >= 5 && !stats.achievements.includes("five_streak")) {
    newAchievements.push("five_streak")
  }
  if (trigger === "streak_updated" && data?.streakDays >= 10 && !stats.achievements.includes("ten_streak")) {
    newAchievements.push("ten_streak")
  }
  if (trigger === "perfect_session" && !stats.achievements.includes("perfect_score")) {
    newAchievements.push("perfect_score")
  }
  if (trigger === "level_up" && data?.level >= 10 && !stats.achievements.includes("master_learner")) {
    newAchievements.push("master_learner")
  }

  return newAchievements
}
