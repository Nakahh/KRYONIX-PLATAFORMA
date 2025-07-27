import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { premiumTokens } from "../../design-system/premium-tokens";

// ========================================
// LOADING NEURAL NETWORK
// ========================================
export const NeuralNetworkLoader = ({ className }: { className?: string }) => {
  const nodes = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: (i % 4) * 80 + 40,
    y: Math.floor(i / 4) * 60 + 30,
    connections: i < 8 ? [i + 4] : [],
  }));

  return (
    <div
      className={cn(
        "relative w-80 h-48 flex items-center justify-center",
        className,
      )}
    >
      <svg width="320" height="192" className="absolute">
        {/* Conexões */}
        {nodes.map((node) =>
          node.connections.map((targetId) => {
            const target = nodes[targetId];
            return (
              <motion.line
                key={`${node.id}-${targetId}`}
                x1={node.x}
                y1={node.y}
                x2={target.x}
                y2={target.y}
                stroke="url(#neuralGradient)"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 1,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              />
            );
          }),
        )}

        {/* Gradientes */}
        <defs>
          <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
          </linearGradient>
        </defs>
      </svg>

      {/* Nós */}
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          className="absolute w-4 h-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full shadow-lg"
          style={{ left: node.x - 8, top: node.y - 8 }}
          animate={{
            scale: [1, 1.3, 1],
            boxShadow: [
              "0 0 10px rgba(34, 197, 94, 0.5)",
              "0 0 20px rgba(59, 130, 246, 0.7)",
              "0 0 10px rgba(139, 92, 246, 0.5)",
            ],
          }}
          transition={{
            duration: 2,
            delay: node.id * 0.1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="mt-16">
        <motion.p
          className="text-center text-sm font-medium bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          IA processando dados...
        </motion.p>
      </div>
    </div>
  );
};

// ========================================
// LOADING HOLOGRÁFICO
// ========================================
export const HolographicLoader = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "relative w-32 h-32 flex items-center justify-center",
        className,
      )}
    >
      {/* Anéis holográficos */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute border-2 rounded-full"
          style={{
            width: 80 + i * 20,
            height: 80 + i * 20,
            borderImage: `linear-gradient(45deg, #ff006e, #8338ec, #3a86ff, #06ffa5, #ffbe0b) 1`,
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Centro pulsante */}
      <motion.div
        className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

// ========================================
// LOADING ONDAS BRASILEIRAS
// ========================================
export const BrazilianWaveLoader = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn("flex items-center justify-center space-x-2", className)}
    >
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="w-3 h-12 bg-gradient-to-t from-green-500 to-yellow-400 rounded-full"
          animate={{
            scaleY: [0.5, 1, 0.5],
            backgroundColor: [
              "#22c55e", // Verde
              "#eab308", // Amarelo
              "#0ea5e9", // Azul
              "#22c55e", // Verde novamente
            ],
          }}
          transition={{
            duration: 1.2,
            delay: i * 0.1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// ========================================
// LOADING PROGRESSO ORGÂNICO
// ========================================
export const OrganicProgressLoader = ({
  progress = 0,
  className,
  showPercentage = true,
}: {
  progress?: number;
  className?: string;
  showPercentage?: boolean;
}) => {
  return (
    <div className={cn("w-full max-w-md", className)}>
      <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
        {/* Fundo com shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: [-100, 300] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Barra de progresso principal */}
        <motion.div
          className="h-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-full relative"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            type: "spring",
            stiffness: 100,
          }}
        >
          {/* Efeito brilho */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
            animate={{ x: [-50, 200] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </motion.div>

        {/* Partículas flutuantes */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-80"
            style={{
              left: `${Math.min(progress - 5 + i * 2, 95)}%`,
              top: "25%",
            }}
            animate={{
              y: [-2, 2, -2],
              opacity: [0.8, 0.4, 0.8],
            }}
            transition={{
              duration: 1,
              delay: i * 0.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {showPercentage && (
        <motion.div
          className="text-center mt-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            {Math.round(progress)}%
          </span>
          <p className="text-sm text-gray-600 mt-1">Configurando KRYONIX...</p>
        </motion.div>
      )}
    </div>
  );
};

// ========================================
// LOADING SKELETON SHIMMER
// ========================================
export const ShimmerSkeleton = ({
  className,
  lines = 3,
  avatar = false,
}: {
  className?: string;
  lines?: number;
  avatar?: boolean;
}) => {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="flex space-x-4">
        {avatar && (
          <div className="relative w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
              animate={{ x: [-48, 96] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>
        )}

        <div className="flex-1 space-y-3">
          {[...Array(lines)].map((_, i) => (
            <div
              key={i}
              className="relative h-4 bg-gray-200 rounded overflow-hidden"
              style={{ width: i === lines - 1 ? "75%" : "100%" }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                animate={{ x: [-100, 200] }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ========================================
// LOADING CUBO 3D
// ========================================
export const Cube3DLoader = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn("relative w-20 h-20", className)}
      style={{ perspective: "200px" }}
    >
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateX: 360, rotateY: 360 }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {/* Faces do cubo */}
        {[
          { bg: "bg-green-500", transform: "rotateY(0deg) translateZ(10px)" },
          { bg: "bg-blue-500", transform: "rotateY(90deg) translateZ(10px)" },
          {
            bg: "bg-purple-500",
            transform: "rotateY(180deg) translateZ(10px)",
          },
          {
            bg: "bg-yellow-500",
            transform: "rotateY(-90deg) translateZ(10px)",
          },
          { bg: "bg-red-500", transform: "rotateX(90deg) translateZ(10px)" },
          { bg: "bg-pink-500", transform: "rotateX(-90deg) translateZ(10px)" },
        ].map((face, i) => (
          <div
            key={i}
            className={`absolute w-full h-full ${face.bg} opacity-80`}
            style={{ transform: face.transform }}
          />
        ))}
      </motion.div>
    </div>
  );
};

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
export interface PremiumLoadingProps {
  type?: "neural" | "holographic" | "wave" | "progress" | "shimmer" | "cube3d";
  className?: string;
  progress?: number;
  showPercentage?: boolean;
  lines?: number;
  avatar?: boolean;
  message?: string;
}

export const PremiumLoading = ({
  type = "neural",
  className,
  progress = 0,
  showPercentage = true,
  lines = 3,
  avatar = false,
  message,
}: PremiumLoadingProps) => {
  const renderLoader = () => {
    switch (type) {
      case "neural":
        return <NeuralNetworkLoader className={className} />;
      case "holographic":
        return <HolographicLoader className={className} />;
      case "wave":
        return <BrazilianWaveLoader className={className} />;
      case "progress":
        return (
          <OrganicProgressLoader
            progress={progress}
            className={className}
            showPercentage={showPercentage}
          />
        );
      case "shimmer":
        return (
          <ShimmerSkeleton
            className={className}
            lines={lines}
            avatar={avatar}
          />
        );
      case "cube3d":
        return <Cube3DLoader className={className} />;
      default:
        return <NeuralNetworkLoader className={className} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      {renderLoader()}
      {message && (
        <motion.p
          className="mt-4 text-center text-sm font-medium text-gray-600"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};

export default PremiumLoading;
