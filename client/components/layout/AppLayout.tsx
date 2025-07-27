import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Settings,
  CreditCard,
  Bell,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  Home,
  Cog,
  MessageSquare,
  Zap
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useUser, useLogout, useNotifications } from '../../hooks/use-api';
import { useMobileAdvanced } from '../../hooks/use-mobile-advanced';
import { Skeleton } from '../ui/skeleton';
import MobileLayout from '../mobile/MobileLayout';

interface AppLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
  },
  {
    name: 'Configurações',
    href: '/settings',
    icon: Settings,
  },
  {
    name: 'Cobrança',
    href: '/billing',
    icon: CreditCard,
  },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { data: user, isLoading: userLoading } = useUser();
  const { data: notificationsData } = useNotifications({ status: 'pending' });
  const logoutMutation = useLogout();
  const { isMobile, isTablet } = useMobileAdvanced();

  const unreadCount = notificationsData?.notifications.length || 0;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isActiveRoute = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  // Use mobile layout for mobile and tablet devices
  if (isMobile || isTablet) {
    return (
      <MobileLayout>
        {children}
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">KRYONIX</span>
            </div>

            {/* Navigation */}
            <nav className="mt-8 flex-1 px-2 space-y-1">
              {navigationItems.map((item) => {
                const isActive = isActiveRoute(item.href);
                return (
                  <Button
                    key={item.name}
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => navigate(item.href)}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Button>
                );
              })}
            </nav>

            {/* User Profile */}
            <div className="flex-shrink-0 p-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start p-2">
                    <div className="flex items-center w-full">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.profile?.avatar || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm">
                          {getUserInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3 flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400 ml-2" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <User className="w-4 h-4 mr-2" />
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Cog className="w-4 h-4 mr-2" />
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsSidebarOpen(false)} />
          <div className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">K</span>
                  </div>
                  <span className="ml-2 text-xl font-bold text-gray-900">KRYONIX</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-1">
                {navigationItems.map((item) => {
                  const isActive = isActiveRoute(item.href);
                  return (
                    <Button
                      key={item.name}
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                          : 'text-gray-700'
                      }`}
                      onClick={() => {
                        navigate(item.href);
                        setIsSidebarOpen(false);
                      }}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </Button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>

              {/* Page Title - Mobile */}
              <div className="flex-1 md:hidden">
                <h1 className="text-lg font-semibold text-gray-900 text-center">
                  KRYONIX
                </h1>
              </div>

              {/* Desktop spacing */}
              <div className="hidden md:flex-1" />

              {/* Right side actions */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative">
                  <Button variant="ghost" size="sm">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </div>

                {/* User Menu - Mobile */}
                <div className="md:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={user.profile?.avatar || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs">
                            {getUserInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/settings')}>
                        <User className="w-4 h-4 mr-2" />
                        Perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/settings')}>
                        <Cog className="w-4 h-4 mr-2" />
                        Configurações
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleLogout}
                        className="text-red-600"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
