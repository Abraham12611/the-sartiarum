"use client"

import { useEffect, useState } from "react"

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"

// --- Icons ---
import { SunIcon } from "@/components/tiptap-icons/sun-icon"
import { MoonStarIcon } from "@/components/tiptap-icons/moon-star-icon"

export function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)

  useEffect(() => {
    // Neo mode should always start in light theme by default.
    setIsDarkMode(false)
    document.documentElement.classList.remove("dark")
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode)
  }, [isDarkMode])

  const toggleDarkMode = () => setIsDarkMode((isDark) => !isDark)

  return (
    <Button
      onClick={toggleDarkMode}
      aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
      variant="ghost"
    >
      {isDarkMode ? (
        <MoonStarIcon className="tiptap-button-icon" />
      ) : (
        <SunIcon className="tiptap-button-icon" />
      )}
    </Button>
  )
}
