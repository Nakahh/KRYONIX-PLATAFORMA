import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Phone,
  CreditCard,
  Zap,
  Bot,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  MessageCircle,
  TrendingUp,
  Shield,
  ArrowRight,
  QrCode,
  Copy,
  ExternalLink,
  Star,
  Heart,
  Target,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import { useToast } from "../../hooks/use-toast";
import { useMobileAdvanced } from "../../hooks/use-mobile-advanced";
import { formatCurrency, getGreeting } from "../../lib/brazilian-formatters";

/**
 * Onboarding Brasileiro Completo
 * KRYONIX - 4 passos otimizados para empreendedores brasileiros
 */

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  priority: "CRÍTICO" | "ESSENCIAL" | "RECOMENDADO" | "DIFERENCIAL";
  estimatedTime: string;
  businessValue: string;
  benefits: string[];
  isCompleted: boolean;
}

export default function BrazilianOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isMobile, screenSize, orientation } = useMobileAdvanced();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [stepData, setStepData] = useState({
    whatsapp: { qrCode: "", connected: false, phoneNumber: "" },
    pix: { pixKey: "", keyType: "", configured: false },
    automation: { templateSelected: "", deployed: false },
    ai: { activated: false, configured: false },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: "📱 WhatsApp Business",
      subtitle: "Conecte-se aos seus clientes",
      description:
        "O WhatsApp é usado por 95% dos brasileiros. Configure sua conta comercial e comece a vender pelo canal mais popular do país.",
      icon: <MessageCircle className="w-8 h-8" />,
      color: "green",
      gradientFrom: "from-green-500",
      gradientTo: "to-emerald-600",
      priority: "CRÍTICO",
      estimatedTime: "2 min",
      businessValue: "Empresas que usam WhatsApp Business vendem 40% mais",
      benefits: [
        "Atendimento 24/7 automatizado",
        "Aumento de 300% nas conversões",
        "Redução de 80% no tempo de resposta",
      ],
      isCompleted: completedSteps.has(1),
    },
    {
      id: 2,
      title: "💸 PIX Instantâneo",
      subtitle: "Receba pagamentos na hora",
      description:
        "O PIX revolucionou os pagamentos no Brasil. Configure e comece a receber dinheiro instantaneamente de qualquer banco.",
      icon: <CreditCard className="w-8 h-8" />,
      color: "blue",
      gradientFrom: "from-blue-500",
      gradientTo: "to-cyan-600",
      priority: "ESSENCIAL",
      estimatedTime: "1 min",
      businessValue: "78% dos brasileiros preferem PIX para compras online",
      benefits: [
        "Recebimento instantâneo 24h",
        "Sem taxas abusivas de cartão",
        "Funciona finais de semana e feriados",
      ],
      isCompleted: completedSteps.has(2),
    },
    {
      id: 3,
      title: "⚙️ Primeira Automação",
      subtitle: "Trabalhe enquanto dorme",
      description:
        "Crie sua primeira automação inteligente. Conecte WhatsApp + PIX + IA para vendas que funcionam sozinhas.",
      icon: <Zap className="w-8 h-8" />,
      color: "purple",
      gradientFrom: "from-purple-500",
      gradientTo: "to-violet-600",
      priority: "RECOMENDADO",
      estimatedTime: "3 min",
      businessValue:
        "Automação aumenta vendas em 250% sem contratar funcionários",
      benefits: [
        "Vendas automáticas 24/7",
        "Economia de 15h semanais",
        "ROI de 400% em 30 dias",
      ],
      isCompleted: completedSteps.has(3),
    },
    {
      id: 4,
      title: "🤖 IA Inteligente",
      subtitle: "Assistente que vende por você",
      description:
        "Configure IA brasileira que entende seus clientes. ChatGPT + Claude + Gemini trabalhando para seu negócio.",
      icon: <Bot className="w-8 h-8" />,
      color: "orange",
      gradientFrom: "from-orange-500",
      gradientTo: "to-red-600",
      priority: "DIFERENCIAL",
      estimatedTime: "2 min",
      businessValue: "IA aumenta faturamento em 180% no primeiro mês",
      benefits: [
        "Atendimento humanizado 24h",
        "Conversão 60% maior",
        "Clientes mais satisfeitos",
      ],
      isCompleted: completedSteps.has(4),
    },
  ];

  // Haptic feedback para dispositivos móveis
  const triggerHaptic = (type: "light" | "medium" | "heavy" = "light") => {
    if ("vibrate" in navigator && isMobile) {
      const patterns = {
        light: [10],
        medium: [10, 100, 10],
        heavy: [50, 100, 50],
      };
      navigator.vibrate(patterns[type]);
    }
  };

  // Navegação entre passos
  const handleNext = () => {
    if (currentStep < steps.length) {
      triggerHaptic("light");
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      triggerHaptic("light");
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    triggerHaptic("medium");
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  // Finalizar onboarding
  const handleFinish = async () => {
    setIsLoading(true);
    triggerHaptic("heavy");

    try {
      // Simular salvamento das configurações
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setShowSuccess(true);

      setTimeout(() => {
        toast({
          title: "🎉 Configuração Concluída!",
          description: "Sua plataforma KRYONIX está pronta para vender!",
        });
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      toast({
        title: "Erro na Configuração",
        description: "Algo deu errado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Configuração específica de cada passo
  const handleStepConfiguration = async (stepId: number) => {
    setIsLoading(true);
    triggerHaptic("medium");

    try {
      switch (stepId) {
        case 1:
          // Simular conexão WhatsApp
          await new Promise((resolve) => setTimeout(resolve, 1500));
          setStepData((prev) => ({
            ...prev,
            whatsapp: {
              ...prev.whatsapp,
              connected: true,
              phoneNumber: "+55 17 98180-5327",
            },
          }));
          break;

        case 2:
          // Simular configuração PIX
          await new Promise((resolve) => setTimeout(resolve, 1000));
          setStepData((prev) => ({
            ...prev,
            pix: { ...prev.pix, configured: true },
          }));
          break;

        case 3:
          // Simular deploy automação
          await new Promise((resolve) => setTimeout(resolve, 2000));
          setStepData((prev) => ({
            ...prev,
            automation: { ...prev.automation, deployed: true },
          }));
          break;

        case 4:
          // Simular ativação IA
          await new Promise((resolve) => setTimeout(resolve, 1500));
          setStepData((prev) => ({
            ...prev,
            ai: { ...prev.ai, activated: true },
          }));
          break;
      }

      setCompletedSteps((prev) => new Set([...prev, stepId]));

      toast({
        title: "✅ Passo Concluído!",
        description: `${steps[stepId - 1].title} configurado com sucesso!`,
      });

      // Auto-avançar para próximo passo
      setTimeout(() => {
        if (stepId < steps.length) {
          setCurrentStep(stepId + 1);
        } else {
          handleFinish();
        }
      }, 1000);
    } catch (error) {
      toast({
        title: "Erro na Configuração",
        description: "Algo deu errado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentStepData = steps[currentStep - 1];
  const progress = (completedSteps.size / steps.length) * 100;

  // Success animation
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center"
          >
            <Sparkles className="w-12 h-12 text-white" />
          </motion.div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🎉 Parabéns, Empreendedor!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Sua plataforma KRYONIX está configurada e pronta para gerar
            resultados!
          </p>

          <div className="space-y-3 text-left max-w-md mx-auto">
            {completedSteps.has(1) && (
              <div className="flex items-center space-x-3 text-green-600">
                <Check className="w-5 h-5" />
                <span>WhatsApp Business conectado</span>
              </div>
            )}
            {completedSteps.has(2) && (
              <div className="flex items-center space-x-3 text-blue-600">
                <Check className="w-5 h-5" />
                <span>PIX configurado para recebimentos</span>
              </div>
            )}
            {completedSteps.has(3) && (
              <div className="flex items-center space-x-3 text-purple-600">
                <Check className="w-5 h-5" />
                <span>Primeira automação ativa</span>
              </div>
            )}
            {completedSteps.has(4) && (
              <div className="flex items-center space-x-3 text-orange-600">
                <Check className="w-5 h-5" />
                <span>IA assistente funcionando</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      {/* Header Mobile-First */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">KRYONIX</h1>
              <p className="text-xs text-gray-600">Configuração Inicial</p>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={handleSkip}>
            Pular
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="text-gray-600">
              Passo {currentStep} de {steps.length}
            </span>
            <span className="font-medium text-emerald-600">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Step Header */}
            <div
              className={`text-center p-6 rounded-2xl bg-gradient-to-r ${currentStepData.gradientFrom} ${currentStepData.gradientTo} text-white`}
            >
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                {currentStepData.icon}
              </div>

              <h2 className="text-2xl font-bold mb-2">
                {currentStepData.title}
              </h2>
              <p className="text-white/90 mb-3">{currentStepData.subtitle}</p>

              <div className="flex items-center justify-center space-x-4 text-sm">
                <Badge className="bg-white/20 text-white border-white/30">
                  {currentStepData.priority}
                </Badge>
                <span className="opacity-90">
                  ⏱️ {currentStepData.estimatedTime}
                </span>
              </div>
            </div>

            {/* Step Description */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {currentStepData.description}
                </p>

                {/* Business Value */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg mb-4 border border-yellow-200">
                  <div className="flex items-start space-x-3">
                    <Target className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">
                        Impacto no Negócio
                      </h4>
                      <p className="text-sm text-yellow-700">
                        {currentStepData.businessValue}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-2 mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Benefícios para seu negócio:
                  </h4>
                  {currentStepData.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Step-specific Configuration */}
                {currentStep === 1 && (
                  <WhatsAppSetup
                    data={stepData.whatsapp}
                    onComplete={() => handleStepConfiguration(1)}
                    isLoading={isLoading}
                  />
                )}

                {currentStep === 2 && (
                  <PIXSetup
                    data={stepData.pix}
                    onComplete={() => handleStepConfiguration(2)}
                    isLoading={isLoading}
                  />
                )}

                {currentStep === 3 && (
                  <AutomationSetup
                    data={stepData.automation}
                    onComplete={() => handleStepConfiguration(3)}
                    isLoading={isLoading}
                  />
                )}

                {currentStep === 4 && (
                  <AISetup
                    data={stepData.ai}
                    onComplete={() => handleStepConfiguration(4)}
                    isLoading={isLoading}
                  />
                )}
              </CardContent>
            </Card>

            {/* Completed Steps Preview */}
            {completedSteps.size > 0 && (
              <Card className="border-emerald-200 bg-emerald-50">
                <CardContent className="p-4">
                  <h4 className="font-medium text-emerald-800 mb-3 flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    J�� Configurado ({completedSteps.size}/4)
                  </h4>
                  <div className="space-y-2">
                    {Array.from(completedSteps).map((stepId) => {
                      const step = steps[stepId - 1];
                      return (
                        <div
                          key={stepId}
                          className="flex items-center space-x-3 text-sm"
                        >
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-700">{step.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </Button>

          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index + 1 === currentStep
                    ? "bg-emerald-600"
                    : completedSteps.has(index + 1)
                      ? "bg-emerald-400"
                      : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          {currentStep === steps.length ? (
            <Button
              onClick={handleFinish}
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>Finalizando...</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4" />
                  <span>Começar a Vender!</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-emerald-600 hover:bg-emerald-700 flex items-center space-x-2"
            >
              <span>Próximo</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Componentes de configuração específicos
const WhatsAppSetup = ({ data, onComplete, isLoading }: any) => (
  <div className="space-y-4">
    {!data.connected ? (
      <>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center space-x-3 mb-3">
            <QrCode className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">QR Code WhatsApp</span>
          </div>
          <div className="w-40 h-40 bg-white border-2 border-green-300 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-xs text-gray-500 text-center">
              QR Code será
              <br />
              exibido aqui
            </span>
          </div>
          <p className="text-sm text-green-700 text-center">
            Abra o WhatsApp e escaneie o código para conectar
          </p>
        </div>

        <Button
          onClick={onComplete}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isLoading ? "Conectando..." : "Gerar QR Code"}
        </Button>
      </>
    ) : (
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="flex items-center space-x-3 text-green-700">
          <Check className="w-5 h-5" />
          <div>
            <p className="font-medium">WhatsApp Conectado!</p>
            <p className="text-sm">Número: {data.phoneNumber}</p>
          </div>
        </div>
      </div>
    )}
  </div>
);

const PIXSetup = ({ data, onComplete, isLoading }: any) => {
  const [pixKey, setPixKey] = useState("");

  return (
    <div className="space-y-4">
      {!data.configured ? (
        <>
          <div className="space-y-3">
            <Label>Sua Chave PIX</Label>
            <Input
              placeholder="email@exemplo.com ou +5511999999999"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
            />
            <p className="text-sm text-gray-600">
              Será usada para gerar PIX automático via WhatsApp
            </p>
          </div>

          <Button
            onClick={onComplete}
            disabled={!pixKey || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Configurando..." : "Configurar PIX"}
          </Button>
        </>
      ) : (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-3 text-blue-700">
            <Check className="w-5 h-5" />
            <div>
              <p className="font-medium">PIX Configurado!</p>
              <p className="text-sm">Recebimentos automáticos ativos</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AutomationSetup = ({ data, onComplete, isLoading }: any) => (
  <div className="space-y-4">
    {!data.deployed ? (
      <>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h4 className="font-medium text-purple-800 mb-2">
            Template: Lead WhatsApp → PIX
          </h4>
          <p className="text-sm text-purple-700 mb-3">
            Quando alguém demonstrar interesse, automaticamente:
          </p>
          <div className="space-y-2 text-sm text-purple-700">
            <div className="flex items-center space-x-2">
              <ArrowRight className="w-3 h-3" />
              <span>Qualifica o lead com IA</span>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowRight className="w-3 h-3" />
              <span>Gera PIX automático</span>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowRight className="w-3 h-3" />
              <span>Envia pelo WhatsApp</span>
            </div>
          </div>
        </div>

        <Button
          onClick={onComplete}
          disabled={isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {isLoading ? "Implementando..." : "Ativar Automação"}
        </Button>
      </>
    ) : (
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <div className="flex items-center space-x-3 text-purple-700">
          <Check className="w-5 h-5" />
          <div>
            <p className="font-medium">Automação Ativa!</p>
            <p className="text-sm">Lead → WhatsApp → PIX funcionando</p>
          </div>
        </div>
      </div>
    )}
  </div>
);

const AISetup = ({ data, onComplete, isLoading }: any) => (
  <div className="space-y-4">
    {!data.activated ? (
      <>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <h4 className="font-medium text-orange-800 mb-2">
            IA Brasileira Inteligente
          </h4>
          <p className="text-sm text-orange-700 mb-3">
            Assistente IA que entende português brasileiro e:
          </p>
          <div className="space-y-2 text-sm text-orange-700">
            <div className="flex items-center space-x-2">
              <ArrowRight className="w-3 h-3" />
              <span>Qualifica leads automaticamente</span>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowRight className="w-3 h-3" />
              <span>Responde perguntas dos clientes</span>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowRight className="w-3 h-3" />
              <span>Otimiza campanhas sozinha</span>
            </div>
          </div>
        </div>

        <Button
          onClick={onComplete}
          disabled={isLoading}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          {isLoading ? "Ativando IA..." : "Ativar IA Brasileira"}
        </Button>
      </>
    ) : (
      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
        <div className="flex items-center space-x-3 text-orange-700">
          <Check className="w-5 h-5" />
          <div>
            <p className="font-medium">IA Ativa e Aprendendo!</p>
            <p className="text-sm">Assistente inteligente funcionando</p>
          </div>
        </div>
      </div>
    )}
  </div>
);
