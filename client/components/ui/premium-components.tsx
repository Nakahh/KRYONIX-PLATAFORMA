import React, { forwardRef, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Card } from "./card";
import { KryonixLogoPremium } from "../brand/KryonixLogoPremium";
import { Sparkles, Zap, TrendingUp, Shield, Crown, Star } from "lucide-react";

// Card Premium com glassmorphism e animações
interface PremiumCardProps {
  children: ReactNode;
  variant?: "default" | "elevated" | "glass" | "premium" | "hero";
  gradient?: boolean;
  glow?: boolean;
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
}

export const PremiumCard = forwardRef<HTMLDivElement, PremiumCardProps>(
  (
    {
      children,
      variant = "default",
      gradient,
      glow,
      interactive,
      className,
      onClick,
      ...props
    },
    ref,
  ) => {
    const variants = {
      default:
        "bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm",
      elevated:
        "bg-white/90 backdrop-blur-md border border-gray-200/50 shadow-lg",
      glass: "bg-white/20 backdrop-blur-xl border border-white/30 shadow-glass",
      premium:
        "bg-gradient-to-br from-white via-white to-blue-50/30 border border-blue-200/50 shadow-elevated",
      hero: "bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 border border-blue-300/30 shadow-glowLg",
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-2xl transition-all duration-300 ease-out",
          variants[variant],
          gradient && "bg-gradient-to-br from-blue-500/5 to-purple-500/5",
          glow && "hover:shadow-glow",
          interactive && "hover:scale-[1.02] hover:shadow-xl cursor-pointer",
          className,
        )}
        whileHover={interactive ? { scale: 1.02, y: -2 } : {}}
        whileTap={interactive ? { scale: 0.98 } : {}}
        transition={{ duration: 0.2 }}
        onClick={onClick}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);

PremiumCard.displayName = "PremiumCard";

// Botão Premium com efeitos avançados
interface PremiumButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "glass" | "gradient" | "neon";
  size?: "sm" | "md" | "lg" | "xl";
  glow?: boolean;
  pulse?: boolean;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      glow,
      pulse,
      className,
      loading,
      ...props
    },
    ref,
  ) => {
    const variants = {
      primary:
        "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg",
      secondary:
        "bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200 shadow-sm hover:bg-white hover:shadow-md",
      ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80",
      glass:
        "bg-white/20 backdrop-blur-xl text-white border border-white/30 hover:bg-white/30",
      gradient:
        "bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 hover:from-blue-600 hover:via-purple-600 hover:to-cyan-600 text-white",
      neon: "bg-gray-900 text-cyan-400 border border-cyan-500/50 hover:bg-gray-800 hover:shadow-[0_0_20px_rgba(34,211,238,0.5)]",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
      xl: "px-8 py-4 text-xl",
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          "relative font-medium rounded-lg transition-all duration-200 ease-out",
          "focus:ring-4 focus:ring-blue-500/30 focus:outline-none",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
          variants[variant],
          sizes[size],
          glow && "hover:shadow-glow",
          pulse && "animate-pulse",
          className,
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.15 }}
        {...props}
      >
        {loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
        <span className={loading ? "opacity-0" : "opacity-100"}>
          {children}
        </span>
      </motion.button>
    );
  },
);

PremiumButton.displayName = "PremiumButton";

// Badge Premium com animações
interface PremiumBadgeProps {
  children: ReactNode;
  variant?:
    | "default"
    | "success"
    | "warning"
    | "error"
    | "info"
    | "premium"
    | "new";
  size?: "sm" | "md" | "lg";
  glow?: boolean;
  pulse?: boolean;
  className?: string;
}

export const PremiumBadge = forwardRef<HTMLDivElement, PremiumBadgeProps>(
  (
    {
      children,
      variant = "default",
      size = "md",
      glow,
      pulse,
      className,
      ...props
    },
    ref,
  ) => {
    const variants = {
      default: "bg-gray-100 text-gray-700",
      success: "bg-green-100 text-green-700 border border-green-200",
      warning: "bg-yellow-100 text-yellow-700 border border-yellow-200",
      error: "bg-red-100 text-red-700 border border-red-200",
      info: "bg-blue-100 text-blue-700 border border-blue-200",
      premium:
        "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg",
      new: "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg",
    };

    const sizes = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-1 text-sm",
      lg: "px-3 py-1.5 text-base",
    };

    const icons = {
      premium: <Crown className="w-3 h-3" />,
      new: <Sparkles className="w-3 h-3" />,
      success: <Shield className="w-3 h-3" />,
      info: <Star className="w-3 h-3" />,
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 font-medium rounded-full",
          variants[variant],
          sizes[size],
          glow && "shadow-glow",
          pulse && "animate-pulse",
          className,
        )}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.15 }}
        {...props}
      >
        {icons[variant as keyof typeof icons]}
        {children}
      </motion.div>
    );
  },
);

