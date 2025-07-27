import React, { forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const premiumCardVariants = cva(
  [
    "relative overflow-hidden transition-all duration-300",
    "transform-gpu will-change-transform",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  ],
  {
    variants: {
      variant: {
        // Card padrão premium
        default: [
          "bg-white border border-gray-200 shadow-lg",
          "hover:shadow-xl hover:shadow-gray-500/10",
          "focus-visible:ring-gray-400",
        ],
        // Glassmorphism
        glass: [
          "bg-white/20 backdrop-blur-xl border border-white/30",
          "shadow-lg shadow-black/5",
          "hover:bg-white/30 hover:shadow-xl hover:shadow-black/10",
          "focus-visible:ring-white/50",
        ],
        // Neumorphism
        neomorphic: [
          "bg-gray-100 border-0",
          "shadow-[8px_8px_16px_#d1d5db,_-8px_-8px_16px_#ffffff]",
          "hover:shadow-[12px_12px_24px_#d1d5db,_-12px_-12px_24px_#ffffff]",
          "focus-visible:ring-gray-400",
        ],
        // Card premium com gradiente sutil
        premium: [
          "bg-gradient-to-br from-white to-gray-50",
          "border border-gray-200 shadow-lg",
          "hover:shadow-xl hover:shadow-purple-500/10",
          "hover:from-purple-50/50 hover:to-blue-50/50",
          "focus-visible:ring-purple-400",
        ],
        // Card holográfico
        holographic: [
          "bg-gradient-to-r from-purple-400/10 via-pink-500/10 to-red-500/10",
          "border border-white/20 backdrop-blur-sm",
          "shadow-lg shadow-purple-500/20",
          "hover:shadow-xl hover:shadow-purple-500/30",
          "focus-visible:ring-purple-400",
        ],
        // Card de sucesso brasileiro
        success: [
          "bg-gradient-to-br from-green-50 to-emerald-50",
          "border border-green-200 shadow-lg",
          "hover:shadow-xl hover:shadow-green-500/20",
          "focus-visible:ring-green-400",
        ],
        // Card de warning
        warning: [
          "bg-gradient-to-br from-yellow-50 to-orange-50",
          "border border-yellow-200 shadow-lg",
          "hover:shadow-xl hover:shadow-yellow-500/20",
          "focus-visible:ring-yellow-400",
        ],
        // Card de erro
        error: [
          "bg-gradient-to-br from-red-50 to-pink-50",
          "border border-red-200 shadow-lg",
          "hover:shadow-xl hover:shadow-red-500/20",
          "focus-visible:ring-red-400",
        ],
      },
      size: {
        sm: "p-4 rounded-lg",
        md: "p-6 rounded-xl",
        lg: "p-8 rounded-2xl",
        xl: "p-10 rounded-3xl",
      },
      interactive: {
        true: "cursor-pointer",
        false: "",
      },
      elevation: {
        none: "shadow-none",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
        xl: "shadow-xl",
        "2xl": "shadow-2xl",
      },
      glow: {
        none: "",
        subtle: "hover:shadow-lg hover:shadow-current/10",
        medium: "hover:shadow-xl hover:shadow-current/20",
        strong: "hover:shadow-2xl hover:shadow-current/30",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      interactive: false,
      elevation: "lg",
      glow: "none",
    },
  },
);

// Animações de interação
const cardAnimations = {
  rest: {
    scale: 1,
    y: 0,
    rotateX: 0,
    rotateY: 0,
    z: 0,
  },
  hover: {
    scale: 1.02,
    y: -4,
    rotateX: 2,
    rotateY: 2,
    z: 50,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
  tap: {
    scale: 0.98,
    y: 0,
    rotateX: 0,
    rotateY: 0,
    z: 0,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 25,
    },
  },
};

// Componente de brilho de fundo
const ShineEffect = () => (
  <motion.div
    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 pointer-events-none"
    style={{ transform: "translateX(-100%)" }}
    whileHover={{
      opacity: [0, 1, 0],
      x: ["0%", "100%"],
      transition: {
        duration: 0.6,
        ease: "easeInOut",
      },
    }}
  />
);

// Componente de partículas flutuantes
const FloatingParticles = ({ variant }: { variant?: string }) => {
  if (variant !== "holographic" && variant !== "premium") return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-10, 10, -10],
            x: [-5, 5, -5],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Interface do componente
export interface PremiumCardProps
  extends Omit<HTMLMotionProps<"div">, "size">,
    VariantProps<typeof premiumCardVariants> {
  children?: React.ReactNode;
  shine?: boolean;
  particles?: boolean;
  borderGradient?: boolean;
}

const PremiumCard = forwardRef<HTMLDivElement, PremiumCardProps>(
  (
    {
      className,
      variant,
      size,
      interactive,
      elevation,
      glow,
      children,
      shine = false,
      particles = false,
      borderGradient = false,
      ...props
    },
    ref,
  ) => {
    // Determinar se deve usar animações
    const shouldAnimate = interactive;

    return (
      <motion.div
        ref={ref}
        className={cn(
          premiumCardVariants({ variant, size, interactive, elevation, glow }),
          borderGradient &&
            "relative border-2 border-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-[2px]",
          className,
        )}
        variants={shouldAnimate ? cardAnimations : undefined}
        initial="rest"
        whileHover={shouldAnimate ? "hover" : undefined}
        whileTap={shouldAnimate ? "tap" : undefined}
        style={{ transformStyle: "preserve-3d" }}
        {...props}
      >
        {/* Conteúdo principal */}
        <div
          className={cn(
            borderGradient && "bg-white rounded-[inherit] h-full w-full",
            borderGradient &&
              variant === "glass" &&
              "bg-white/20 backdrop-blur-xl",
          )}
        >
          {children}
        </div>

        {/* Efeitos visuais */}
        {shine && <ShineEffect />}
        {particles && <FloatingParticles variant={variant} />}

        {/* Bordas com gradiente animado */}
        {borderGradient && (
          <motion.div
            className="absolute inset-0 rounded-[inherit] p-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"
            style={{ zIndex: -1 }}
            animate={{
              background: [
                "linear-gradient(0deg, #8b5cf6, #ec4899, #ef4444)",
                "linear-gradient(90deg, #8b5cf6, #ec4899, #ef4444)",
                "linear-gradient(180deg, #8b5cf6, #ec4899, #ef4444)",
                "linear-gradient(270deg, #8b5cf6, #ec4899, #ef4444)",
                "linear-gradient(360deg, #8b5cf6, #ec4899, #ef4444)",
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}
      </motion.div>
    );
  },
);

PremiumCard.displayName = "PremiumCard";

// Componentes de Header e Content para facilitar uso
export const PremiumCardHeader = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={cn("mb-4", className)}>{children}</div>;

export const PremiumCardTitle = ({
  children,
  className,
  gradient = false,
}: {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}) => (
  <h3
    className={cn(
      "text-xl font-semibold leading-none tracking-tight",
      gradient &&
        "bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent",
      className,
    )}
  >
    {children}
  </h3>
);

export const PremiumCardDescription = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <p className={cn("text-sm text-gray-600 mt-2", className)}>{children}</p>;

export const PremiumCardContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={cn("", className)}>{children}</div>;

export const PremiumCardFooter = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("mt-4 flex items-center justify-between", className)}>
    {children}
  </div>
);

export { PremiumCard, premiumCardVariants };
export default PremiumCard;
