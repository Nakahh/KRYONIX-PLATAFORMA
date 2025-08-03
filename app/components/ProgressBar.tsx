'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Clock, Sparkles } from 'lucide-react'

interface ProgressBarProps {
  className?: string
  showDetails?: boolean
  compact?: boolean
}

export default function ProgressBar({ className = '', showDetails = true, compact = false }: ProgressBarProps) {
  const [mounted, setMounted] = useState(false)
  const [animatedProgress, setAnimatedProgress] = useState(0)

  // Dados do progresso atual
  const totalParts = 53
  const completedParts = 2
  const inProgressParts = 1
  const currentPart = completedParts + inProgressParts
  const progressPercentage = (currentPart / totalParts) * 100

  useEffect(() => {
    setMounted(true)
    // Animar a barra de progresso
    const timer = setTimeout(() => {
      setAnimatedProgress(progressPercentage)
    }, 500)
    return () => clearTimeout(timer)
  }, [progressPercentage])

  if (!mounted) return null

  const getCurrentPartName = () => {
    if (currentPart <= 2) return "Base de Dados PostgreSQL"
    if (currentPart === 3) return "Storage MinIO"
    return "Sistema de Cache Redis"
  }

  const getPhase = () => {
    if (currentPart <= 10) return "FASE 1: FUNDAÇÃO"
    if (currentPart <= 25) return "FASE 2: INTERFACE & CORE"
    if (currentPart <= 35) return "FASE 3: INTELIGÊNCIA ARTIFICIAL"
    if (currentPart <= 45) return "FASE 4: COMUNICAÇÃO"
    return "FASE 5: MÓDULOS ESPECIALIZADOS"
  }

  if (compact) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${animatedProgress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {completedParts + inProgressParts}/{totalParts}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Progresso do Desenvolvimento</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Acompanhe em tempo real</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            {Math.round(animatedProgress)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-300">Concluído</div>
        </div>
      </div>

      {/* Current Phase */}
      <div className="mb-6">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-medium mb-2">
          <Clock className="w-4 h-4 mr-1" />
          {getPhase()}
        </div>
        <div className="text-gray-900 dark:text-gray-100 font-semibold">
          Parte {currentPart}: {getCurrentPartName()}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
          <span>Parte {currentPart} de {totalParts}</span>
          <span>{completedParts} concluídas • {inProgressParts} em andamento</span>
        </div>
        
        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative">
          {/* Background segments */}
          <div className="absolute inset-0 flex">
            {[...Array(totalParts)].map((_, i) => (
              <div key={i} className="flex-1 border-r border-gray-200 dark:border-gray-600 last:border-r-0"></div>
            ))}
          </div>
          
          {/* Progress fill */}
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full transition-all duration-1000 ease-out relative"
            style={{ width: `${animatedProgress}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            
            {/* Pulse at the end */}
            <div className="absolute right-0 top-0 h-full w-2 bg-white rounded-full animate-pulse opacity-80"></div>
          </div>
        </div>
      </div>

      {showDetails && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">{completedParts}</div>
              <div className="text-xs text-green-700 dark:text-green-200">Concluídas</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{inProgressParts}</div>
              <div className="text-xs text-blue-700 dark:text-blue-200">Em Andamento</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <div className="w-5 h-5 rounded-full bg-gray-400"></div>
              </div>
              <div className="text-xl font-bold text-gray-600 dark:text-gray-300">{totalParts - currentPart}</div>
              <div className="text-xs text-gray-700 dark:text-gray-400">Pendentes</div>
            </div>
          </div>

          {/* Next Milestone */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">{currentPart + 1}</span>
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Próxima: Cache Redis</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Sistema de cache distribuído para performance</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