PremiumBadge.displayName = "PremiumBadge";

// Alert Premium com animações
interface PremiumAlertProps {
  children: ReactNode;
  variant?: "success" | "warning" | "error" | "info";
  title?: string;
  closable?: boolean;
  onClose?: () => void;
  className?: string;
}

export const PremiumAlert = forwardRef<HTMLDivElement, PremiumAlertProps>(
  (
    {
      children,
      variant = "info",
      title,
      closable,
      onClose,
      className,
      ...props
    },
    ref,
  ) => {
    const variants = {
      success: "bg-green-50 border-green-200 text-green-800",
      warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
      error: "bg-red-50 border-red-200 text-red-800",
      info: "bg-blue-50 border-blue-200 text-blue-800",
    };

    const icons = {
      success: <Shield className="w-5 h-5 text-green-500" />,
      warning: <Zap className="w-5 h-5 text-yellow-500" />,
      error: <Zap className="w-5 h-5 text-red-500" />,
      info: <Star className="w-5 h-5 text-blue-500" />,
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={cn(
          "p-4 rounded-xl border backdrop-blur-sm",
          variants[variant],
          className,
        )}
        {...props}
      >
        <div className="flex items-start gap-3">
          {icons[variant]}
          <div className="flex-1">
            {title && <h4 className="font-semibold mb-1">{title}</h4>}
            <div className="text-sm">{children}</div>
          </div>
          {closable && (
            <button
              onClick={onClose}
              className="text-current opacity-70 hover:opacity-100 transition-opacity"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </motion.div>
    );
  },
);

PremiumAlert.displayName = "PremiumAlert";

// Modal Premium com backdrop blur
interface PremiumModalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

export const PremiumModal = ({
  children,
  isOpen,
  onClose,
  title,
  size = "md",
  className,
}: PremiumModalProps) => {
  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-7xl",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20",
                sizes[size],
                className,
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {title && (
                <div className="px-6 py-4 border-b border-gray-200/50">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {title}
                    </h2>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              <div className="p-6">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// Loading Premium com logo KRYONIX
interface PremiumLoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  variant?: "default" | "minimal" | "hero";
}

export const PremiumLoading = ({
  message = "Carregando...",
  size = "md",
  fullScreen,
  variant = "default",
}: PremiumLoadingProps) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-6">
      {variant === "hero" ? (
        <KryonixLogoPremium
          variant="hero"
          size="xl"
          theme="gradient"
          animated
          glowEffect
          pulseEffect
          particleEffect
        />
      ) : (
        <div className="relative">
          <KryonixLogoPremium
            variant="icon"
            size={size}
            theme="gradient"
            animated
            glowEffect
            pulseEffect
          />
          <motion.div
            className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>
      )}

      <motion.p
        className="text-lg text-gray-600 text-center font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {message}
      </motion.p>

      {variant !== "minimal" && (
        <div className="w-64 h-1 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-8">{content}</div>;
};

// Stats Premium com animações
interface PremiumStatsProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: ReactNode;
  variant?: "default" | "gradient" | "glass";
  className?: string;
}

export const PremiumStats = ({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  variant = "default",
  className,
}: PremiumStatsProps) => {
  const variants = {
    default: "bg-white/80 backdrop-blur-sm border border-gray-200/50",
    gradient:
      "bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-200/50",
    glass: "bg-white/20 backdrop-blur-xl border border-white/30",
  };

  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-gray-600",
  };

  const trendIcons = {
    up: <TrendingUp className="w-4 h-4" />,
    down: <TrendingUp className="w-4 h-4 rotate-180" />,
    neutral: <span className="w-4 h-4" />,
  };

  return (
    <motion.div
      className={cn(
        "p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200",
        variants[variant],
        className,
      )}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>

        {icon && (
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg text-white">
            {icon}
          </div>
        )}
      </div>

      {trend && trendValue && (
        <div
          className={cn(
            "flex items-center gap-1 mt-4 text-sm font-medium",
            trendColors[trend],
          )}
        >
          {trendIcons[trend]}
          <span>{trendValue}</span>
          <span className="text-gray-500">vs período anterior</span>
        </div>
      )}
    </motion.div>
  );
};

export {
  PremiumCard,
  PremiumButton,
  PremiumBadge,
  PremiumAlert,
  PremiumModal,
  PremiumLoading,
  PremiumStats,
};
