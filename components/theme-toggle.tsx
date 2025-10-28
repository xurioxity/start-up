"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-16 h-8 bg-muted rounded-full p-1">
        <div className="w-6 h-6 bg-background rounded-full shadow-sm flex items-center justify-center">
          <Sun className="h-3 w-3" />
        </div>
      </div>
    )
  }

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`
        relative w-16 h-8 rounded-full p-1 transition-all duration-300 ease-in-out
        ${isDark ? 'bg-slate-700' : 'bg-blue-200'}
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        hover:scale-105 active:scale-95
      `}
      aria-label="Toggle theme"
    >
      {/* Sliding toggle background */}
      <div
        className={`
          absolute top-1 w-6 h-6 rounded-full shadow-lg transition-all duration-300 ease-in-out
          ${isDark 
            ? 'bg-slate-900 translate-x-8' 
            : 'bg-white translate-x-0'
          }
          flex items-center justify-center
        `}
      >
        {isDark ? (
          <Moon className="h-3 w-3 text-slate-300" />
        ) : (
          <Sun className="h-3 w-3 text-yellow-500" />
        )}
      </div>
      
      {/* Background icons */}
      <div className="absolute inset-1 flex items-center justify-between px-1">
        <Sun className={`h-3 w-3 transition-opacity duration-300 ${isDark ? 'opacity-30' : 'opacity-100'}`} />
        <Moon className={`h-3 w-3 transition-opacity duration-300 ${isDark ? 'opacity-100' : 'opacity-30'}`} />
      </div>
    </button>
  )
}
