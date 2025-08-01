'use client'

import { useState } from 'react'
import { 
  Menu, 
  X, 
  Home, 
  BarChart3, 
  MessageCircle, 
  Settings, 
  Users, 
  Shield,
  Bot,
  Sparkles
} from 'lucide-react'

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { icon: Home, label: 'Início', href: '/', active: true },
    { icon: BarChart3, label: 'Progresso', href: '/progresso' },
    { icon: MessageCircle, label: 'WhatsApp', href: '/whatsapp' },
    { icon: Users, label: 'Clientes', href: '/clientes' },
    { icon: Bot, label: 'Agentes IA', href: '/agentes' },
    { icon: Shield, label: 'Segurança', href: '/seguranca' },
    { icon: Settings, label: 'Configurações', href: '/configuracoes' }
  ]

  return (
    <>
      {/* Menu Button - Visible only on mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-50 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-gray-600" />
        ) : (
          <Menu className="w-6 h-6 text-gray-600" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div className={`
        fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-40 
        transform transition-transform duration-300 ease-in-out md:hidden
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-8 pt-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-success-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold gradient-text">KRYONIX</h2>
              <p className="text-xs text-gray-600">Plataforma SaaS IA</p>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="space-y-2">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200
                  ${item.active 
                    ? 'bg-primary-100 text-primary-700 border-l-4 border-primary-500' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </a>
            ))}
          </nav>

          {/* Footer */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="status-online"></div>
                <span>Sistema Online</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                © 2025 KRYONIX
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
