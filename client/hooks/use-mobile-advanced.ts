import { useState, useEffect } from 'react';

export interface MobileInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  orientation: 'portrait' | 'landscape';
  touchCapable: boolean;
  userAgent: {
    isIOS: boolean;
    isAndroid: boolean;
    isSafari: boolean;
    isChrome: boolean;
    isMobileSafari: boolean;
  };
  viewport: {
    width: number;
    height: number;
  };
}

export function useMobileAdvanced(): MobileInfo {
  const [mobileInfo, setMobileInfo] = useState<MobileInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenSize: 'lg',
        orientation: 'landscape',
        touchCapable: false,
        userAgent: {
          isIOS: false,
          isAndroid: false,
          isSafari: false,
          isChrome: false,
          isMobileSafari: false,
        },
        viewport: {
          width: 1024,
          height: 768,
        },
      };
    }

    return getMobileInfo();
  });

  useEffect(() => {
    const updateMobileInfo = () => {
      setMobileInfo(getMobileInfo());
    };

    // Listen for resize and orientation changes
    window.addEventListener('resize', updateMobileInfo);
    window.addEventListener('orientationchange', updateMobileInfo);

    // Initial detection
    updateMobileInfo();

    return () => {
      window.removeEventListener('resize', updateMobileInfo);
      window.removeEventListener('orientationchange', updateMobileInfo);
    };
  }, []);

  return mobileInfo;
}

function getMobileInfo(): MobileInfo {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const userAgent = navigator.userAgent;

  // Screen size detection based on Tailwind breakpoints
  const getScreenSize = (width: number): MobileInfo['screenSize'] => {
    if (width < 640) return 'xs';
    if (width < 768) return 'sm';
    if (width < 1024) return 'md';
    if (width < 1280) return 'lg';
    if (width < 1536) return 'xl';
    return '2xl';
  };

  // Device type detection
  const isMobile = width <= 768;
  const isTablet = width > 768 && width <= 1024;
  const isDesktop = width > 1024;

  // Orientation detection
  const orientation = height > width ? 'portrait' : 'landscape';

  // Touch capability detection
  const touchCapable = 'ontouchstart' in window || 
                      navigator.maxTouchPoints > 0 || 
                      (navigator as any).msMaxTouchPoints > 0;

  // User agent detection
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  const isChrome = /Chrome/.test(userAgent);
  const isMobileSafari = isIOS && isSafari;

  return {
    isMobile,
    isTablet,
    isDesktop,
    screenSize: getScreenSize(width),
    orientation,
    touchCapable,
    userAgent: {
      isIOS,
      isAndroid,
      isSafari,
      isChrome,
      isMobileSafari,
    },
    viewport: {
      width,
      height,
    },
  };
}

// Hook para gestos de toque
export function useTouchGestures() {
  const [touchState, setTouchState] = useState({
    isSwipe: false,
    direction: null as 'left' | 'right' | 'up' | 'down' | null,
    startX: 0,
    startY: 0,
    deltaX: 0,
    deltaY: 0,
  });

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    setTouchState(prev => ({
      ...prev,
      startX: touch.clientX,
      startY: touch.clientY,
      isSwipe: false,
      direction: null,
    }));
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!e.touches.length) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchState.startX;
    const deltaY = touch.clientY - touchState.startY;

    setTouchState(prev => ({
      ...prev,
      deltaX,
      deltaY,
    }));
  };

  const handleTouchEnd = () => {
    const { deltaX, deltaY } = touchState;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
      let direction: 'left' | 'right' | 'up' | 'down';

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      setTouchState(prev => ({
        ...prev,
        isSwipe: true,
        direction,
      }));
    }
  };

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchState.startX, touchState.startY]);

  return touchState;
}

// Hook para detectar se o usuário está usando dispositivo móvel pela primeira vez
export function useMobileOnboarding() {
  const [showMobileOnboarding, setShowMobileOnboarding] = useState(false);
  const { isMobile } = useMobileAdvanced();

  useEffect(() => {
    if (isMobile) {
      const hasSeenMobileOnboarding = localStorage.getItem('kryonix-mobile-onboarding');
      if (!hasSeenMobileOnboarding) {
        setShowMobileOnboarding(true);
      }
    }
  }, [isMobile]);

  const completeMobileOnboarding = () => {
    localStorage.setItem('kryonix-mobile-onboarding', 'true');
    setShowMobileOnboarding(false);
  };

  return {
    showMobileOnboarding,
    completeMobileOnboarding,
  };
}

// Hook para viewport seguro (considera as barras do navegador móvel)
export function useSafeViewport() {
  const [safeViewport, setSafeViewport] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });

  useEffect(() => {
    const updateViewport = () => {
      // Para iOS Safari, usar visualViewport quando disponível
      if ('visualViewport' in window && window.visualViewport) {
        setSafeViewport({
          height: window.visualViewport.height,
          width: window.visualViewport.width,
        });
      } else {
        setSafeViewport({
          height: window.innerHeight,
          width: window.innerWidth,
        });
      }
    };

    updateViewport();

    if ('visualViewport' in window && window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewport);
      return () => {
        window.visualViewport?.removeEventListener('resize', updateViewport);
      };
    } else {
      window.addEventListener('resize', updateViewport);
      return () => {
        window.removeEventListener('resize', updateViewport);
      };
    }
  }, []);

  return safeViewport;
}
