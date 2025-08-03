'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface LoadingScreenProps {
  onComplete?: () => void
  duration?: number
}

export default function LoadingScreen({ onComplete, duration = 3000 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsVisible(false)
            onComplete?.()
          }, 500)
          return 100
        }
        return prev + 2
      })
    }, duration / 50)

    return () => clearInterval(interval)
  }, [duration, onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-green-400 rounded-full opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Main Loading Container */}
      <div className="relative flex flex-col items-center justify-center">
        
        {/* Rotating Gradient Ring */}
        <div className="relative w-32 h-32 mb-8">
          {/* Outer rotating gradient */}
          <div className="absolute inset-0 animate-spin-slow">
            <div className="w-full h-full rounded-full bg-gradient-conic from-blue-500 via-purple-500 via-green-500 via-yellow-500 to-blue-500 p-1">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-50 via-white to-green-50"></div>
            </div>
          </div>
          
          {/* Middle rotating gradient - opposite direction */}
          <div className="absolute inset-2 animate-spin-reverse">
            <div className="w-full h-full rounded-full bg-gradient-conic from-green-400 via-blue-400 via-purple-400 via-pink-400 to-green-400 p-1">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-50 via-white to-green-50"></div>
            </div>
          </div>
          
          {/* Inner pulsing gradient */}
          <div className="absolute inset-4 animate-pulse">
            <div className="w-full h-full rounded-full bg-gradient-radial from-blue-200 via-transparent to-green-200"></div>
          </div>
          
          {/* Logo Container */}
          <div className="absolute inset-6 flex items-center justify-center">
            <div className="relative w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Image
                src="/logo-kryonix.png"
                alt="KRYONIX"
                width={40}
                height={40}
                className="rounded-lg"
                priority
              />
              
              {/* Logo glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-green-400/20 animate-pulse"></div>
            </div>
          </div>
          
          {/* Orbiting dots */}
          <div className="absolute inset-0 animate-spin-slow">
            <div className="relative w-full h-full">
              <div className="absolute top-0 left-1/2 w-2 h-2 bg-blue-500 rounded-full transform -translate-x-1/2 animate-pulse"></div>
              <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-green-500 rounded-full transform -translate-x-1/2 animate-pulse"></div>
              <div className="absolute left-0 top-1/2 w-2 h-2 bg-purple-500 rounded-full transform -translate-y-1/2 animate-pulse"></div>
              <div className="absolute right-0 top-1/2 w-2 h-2 bg-pink-500 rounded-full transform -translate-y-1/2 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Brand Text */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent animate-pulse mb-2">
            KRYONIX
          </h1>
          <p className="text-gray-600 text-sm font-medium">
            Plataforma SaaS 100% Autônoma por IA
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-80 mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Carregando sistema...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
        </div>

        {/* Loading Steps */}
        <div className="text-center text-xs text-gray-500 min-h-[20px]">
          {progress < 20 && "Inicializando sistemas..."}
          {progress >= 20 && progress < 40 && "Carregando módulos IA..."}
          {progress >= 40 && progress < 60 && "Conectando bases de dados..."}
          {progress >= 60 && progress < 80 && "Verificando segurança..."}
          {progress >= 80 && progress < 95 && "Finalizando configurações..."}
          {progress >= 95 && "Sistema pronto!"}
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-blue-300 rounded-tl-lg"></div>
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-green-300 rounded-tr-lg"></div>
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-purple-300 rounded-bl-lg"></div>
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-pink-300 rounded-br-lg"></div>
    </div>
  )
}
