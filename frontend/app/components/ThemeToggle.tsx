'use client'

import { useTheme } from '@/lib/contexts/theme-context'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useState } from 'react'

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const themes = [
    { id: 'light', label: 'Claro', icon: Sun },
    { id: 'dark', label: 'Escuro', icon: Moon },
    { id: 'system', label: 'Sistema', icon: Monitor },
  ] as const

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-label="Alterar tema"
      >
        {theme === 'light' && <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
        {theme === 'dark' && <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
        {theme === 'system' && <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu dropdown */}
          <div className="absolute right-0 top-12 z-20 w-44 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon
              const isActive = theme === themeOption.id
              
              return (
                <button
                  key={themeOption.id}
                  onClick={() => {
                    setTheme(themeOption.id)
                    setIsOpen(false)
                  }}
                  className={`flex items-center w-full px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  <span className="flex-1 text-left">{themeOption.label}</span>
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-primary-500" />
                  )}
                </button>
              )
            })}
            
            {/* Separador */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
            
            {/* Indicador do tema atual resolvido */}
            <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
              Atual: {resolvedTheme === 'dark' ? '🌙 Escuro' : '☀️ Claro'}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
