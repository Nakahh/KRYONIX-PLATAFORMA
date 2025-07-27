import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook para Gestos Nativos Avançados
 * KRYONIX - Otimizado para UX mobile brasileira
 */

interface SwipeConfig {
  threshold: number;
  velocity: number;
  restraint: number;
  allowedTime: number;
}

interface GestureState {
  isSwipe: boolean;
  direction: "left" | "right" | "up" | "down" | null;
  distance: number;
  velocity: number;
  deltaX: number;
  deltaY: number;
  startTime: number;
  endTime: number;
}

interface TouchStart {
  x: number;
  y: number;
  time: number;
}

interface UseNativeGesturesProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPullToRefresh?: () => void;
  onLongPress?: () => void;
  onDoubleTap?: () => void;
  swipeConfig?: Partial<SwipeConfig>;
  enablePullToRefresh?: boolean;
  enableHapticFeedback?: boolean;
  pullThreshold?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
}

const defaultSwipeConfig: SwipeConfig = {
  threshold: 50, // Distância mínima em pixels
  velocity: 0.3, // Velocidade mínima
  restraint: 100, // Máxima distância perpendicular
  allowedTime: 300, // Tempo máximo em ms
};

export function useNativeGestures({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPullToRefresh,
  onLongPress,
  onDoubleTap,
  swipeConfig = {},
  enablePullToRefresh = false,
  enableHapticFeedback = true,
  pullThreshold = 80,
  longPressDelay = 500,
  doubleTapDelay = 300,
}: UseNativeGesturesProps = {}) {
  const [gestureState, setGestureState] = useState<GestureState>({
    isSwipe: false,
    direction: null,
    distance: 0,
    velocity: 0,
    deltaX: 0,
    deltaY: 0,
    startTime: 0,
    endTime: 0,
  });

  const [isPullToRefresh, setIsPullToRefresh] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isLongPress, setIsLongPress] = useState(false);
  const [lastTap, setLastTap] = useState(0);

  const touchStartRef = useRef<TouchStart | null>(null);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  const config = { ...defaultSwipeConfig, ...swipeConfig };

  // Haptic feedback otimizado para dispositivos brasileiros
  const triggerHaptic = useCallback(
    (type: "light" | "medium" | "heavy" = "light") => {
      if (!enableHapticFeedback) return;

      if ("vibrate" in navigator) {
        const patterns = {
          light: [10],
          medium: [20, 50, 20],
          heavy: [50, 100, 50],
        };
        navigator.vibrate(patterns[type]);
      }
    },
    [enableHapticFeedback],
  );

  // Pull to refresh específico para mobile brasileiro
  const handlePullToRefresh = useCallback(
    (deltaY: number) => {
      if (!enablePullToRefresh || window.scrollY > 0) return;

      const pullPercentage = Math.min(deltaY / pullThreshold, 1);

      setPullDistance(deltaY);

      // Feedback visual e háptico
      if (deltaY > pullThreshold && !isPullToRefresh) {
        setIsPullToRefresh(true);
        triggerHaptic("medium");
      } else if (deltaY <= pullThreshold && isPullToRefresh) {
        setIsPullToRefresh(false);
      }
    },
    [enablePullToRefresh, isPullToRefresh, triggerHaptic, pullThreshold],
  );

  // Long press otimizado para mobile
  const startLongPress = useCallback(
    (event: TouchEvent) => {
      longPressTimeoutRef.current = setTimeout(() => {
        setIsLongPress(true);
        triggerHaptic("heavy");
        onLongPress?.();
      }, longPressDelay);
    },
    [onLongPress, triggerHaptic, longPressDelay],
  );

  const cancelLongPress = useCallback(() => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
    setIsLongPress(false);
  }, []);

  // Double tap detection
  const handleDoubleTap = useCallback(
    (event: TouchEvent) => {
      const now = Date.now();

      if (now - lastTap <= doubleTapDelay) {
        triggerHaptic("light");
        onDoubleTap?.();
        setLastTap(0);
      } else {
        setLastTap(now);
      }
    },
    [lastTap, onDoubleTap, triggerHaptic, doubleTapDelay],
  );

  // Touch start handler
  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      const touch = event.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };

      startLongPress(event);

      setGestureState((prev) => ({
        ...prev,
        isSwipe: false,
        direction: null,
        distance: 0,
        velocity: 0,
        deltaX: 0,
        deltaY: 0,
        startTime: Date.now(),
      }));
    },
    [startLongPress],
  );

  // Touch move handler
  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (!touchStartRef.current) return;

      cancelLongPress();

      const touch = event.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      setGestureState((prev) => ({
        ...prev,
        deltaX,
        deltaY,
        distance,
      }));

      // Pull to refresh logic
      if (deltaY > 0 && Math.abs(deltaX) < 50 && window.scrollY === 0) {
        handlePullToRefresh(deltaY);

        // Prevent default scroll when pulling to refresh
        if (deltaY > 0 && window.scrollY === 0) {
          event.preventDefault();
        }
      }
    },
    [cancelLongPress, handlePullToRefresh],
  );

  // Touch end handler
  const handleTouchEnd = useCallback(
    (event: TouchEvent) => {
      if (!touchStartRef.current) return;

      cancelLongPress();

      const endTime = Date.now();
      const elapsedTime = endTime - touchStartRef.current.time;
      const { deltaX, deltaY, distance } = gestureState;

      // Handle double tap
      if (distance < 20 && elapsedTime < 200) {
        handleDoubleTap(event);
      }

      // Pull to refresh release
      if (isPullToRefresh && pullDistance > pullThreshold) {
        triggerHaptic("heavy");
        onPullToRefresh?.();
      }
      setIsPullToRefresh(false);
      setPullDistance(0);

      // Swipe detection
      if (distance >= config.threshold && elapsedTime <= config.allowedTime) {
        const velocity = distance / elapsedTime;

        if (velocity >= config.velocity) {
          let direction: GestureState["direction"] = null;

          if (Math.abs(deltaX) >= Math.abs(deltaY)) {
            // Horizontal swipe
            if (Math.abs(deltaY) <= config.restraint) {
              direction = deltaX > 0 ? "right" : "left";
            }
          } else {
            // Vertical swipe
            if (Math.abs(deltaX) <= config.restraint) {
              direction = deltaY > 0 ? "down" : "up";
            }
          }

          if (direction) {
            triggerHaptic("light");
            setGestureState((prev) => ({
              ...prev,
              isSwipe: true,
              direction,
              velocity,
              endTime,
            }));

            // Execute callbacks
            switch (direction) {
              case "left":
                onSwipeLeft?.();
                break;
              case "right":
                onSwipeRight?.();
                break;
              case "up":
                onSwipeUp?.();
                break;
              case "down":
                onSwipeDown?.();
                break;
            }
          }
        }
      }

      touchStartRef.current = null;
    },
    [
      cancelLongPress,
      gestureState,
      isPullToRefresh,
      pullDistance,
      config,
      triggerHaptic,
      onSwipeLeft,
      onSwipeRight,
      onSwipeUp,
      onSwipeDown,
      onPullToRefresh,
      pullThreshold,
      handleDoubleTap,
    ],
  );

  // Bind event listeners
  useEffect(() => {
    const element = elementRef.current || document;

    const options = { passive: false };

    element.addEventListener("touchstart", handleTouchStart, options);
    element.addEventListener("touchmove", handleTouchMove, options);
    element.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    gestureState,
    isPullToRefresh,
    pullDistance: Math.min(pullDistance, pullThreshold * 1.2),
    pullProgress: Math.min(pullDistance / pullThreshold, 1),
    isLongPress,
    bind: (element: HTMLElement | null) => {
      elementRef.current = element;
    },
    triggerHaptic,
  };
}

