"use client"

import * as React from "react"

type BaseTheme =
  | "default"
  | "ocean"
  | "sunset"
  | "forest"
  | "midnight"
  | "aurora"
  | "desert"
  | "lavender"
  | "crimson"
  | "sapphire"
  | "jade"
  | "premium"
  | "royal"
  | "neon"
  | "emerald"
  | "cosmic"
  | "halloween"
  | "christmas"
  | "obsidian"
  | "aurora-borealis"
  | "volcanic"
  | "cyberpunk"

type ThemeMode = "light" | "dark"

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: BaseTheme
  defaultMode?: ThemeMode
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

interface ThemeProviderState {
  theme: BaseTheme
  mode: ThemeMode
  setTheme: (theme: BaseTheme) => void
  setMode: (mode: ThemeMode) => void
}

const initialState: ThemeProviderState = {
  theme: "default",
  mode: "dark",
  setTheme: () => null,
  setMode: () => null,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "ocean",
  defaultMode = "dark",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<BaseTheme>(defaultTheme)
  const [mode, setMode] = React.useState<ThemeMode>(defaultMode)

  React.useEffect(() => {
    const savedTheme = localStorage.getItem("wavewatch_theme") as BaseTheme
    const savedMode = localStorage.getItem("wavewatch_mode") as ThemeMode

    if (savedTheme) {
      setTheme(savedTheme)
    }
    if (savedMode) {
      setMode(savedMode)
    }
  }, [])

  React.useEffect(() => {
    const root = window.document.documentElement

    // Remove all theme classes
    root.classList.remove(
      // Light themes
      "light-default",
      "light-ocean",
      "light-sunset",
      "light-forest",
      "light-midnight",
      "light-aurora",
      "light-desert",
      "light-lavender",
      "light-crimson",
      "light-sapphire",
      "light-jade",
      "light-premium",
      "light-royal",
      "light-neon",
      "light-emerald",
      "light-cosmic",
      "light-christmas",
      "light-halloween",
      "light-obsidian",
      "light-aurora-borealis",
      "light-volcanic",
      "light-cyberpunk",
      // Dark themes
      "dark-default",
      "dark-ocean",
      "dark-sunset",
      "dark-forest",
      "dark-midnight",
      "dark-aurora",
      "dark-desert",
      "dark-lavender",
      "dark-crimson",
      "dark-sapphire",
      "dark-jade",
      "dark-premium",
      "dark-royal",
      "dark-neon",
      "dark-emerald",
      "dark-cosmic",
      "dark-christmas",
      "dark-halloween",
      "dark-obsidian",
      "dark-aurora-borealis",
      "dark-volcanic",
      "dark-cyberpunk",
    )

    // Apply new theme class
    const themeClass = `${mode}-${theme}`
    root.classList.add(themeClass)

    localStorage.setItem("wavewatch_theme", theme)
    localStorage.setItem("wavewatch_mode", mode)
  }, [theme, mode])

  const value = {
    theme,
    mode,
    setTheme: (theme: BaseTheme) => {
      setTheme(theme)
    },
    setMode: (mode: ThemeMode) => {
      setMode(mode)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
