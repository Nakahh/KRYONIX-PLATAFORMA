import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  X, 
  Plus,
  Share,
  Chrome,
  Safari
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { useMobileAdvanced } from '../../hooks/use-mobile-advanced';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasSeenPrompt, setHasSeenPrompt] = useState(false);
  
  const { userAgent, isMobile } = useMobileAdvanced();

  useEffect(() => {
    // Check if app is already installed
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true;
    setIsInstalled(isAppInstalled);

    // Check if user has seen the prompt before
    const seenPrompt = localStorage.getItem('kryonix-pwa-prompt-seen');
    setHasSeenPrompt(!!seenPrompt);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after delay if not seen before and on mobile
      if (!seenPrompt && isMobile) {
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 10000); // Show after 10 seconds
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      console.log('KRYONIX PWA foi instalado!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isMobile]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`Usuário ${outcome === 'accepted' ? 'aceitou' : 'recusou'} a instalação`);
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
    
    // Mark as seen
    localStorage.setItem('kryonix-pwa-prompt-seen', 'true');
    setHasSeenPrompt(true);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('kryonix-pwa-prompt-seen', 'true');
    setHasSeenPrompt(true);
  };

  // Don't show if already installed or not mobile
  if (isInstalled || !isMobile) return null;

  // Manual install instructions for different browsers
  const getInstallInstructions = () => {
    if (userAgent.isIOS) {
      return {
        browser: 'Safari',
        icon: <Safari className="w-5 h-5" />,
        steps: [
          'Toque no botão "Compartilhar" na parte inferior',
          'Role para baixo e toque em "Adicionar à Tela de Início"',
          'Toque em "Adicionar" para confirmar'
        ]
      };
    } else if (userAgent.isChrome || userAgent.isAndroid) {
      return {
        browser: 'Chrome',
        icon: <Chrome className="w-5 h-5" />,
        steps: [
          'Toque no menu (três pontos) no canto superior direito',
          'Toque em "Adicionar à tela inicial"',
          'Toque em "Adicionar" para confirmar'
        ]
      };
    }
    return null;
  };

  const instructions = getInstallInstructions();

  return (
    <>
      {/* Auto Install Prompt */}
      {showInstallPrompt && deferredPrompt && (
        <div className="fixed inset-x-4 bottom-20 z-50 animate-in slide-in-from-bottom-full">
          <Card className="shadow-lg border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">K</span>
                  </div>
                  <div>
                    <CardTitle className="text-sm">Instalar KRYONIX</CardTitle>
                    <CardDescription className="text-xs">
                      Acesso rápido e offline
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleDismiss}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-4">
              <div className="flex space-x-2">
                <Button 
                  onClick={handleInstallClick}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Instalar App
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleDismiss}
                  size="sm"
                >
                  Agora não
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Manual Install Instructions */}
      {!hasSeenPrompt && !deferredPrompt && instructions && (
        <div className="fixed inset-x-4 bottom-20 z-50 animate-in slide-in-from-bottom-full">
          <Card className="shadow-lg border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">K</span>
                  </div>
                  <div>
                    <CardTitle className="text-sm">Instalar KRYONIX</CardTitle>
                    <CardDescription className="text-xs">
                      Para uma melhor experiência
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleDismiss}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  {instructions.icon}
                  <span>Para instalar no {instructions.browser}:</span>
                </div>
                
                <ol className="text-xs text-gray-600 space-y-1 ml-4">
                  {instructions.steps.map((step, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-600 font-medium">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>

                <Button 
                  variant="outline" 
                  onClick={handleDismiss}
                  size="sm"
                  className="w-full"
                >
                  Entendi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Install Button in Settings/Menu */}
      <InstallButton deferredPrompt={deferredPrompt} onInstall={handleInstallClick} />
    </>
  );
}

// Separate component for install button that can be used in menus
interface InstallButtonProps {
  deferredPrompt: BeforeInstallPromptEvent | null;
  onInstall: () => void;
}

export function InstallButton({ deferredPrompt, onInstall }: InstallButtonProps) {
  const { isMobile } = useMobileAdvanced();
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true;
    setIsInstalled(isAppInstalled);
  }, []);

  if (!isMobile || isInstalled) return null;

  return (
    <Button
      onClick={onInstall}
      disabled={!deferredPrompt}
      variant="outline"
      className="w-full justify-start"
    >
      <Smartphone className="w-4 h-4 mr-2" />
      Instalar App
    </Button>
  );
}

// Hook to check if PWA is installed
export function usePWAInstall() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      const installed = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true;
      setIsInstalled(installed);
    };

    // Check if can be installed
    const handleBeforeInstallPrompt = () => {
      setCanInstall(true);
    };

    checkInstalled();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return { isInstalled, canInstall };
}
