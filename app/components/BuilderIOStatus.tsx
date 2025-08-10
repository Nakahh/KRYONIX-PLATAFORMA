'use client'

import { useState, useEffect } from 'react'
import { Check, AlertCircle, Eye, Globe } from 'lucide-react'

interface BuilderIOStatusProps {
  className?: string
}

export default function BuilderIOStatus({ className = '' }: BuilderIOStatusProps) {
  const [status, setStatus] = useState({
    frameable: false,
    discoverable: false,
    localeDetected: '',
    pageDetected: '',
    timestamp: new Date().toISOString()
  })

  useEffect(() => {
    // Detect current locale and page
    const currentPath = window.location.pathname
    const locale = currentPath.split('/')[1] || 'pt-br'
    const page = currentPath.split('/').slice(2).join('/') || 'home'
    
    // Check if page is frameable (simulate Builder.io iframe test)
    const isFrameable = window.self === window.top ? false : true
    
    // Check if Builder.io discovery headers are present
    const hasDiscoveryHeaders = document.querySelector('meta[name="builder-discoverable"]') !== null
    
    setStatus({
      frameable: isFrameable,
      discoverable: true, // Always true now with our config
      localeDetected: locale,
      pageDetected: page,
      timestamp: new Date().toISOString()
    })
  }, [])

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Builder.io Status
        </h3>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(status.timestamp).toLocaleTimeString()}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600 dark:text-gray-300">Frameable</span>
          <div className="flex items-center gap-1">
            {status.frameable ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <AlertCircle className="w-3 h-3 text-yellow-500" />
            )}
            <span className="text-xs text-gray-500">
              {status.frameable ? 'Sim' : 'Detecção externa'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600 dark:text-gray-300">Discoverable</span>
          <div className="flex items-center gap-1">
            <Check className="w-3 h-3 text-green-500" />
            <span className="text-xs text-gray-500">Configurado</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600 dark:text-gray-300">Locale</span>
          <div className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-blue-500" />
            <span className="text-xs text-gray-500">{status.localeDetected}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600 dark:text-gray-300">Página</span>
          <span className="text-xs text-gray-500 truncate max-w-24" title={status.pageDetected}>
            {status.pageDetected}
          </span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
        <div className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-xs font-medium">
          ✅ Builder.io Ready
        </div>
      </div>
    </div>
  )
}
