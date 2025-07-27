// Loading States com identidade visual KRYONIX
// Componentes de carregamento que reforçam a marca

import React from "react";
import { cn } from "@/lib/utils";
import { KryonixLogo, KryonixLoadingLogo } from "./KryonixLogo";

interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl";
  message?: string;
  className?: string;
  fullScreen?: boolean;
}

// Loading principal com logo KRYONIX
export function KryonixLoading({
  size = "lg",
  message = "Carregando...",
  className,
  fullScreen = false,
}: LoadingProps) {
  const containerClasses = fullScreen
    ? "fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
    : "flex items-center justify-center py-12";

  return (
    <div className={cn(containerClasses, className)}>
      <div className="text-center">
        <KryonixLoadingLogo size={size} message={message} />
      </div>
    </div>
  );
}

// Loading para páginas inteiras
export function PageLoading({
  message = "Carregando página...",
}: {
  message?: string;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative">
          <KryonixLogo
            variant="icon"
            size="2xl"
            theme="gradient"
            animated
            className="animate-pulse"
          />

          {/* Círculos de carregamento */}
          <div className="absolute inset-0 animate-spin">
            <div className="h-full w-full rounded-full border-4 border-transparent border-t-kryonix-blue border-r-kryonix-green opacity-60"></div>
          </div>
          <div
            className="absolute inset-2 animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "3s" }}
          >
            <div className="h-full w-full rounded-full border-2 border-transparent border-b-kryonix-green border-l-kryonix-blue opacity-40"></div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">KRYONIX</h3>
          <p className="text-gray-600 animate-pulse">{message}</p>
        </div>

        {/* Barra de progresso */}
        <div className="w-64 mx-auto">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-kryonix-blue to-kryonix-green rounded-full animate-pulse"
              style={{
                animation: "loading-bar 2s ease-in-out infinite",
                width: "60%",
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading para componentes específicos
export function ComponentLoading({
  message = "Carregando...",
  compact = false,
  className,
}: {
  message?: string;
  compact?: boolean;
  className?: string;
}) {
  if (compact) {
    return (
      <div
        className={cn("flex items-center justify-center gap-3 py-4", className)}
      >
        <div className="relative">
          <KryonixLogo variant="icon" size="sm" theme="gradient" />
          <div className="absolute inset-0 animate-spin">
            <div className="h-full w-full rounded-full border-2 border-transparent border-t-kryonix-blue"></div>
          </div>
        </div>
        <span className="text-sm text-gray-600 animate-pulse">{message}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-8",
        className,
      )}
    >
      <KryonixLoadingLogo size="md" />
      <p className="text-gray-600 animate-pulse">{message}</p>
    </div>
  );
}

// Loading para cards/widgets
export function CardLoading({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 bg-white rounded-lg border shadow-sm", className)}>
      <div className="animate-pulse space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-kryonix-blue/20 rounded-lg"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-16"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="h-2 bg-gray-200 rounded-full w-full">
          <div className="h-full bg-gradient-to-r from-kryonix-blue to-kryonix-green rounded-full w-3/4 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

// Loading para tabelas
export function TableLoading({
  rows = 5,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="animate-pulse flex items-center gap-4 p-4 bg-white rounded-lg border"
        >
          <div className="w-10 h-10 bg-kryonix-blue/20 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="w-20 h-8 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );
}

// Loading para gráficos
export function ChartLoading({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 bg-white rounded-lg border shadow-sm", className)}>
      <div className="animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-gray-200 rounded w-32"></div>
          <div className="w-6 h-6 bg-kryonix-blue/20 rounded"></div>
        </div>
        <div className="h-64 bg-gradient-to-t from-kryonix-blue/10 to-kryonix-green/10 rounded-lg flex items-end justify-center gap-2 p-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="bg-kryonix-blue/30 rounded-t animate-pulse"
              style={{
                width: "20px",
                height: `${20 + i * 10}px`,
                animationDelay: `${i * 0.1}s`,
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Loading para dados em tempo real
export function LiveDataLoading({
  title = "Dados em Tempo Real",
  className,
}: {
  title?: string;
  className?: string;
}) {
  return (
    <div className={cn("p-4 bg-white rounded-lg border shadow-sm", className)}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 bg-kryonix-green rounded-full animate-pulse"></div>
        <span className="text-sm font-medium text-gray-700">{title}</span>
      </div>

      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-2 bg-gray-50 rounded"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-kryonix-blue rounded-full animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Loading para integração de APIs
export function APIConnectionLoading({
  service,
  status = "Conectando...",
}: {
  service: string;
  status?: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-lg border shadow-sm">
      <div className="relative">
        <div className="w-8 h-8 bg-kryonix-blue/20 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-kryonix-blue rounded animate-pulse"></div>
        </div>
        <div className="absolute -inset-1 border-2 border-kryonix-blue/30 rounded-lg animate-ping"></div>
      </div>

      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{service}</h4>
        <p className="text-sm text-gray-600 animate-pulse">{status}</p>
      </div>

      <div className="flex gap-1">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="w-1 h-4 bg-kryonix-blue rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          ></div>
        ))}
      </div>
    </div>
  );
}

// CSS para animações customizadas (adicionar ao global.css)
const customStyles = `
@keyframes loading-bar {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(0%); }
  100% { transform: translateX(100%); }
}
`;

export { customStyles };
export default KryonixLoading;
