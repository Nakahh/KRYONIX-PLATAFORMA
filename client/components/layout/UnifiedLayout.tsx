import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  MessageSquare,
  Plus,
  BarChart3,
  User,
  ArrowLeft,
  Menu as MenuIcon,
  Bell,
  Search,
  Settings,
  Layers,
  Bot,
  Building,
  CreditCard,
  Zap,
  X,
} from "lucide-react";
import { useMobileAdvanced } from "../../hooks/use-mobile-advanced";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { KryonixLogo } from "../brand/KryonixLogo";

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  mobile: boolean;
  notifications?: number;
  isFloating?: boolean;
  color?: string;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  // Navegação principal (aparece em mobile)
  {
    id: "dashboard",
    label: "Início",
    href: "/dashboard",
    icon: Home,
    mobile: true,
    color: "text-blue-600",
  },
  {
    id: "communication",
    label: "WhatsApp",
    href: "/communication",
    icon: MessageSquare,
    mobile: true,
    notifications: 3,
    color: "text-green-600",
  },
  {
    id: "quick-actions",
    label: "",
    href: "/quick-actions",
    icon: Plus,
    mobile: true,
    isFloating: true,
    color: "text-white",
  },
  {
    id: "analytics",
    label: "Métricas",
    href: "/analytics",
    icon: BarChart3,
    mobile: true,
    color: "text-purple-600",
  },
  {
    id: "settings",
    label: "Perfil",
    href: "/settings",
    icon: User,
    mobile: true,
    color: "text-gray-600",
  },

  // Navegação secundária (apenas desktop/tablet)
  {
    id: "stacks",
    label: "Stacks",
    href: "/stacks",
    icon: Layers,
    mobile: false,
    color: "text-indigo-600",
  },
  {
    id: "ai",
    label: "IA Autônoma",
    href: "/ai/autonomous",
    icon: Bot,
    mobile: false,
    color: "text-orange-600",
  },
  {
    id: "billing",
    label: "Cobrança",
    href: "/billing",
    icon: CreditCard,
    mobile: false,
    color: "text-emerald-600",
  },
  {
    id: "automation",
    label: "Automação",
    href: "/automation",
    icon: Zap,
    mobile: false,
    color: "text-yellow-600",
  },
  {
    id: "enterprise",
    label: "Enterprise",
    href: "/enterprise",
    icon: Building,
    mobile: false,
    color: "text-gray-700",
  },
];

interface UnifiedLayoutProps {
  children?: React.ReactNode;
}

export function UnifiedLayout({ children }: UnifiedLayoutProps) {
  const { isMobile, isTablet, screenSize } = useMobileAdvanced();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState(5);

  // Detectar página atual para highlights
  const currentPath = location.pathname;
  const currentItem = NAVIGATION_ITEMS.find(
    (item) => currentPath.startsWith(item.href) || currentPath === item.href,
  );

  // Navegação mobile sempre visível
  const mobileNavItems = NAVIGATION_ITEMS.filter((item) => item.mobile);

  // Navegação desktop inclui todos os itens
  const desktopNavItems = NAVIGATION_ITEMS;

  // Breadcrumb brasileiro
  const getBreadcrumb = (path: string) => {
    const breadcrumbs = {
      "/dashboard": "Painel Principal",
      "/communication": "Central WhatsApp",
      "/analytics": "Métricas & Relatórios",
      "/settings": "Configurações",
      "/stacks": "Gerenciar Stacks",
      "/ai/autonomous": "IA Autônoma",
      "/billing": "Cobrança & PIX",
      "/automation": "Automações N8N",
      "/enterprise": "Recursos Enterprise",
    };
    return breadcrumbs[path] || "KRYONIX";
  };

  const handleNavigation = (item: NavigationItem) => {
    if (item.id === "quick-actions") {
      // Abrir modal de ações rápidas ao invés de navegar
      setSearchOpen(true);
      return;
    }

    navigate(item.href);

    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              {currentPath !== "/dashboard" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="p-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <div>
                <h1 className="font-bold text-lg text-gray-900">
                  {getBreadcrumb(currentPath)}
                </h1>
                {currentPath !== "/dashboard" && (
                  <p className="text-xs text-gray-500">KRYONIX Automação</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchOpen(true)}
                className="p-2"
              >
                <Search className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="sm" className="p-2 relative">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500">
                    {notifications}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Content */}
        <main className="pb-20">{children || <Outlet />}</main>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="flex items-center justify-around py-2">
            {mobileNavItems.map((item) => {
              const isActive =
                currentPath.startsWith(item.href) || currentPath === item.href;
              const Icon = item.icon;

              if (item.isFloating) {
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleNavigation(item)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center justify-center p-3 -mt-6"
                  >
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-3 shadow-lg">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </motion.button>
                );
              }

              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center justify-center p-3 relative"
                >
                  <div
                    className={`relative ${isActive ? item.color : "text-gray-400"}`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.notifications && (
                      <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs bg-red-500">
                        {item.notifications}
                      </Badge>
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1 ${isActive ? "text-gray-900 font-medium" : "text-gray-400"}`}
                  >
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Search Modal */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20"
              onClick={() => setSearchOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg m-4 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Ações Rápidas</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchOpen(false)}
                      className="p-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Input
                      placeholder="Buscar páginas, stacks, configurações..."
                      className="w-full"
                    />

                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {[
                        {
                          label: "Configurar WhatsApp",
                          icon: MessageSquare,
                          color: "bg-green-100 text-green-700",
                        },
                        {
                          label: "Ver Métricas",
                          icon: BarChart3,
                          color: "bg-blue-100 text-blue-700",
                        },
                        {
                          label: "Criar Automação",
                          icon: Zap,
                          color: "bg-purple-100 text-purple-700",
                        },
                        {
                          label: "Configurar IA",
                          icon: Bot,
                          color: "bg-orange-100 text-orange-700",
                        },
                      ].map((action, index) => {
                        const Icon = action.icon;
                        return (
                          <button
                            key={index}
                            className={`p-3 rounded-lg ${action.color} text-left flex items-center gap-2`}
                            onClick={() => {
                              setSearchOpen(false);
                              // Navegação específica baseada na ação
                            }}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {action.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Desktop/Tablet Layout
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <KryonixLogo className="h-8 w-8" />
            <div>
              <h2 className="font-bold text-xl text-gray-900">KRYONIX</h2>
              <p className="text-xs text-gray-500">Automação Brasileira</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1">
          {desktopNavItems
            .filter((item) => !item.isFloating)
            .map((item) => {
              const isActive =
                currentPath.startsWith(item.href) || currentPath === item.href;
              const Icon = item.icon;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                    {item.notifications && (
                      <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs bg-red-500">
                        {item.notifications}
                      </Badge>
                    )}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              );
            })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback>VF</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">
                Vitor Fernandes
              </p>
              <p className="text-xs text-gray-500">Admin KRYONIX</p>
            </div>
            <Button variant="ghost" size="sm" className="p-2">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Desktop Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getBreadcrumb(currentPath)}
              </h1>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString("pt-BR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Input placeholder="Buscar..." className="w-64 pr-10" />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500">
                    {notifications}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Desktop Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

export default UnifiedLayout;
