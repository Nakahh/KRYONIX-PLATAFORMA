'use client'

import Link from 'next/link'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import SimpleLanguageSwitcher from './SimpleLanguageSwitcher'
import { ArrowLeft, Home } from 'lucide-react'

interface PageHeaderProps {
  title?: string
  subtitle?: string
  showBackButton?: boolean
  backHref?: string
  showHomeButton?: boolean
  className?: string
}

export default function PageHeader({
  title,
  subtitle,
  showBackButton = false,
  backHref = '/',
  showHomeButton = false,
  className = ''
}: PageHeaderProps) {
  return (
    <header className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Link 
                href={backHref} 
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Voltar</span>
              </Link>
            )}
            
            {showHomeButton && (
              <Link 
                href="/" 
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">Início</span>
              </Link>
            )}
            
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Logo />
            </Link>
            
            {(title || subtitle) && (
              <div className="text-left hidden md:block">
                {title && (
                  <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h1>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
                )}
              </div>
            )}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Status indicator */}
            <div className="hidden sm:flex items-center space-x-2">
              <div className="inline-flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Sistema Online</span>
            </div>
            
            {/* Language switcher */}
            <SimpleLanguageSwitcher className="" variant="dropdown" />
            
            {/* Theme toggle */}
            <ThemeToggle />
          </div>
        </div>
        
        {/* Mobile title */}
        {(title || subtitle) && (
          <div className="mt-3 md:hidden">
            {title && (
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h1>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
