import { useState, useEffect, useCallback } from 'react';

export interface PWAInstallPrompt {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWAInfo {
  isInstalled: boolean;
  isInstallable: boolean;
  isOnline: boolean;
  isSupported: boolean;
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
  installPrompt: PWAInstallPrompt | null;
}

export interface PWAActions {
  install: () => Promise<boolean>;
  showInstallInstructions: () => void;
  registerServiceWorker: () => Promise<boolean>;
  unregisterServiceWorker: () => Promise<boolean>;
  updateApp: () => Promise<boolean>;
  showUpdatePrompt: () => void;
}

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Hook para gerenciar PWA KRYONIX otimizado para brasileiros
 * Funcionalidades: instalação, offline, notificações, atualizações
 */
export function usePWA() {
  const [pwaInfo, setPwaInfo] = useState<PWAInfo>({
    isInstalled: false,
    isInstallable: false,
    isOnline: navigator.onLine,
    isSupported: 'serviceWorker' in navigator,
    platform: 'unknown',
    installPrompt: null,
  });

  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Detectar plataforma
  const detectPlatform = useCallback((): PWAInfo['platform'] => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      return 'ios';
    }
    if (/android/.test(userAgent)) {
      return 'android';
    }
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return 'desktop';
    }
    
    return 'unknown';
  }, []);

  // Verificar se está instalado
  const checkIfInstalled = useCallback(() => {
    // PWA instalado se estiver em standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    // iOS Safari
    const isIOSStandalone = (window.navigator as any).standalone === true;
    // Android Chrome
    const isInWebapp = window.matchMedia('(display-mode: standalone)').matches || 
                     window.matchMedia('(display-mode: fullscreen)').matches;
    
    return isStandalone || isIOSStandalone || isInWebapp;
  }, []);

  // Registrar Service Worker
  const registerServiceWorker = useCallback(async (): Promise<boolean> => {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Workers não suportado');
      return false;
    }

    try {
      console.log('🔄 Registrando Service Worker KRYONIX...');
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('✅ Service Worker registrado:', registration.scope);

      // Escutar por atualizações
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🆕 Nova versão disponível!');
              setUpdateAvailable(true);
            }
          });
        }
      });

      return true;
    } catch (error) {
      console.error('❌ Falha ao registrar Service Worker:', error);
      return false;
    }
  }, []);

  // Desregistrar Service Worker
  const unregisterServiceWorker = useCallback(async (): Promise<boolean> => {
    if (!('serviceWorker' in navigator)) return false;

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      const unregisterPromises = registrations.map(registration => registration.unregister());
      await Promise.all(unregisterPromises);
      console.log('🗑️ Service Workers desregistrados');
      return true;
    } catch (error) {
      console.error('❌ Falha ao desregistrar Service Workers:', error);
      return false;
    }
  }, []);

  // Instalar PWA
  const install = useCallback(async (): Promise<boolean> => {
    if (!pwaInfo.installPrompt) {
      console.log('❌ Prompt de instalação não disponível');
      return false;
    }

    try {
      console.log('📲 Iniciando instalação PWA...');
      await pwaInfo.installPrompt.prompt();
      
      const choiceResult = await pwaInfo.installPrompt.userChoice;
      console.log('👤 Escolha do usuário:', choiceResult.outcome);
      
      if (choiceResult.outcome === 'accepted') {
        setPwaInfo(prev => ({ 
          ...prev, 
          isInstallable: false, 
          installPrompt: null,
          isInstalled: true 
        }));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Falha na instalação PWA:', error);
      return false;
    }
  }, [pwaInfo.installPrompt]);

  // Mostrar instruções de instalação manual
  const showInstallInstructions = useCallback(() => {
    const platform = detectPlatform();
    let instructions = '';

    switch (platform) {
      case 'ios':
        instructions = `
🇧🇷 KRYONIX - Instalar no iPhone/iPad:

1. Toque no botão Compartilhar (📤) 
2. Role para baixo e toque em "Adicionar à Tela de Início"
3. Toque em "Adicionar" no canto superior direito
4. O app KRYONIX aparecerá na sua tela inicial!

✨ Aproveite a experiência completa sem navegador!
        `;
        break;
        
      case 'android':
        instructions = `
🇧🇷 KRYONIX - Instalar no Android:

1. Toque no menu do navegador (⋮)
2. Selecione "Adicionar à tela inicial" ou "Instalar app"
3. Confirme tocando em "Adicionar" ou "Instalar"
4. O app KRYONIX aparecerá na sua tela inicial!

✨ Acesso rápido sem abrir o navegador!
        `;
        break;
        
      default:
        instructions = `
🇧🇷 KRYONIX - Instalar no computador:

Chrome/Edge:
1. Clique no ícone de instalação (➕) na barra de endereços
2. Clique em "Instalar" na janela que aparecer
3. O KRYONIX será instalado como um app!

Firefox:
1. Adicione aos favoritos para acesso rápido
2. Use o modo tela cheia (F11) para melhor experiência

✨ Tenha o KRYONIX sempre à mão!
        `;
    }

    alert(instructions);
  }, [detectPlatform]);

  // Atualizar app
  const updateApp = useCallback(async (): Promise<boolean> => {
    if (!('serviceWorker' in navigator)) return false;

    try {
      setIsUpdating(true);
      console.log('🔄 Atualizando KRYONIX...');

      const registration = await navigator.serviceWorker.ready;
      
      if (registration.waiting) {
        // Força a ativação do novo service worker
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Espera a ativação e recarrega
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('✅ KRYONIX atualizado!');
          window.location.reload();
        });
        
        return true;
      }
      
      // Força verificação de atualização
      await registration.update();
      setIsUpdating(false);
      
      return false;
    } catch (error) {
      console.error('❌ Falha na atualização:', error);
      setIsUpdating(false);
      return false;
    }
  }, []);

  // Mostrar prompt de atualização
  const showUpdatePrompt = useCallback(() => {
    const shouldUpdate = confirm(`
🇧🇷 KRYONIX - Nova versão disponível!

Uma nova versão do KRYONIX está pronta para ser instalada.

✨ Novidades:
• Melhor performance
• Correções de bugs  
• Novos recursos brasileiros

Deseja atualizar agora?
    `);

    if (shouldUpdate) {
      updateApp();
    }
  }, [updateApp]);

  // Configurar notificações push
  const enableNotifications = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.log('❌ Notificações não suportadas');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('✅ Notificações habilitadas');
        
        // Registrar para push notifications
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
        });
        
        // Enviar subscription para o servidor
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Falha ao habilitar notificações:', error);
      return false;
    }
  }, []);

  // Effects
  useEffect(() => {
    // Detectar plataforma e status inicial
    setPwaInfo(prev => ({
      ...prev,
      platform: detectPlatform(),
      isInstalled: checkIfInstalled(),
    }));

    // Registrar service worker automaticamente
    registerServiceWorker();
  }, [detectPlatform, checkIfInstalled, registerServiceWorker]);

  useEffect(() => {
    // Escutar prompt de instalação
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('📱 Prompt de instalação detectado');
      e.preventDefault(); // Previne o prompt automático
      
      setPwaInfo(prev => ({
        ...prev,
        isInstallable: true,
        installPrompt: e as PWAInstallPrompt,
      }));
    };

    // Escutar instalação concluída
    const handleAppInstalled = () => {
      console.log('✅ PWA instalado com sucesso!');
      setPwaInfo(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        installPrompt: null,
      }));
    };

    // Escutar mudanças de conexão
    const handleOnline = () => {
      console.log('🟢 Conectado à internet');
      setPwaInfo(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      console.log('🔴 Desconectado da internet');
      setPwaInfo(prev => ({ ...prev, isOnline: false }));
    };

    // Adicionar event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-mostrar prompt de atualização
  useEffect(() => {
    if (updateAvailable && !isUpdating) {
      // Aguarda 2 segundos antes de mostrar o prompt
      const timer = setTimeout(showUpdatePrompt, 2000);
      return () => clearTimeout(timer);
    }
  }, [updateAvailable, isUpdating, showUpdatePrompt]);

  const actions: PWAActions = {
    install,
    showInstallInstructions,
    registerServiceWorker,
    unregisterServiceWorker,
    updateApp,
    showUpdatePrompt,
  };

  return {
    ...pwaInfo,
    updateAvailable,
    isUpdating,
    enableNotifications,
    actions,
  };
}

// Hook para cache offline
export function useOfflineCache() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [cachedData, setCachedData] = useState<Record<string, any>>({});

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const cacheData = useCallback((key: string, data: any) => {
    try {
      localStorage.setItem(`kryonix_cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
      setCachedData(prev => ({ ...prev, [key]: data }));
    } catch (error) {
      console.error('Falha ao cachear dados:', error);
    }
  }, []);

  const getCachedData = useCallback((key: string, maxAge: number = 24 * 60 * 60 * 1000) => {
    try {
      const cached = localStorage.getItem(`kryonix_cache_${key}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < maxAge) {
          return data;
        }
      }
    } catch (error) {
      console.error('Falha ao recuperar dados do cache:', error);
    }
    return null;
  }, []);

  const clearCache = useCallback(() => {
    Object.keys(localStorage)
      .filter(key => key.startsWith('kryonix_cache_'))
      .forEach(key => localStorage.removeItem(key));
    setCachedData({});
  }, []);

  return {
    isOffline,
    cachedData,
    cacheData,
    getCachedData,
    clearCache,
  };
}

export default usePWA;
