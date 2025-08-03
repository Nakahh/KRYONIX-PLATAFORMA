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
        
        {/* Modern Semicircle Animation */}
        <div className="relative w-40 h-40 mb-8">
          {/* Logo Container - Full Size */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-32 h-32 rounded-full bg-white shadow-2xl flex items-center justify-center backdrop-blur-sm border border-white/10 overflow-hidden">
              <Image
                src="/logo-kryonix.png"
                alt="KRYONIX"
                width={120}
                height={120}
                className="rounded-lg"
                priority
              />

              {/* Logo inner glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/10 to-green-400/10 animate-pulse"></div>

              {/* Subtle inner shadow */}
              <div className="absolute inset-0 rounded-full shadow-inner"></div>
            </div>
          </div>

          {/* Animated Semicircle Spinner */}
          <div className="absolute inset-0 animate-spin-elegant">
            <div className="relative w-full h-full">
              {/* Top semicircle */}
              <div className="absolute top-0 left-0 w-full h-1/2 overflow-hidden">
                <div className="w-full h-full border-4 border-transparent border-t-blue-500 rounded-full animate-pulse-glow"></div>
              </div>
            </div>
          </div>

          {/* Second Semicircle - Opposite */}
          <div className="absolute inset-0 animate-spin-elegant-reverse">
            <div className="relative w-full h-full">
              {/* Bottom semicircle */}
              <div className="absolute bottom-0 left-0 w-full h-1/2 overflow-hidden rotate-180">
                <div className="w-full h-full border-4 border-transparent border-t-green-500 rounded-full animate-pulse-glow"></div>
              </div>
            </div>
          </div>

          {/* Floating gradient orbs */}
          <div className="absolute inset-0 animate-spin-slow">
            <div className="relative w-full h-full">
              <div className="absolute -top-1 left-1/2 w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transform -translate-x-1/2 animate-bounce shadow-lg"></div>
              <div className="absolute -bottom-1 left-1/2 w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full transform -translate-x-1/2 animate-bounce shadow-lg" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>

          {/* Outer glow ring */}
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20 animate-pulse blur-xl"></div>
        </div>

        {/* Brand Text */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent mb-3">
            KRYONIX
          </h1>
          <p className="text-gray-600 text-base font-medium tracking-wide">
            Plataforma SaaS 100% Autônoma por IA
          </p>
          <div className="flex items-center justify-center mt-3 space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-96 mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-3 font-medium">
            <span>Carregando sistema...</span>
            <span className="tabular-nums">{progress}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
              {/* Progress glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-green-400/20 blur-sm"></div>
            </div>
          </div>
        </div>

        {/* Loading Steps */}
        <div className="text-center text-sm text-gray-600 min-h-[24px] font-medium">
          {progress < 20 && "🚀 Inicializando sistemas..."}
          {progress >= 20 && progress < 40 && "🤖 Carregando módulos IA..."}
          {progress >= 40 && progress < 60 && "🗄️ Conectando bases de dados..."}
          {progress >= 60 && progress < 80 && "🔒 Verificando segurança..."}
          {progress >= 80 && progress < 95 && "⚙️ Finalizando configurações..."}
          {progress >= 95 && "✨ Sistema pronto!"}
        </div>
      </div>

      {/* Modern corner decorations */}
      <div className="absolute top-6 left-6 w-12 h-12 border-l-3 border-t-3 border-blue-400/30 rounded-tl-2xl"></div>
      <div className="absolute top-6 right-6 w-12 h-12 border-r-3 border-t-3 border-green-400/30 rounded-tr-2xl"></div>
      <div className="absolute bottom-6 left-6 w-12 h-12 border-l-3 border-b-3 border-purple-400/30 rounded-bl-2xl"></div>
      <div className="absolute bottom-6 right-6 w-12 h-12 border-r-3 border-b-3 border-pink-400/30 rounded-br-2xl"></div>

      {/* Floating decorative elements */}
      <div className="absolute top-20 left-20 w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full opacity-20 animate-float"></div>
      <div className="absolute top-32 right-24 w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-25 animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-24 left-32 w-5 h-5 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full opacity-15 animate-float" style={{ animationDelay: '2s' }}></div>
    </div>
  )
}
