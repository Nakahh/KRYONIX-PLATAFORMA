import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  Home,
  BarChart3,
  Zap,
  Settings,
  Menu,
  X,
  Search,
  Bell,
  User,
  ChevronRight,
  Wifi,
  Battery,
  Signal,
  ArrowLeft,
  MoreVertical,
  Sparkles,
  Flame,
  TrendingUp,
} from "lucide-react";
import { useMobileAdvanced } from "../../hooks/use-mobile-advanced";
import { useNativeGestures } from "../../hooks/use-native-gestures";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface PremiumMobileShellProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function PremiumMobileShell({
  children,
  currentPage,
  onNavigate,
}: PremiumMobileShellProps) {
  const { isMobile, screenSize, orientation, safeArea } = useMobileAdvanced();
  const {
    swipeHandlers,
    longPressHandlers,
    hapticFeedback,
    pullToRefreshState,
    handlePullToRefresh,
  } = useNativeGestures();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Atualizar horário
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Navegação principal mobile-first
  const primaryNavigation = [
    {
      id: "dashboard",
      label: "Início",
      icon: Home,
      color: "text-blue-600",
      gradient: "from-blue-500 to-cyan-500",
      active: currentPage === "dashboard",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      color: "text-purple-600",
      gradient: "from-purple-500 to-pink-500",
      active: currentPage === "analytics",
      badge: "Nova",
    },
    {
      id: "automation",
      label: "Automação",
      icon: Zap,
      color: "text-orange-600",
      gradient: "from-orange-500 to-red-500",
      active: currentPage === "automation",
    },
    {
      id: "settings",
      label: "Config",
      icon: Settings,
      color: "text-gray-600",
      gradient: "from-gray-500 to-gray-600",
      active: currentPage === "settings",
    },
  ];

  // Navegação secundária (drawer)
  const secondaryNavigation = [
    { id: "whatsapp", label: "WhatsApp Business", icon: "📱", premium: true },
    { id: "workflows", label: "Workflows N8N", icon: "🔄", premium: true },
    { id: "chatbots", label: "Chatbots IA", icon: "🤖", premium: true },
    { id: "marketing", label: "Email Marketing", icon: "📧", premium: false },
    { id: "payments", label: "PIX & Pagamentos", icon: "💳", premium: true },
    { id: "team", label: "Equipe", icon: "👥", premium: false },
    { id: "integrations", label: "Integrações", icon: "🔗", premium: true },
    { id: "ai-assistant", label: "Assistente KIRA", icon: "🧠", premium: true },
  ];

  const handleNavigation = (pageId: string) => {
    hapticFeedback("light");
    onNavigate(pageId);
    setIsDrawerOpen(false);
  };

  const handleDrawerToggle = () => {
    hapticFeedback("medium");
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleSearch = () => {
    hapticFeedback("light");
    setIsSearchOpen(!isSearchOpen);
  };

  // Status bar simulado para preview
  const StatusBar = () => (
    <div className="flex items-center justify-between px-4 py-1 text-xs font-medium text-white bg-black">
      <div className="flex items-center space-x-1">
        <span>
          {currentTime.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <Signal className="w-3 h-3" />
        <Wifi className="w-3 h-3" />
        <div className="flex items-center space-x-1">
          <span>{batteryLevel}%</span>
          <Battery className="w-3 h-3" />
        </div>
      </div>
    </div>
  );

  // Header premium mobile
  const PremiumHeader = () => (
    <motion.header
      className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white overflow-hidden"
      style={{
        paddingTop: safeArea.top,
        backgroundImage:
          "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)",
      }}
    >
      {/* Glassmorphism effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent backdrop-blur-sm" />

      <div className="relative px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Menu button */}
          <motion.button
            onClick={handleDrawerToggle}
            className="p-2 rounded-xl bg-white/20 backdrop-blur-sm"
            whileTap={{ scale: 0.95 }}
            {...longPressHandlers}
          >
            <Menu className="w-5 h-5" />
          </motion.button>

          {/* Logo e status */}
          <div className="flex-1 text-center">
            <motion.div
              className="flex items-center justify-center space-x-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">KRYONIX</h1>
                <div className="flex items-center justify-center space-x-1 text-xs opacity-90">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>Sistema Ativo</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={handleSearch}
              className="p-2 rounded-xl bg-white/20 backdrop-blur-sm"
              whileTap={{ scale: 0.95 }}
            >
              <Search className="w-5 h-5" />
            </motion.button>

            <motion.button
              className="relative p-2 rounded-xl bg-white/20 backdrop-blur-sm"
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 w-5 h-5 text-xs rounded-full bg-red-500 border-2 border-white"
                >
                  {notifications}
                </Badge>
              )}
            </motion.button>
          </div>
        </div>

        {/* Search bar expandable */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar stacks, automações, relatórios..."
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  autoFocus
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-lg" />
    </motion.header>
  );

  // Bottom navigation premium
  const PremiumBottomNav = () => (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-gray-200/50"
      style={{ paddingBottom: safeArea.bottom }}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="px-2 py-2">
        <div className="flex items-center justify-around">
          {primaryNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`relative flex flex-col items-center justify-center p-3 rounded-2xl min-w-[60px] ${
                  item.active
                    ? "bg-gradient-to-t from-blue-500/20 to-blue-600/10"
                    : "hover:bg-gray-100/50"
                }`}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
              >
                {/* Active indicator */}
                {item.active && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Icon with gradient for active */}
                <div
                  className={`relative ${
                    item.active
                      ? `bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`
                      : item.color
                  }`}
                >
                  <Icon className="w-6 h-6" />

                  {/* Badge */}
                  {item.badge && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-xs mt-1 font-medium ${
                    item.active ? "text-blue-600" : "text-gray-600"
                  }`}
                >
                  {item.label}
                </span>

                {/* Active dot */}
                {item.active && (
                  <motion.div
                    className="absolute -bottom-1 w-1 h-1 bg-blue-500 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );

  // Drawer lateral premium
  const PremiumDrawer = () => (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-80 bg-white/95 backdrop-blur-xl"
            style={{ paddingTop: safeArea.top }}
          >
            {/* Drawer header */}
            <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Menu Principal</h2>
                <motion.button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-lg bg-white/20"
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* User info */}
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12 border-2 border-white/30">
                  <AvatarImage src="/avatar.jpg" />
                  <AvatarFallback className="bg-white/20 text-white">
                    VF
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">Vitor Fernandes</p>
                  <p className="text-sm opacity-90">Plano Premium ✨</p>
                </div>
              </div>
            </div>

            {/* Navigation items */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {secondaryNavigation.map((item, index) => (
                  <motion.button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{item.icon}</div>
                      <div className="text-left">
                        <p className="font-medium text-gray-800">
                          {item.label}
                        </p>
                        {item.premium && (
                          <div className="flex items-center space-x-1">
                            <Sparkles className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs text-yellow-600 font-medium">
                              Premium
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </motion.button>
                ))}
              </div>

              {/* Quick stats */}
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-3">
                  Status Rápido
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Sistema</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-green-600 font-medium">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">IA KIRA</span>
                    <div className="flex items-center space-x-1">
                      <Flame className="w-3 h-3 text-orange-500" />
                      <span className="text-orange-600 font-medium">Ativa</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Performance</span>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3 text-blue-500" />
                      <span className="text-blue-600 font-medium">
                        Excelente
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Pull to refresh
  const PullToRefreshIndicator = () => {
    if (pullToRefreshState.isRefreshing) {
      return (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-sm p-4 text-center"
        >
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-gray-600">
              Atualizando dados...
            </span>
          </div>
        </motion.div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Status bar simulado */}
      {isMobile && <StatusBar />}

      {/* Header */}
      <PremiumHeader />

      {/* Pull to refresh indicator */}
      <PullToRefreshIndicator />

      {/* Main content */}
      <motion.main
        className="relative"
        style={{
          paddingBottom: isMobile ? `${safeArea.bottom + 80}px` : "0",
          minHeight: `calc(100vh - ${safeArea.top + 140}px)`,
        }}
        {...swipeHandlers}
        onPan={(_, info: PanInfo) => {
          if (info.delta.y > 0 && info.velocity.y > 0) {
            handlePullToRefresh();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10"
        >
          {children}
        </motion.div>
      </motion.main>

      {/* Bottom navigation */}
      {isMobile && <PremiumBottomNav />}

      {/* Drawer */}
      <PremiumDrawer />

      {/* Background gradient */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-purple-50" />

      {/* Floating elements */}
      <div className="fixed top-1/4 right-0 w-32 h-32 bg-gradient-to-l from-blue-200/30 to-transparent rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-1/4 left-0 w-24 h-24 bg-gradient-to-r from-purple-200/30 to-transparent rounded-full blur-2xl -z-10" />
    </div>
  );
}

export default PremiumMobileShell;
