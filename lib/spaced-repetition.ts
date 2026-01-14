// Spaced Repetition Algorithm - Based on SuperMemo SM-2
// Optimizes review timing based on learning science

interface CardSchedule {
  cardId: string
  lastReview: number
  nextReview: number
  repetitions: number
  easeFactor: number
  interval: number
}

const INITIAL_EASE = 2.5
const MIN_EASE = 1.3
const MAX_EASE = 2.5

export function initializeCardSchedule(cardId: string): CardSchedule {
  const now = Date.now()
  return {
    cardId,
    lastReview: now,
    nextReview: now + 24 * 60 * 60 * 1000, // 1 day
    repetitions: 0,
    easeFactor: INITIAL_EASE,
    interval: 1,
  }
}

export function calculateNextReview(
  schedule: CardSchedule,
  quality: number, // 0-5: 0=complete blackout, 5=perfect response
): CardSchedule {
  const now = Date.now()
  let newRepetitions = schedule.repetitions + 1
  let newInterval = schedule.interval
  let newEaseFactor = schedule.easeFactor

  // SM-2 algorithm
  newEaseFactor = schedule.easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)

  if (newEaseFactor < MIN_EASE) newEaseFactor = MIN_EASE
  if (newEaseFactor > MAX_EASE) newEaseFactor = MAX_EASE

  if (quality >= 3) {
    // Correct answer
    if (newRepetitions === 1) {
      newInterval = 1
    } else if (newRepetitions === 2) {
      newInterval = 3
    } else {
      newInterval = Math.round(schedule.interval * newEaseFactor)
    }
  } else {
    // Incorrect answer
    newRepetitions = 0
    newInterval = 1
  }

  return {
    cardId: schedule.cardId,
    lastReview: now,
    nextReview: now + newInterval * 24 * 60 * 60 * 1000,
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
    interval: newInterval,
  }
}

export function isDueForReview(schedule: CardSchedule): boolean {
  return Date.now() >= schedule.nextReview
}

export function daysUntilNextReview(schedule: CardSchedule): number {
  const daysMs = Math.max(0, schedule.nextReview - Date.now())
  return Math.ceil(daysMs / (24 * 60 * 60 * 1000))
}

export function calculatePriority(schedules: CardSchedule[]): CardSchedule[] {
  return schedules.sort((a, b) => {
    const aDue = isDueForReview(a) ? 0 : 1
    const bDue = isDueForReview(b) ? 0 : 1
    if (aDue !== bDue) return aDue - bDue
    return a.nextReview - b.nextReview
  })
}
