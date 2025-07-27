import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useWhiteLabel,
  useBranding,
  useIsWhiteLabel,
} from "./WhiteLabelProvider";
import { KryonixLogo } from "@/components/brand/KryonixLogo";
import { cn } from "@/lib/utils";

// Logo com branding automático
interface BrandedLogoProps {
  variant?: "full" | "icon" | "compact" | "text";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  animated?: boolean;
}

export function BrandedLogo({
  variant = "full",
  size = "md",
  className,
  animated = false,
}: BrandedLogoProps) {
  const { logoUrl, companyName } = useBranding();
  const isWhiteLabel = useIsWhiteLabel();

  if (isWhiteLabel && logoUrl) {
    const sizeClasses = {
      xs: "h-6",
      sm: "h-8",
      md: "h-10",
      lg: "h-12",
      xl: "h-16",
      "2xl": "h-20",
    };

    return (
      <div className={cn("flex items-center", className)}>
        <img
          src={logoUrl}
          alt={`${companyName} Logo`}
          className={cn(
            sizeClasses[size],
            "w-auto object-contain",
            animated && "transition-transform hover:scale-105",
          )}
        />
        {variant === "full" && (
          <span className="ml-2 font-semibold text-lg text-foreground">
            {companyName}
          </span>
        )}
      </div>
    );
  }

  // Fallback para logo padrão KRYONIX
  return (
    <KryonixLogo
      variant={variant}
      size={size}
      className={className}
      animated={animated}
    />
  );
}

// Botão com cores de marca
interface BrandedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "accent"
    | "default"
    | "outline"
    | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
}

