import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface KryonixLogoPremiumProps {
  variant?: "full" | "icon" | "compact" | "horizontal" | "hero";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "hero";
  theme?: "light" | "dark" | "gradient" | "glass" | "neon" | "golden";
  animated?: boolean;
  glowEffect?: boolean;
  pulseEffect?: boolean;
  particleEffect?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeConfig = {
  xs: { icon: "w-4 h-4", text: "text-xs", container: "h-6", spacing: "gap-1" },
  sm: {
    icon: "w-6 h-6",
    text: "text-sm",
    container: "h-8",
    spacing: "gap-1.5",
  },
  md: {
    icon: "w-8 h-8",
    text: "text-base",
    container: "h-10",
    spacing: "gap-2",
  },
  lg: {
    icon: "w-12 h-12",
    text: "text-lg",
    container: "h-14",
    spacing: "gap-2",
  },
  xl: {
    icon: "w-16 h-16",
    text: "text-xl",
    container: "h-20",
    spacing: "gap-3",
  },
  "2xl": {
    icon: "w-24 h-24",
    text: "text-2xl",
    container: "h-28",
    spacing: "gap-4",
  },
  "3xl": {
    icon: "w-32 h-32",
    text: "text-3xl",
    container: "h-36",
    spacing: "gap-4",
  },
  hero: {
    icon: "w-48 h-48",
    text: "text-6xl",
    container: "h-64",
    spacing: "gap-6",
  },
};

const themeConfig = {
  light: {
    icon: "text-blue-600 drop-shadow-md",
    text: "text-gray-900",
    accent: "text-green-500",
    background: "bg-white/80 backdrop-blur-sm",
    glow: "drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]",
  },
  dark: {
    icon: "text-blue-400 drop-shadow-md",
    text: "text-white",
    accent: "text-green-400",
    background: "bg-gray-900/80 backdrop-blur-sm",
    glow: "drop-shadow-[0_0_15px_rgba(96,165,250,0.6)]",
  },
  gradient: {
    icon: "text-transparent bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 bg-clip-text",
    text: "text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text",
    accent: "text-green-400",
    background: "bg-gradient-to-br from-blue-50 to-purple-50",
    glow: "drop-shadow-[0_0_20px_rgba(147,51,234,0.4)]",
  },
  glass: {
    icon: "text-blue-600 drop-shadow-lg",
    text: "text-gray-900",
    accent: "text-green-500",
    background:
      "bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl",
    glow: "drop-shadow-[0_0_25px_rgba(59,130,246,0.3)]",
  },
  neon: {
    icon: "text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]",
    text: "text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]",
    accent: "text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]",
    background: "bg-gray-900/90 backdrop-blur-sm border border-cyan-500/30",
    glow: "drop-shadow-[0_0_30px_rgba(34,211,238,0.8)]",
  },
  golden: {
    icon: "text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]",
    text: "text-yellow-600",
    accent: "text-orange-500",
    background: "bg-gradient-to-br from-yellow-50 to-orange-50",
    glow: "drop-shadow-[0_0_25px_rgba(234,179,8,0.5)]",
  },
};

export function KryonixLogoPremium({
  variant = "full",
  size = "md",
  theme = "light",
  animated = true,
  glowEffect = false,
  pulseEffect = false,
  particleEffect = false,
  className,
  onClick,
}: KryonixLogoPremiumProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);

  const sizeClasses = sizeConfig[size];
  const themeClasses = themeConfig[theme];

  // Gerar partículas para efeito
  useEffect(() => {
    if (particleEffect) {
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
      }));
      setParticles(newParticles);
    }
  }, [particleEffect]);

  // Logo Icon Premium com efeitos avançados
  const LogoIcon = () => (
    <motion.div
      className={cn(
        sizeClasses.icon,
        "relative flex items-center justify-center",
        glowEffect && themeClasses.glow,
        className,
      )}
      whileHover={
        animated
          ? {
              scale: 1.1,
              rotate: isHovered ? 360 : 0,
              filter: "brightness(1.2)",
            }
          : {}
      }
      transition={{
        type: "spring",
        damping: 15,
        stiffness: 300,
        duration: 0.6,
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Partículas de fundo */}
      {particleEffect && (
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-60"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.6, 1, 0.6],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}

      {/* Anel externo com pulso */}
      <motion.div
        className="absolute inset-0"
        animate={
          pulseEffect
            ? {
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke="url(#gradient-ring)"
            strokeWidth="3"
            strokeDasharray="5 5"
            className="animate-spin"
            style={{ animationDuration: "20s" }}
          />
          <defs>
            <linearGradient
              id="gradient-ring"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.6" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Logo principal */}
      <svg
        viewBox="0 0 200 200"
        className={cn("w-full h-full", themeClasses.icon)}
        fill="currentColor"
      >
        {/* Gradientes para efeitos */}
        <defs>
          <linearGradient
            id="main-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Círculo base com gradiente */}
        <circle
          cx="100"
          cy="100"
          r="85"
          fill="url(#main-gradient)"
          opacity="0.1"
          filter="url(#glow)"
        />

        {/* Forma geométrica principal - K estilizado */}
        <g transform="translate(100, 100)">
          {/* Elemento central entrelacado */}
          <motion.path
            d="M-45,-45 L-25,-45 L-25,-25 L-5,-25 L-5,-5 L15,-5 L15,15 L35,15 L35,35 L15,35 L15,15 L-5,15 L-5,-5 L-25,-5 L-25,-25 L-45,-25 Z"
            fill="url(#main-gradient)"
            className="drop-shadow-lg"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {/* Elemento complementar */}
          <motion.path
            d="M45,-45 L25,-45 L25,-25 L5,-25 L5,-5 L-15,-5 L-15,15 L-35,15 L-35,35 L-15,35 L-15,15 L5,15 L5,-5 L25,-5 L25,-25 L45,-25 Z"
            fill="#22c55e"
            opacity="0.8"
            className="drop-shadow-lg"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.8 }}
            transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
          />

          {/* Centro brilhante com pulso */}
          <motion.circle
            cx="0"
            cy="0"
            r="12"
            fill="url(#center-glow)"
            animate={
              pulseEffect
                ? {
                    r: [12, 16, 12],
                    opacity: [0.8, 1, 0.8],
                  }
                : {}
            }
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <circle cx="0" cy="0" r="6" fill="#3b82f6" />
          <circle cx="0" cy="0" r="3" fill="#ffffff" opacity="0.9" />
        </g>
      </svg>

      {/* Reflexo de vidro */}
      {theme === "glass" && (
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-full" />
      )}
    </motion.div>
  );

  // Texto KRYONIX Premium
  const LogoText = ({ compact = false }: { compact?: boolean }) => (
    <motion.div
      className="flex flex-col items-center"
      initial={animated ? { opacity: 0, y: 10 } : {}}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <motion.span
        className={cn(
          sizeClasses.text,
          themeClasses.text,
          "font-bold tracking-wider relative",
          "drop-shadow-sm",
        )}
        whileHover={
          animated
            ? {
                letterSpacing: "0.1em",
                textShadow: theme === "neon" ? "0 0 20px currentColor" : "none",
              }
            : {}
        }
        transition={{ duration: 0.3 }}
      >
        KRYONIX
        {/* Underline animado */}
        <motion.div
          className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: isHovered ? "100%" : "30%" }}
          transition={{ duration: 0.4 }}
        />
      </motion.span>

      {!compact && size !== "xs" && size !== "sm" && (
        <motion.span
          className={cn(
            "text-xs text-gray-500 tracking-widest mt-1",
            themeClasses.accent,
            theme === "neon" && "drop-shadow-[0_0_8px_currentColor]",
          )}
          initial={animated ? { opacity: 0 } : {}}
          animate={{ opacity: 0.8 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          AUTOMAÇÃO INTELIGENTE
        </motion.span>
      )}
    </motion.div>
  );

  // Render baseado na variante
  const renderLogo = () => {
    const containerClasses = cn(
      onClick && "cursor-pointer group",
      animated && "transition-all duration-300",
      className,
    );

    switch (variant) {
      case "icon":
        return (
          <div className={containerClasses}>
            <LogoIcon />
          </div>
        );

      case "compact":
        return (
          <motion.div
            className={cn(
              "flex items-center",
              sizeClasses.spacing,
              sizeClasses.container,
              themeClasses.background,
              "rounded-lg px-3 py-2",
              containerClasses,
            )}
            whileHover={animated ? { scale: 1.02 } : {}}
            transition={{ duration: 0.2 }}
          >
            <LogoIcon />
            <LogoText compact />
          </motion.div>
        );

      case "horizontal":
        return (
          <motion.div
            className={cn(
              "flex items-center",
              sizeClasses.spacing,
              containerClasses,
            )}
            whileHover={animated ? { scale: 1.02 } : {}}
            transition={{ duration: 0.2 }}
          >
            <LogoIcon />
            <LogoText compact />
          </motion.div>
        );

      case "hero":
        return (
          <motion.div
            className={cn(
              "flex flex-col items-center",
              sizeClasses.spacing,
              "p-8 rounded-2xl",
              themeClasses.background,
              containerClasses,
            )}
            initial={animated ? { opacity: 0, scale: 0.8 } : {}}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <LogoIcon />
            <LogoText />
          </motion.div>
        );

      case "full":
      default:
        return (
          <motion.div
            className={cn(
              "flex flex-col items-center",
              sizeClasses.spacing,
              containerClasses,
            )}
            whileHover={animated ? { scale: 1.05 } : {}}
            transition={{ duration: 0.3, type: "spring", damping: 15 }}
          >
            <LogoIcon />
            <LogoText />
          </motion.div>
        );
    }
  };

  return (
    <div
      className={cn("select-none", onClick && "cursor-pointer")}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {renderLogo()}
    </div>
  );
}

// Componente especializado para carregamento premium
export function KryonixLoadingPremium({
  size = "lg",
  theme = "gradient",
  message,
}: {
  size?: "md" | "lg" | "xl" | "hero";
  theme?: "light" | "dark" | "gradient" | "neon";
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8">
      <div className="relative">
        <KryonixLogoPremium
          variant="icon"
          size={size}
          theme={theme}
          animated
          glowEffect
          pulseEffect
          particleEffect
        />

        {/* Anel de carregamento */}
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

      {message && (
        <motion.p
          className="text-lg text-gray-600 text-center font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {message}
        </motion.p>
      )}

      {/* Barra de progresso animada */}
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
    </div>
  );
}

export default KryonixLogoPremium;
