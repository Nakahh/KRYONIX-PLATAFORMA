'use client'

import { useEffect, useState } from 'react'
import { Eye, TrendingUp } from 'lucide-react'

interface ViewCounterProps {
  pageId: string
  className?: string
  showIcon?: boolean
  animated?: boolean
}

export default function ViewCounter({
  pageId,
  className = '',
  showIcon = true,
  animated = true
}: ViewCounterProps) {
  const [count, setCount] = useState(0)
  const [hasViewed, setHasViewed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setIsLoading(true)

    // Simulate loading and view counting
    setTimeout(() => {
      const savedCount = localStorage.getItem(`view-count-${pageId}`) || '0'
      const currentCount = parseInt(savedCount) + 1
      setCount(currentCount)
      setHasViewed(true)
      setIsLoading(false)
      localStorage.setItem(`view-count-${pageId}`, currentCount.toString())
    }, 500)
  }, [pageId])

  if (!isClient || isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showIcon && <Eye className="w-4 h-4 text-gray-400 animate-pulse" />}
        <span className="text-gray-400 animate-pulse">Carregando...</span>
      </div>
    )
  }

  return (
    <div
      className={`flex items-center gap-2 transition-all duration-300 ${
        hasViewed && animated ? 'animate-pulse' : ''
      } ${className}`}
    >
      {showIcon && (
        <Eye
          className={`w-4 h-4 transition-colors duration-300 ${
            hasViewed ? 'text-green-500' : 'text-gray-500'
          }`}
        />
      )}
      <span
        className={`font-medium transition-colors duration-300 ${
          hasViewed ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
        }`}
      >
        {count.toLocaleString('pt-BR')} visualizaçõ{count !== 1 ? 'es' : 'ão'}
      </span>
      {hasViewed && (
        <TrendingUp className="w-3 h-3 text-green-500 animate-pulse" />
      )}
    </div>
  )
}
