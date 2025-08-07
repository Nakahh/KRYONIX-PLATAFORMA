'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface LoadingScreenProps {
  onComplete?: () => void
  duration?: number
}

export default function LoadingScreen({ onComplete, duration = 1000 }: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onComplete?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* Main Container */}
      <div className="relative flex flex-col items-center justify-center">
        
        {/* Logo with Circular Loading */}
        <div className="relative mb-8">
          {/* Logo Container */}
          <div className="relative w-48 h-48 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full bg-white dark:bg-gray-800 shadow-2xl flex items-center justify-center relative overflow-hidden">
              <Image
                src="/logo-kryonix.png"
                alt="KRYONIX"
                width={160}
                height={160}
                className="rounded-lg"
                priority
              />
              
              {/* Subtle inner glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/5 to-green-400/5"></div>
            </div>
          </div>
          
          {/* Circular Progress Ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 relative">
              {/* Background circle */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="rgba(229, 231, 235, 0.3)" className="dark:stroke-gray-600"
                  strokeWidth="2"
                  fill="none"
                />
                {/* Animated progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset="283"
                  className="animate-circle-progress"
                />
                
                {/* Gradient definition */}
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="50%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          

        </div>

        {/* Brand Text */}
        <div className="text-center">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
            KRYONIX
          </h1>
        </div>
      </div>
    </div>
  )
}
