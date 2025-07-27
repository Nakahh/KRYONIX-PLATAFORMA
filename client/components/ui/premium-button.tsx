import React, { forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const premiumButtonVariants = cva(
  // Base styles
  [
    "relative inline-flex items-center justify-center",
    "font-medium text-sm transition-all duration-300",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "transform-gpu will-change-transform",
    "select-none touch-manipulation",
  ],
  {
    variants: {
      variant: {
        // Padrão com gradiente brasileiro
        default: [
          "bg-gradient-to-r from-green-500 to-blue-500",
          "text-white shadow-lg",
          "hover:shadow-xl hover:shadow-green-500/25",
          "hover:from-green-600 hover:to-blue-600",
          "focus-visible:ring-green-500",
        ],
        // Botão PIX brasileiro
        pix: [
          "bg-gradient-to-r from-green-500 to-emerald-500",
          "text-white shadow-lg",
          "hover:shadow-xl hover:shadow-green-500/30",
          "hover:from-green-600 hover:to-emerald-600",
          "focus-visible:ring-green-500",
        ],
        // Botão WhatsApp
        whatsapp: [
          "bg-gradient-to-r from-green-500 via-green-600 to-green-500",
          "text-white shadow-lg",
          "hover:shadow-xl hover:shadow-green-500/30",
          "hover:from-green-600 hover:via-green-700 hover:to-green-600",
          "focus-visible:ring-green-500",
        ],
        // Botão destrutivo
        destructive: [
          "bg-gradient-to-r from-red-500 to-red-600",
          "text-white shadow-lg",
          "hover:shadow-xl hover:shadow-red-500/25",
          "hover:from-red-600 hover:to-red-700",
          "focus-visible:ring-red-500",
        ],
        // Botão outline premium
        outline: [
          "border-2 border-green-500 bg-transparent",
          "text-green-600 hover:text-white",
          "hover:bg-gradient-to-r hover:from-green-500 hover:to-blue-500",
          "hover:border-transparent hover:shadow-lg",
          "focus-visible:ring-green-500",
        ],
        // Botão secundário
        secondary: [
          "bg-gray-100 text-gray-900",
          "hover:bg-gray-200 hover:shadow-md",
          "focus-visible:ring-gray-400",
        ],
        // Botão fantasma
        ghost: [
          "text-gray-700 hover:text-gray-900",
          "hover:bg-gray-100 hover:shadow-sm",
          "focus-visible:ring-gray-400",
        ],
        // Botão apenas link
        link: [
          "text-green-600 underline-offset-4",
          "hover:underline hover:text-green-700",
          "focus-visible:ring-green-500",
        ],
        // Glassmorphism
        glass: [
          "bg-white/20 text-gray-800 backdrop-blur-xl",
          "border border-white/30 shadow-lg",
          "hover:bg-white/30 hover:shadow-xl",
          "focus-visible:ring-white/50",
        ],
        // Neumorphism
        neomorphic: [
          "bg-gray-100 text-gray-800",
          "shadow-[8px_8px_16px_#d1d5db,_-8px_-8px_16px_#ffffff]",
          "hover:shadow-[inset_4px_4px_8px_#d1d5db,_inset_-4px_-4px_8px_#ffffff]",
          "active:shadow-[inset_8px_8px_16px_#d1d5db,_inset_-8px_-8px_16px_#ffffff]",
          "focus-visible:ring-gray-400",
        ],
        // Holográfico
        holographic: [
          "bg-gradient-to-r from-purple-400 via-pink-500 to-red-500",
          "text-white shadow-lg bg-[length:200%_200%]",
          "hover:shadow-xl hover:shadow-purple-500/25",
          "animate-gradient-x",
          "focus-visible:ring-purple-500",
        ],
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-md",
        md: "h-9 px-4 py-2 text-sm rounded-lg",
        lg: "h-10 px-6 py-2 text-base rounded-lg",
        xl: "h-12 px-8 py-3 text-lg rounded-xl",
        "2xl": "h-14 px-10 py-4 text-xl rounded-2xl",
        icon: "h-9 w-9 rounded-lg",
        "icon-sm": "h-8 w-8 rounded-md",
        "icon-lg": "h-10 w-10 rounded-lg",
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
      elevation: {
        none: "shadow-none",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
        xl: "shadow-xl",
        "2xl": "shadow-2xl",
        glow: "shadow-lg shadow-current/25",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      fullWidth: false,
      elevation: "md",
    },
  },
);

// Animações de micro-interação
const buttonAnimations = {
  // Estado normal
  rest: {
    scale: 1,
    y: 0,
    rotateX: 0,
    rotateY: 0,
  },
  // Hover
  hover: {
    scale: 1.02,
    y: -2,
    rotateX: 5,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
  // Click/Tap
  tap: {
    scale: 0.98,
    y: 0,
    rotateX: 0,
    transition: {
      type: "spring",
      stiffness: 600,
      damping: 15,
    },
  },
  // Loading
  loading: {
    scale: 1,
    transition: {
      repeat: Infinity,
      duration: 2,
      ease: "easeInOut",
    },
  },
};

// Efeito ripple
const RippleEffect = ({ children }: { children: React.ReactNode }) => {
  const [ripples, setRipples] = React.useState<
    Array<{ x: number; y: number; id: number }>
  >([]);

  const addRipple = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);

    // Remove ripple após animação
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
    }, 600);
  };

  return (
    <div className="relative overflow-hidden" onClick={addRipple}>
      {children}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
    </div>
  );
};

// Interface do componente
export interface PremiumButtonProps
  extends Omit<HTMLMotionProps<"button">, "size">,
    VariantProps<typeof premiumButtonVariants> {
  loading?: boolean;
  ripple?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  loadingText?: string;
  children?: React.ReactNode;
}

const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      elevation,
      loading = false,
      ripple = true,
      icon,
      iconPosition = "left",
      loadingText,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    const buttonContent = (
      <>
        {/* Loading state */}
        {loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            {loadingText && <span>{loadingText}</span>}
          </motion.div>
        )}

        {/* Conteúdo normal */}
        <motion.div
          className="flex items-center justify-center gap-2"
          animate={{ opacity: loading ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {icon && iconPosition === "left" && (
            <span className="flex-shrink-0">{icon}</span>
          )}
          {children && <span>{children}</span>}
          {icon && iconPosition === "right" && (
            <span className="flex-shrink-0">{icon}</span>
          )}
        </motion.div>
      </>
    );

    const ButtonComponent = (
      <motion.button
        ref={ref}
        className={cn(
          premiumButtonVariants({ variant, size, fullWidth, elevation }),
          className,
        )}
        disabled={isDisabled}
        variants={buttonAnimations}
        initial="rest"
        whileHover={!isDisabled ? "hover" : "rest"}
        whileTap={!isDisabled ? "tap" : "rest"}
        style={{ transformStyle: "preserve-3d" }}
        {...props}
      >
        {buttonContent}
      </motion.button>
    );

    // Aplicar efeito ripple se habilitado
    if (ripple && !isDisabled) {
      return <RippleEffect>{ButtonComponent}</RippleEffect>;
    }

    return ButtonComponent;
  },
);

PremiumButton.displayName = "PremiumButton";

export { PremiumButton, premiumButtonVariants };
export default PremiumButton;
