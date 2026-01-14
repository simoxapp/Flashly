"use client"

interface ProgressRingProps {
  radius?: number
  circumference?: number
  strokeDashoffset?: number
  percent: number
  label?: string
}

export function ProgressRing({ percent = 0, label = "Mastery" }: ProgressRingProps) {
  const radius = 45
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (percent / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-32 h-32">
        <svg width="130" height="130" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="65"
            cy="65"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted opacity-20"
          />
          {/* Progress circle */}
          <circle
            cx="65"
            cy="65"
            r={radius}
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "hsl(var(--primary))" }} />
              <stop offset="100%" style={{ stopColor: "hsl(var(--secondary))" }} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{Math.round(percent)}%</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
