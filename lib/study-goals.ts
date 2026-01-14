// Study goals and tracking system

export interface StudyGoal {
  id: string
  userId: string
  title: string
  targetCards: number
  targetMinutes: number
  targetDays: number // per week
  startDate: number
  deadline?: number
  progress: GoalProgress
  type: "daily" | "weekly" | "custom"
}

export interface GoalProgress {
  cardsStudied: number
  minutesSpent: number
  daysCompleted: number
  lastCheckin: number
}

export function getGoalProgress(goal: StudyGoal): number {
  const targetMetrics = [
    goal.targetCards > 0 ? goal.progress.cardsStudied / goal.targetCards : 1,
    goal.targetMinutes > 0 ? goal.progress.minutesSpent / goal.targetMinutes : 1,
    goal.targetDays > 0 ? goal.progress.daysCompleted / goal.targetDays : 1,
  ].filter((m) => m !== 1)

  if (targetMetrics.length === 0) return 0

  const average = targetMetrics.reduce((a, b) => a + b, 0) / targetMetrics.length
  return Math.min(100, Math.round(average * 100))
}

export function isGoalCompleted(goal: StudyGoal): boolean {
  const progress = getGoalProgress(goal)
  return progress >= 100
}

export function getGoalStatusMessage(goal: StudyGoal): string {
  const progress = getGoalProgress(goal)

  if (progress === 0) return "Not started"
  if (progress < 25) return "Just getting started"
  if (progress < 50) return "Good progress"
  if (progress < 75) return "Almost there"
  if (progress < 100) return "Almost done"
  return "Goal completed!"
}

export function createDailyGoal(userId: string, targetCards = 20, targetMinutes = 30): StudyGoal {
  return {
    id: `${userId}-daily-${Date.now()}`,
    userId,
    title: "Daily Study Goal",
    targetCards,
    targetMinutes,
    targetDays: 1,
    startDate: Date.now(),
    type: "daily",
    progress: {
      cardsStudied: 0,
      minutesSpent: 0,
      daysCompleted: 0,
      lastCheckin: Date.now(),
    },
  }
}
