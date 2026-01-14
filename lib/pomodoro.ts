// Pomodoro timer system for focused study sessions

export interface PomodoroSession {
  id: string
  userId: string
  startTime: number
  duration: number // in minutes
  type: "focus" | "break"
  completed: boolean
  sessionsCompleted: number
}

export const POMODORO_CONFIG = {
  focusDuration: 25, // minutes
  breakDuration: 5, // minutes
  longBreakDuration: 15, // minutes
  sessionsBeforeLongBreak: 4,
} as const

export function getNextBreakType(sessionsCompleted: number): "break" | "long-break" {
  if (sessionsCompleted % POMODORO_CONFIG.sessionsBeforeLongBreak === 0) {
    return "long-break"
  }
  return "break"
}

export function getBreakDuration(breakType: "break" | "long-break"): number {
  return breakType === "long-break" ? POMODORO_CONFIG.longBreakDuration : POMODORO_CONFIG.breakDuration
}

export function createPomodoroSession(userId: string, type: "focus" | "break" = "focus"): PomodoroSession {
  const duration = type === "focus" ? POMODORO_CONFIG.focusDuration : POMODORO_CONFIG.breakDuration

  return {
    id: `pomodoro-${userId}-${Date.now()}`,
    userId,
    startTime: Date.now(),
    duration,
    type,
    completed: false,
    sessionsCompleted: 0,
  }
}

export function calculateTimeRemaining(session: PomodoroSession): number {
  const elapsed = Math.floor((Date.now() - session.startTime) / 1000 / 60)
  return Math.max(0, session.duration - elapsed)
}

export function formatTimeRemaining(minutes: number): string {
  const mins = Math.floor(minutes)
  const secs = Math.floor((minutes - mins) * 60)
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}
