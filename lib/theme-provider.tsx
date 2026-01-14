"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system")
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("theme") as Theme | null
    if (stored) {
      setThemeState(stored)
    }

    const updateDarkMode = () => {
      const dark =
        stored === "dark" || (stored === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
      setIsDark(dark)
      document.documentElement.classList.toggle("dark", dark)
    }

    updateDarkMode()
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", updateDarkMode)
    return () => {
      window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", updateDarkMode)
    }
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem("theme", newTheme)

    const dark =
      newTheme === "dark" || (newTheme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    setIsDark(dark)
    document.documentElement.classList.toggle("dark", dark)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}
