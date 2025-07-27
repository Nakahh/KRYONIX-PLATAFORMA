import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Smartphone,
  X,
  Zap,
  Wifi,
  Battery,
  Shield,
  Star,
  CheckCircle,
  ArrowRight,
  MessageCircle,
  CreditCard,
  Bot,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { usePWA } from "../../hooks/use-pwa";
import { useMobileAdvanced } from "../../hooks/use-mobile-advanced";

/**
 * PWA Install Brasileiro Avançado
 * KRYONIX - Experiência de instalação otimizada para Brasil
 */

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function EnhancedPWAInstall() {
  const { isMobile, isStandalone, platform } = useMobileAdvanced();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [installStep, setInstallStep] = useState(0);
  const [isInstalling, setIsInstalling] = useState(false);
  const [hasBeenPrompted, setHasBeenPrompted] = useState(false);

  // Features específicas para mercado brasileiro
  const brazilianFeatures = [
    {
      icon: <MessageCircle className="w-5 h-5" />,
      title: "WhatsApp Business",
      description: "Gestão completa do canal mais usado no Brasil",
      color: "text-green-600",
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      title: "PIX Instantâneo",
      description: "Receba pagamentos na hora, 24h por dia",
      color: "text-blue-600",
    },
    {
      icon: <Bot className="w-5 h-5" />,
      title: "IA Brasileira",
      description: "Assistente que entende o mercado nacional",
      color: "text-purple-600",
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Automações",
      description: "Trabalhe enquanto dorme com N8N + Typebot",
      color: "text-orange-600",
    },
  ];

  const installBenefits = [
    {
      icon: <Wifi className="w-4 h-4" />,
      text: "Funciona offline (economia de dados)",
    },
    {
      icon: <Battery className="w-4 h-4" />,
      text: "Menos consumo de bateria",
    },
    {
      icon: <Shield className="w-4 h-4" />,
      text: "Acesso direto e seguro",
    },
    {
      icon: <Zap className="w-4 h-4" />,
      text: "Carregamento mais rápido",
    },
  ];

  useEffect(() => {
    // Verifica se já foi solicitado antes
    const hasPrompted = localStorage.getItem("kryonix-pwa-prompted");
    if (hasPrompted) {
      setHasBeenPrompted(true);
      return;
    }

    // Event listener para PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Mostrar prompt após 30 segundos se for mobile
      if (isMobile && !isStandalone) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 30000);
      }
    };

    // Event listener para install bem-sucedido
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowPrompt(false);
      localStorage.setItem("kryonix-pwa-installed", "true");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isMobile, isStandalone]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === "accepted") {
        setInstallStep(1);
        setTimeout(() => setInstallStep(2), 2000);
        setTimeout(() => {
          setShowPrompt(false);
          localStorage.setItem("kryonix-pwa-installed", "true");
        }, 4000);
      }
    } catch (error) {
      console.error("Erro na instalação:", error);
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  };

  const handleManualInstallPrompt = () => {
    if (hasBeenPrompted || isStandalone) return;
    setShowPrompt(true);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("kryonix-pwa-prompted", "true");
    setHasBeenPrompted(true);
  };

  // Não mostrar se já instalado ou não é mobile
  if (isStandalone || !isMobile || hasBeenPrompted) {
    return null;
  }

  // Manual install instructions para iOS
  const getManualInstructions = () => {
    if (platform === "ios") {
      return [
        "Toque no ícone de compartilhar (quadrado com seta) no Safari",
        'Role e toque em "Adicionar à Tela de Início"',
        'Confirme tocando em "Adicionar"',
        "O KRYONIX aparecerá na sua tela inicial",
      ];
    }

    return [
      "Toque no menu (⋮) do seu navegador",
      'Procure por "Instalar app" ou "Adicionar à tela inicial"',
      "Confirme a instalação",
      "O KRYONIX aparecerá como um app nativo",
    ];
  };

  return (
    <>
      {/* Botão flutuante para mostrar prompt manualmente */}
      {!showPrompt && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 5 }}
          className="fixed bottom-20 right-4 z-40"
        >
          <Button
            onClick={handleManualInstallPrompt}
            className="bg-emerald-600 hover:bg-emerald-700 shadow-lg rounded-full p-3"
            size="sm"
          >
            <Download className="w-5 h-5" />
          </Button>
        </motion.div>
      )}

      {/* PWA Install Modal */}
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-md"
            >
              <Card className="border-0 shadow-2xl bg-white overflow-hidden">
                {installStep === 0 && (
                  <CardContent className="p-0">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-6 relative">
                      <button
                        onClick={handleDismiss}
                        className="absolute top-4 right-4 text-white/80 hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">
                            Instalar KRYONIX
                          </h2>
                          <p className="text-emerald-100 text-sm">
                            Como um app nativo
                          </p>
                        </div>
                      </div>

                      <Badge className="bg-white/20 text-white border-white/30">
                        🇧🇷 Otimizado para o Brasil
                      </Badge>
                    </div>

                    {/* Features */}
                    <div className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-4 text-center">
                        Tudo que você precisa para vender mais:
                      </h3>

                      <div className="grid grid-cols-2 gap-3 mb-6">
                        {brazilianFeatures.map((feature, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gray-50 p-3 rounded-lg"
                          >
                            <div className={`${feature.color} mb-2`}>
                              {feature.icon}
                            </div>
                            <h4 className="font-medium text-sm text-gray-900 mb-1">
                              {feature.title}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {feature.description}
                            </p>
                          </motion.div>
                        ))}
                      </div>

                      {/* Benefits */}
                      <div className="bg-blue-50 p-4 rounded-lg mb-6">
                        <h4 className="font-medium text-blue-900 mb-3 text-sm">
                          Por que instalar como app?
                        </h4>
                        <div className="space-y-2">
                          {installBenefits.map((benefit, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-3"
                            >
                              <div className="text-blue-600">
                                {benefit.icon}
                              </div>
                              <span className="text-sm text-blue-800">
                                {benefit.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Install Buttons */}
                      <div className="space-y-3">
                        {deferredPrompt ? (
                          <Button
                            onClick={handleInstallClick}
                            disabled={isInstalling}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 h-12"
                          >
                            {isInstalling ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    ease: "linear",
                                  }}
                                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                                />
                                Instalando...
                              </>
                            ) : (
                              <>
                                <Download className="w-5 h-5 mr-2" />
                                Instalar KRYONIX
                              </>
                            )}
                          </Button>
                        ) : (
                          <div className="space-y-3">
                            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                              <p className="text-sm text-yellow-800 mb-2 font-medium">
                                📱 Instruções para{" "}
                                {platform === "ios" ? "iPhone/iPad" : "Android"}
                                :
                              </p>
                              <div className="space-y-1">
                                {getManualInstructions().map(
                                  (instruction, index) => (
                                    <div
                                      key={index}
                                      className="flex items-start space-x-2 text-xs text-yellow-700"
                                    >
                                      <span className="w-4 h-4 bg-yellow-200 rounded-full flex items-center justify-center text-yellow-800 font-bold text-xs mt-0.5">
                                        {index + 1}
                                      </span>
                                      <span>{instruction}</span>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={handleDismiss}
                          variant="outline"
                          className="w-full"
                        >
                          Talvez mais tarde
                        </Button>
                      </div>

                      {/* Testimonial */}
                      <div className="mt-4 text-center">
                        <div className="flex justify-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 text-yellow-400 fill-current"
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-600 italic">
                          "Com KRYONIX meu faturamento aumentou 180% em 30 dias"
                        </p>
                        <p className="text-xs text-gray-500">
                          - Maria Silva, E-commerce
                        </p>
                      </div>
                    </div>
                  </CardContent>
                )}

                {installStep === 1 && (
                  <CardContent className="p-8 text-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle className="w-8 h-8 text-white" />
                    </motion.div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Instalando...
                    </h3>
                    <p className="text-gray-600">
                      KRYONIX será adicionado à sua tela inicial
                    </p>
                  </CardContent>
                )}

                {installStep === 2 && (
                  <CardContent className="p-8 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle className="w-8 h-8 text-white" />
                    </motion.div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      🎉 Instalado com Sucesso!
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Agora você pode acessar KRYONIX diretamente da sua tela
                      inicial
                    </p>

                    <Button
                      onClick={() => setShowPrompt(false)}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Começar a usar
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Hook para PWA events
export function usePWAEvents() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if already installed
    const installed = localStorage.getItem("kryonix-pwa-installed") === "true";
    setIsInstalled(installed);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      localStorage.setItem("kryonix-pwa-installed", "true");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!installEvent) return false;

    try {
      await installEvent.prompt();
      const result = await installEvent.userChoice;
      return result.outcome === "accepted";
    } catch (error) {
      console.error("Install prompt error:", error);
      return false;
    }
  };

  return {
    isInstalled,
    canInstall: !!installEvent,
    promptInstall,
  };
}
