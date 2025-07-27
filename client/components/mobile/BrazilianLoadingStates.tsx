import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Sparkles,
  TrendingUp,
  Zap,
  Heart,
  Star,
  MessageCircle,
  CreditCard,
  Bot,
  Trophy,
  Target,
  Rocket,
} from "lucide-react";
import { getMotivationalMessage } from "../../lib/brazilian-formatters";

/**
 * Loading States Motivacionais Brasileiros
 * KRYONIX - Mensagens contextuais para manter engajamento
 */

interface BrazilianLoadingProps {
  type?:
    | "default"
    | "success"
    | "revenue"
    | "whatsapp"
    | "automation"
    | "pix"
    | "ai"
    | "onboarding";
  message?: string;
  showProgress?: boolean;
  progress?: number;
  duration?: number;
  size?: "sm" | "md" | "lg";
  showMotivation?: boolean;
}

const loadingMessages = {
  default: [
    "💪 Carregando seu sucesso...",
    "🚀 Preparando algo incrível...",
    "⭐ Construindo o futuro do seu negócio...",
    "🎯 Organizando dados para você...",
    "🔥 Turbinando sua plataforma...",
  ],
  success: [
    "🎉 Parabéns! Você está arrasando!",
    "✨ Seu negócio está crescendo!",
    "🏆 Mais uma conquista desbloqueada!",
    "💎 Excelente trabalho, empreendedor!",
    "🚀 Você está no caminho certo!",
  ],
  revenue: [
    "💰 Calculando seu faturamento...",
    "📈 Analisando receita em tempo real...",
    "💸 Contando seus lucros...",
    "🤑 Atualizando métricas de vendas...",
    "💎 Processando PIX recebidos...",
  ],
  whatsapp: [
    "📱 Conectando ao WhatsApp Business...",
    "💬 Sincronizando conversas...",
    "🔗 Estabelecendo conexão segura...",
    "📊 Carregando métricas de mensagens...",
    "🚀 Turbinando seu atendimento...",
  ],
  automation: [
    "⚙️ Ativando automações inteligentes...",
    "🤖 Preparando IA para trabalhar...",
    "🔄 Configurando fluxos de trabalho...",
    "⚡ Otimizando processos...",
    "🎯 Automatizando seu sucesso...",
  ],
  pix: [
    "💸 Configurando PIX instantâneo...",
    "🇧🇷 Conectando com sistema bancário...",
    "⚡ Ativando recebimentos automáticos...",
    "💰 Preparando chave PIX...",
    "🚀 Liberando pagamentos express...",
  ],
  ai: [
    "🤖 Ativando inteligência artificial...",
    "🧠 Carregando modelos brasileiros...",
    "⚡ Configurando IA contextual...",
    "🎯 Otimizando para seu negócio...",
    "✨ Preparando assistente inteligente...",
  ],
  onboarding: [
    "🏗️ Construindo sua plataforma...",
    "🎯 Configurando para o Brasil...",
    "💪 Preparando automações...",
    "🚀 Quase lá, empreendedor!",
    "⭐ Finalizando configurações...",
  ],
};

const motivationalQuotes = [
  '"Grandes negócios começam com pequenas automações." 🚀',
  '"No Brasil, quem não se adapta fica para trás." 🇧🇷',
  '"WhatsApp + PIX + IA = Fórmula do sucesso!" 💡',
  '"Cada minuto economizado é dinheiro ganho." ⏰',
  '"Tecnologia a favor do empreendedor brasileiro." 🎯',
  '"Sua automação está gerando resultados agora!" 📈',
  '"PIX revolucionou, automação vai revolucionar você!" ⚡',
];

const icons = {
  default: Loader2,
  success: Sparkles,
  revenue: TrendingUp,
  whatsapp: MessageCircle,
  automation: Zap,
  pix: CreditCard,
  ai: Bot,
  onboarding: Star,
};

const gradients = {
  default: "from-blue-500 to-purple-500",
  success: "from-emerald-500 to-green-500",
  revenue: "from-yellow-500 to-orange-500",
  whatsapp: "from-green-500 to-emerald-500",
  automation: "from-purple-500 to-violet-500",
  pix: "from-blue-500 to-cyan-500",
  ai: "from-orange-500 to-red-500",
  onboarding: "from-indigo-500 to-purple-500",
};