export function BrandedButton({
  variant = "primary",
  size = "md",
  children,
  className,
  ...props
}: BrandedButtonProps) {
  const { primaryColor, secondaryColor } = useBranding();
  const isWhiteLabel = useIsWhiteLabel();

  const getVariantStyles = () => {
    if (!isWhiteLabel) {
      return ""; // Usar estilos padrão do shadcn/ui
    }

    switch (variant) {
      case "primary":
        return {
          backgroundColor: primaryColor,
          borderColor: primaryColor,
          color: "white",
        };
      case "secondary":
        return {
          backgroundColor: secondaryColor,
          borderColor: secondaryColor,
          color: "white",
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderColor: primaryColor,
          color: primaryColor,
        };
      default:
        return {};
    }
  };

  const customStyles = getVariantStyles();

  return (
    <Button
      variant={isWhiteLabel ? "default" : (variant as any)}
      size={size}
      style={customStyles}
      className={cn(
        isWhiteLabel && variant === "primary" && "hover:opacity-90",
        isWhiteLabel && variant === "secondary" && "hover:opacity-90",
        isWhiteLabel && variant === "outline" && "hover:bg-opacity-10",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

// Card com tema de marca
interface BrandedCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "primary" | "secondary";
  headerColor?: boolean;
}

export function BrandedCard({
  children,
  className,
  variant = "default",
  headerColor = false,
}: BrandedCardProps) {
  const { primaryColor, secondaryColor } = useBranding();
  const isWhiteLabel = useIsWhiteLabel();

  const getCardStyles = () => {
    if (!isWhiteLabel || variant === "default") {
      return {};
    }

    switch (variant) {
      case "primary":
        return {
          borderColor: primaryColor,
          boxShadow: `0 4px 6px -1px ${primaryColor}20`,
        };
      case "secondary":
        return {
          borderColor: secondaryColor,
          boxShadow: `0 4px 6px -1px ${secondaryColor}20`,
        };
      default:
        return {};
    }
  };

  const customStyles = getCardStyles();

  return (
    <Card
      style={customStyles}
      className={cn(
        isWhiteLabel && variant !== "default" && "border-2",
        className,
      )}
    >
      {children}
    </Card>
  );
}

// Badge com cores de marca
interface BrandedBadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "accent" | "default" | "outline";
  className?: string;
}

export function BrandedBadge({
  children,
  variant = "primary",
  className,
}: BrandedBadgeProps) {
  const { primaryColor, secondaryColor } = useBranding();
  const isWhiteLabel = useIsWhiteLabel();

  const getBadgeStyles = () => {
    if (!isWhiteLabel) {
      return {};
    }

    switch (variant) {
      case "primary":
        return {
          backgroundColor: primaryColor,
          color: "white",
        };
      case "secondary":
        return {
          backgroundColor: secondaryColor,
          color: "white",
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderColor: primaryColor,
          color: primaryColor,
          border: `1px solid ${primaryColor}`,
        };
      default:
        return {};
    }
  };

  const customStyles = getBadgeStyles();

  return (
    <Badge
      variant={isWhiteLabel ? "default" : (variant as any)}
      style={customStyles}
      className={className}
    >
      {children}
    </Badge>
  );
}

// Header com branding
interface BrandedHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

export function BrandedHeader({
  title,
  subtitle,
  action,
  className,
  gradient = false,
}: BrandedHeaderProps) {
  const { primaryColor, secondaryColor } = useBranding();
  const isWhiteLabel = useIsWhiteLabel();

  const getHeaderStyles = () => {
    if (!isWhiteLabel || !gradient) {
      return {};
    }

    return {
      background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
      color: "white",
    };
  };

  const customStyles = getHeaderStyles();

  return (
    <div
      style={customStyles}
      className={cn(
        "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-lg",
        gradient && "text-white",
        !gradient && "bg-background",
        className,
      )}
    >
      <div className="space-y-1">
        <h1
          className={cn(
            "text-2xl font-bold",
            gradient ? "text-white" : "text-foreground",
          )}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={cn(
              "text-sm",
              gradient ? "text-white/80" : "text-muted-foreground",
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// Footer com branding
interface BrandedFooterProps {
  className?: string;
  showPoweredBy?: boolean;
}

export function BrandedFooter({
  className,
  showPoweredBy,
}: BrandedFooterProps) {
  const { companyName, hidePoweredBy, supportEmail } = useBranding();
  const isWhiteLabel = useIsWhiteLabel();
  const currentYear = new Date().getFullYear();

  const shouldShowPoweredBy = showPoweredBy !== false && !hidePoweredBy;

  return (
    <footer className={cn("border-t bg-background px-6 py-4", className)}>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <span>
            © {currentYear} {isWhiteLabel ? companyName : "KRYONIX"}. Todos os
            direitos reservados.
          </span>
          {isWhiteLabel && <span className="hidden sm:inline">•</span>}
          <a
            href={`mailto:${supportEmail}`}
            className="hover:text-foreground transition-colors"
          >
            {supportEmail}
          </a>
        </div>

        {shouldShowPoweredBy && (
          <div className="flex items-center gap-2">
            <span>Powered by</span>
            <BrandedLogo variant="compact" size="xs" />
          </div>
        )}
      </div>
    </footer>
  );
}

// Loading screen com branding
interface BrandedLoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export function BrandedLoading({
  message = "Carregando...",
  fullScreen = false,
}: BrandedLoadingProps) {
  const { companyName, primaryColor } = useBranding();

  const containerClass = fullScreen
    ? "fixed inset-0 bg-background flex items-center justify-center z-50"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClass}>
      <div className="text-center space-y-4">
        <div className="relative">
          <BrandedLogo size="lg" animated />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-current animate-spin"
            style={{ borderTopColor: primaryColor }}
          />
        </div>
        <div className="space-y-2">
          <p className="text-lg font-medium">{message}</p>
          <p className="text-sm text-muted-foreground">
            {companyName} • Plataforma de Automação
          </p>
        </div>
      </div>
    </div>
  );
}

// Error boundary com branding
interface BrandedErrorProps {
  error: Error;
  reset?: () => void;
}

export function BrandedError({ error, reset }: BrandedErrorProps) {
  const { companyName, supportEmail } = useBranding();

  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="text-center space-y-6 max-w-md">
        <BrandedLogo size="lg" />

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            Ops! Algo deu errado
          </h2>
          <p className="text-muted-foreground">
            Encontramos um problema inesperado em sua plataforma {companyName}.
          </p>
        </div>

        <div className="bg-muted p-4 rounded-lg text-left">
          <p className="text-sm font-mono text-muted-foreground">
            {error.message}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {reset && (
            <BrandedButton onClick={reset} variant="primary">
              Tentar novamente
            </BrandedButton>
          )}
          <BrandedButton
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Recarregar página
          </BrandedButton>
        </div>

        <p className="text-sm text-muted-foreground">
          Se o problema persistir, entre em contato:{" "}
          <a
            href={`mailto:${supportEmail}`}
            className="text-primary hover:underline"
          >
            {supportEmail}
          </a>
        </p>
      </div>
    </div>
  );
}

// Theme switcher com branding
export function BrandedThemeSwitcher() {
  const { config, updateConfig } = useWhiteLabel();
  const isWhiteLabel = useIsWhiteLabel();

  if (!isWhiteLabel || !config) return null;

  const handleThemeChange = (theme: "light" | "dark" | "auto") => {
    updateConfig({ theme });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Tema:</span>
      <div className="flex rounded-lg border">
        {(["light", "dark", "auto"] as const).map((theme) => (
          <button
            key={theme}
            onClick={() => handleThemeChange(theme)}
            className={cn(
              "px-3 py-1 text-xs rounded-md transition-colors",
              config.theme === theme
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted",
            )}
          >
            {theme === "light" ? "☀️" : theme === "dark" ? "🌙" : "🔄"}
          </button>
        ))}
      </div>
    </div>
  );
}

// Exports já estão definidos nas funções individuais acima
