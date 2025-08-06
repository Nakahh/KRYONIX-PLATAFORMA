'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    setMounted(true)

    if (typeof window === 'undefined') return

    // Check initial theme using same key as theme context
    const savedTheme = localStorage.getItem('kryonix-theme')
    let isDark = false

    if (savedTheme === 'dark') {
      isDark = true
    } else if (savedTheme === 'system' || !savedTheme) {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    setDarkMode(isDark)

    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    if (typeof window === 'undefined') return

    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)

    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('kryonix-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('kryonix-theme', 'light')
    }
  }

  if (!mounted) {
    return (
      <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
        <div className="w-5 h-5" />
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
      title={darkMode ? 'Modo claro' : 'Modo escuro'}
    >
      {darkMode ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-gray-700" />
      )}
    </button>
  )
}