export function BrazilianLoadingState({
  type = "default",
  message,
  showProgress = false,
  progress = 0,
  duration = 3000,
  size = "md",
  showMotivation = true,
}: BrazilianLoadingProps) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
  const [currentQuote, setCurrentQuote] = useState("");

  const Icon = icons[type];
  const messages = message ? [message] : loadingMessages[type];
  const gradient = gradients[type];

  const sizeClasses = {
    sm: { icon: "w-6 h-6", container: "p-4", text: "text-sm" },
    md: { icon: "w-8 h-8", container: "p-6", text: "text-base" },
    lg: { icon: "w-12 h-12", container: "p-8", text: "text-lg" },
  };

  const classes = sizeClasses[size];

  useEffect(() => {
    setCurrentMessage(messages[0]);
    setCurrentQuote(
      motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)],
    );

    if (messages.length > 1) {
      const interval = setInterval(() => {
        setMessageIndex((prev) => {
          const newIndex = (prev + 1) % messages.length;
          setCurrentMessage(messages[newIndex]);
          return newIndex;
        });
      }, duration / messages.length);

      return () => clearInterval(interval);
    }
  }, [messages, duration]);

  // Atualizar frase motivacional
  useEffect(() => {
    if (showMotivation) {
      const interval = setInterval(() => {
        setCurrentQuote(
          motivationalQuotes[
            Math.floor(Math.random() * motivationalQuotes.length)
          ],
        );
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [showMotivation]);

  return (
    <div
      className={`flex flex-col items-center justify-center ${classes.container}`}
    >
      {/* Ícone Principal com Animação */}
      <div className="relative mb-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className={`${classes.icon} relative z-10`}
        >
          <Icon className={`${classes.icon} text-white`} />
        </motion.div>

        {/* Background gradient pulsante */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-full blur-md opacity-60`}
        />

        {/* Círculo base */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-full flex items-center justify-center`}
        />
      </div>

      {/* Partículas Animadas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
            style={{
              left: `${20 + i * 10}%`,
              top: "60%",
            }}
          />
        ))}
      </div>

      {/* Mensagem Principal */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMessage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className={`${classes.text} font-semibold text-gray-900 text-center mb-2`}
        >
          {currentMessage}
        </motion.div>
      </AnimatePresence>

      {/* Frase Motivacional */}
      {showMotivation && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuote}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8 }}
            className="text-sm text-gray-600 text-center italic max-w-xs"
          >
            {currentQuote}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Barra de Progresso */}
      {showProgress && (
        <div className="w-full max-w-xs mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Progresso</span>
            <span className="text-sm font-medium text-gray-900">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className={`h-2 bg-gradient-to-r ${gradient} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Pulse effect */}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
        }}
      />
    </div>
  );
}

// Skeleton loader brasileiro
export function BrazilianSkeleton({
  className = "",
  variant = "default",
  ...props
}: {
  className?: string;
  variant?: "default" | "card" | "text" | "circle" | "button";
}) {
  const variants = {
    default: "h-4 bg-gray-200 rounded",
    card: "h-32 bg-gray-200 rounded-lg",
    text: "h-3 bg-gray-200 rounded",
    circle: "w-10 h-10 bg-gray-200 rounded-full",
    button: "h-10 bg-gray-200 rounded-md",
  };

  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className={`${variants[variant]} ${className}`}
      {...props}
    />
  );
}

// Loading específico para componentes
export function WhatsAppLoadingCard() {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <BrazilianSkeleton variant="text" className="w-32 mb-2" />
          <BrazilianSkeleton variant="text" className="w-24" />
        </div>
      </div>
      <BrazilianLoadingState type="whatsapp" size="sm" showMotivation={false} />
    </div>
  );
}

export function RevenueLoadingCard() {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <BrazilianSkeleton variant="text" className="w-40 mb-2" />
          <BrazilianSkeleton variant="text" className="w-32" />
        </div>
      </div>
      <BrazilianLoadingState type="revenue" size="sm" showMotivation={false} />
    </div>
  );
}

export function AutomationLoadingCard() {
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <BrazilianSkeleton variant="text" className="w-36 mb-2" />
          <BrazilianSkeleton variant="text" className="w-28" />
        </div>
      </div>
      <BrazilianLoadingState
        type="automation"
        size="sm"
        showMotivation={false}
      />
    </div>
  );
}

// Loading full screen brasileiro
export function FullScreenBrazilianLoading({
  type = "default",
  title = "KRYONIX",
  subtitle = "Carregando sua plataforma...",
}: {
  type?: BrazilianLoadingProps["type"];
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        {/* Logo/Brand */}
        <div className="mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <Zap className="w-8 h-8 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-gray-900 mb-2"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-gray-600"
          >
            {subtitle}
          </motion.p>
        </div>

        {/* Loading Component */}
        <BrazilianLoadingState type={type} size="lg" showMotivation={true} />

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-gray-500">
            Plataforma SaaS Brasileira • Feito com 💚 para empreendedores
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// Hook para loading automático
export function useBrazilianLoading(
  initialType: BrazilianLoadingProps["type"] = "default",
) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState(initialType);
  const [progress, setProgress] = useState(0);

  const startLoading = (type?: BrazilianLoadingProps["type"]) => {
    if (type) setLoadingType(type);
    setIsLoading(true);
    setProgress(0);
  };

  const updateProgress = (newProgress: number) => {
    setProgress(Math.max(0, Math.min(100, newProgress)));
  };

  const stopLoading = () => {
    setIsLoading(false);
    setProgress(100);
  };

  return {
    isLoading,
    loadingType,
    progress,
    startLoading,
    updateProgress,
    stopLoading,
  };
}
