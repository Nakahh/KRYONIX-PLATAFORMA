import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  BarChart3,
  MessageCircle,
  Settings
} from 'lucide-react';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Não mostrar navegação se não estiver autenticado
  if (!isAuthenticated) {
    return null;
  }

  // Não mostrar em certas páginas
  const hiddenRoutes = ['/login', '/register', '/'];
  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  const navItems = [
    {
      id: 'dashboard',
      label: 'Início',
      icon: Home,
      path: '/dashboard',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      path: '/analytics',
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageCircle,
      path: '/whatsapp',
    },
    {
      id: 'settings',
      label: 'Configs',
      icon: Settings,
      path: '/settings',
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 safe-area-bottom z-50">
      <div className="flex justify-around items-center py-2 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 min-w-0 flex-1 touch-manipulation ${
                active
                  ? 'text-kryonix-600 bg-kryonix-50 dark:bg-kryonix-900/20'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              aria-label={item.label}
            >
              <Icon 
                size={20} 
                className={`mb-1 ${active ? 'scale-110' : ''} transition-transform duration-200`}
              />
              <span className={`text-xs font-medium truncate ${active ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
              
              {/* Indicador ativo */}
              {active && (
                <div className="absolute -top-1 w-1 h-1 bg-kryonix-600 rounded-full animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Indicador de conexão */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-8 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
    </nav>
  );
};

export default BottomNavigation;
