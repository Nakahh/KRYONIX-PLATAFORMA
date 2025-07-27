import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  BarChart3,
  Settings,
  CreditCard,
  Bell,
  User,
  Menu,
  X,
  Plus,
  Search,
  ChevronUp,
  LogOut,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useMobileAdvanced, useSafeViewport } from '../../hooks/use-mobile-advanced';
import { useUser, useLogout, useNotifications } from '../../hooks/use-api';

interface MobileLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  showHeader?: boolean;
}

const bottomNavItems = [
  {
    name: 'Início',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Análises',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    name: 'Ações',
    href: '/actions',
    icon: Plus,
    isAction: true,
  },
  {
    name: 'Cobrança',
    href: '/billing',
    icon: CreditCard,
  },
  {
    name: 'Perfil',
    href: '/settings',
    icon: User,
  },
];

export default function MobileLayout({ 
  children, 
  showBottomNav = true, 
  showHeader = true 
}: MobileLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { isMobile, orientation } = useMobileAdvanced();
  const safeViewport = useSafeViewport();
  const { data: user } = useUser();
  const { data: notificationsData } = useNotifications({ status: 'pending' });
  const logoutMutation = useLogout();

  const unreadCount = notificationsData?.notifications.length || 0;

  // Detect scroll for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

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

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const dynamicStyles = {
    height: `${safeViewport.height}px`,
    paddingBottom: showBottomNav ? '80px' : '0',
  };

  if (!isMobile) {
    return <div>{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden" style={dynamicStyles}>
      {/* Header */}
      {showHeader && (
        <header 
          className={`
            fixed top-0 left-0 right-0 z-50 transition-all duration-200
            ${isScrolled 
              ? 'bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200' 
              : 'bg-white border-b border-gray-100'
            }
          `}
          style={{
            paddingTop: 'env(safe-area-inset-top)',
          }}
        >
          <div className="flex items-center justify-between h-14 px-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="text-lg font-bold text-gray-900">KRYONIX</span>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-2">
              {/* Search Button */}
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Search className="w-4 h-4" />
              </Button>

              {/* Notifications */}
              <div className="relative">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-xs"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Menu */}
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-0">
                  <div className="flex flex-col h-full">
                    {/* Profile Section */}
                    <div className="p-6 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12 border-2 border-white/20">
                          <AvatarImage src={user?.profile?.avatar || undefined} />
                          <AvatarFallback className="bg-white/20 text-white">
                            {user?.name ? getUserInitials(user.name) : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{user?.name || 'Usuário'}</h3>
                          <p className="text-sm text-white/80 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4">
                      <div className="space-y-2">
                        {bottomNavItems.filter(item => !item.isAction).map((item) => (
                          <Button
                            key={item.href}
                            variant={isActiveRoute(item.href) ? "default" : "ghost"}
                            className="w-full justify-start h-12"
                            onClick={() => {
                              navigate(item.href);
                              setIsMenuOpen(false);
                            }}
                          >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.name}
                          </Button>
                        ))}
                      </div>
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-gray-200">
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-12 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-5 h-5 mr-3" />
                        Sair
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main 
        className={`
          ${showHeader ? 'pt-14' : ''} 
          ${showBottomNav ? 'pb-20' : ''}
          min-h-full
        `}
        style={{
          paddingTop: showHeader ? `calc(56px + env(safe-area-inset-top))` : undefined,
        }}
      >
        {children}
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && (
        <nav 
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40"
          style={{
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          <div className="grid grid-cols-5 h-16">
            {bottomNavItems.map((item) => {
              const isActive = isActiveRoute(item.href);
              
              if (item.isAction) {
                return (
                  <button
                    key={item.href}
                    className="flex flex-col items-center justify-center relative"
                    onClick={() => navigate('/dashboard/new-stack')}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg -mt-2">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                  </button>
                );
              }

              return (
                <button
                  key={item.href}
                  className={`
                    flex flex-col items-center justify-center space-y-1 transition-colors
                    ${isActive 
                      ? 'text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                    }
                  `}
                  onClick={() => navigate(item.href)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.name}</span>
                  {isActive && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* iOS-style scroll indicator for long content */}
      <ScrollIndicator />
    </div>
  );
}

// Component for iOS-style scroll indicator
function ScrollIndicator() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentScrollY = window.scrollY;
      const progress = currentScrollY / scrollHeight;
      
      setScrollProgress(progress);
      setIsVisible(currentScrollY > 100 && progress < 0.95);
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed right-2 top-1/2 transform -translate-y-1/2 z-50">
      <div className="w-1 h-20 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="w-full bg-blue-500 rounded-full transition-all duration-150"
          style={{ height: `${scrollProgress * 100}%` }}
        />
      </div>
    </div>
  );
}
