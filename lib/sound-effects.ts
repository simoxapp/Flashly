// Sound effects and notifications for better feedback

export function playSound(type: "correct" | "incorrect" | "complete" | "levelup" | "achievement") {
  if (typeof window === "undefined") return

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

  switch (type) {
    case "correct":
      playTone(audioContext, 523, 0.1, 0.1) // C5
      break
    case "incorrect":
      playTone(audioContext, 349, 0.15, 0.2) // F4
      break
    case "complete":
      playSuccessChord(audioContext)
      break
    case "levelup":
      playLevelUpSound(audioContext)
      break
    case "achievement":
      playAchievementSound(audioContext)
      break
  }
}

function playTone(context: AudioContext, frequency: number, duration: number, volume: number) {
  const osc = context.createOscillator()
  const gain = context.createGain()

  osc.connect(gain)
  gain.connect(context.destination)

  osc.frequency.value = frequency
  gain.gain.setValueAtTime(volume, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration)

  osc.start(context.currentTime)
  osc.stop(context.currentTime + duration)
}

function playSuccessChord(context: AudioContext) {
  const now = context.currentTime
  ;[523, 659, 784].forEach((freq, i) => {
    const osc = context.createOscillator()
    const gain = context.createGain()

    osc.connect(gain)
    gain.connect(context.destination)

    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3)

    osc.start(now + i * 0.05)
    osc.stop(now + i * 0.05 + 0.3)
  })
}

function playLevelUpSound(context: AudioContext) {
  const now = context.currentTime
  ;[392, 494, 587, 784].forEach((freq, i) => {
    const osc = context.createOscillator()
    const gain = context.createGain()

    osc.connect(gain)
    gain.connect(context.destination)

    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.2, now + i * 0.08)
    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.2)

    osc.start(now + i * 0.08)
    osc.stop(now + i * 0.08 + 0.2)
  })
}

function playAchievementSound(context: AudioContext) {
  const now = context.currentTime
  ;[392, 440, 494, 587, 659].forEach((freq, i) => {
    const osc = context.createOscillator()
    const gain = context.createGain()

    osc.connect(gain)
    gain.connect(context.destination)

    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.2, now + i * 0.06)
    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.15)

    osc.start(now + i * 0.06)
    osc.stop(now + i * 0.06 + 0.15)
  })
}

export function showNotification(title: string, options?: NotificationOptions) {
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "granted") {
      new Notification(title, options)
    }
  }
}

export function requestNotificationPermission() {
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "default") {
      Notification.requestPermission()
    }
  }
}
