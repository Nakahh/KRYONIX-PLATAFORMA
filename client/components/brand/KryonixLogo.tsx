// Componente de logo KRYONIX responsivo e consistente
// Implementa a identidade visual da marca em toda a plataforma

import React from "react";
import { cn } from "@/lib/utils";

interface KryonixLogoProps {
  variant?: "full" | "icon" | "compact" | "text";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  theme?: "light" | "dark" | "gradient" | "white";
  animated?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeConfig = {
  xs: { icon: "w-4 h-4", text: "text-xs", container: "h-6" },
  sm: { icon: "w-6 h-6", text: "text-sm", container: "h-8" },
  md: { icon: "w-8 h-8", text: "text-base", container: "h-10" },
  lg: { icon: "w-12 h-12", text: "text-lg", container: "h-14" },
  xl: { icon: "w-16 h-16", text: "text-xl", container: "h-20" },
  "2xl": { icon: "w-24 h-24", text: "text-2xl", container: "h-28" },
};

const themeConfig = {
  light: {
    icon: "text-kryonix-blue",
    text: "text-gray-900",
    accent: "text-kryonix-green",
  },
  dark: {
    icon: "text-kryonix-blue",
    text: "text-white",
    accent: "text-kryonix-green",
  },
  gradient: {
    icon: "text-transparent bg-gradient-to-r from-kryonix-blue to-kryonix-green bg-clip-text",
    text: "text-transparent bg-gradient-to-r from-kryonix-blue to-kryonix-green bg-clip-text",
    accent: "text-kryonix-green",
  },
  white: {
    icon: "text-white",
    text: "text-white",
    accent: "text-white",
  },
};

export function KryonixLogo({
  variant = "full",
  size = "md",
  theme = "light",
  animated = false,
  className,
  onClick,
}: KryonixLogoProps) {
  const sizeClasses = sizeConfig[size];
  const themeClasses = themeConfig[theme];

  // SVG da logo KRYONIX (baseado na imagem fornecida)
  const LogoIcon = () => (
    <div
      className={cn(
        sizeClasses.icon,
        "relative flex items-center justify-center",
        animated && "transition-all duration-300 hover:scale-110",
        className,
      )}
    >
      <svg
        viewBox="0 0 200 200"
        className={cn("w-full h-full", themeClasses.icon)}
        fill="currentColor"
      >
        {/* Círculo externo com gradiente verde */}
        <circle
          cx="100"
          cy="100"
          r="95"
          fill="none"
          stroke="#22c55e"
          strokeWidth="6"
          className="opacity-30"
        />

        {/* Símbolo geométrico central */}
        <g transform="translate(100, 100)">
          {/* Forma geométrica entrelacada - representando conexão e automação */}
          <path
            d="M-40,-40 L-20,-40 L-20,-20 L0,-20 L0,0 L20,0 L20,20 L40,20 L40,40 L20,40 L20,20 L0,20 L0,0 L-20,0 L-20,-20 L-40,-20 Z"
            fill="#0ea5e9"
            className="drop-shadow-sm"
          />
          <path
            d="M40,-40 L20,-40 L20,-20 L0,-20 L0,0 L-20,0 L-20,20 L-40,20 L-40,40 L-20,40 L-20,20 L0,20 L0,0 L20,0 L20,-20 L40,-20 Z"
            fill="#22c55e"
            className="opacity-80"
          />

          {/* Detalhe central que representa IA/conexão */}
          <circle
            cx="0"
            cy="0"
            r="8"
            fill="#0ea5e9"
            className="animate-pulse"
          />
          <circle cx="0" cy="0" r="4" fill="#22c55e" />
        </g>
      </svg>
    </div>
  );

  // Texto KRYONIX estilizado
  const LogoText = ({ compact = false }: { compact?: boolean }) => (
    <span
      className={cn(
        sizeClasses.text,
        themeClasses.text,
        "font-bold tracking-tight",
        animated && "transition-all duration-300",
      )}
    >
      {compact ? "KRYONIX" : "KRYONIX"}
    </span>
  );

  // Render baseado na variante
  const renderLogo = () => {
    switch (variant) {
      case "icon":
        return <LogoIcon />;

      case "text":
        return <LogoText />;

      case "compact":
        return (
          <div
            className={cn(
              "flex items-center gap-2",
              sizeClasses.container,
              onClick && "cursor-pointer",
            )}
          >
            <LogoIcon />
            <LogoText compact />
          </div>
        );

      case "full":
      default:
        return (
          <div
            className={cn(
              "flex flex-col items-center gap-1",
              sizeClasses.container,
              onClick && "cursor-pointer",
            )}
          >
            <LogoIcon />
            <LogoText />
          </div>
        );
    }
  };

  return (
    <div
      className={cn(
        "select-none",
        animated && "transition-all duration-300",
        onClick && "cursor-pointer hover:opacity-80",
        className,
      )}
      onClick={onClick}
    >
      {renderLogo()}
    </div>
  );
}

// Componente especializado para loading com logo
export function KryonixLoadingLogo({
  size = "lg",
  message,
}: {
  size?: "md" | "lg" | "xl";
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <KryonixLogo
          variant="icon"
          size={size}
          theme="gradient"
          animated
          className="animate-pulse"
        />
        <div className="absolute inset-0 animate-spin">
          <div className="h-full w-full rounded-full border-2 border-transparent border-t-kryonix-blue border-r-kryonix-green"></div>
        </div>
      </div>
      {message && (
        <p className="text-sm text-gray-600 text-center animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}

// Componente para favicon/PWA
export function KryonixFavicon() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <circle cx="100" cy="100" r="95" fill="#1f2937" />
      <circle
        cx="100"
        cy="100"
        r="85"
        fill="none"
        stroke="#22c55e"
        strokeWidth="4"
      />
      <g transform="translate(100, 100)">
        <path
          d="M-30,-30 L-15,-30 L-15,-15 L0,-15 L0,0 L15,0 L15,15 L30,15 L30,30 L15,30 L15,15 L0,15 L0,0 L-15,0 L-15,-15 L-30,-15 Z"
          fill="#0ea5e9"
        />
        <path
          d="M30,-30 L15,-30 L15,-15 L0,-15 L0,0 L-15,0 L-15,15 L-30,15 L-30,30 L-15,30 L-15,15 L0,15 L0,0 L15,0 L15,-15 L30,-15 Z"
          fill="#22c55e"
          opacity="0.8"
        />
        <circle cx="0" cy="0" r="6" fill="#0ea5e9" />
        <circle cx="0" cy="0" r="3" fill="#22c55e" />
      </g>
    </svg>
  );
}

export default KryonixLogo;