// Hook específico para pull-to-refresh brasileiro
export function usePullToRefresh(onRefresh: () => void | Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 800);
    }
  }, [onRefresh, isRefreshing]);

  const { isPullToRefresh, pullProgress, triggerHaptic } = useNativeGestures({
    onPullToRefresh: handleRefresh,
    enablePullToRefresh: true,
    pullThreshold: 80,
  });

  return {
    isRefreshing,
    isPullToRefresh,
    pullProgress,
    triggerHaptic,
  };
}

// Hook para swipe navigation (páginas/cards)
export function useSwipeNavigation({
  onNext,
  onPrevious,
  enableVerticalSwipe = false,
}: {
  onNext?: () => void;
  onPrevious?: () => void;
  enableVerticalSwipe?: boolean;
}) {
  const { gestureState } = useNativeGestures({
    onSwipeLeft: onNext,
    onSwipeRight: onPrevious,
    onSwipeUp: enableVerticalSwipe ? onNext : undefined,
    onSwipeDown: enableVerticalSwipe ? onPrevious : undefined,
    swipeConfig: {
      threshold: 80,
      velocity: 0.4,
      restraint: 120,
    },
  });

  return {
    isNavigating: gestureState.isSwipe,
    direction: gestureState.direction,
    progress: Math.min(gestureState.distance / 80, 1),
  };
}

// Hook para gesture feedback visual
export function useGestureFeedback() {
  const [feedbackState, setFeedbackState] = useState({
    type: null as "swipe" | "pull" | "longpress" | null,
    direction: null as string | null,
    progress: 0,
    visible: false,
  });

  const showFeedback = useCallback(
    (
      type: "swipe" | "pull" | "longpress",
      direction?: string,
      progress?: number,
    ) => {
      setFeedbackState({
        type,
        direction: direction || null,
        progress: progress || 0,
        visible: true,
      });

      if (type === "swipe" || type === "longpress") {
        setTimeout(() => {
          setFeedbackState((prev) => ({ ...prev, visible: false }));
        }, 1000);
      }
    },
    [],
  );

  const hideFeedback = useCallback(() => {
    setFeedbackState((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    feedbackState,
    showFeedback,
    hideFeedback,
  };
}
