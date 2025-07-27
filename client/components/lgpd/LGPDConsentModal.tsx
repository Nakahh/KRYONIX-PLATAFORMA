import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Check, X, FileText, Download, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { PremiumButton } from "../ui/premium-button";
import { Card } from "../ui/card";
import { Checkbox } from "../ui/checkbox";

interface LGPDConsentData {
  marketing: boolean;
  analytics: boolean;
  personalization: boolean;
  communication: boolean;
  whatsapp: boolean;
  essential: boolean; // sempre true
}

interface LGPDConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConsent: (consent: LGPDConsentData) => void;
  userType: "new" | "existing";
}

export function LGPDConsentModal({
  isOpen,
  onClose,
  onConsent,
  userType,
}: LGPDConsentModalProps) {
  const [consent, setConsent] = useState<LGPDConsentData>({
    marketing: false,
    analytics: false,
    personalization: true,
    communication: true,
    whatsapp: true,
    essential: true,
  });

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "🛡️ Proteção dos Seus Dados",
      description:
        "Sua privacidade é nossa prioridade. Explicaremos como protegemos seus dados.",
      content: (
        <div className="space-y-4">
          <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl">
            <Shield className="w-16 h-16 mx-auto text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Lei Geral de Proteção de Dados (LGPD)
            </h3>
            <p className="text-gray-600">
              Estamos em total conformidade com a LGPD. Você tem controle total
              sobre seus dados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-700 mb-2">🔒 Segurança</h4>
              <p className="text-sm text-gray-600">
                Criptografia end-to-end e servidores no Brasil
              </p>
            </div>
            <div className="p-4 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-700 mb-2">
                ⚖️ Seus Direitos
              </h4>
              <p className="text-sm text-gray-600">
                Acesso, correção, exclusão e portabilidade
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "🎯 Personalização de Consentimentos",
      description:
        "Escolha como queremos usar seus dados para melhorar sua experiência.",
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Checkbox checked={consent.essential} disabled />
              <div>
                <h4 className="font-semibold text-gray-800">
                  Dados Essenciais
                </h4>
                <p className="text-sm text-gray-600">
                  Necessários para funcionamento da plataforma (login, perfil,
                  segurança)
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <Checkbox
                checked={consent.personalization}
                onCheckedChange={(checked) =>
                  setConsent((prev) => ({
                    ...prev,
                    personalization: checked as boolean,
                  }))
                }
              />
              <div>
                <h4 className="font-semibold">🎨 Personalização</h4>
                <p className="text-sm text-gray-600">
                  Personalizar interface e recomendações baseadas no seu uso
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <Checkbox
                checked={consent.analytics}
                onCheckedChange={(checked) =>
                  setConsent((prev) => ({
                    ...prev,
                    analytics: checked as boolean,
                  }))
                }
              />
              <div>
                <h4 className="font-semibold">📊 Analytics</h4>
                <p className="text-sm text-gray-600">
                  Análise de uso para melhorar a plataforma (dados anonimizados)
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <Checkbox
                checked={consent.whatsapp}
                onCheckedChange={(checked) =>
                  setConsent((prev) => ({
                    ...prev,
                    whatsapp: checked as boolean,
                  }))
                }
              />
              <div>
                <h4 className="font-semibold">📱 WhatsApp Business</h4>
                <p className="text-sm text-gray-600">
                  Integração e automação via WhatsApp para seus clientes
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <Checkbox
                checked={consent.communication}
                onCheckedChange={(checked) =>
                  setConsent((prev) => ({
                    ...prev,
                    communication: checked as boolean,
                  }))
                }
              />
              <div>
                <h4 className="font-semibold">📧 Comunicação</h4>
                <p className="text-sm text-gray-600">
                  Notificações importantes sobre sua conta e serviços
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <Checkbox
                checked={consent.marketing}
                onCheckedChange={(checked) =>
                  setConsent((prev) => ({
                    ...prev,
                    marketing: checked as boolean,
                  }))
                }
              />
              <div>
                <h4 className="font-semibold">🎯 Marketing</h4>
                <p className="text-sm text-gray-600">
                  Dicas, novidades e ofertas personalizadas sobre automação
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "✅ Confirmação Final",
      description: "Revise suas escolhas e confirme seus consentimentos.",
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-3">
              📋 Resumo dos Seus Consentimentos:
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Dados Essenciais</span>
                <Check className="w-4 h-4 text-green-600" />
              </div>
              {Object.entries(consent).map(([key, value]) => {
                if (key === "essential") return null;
                const labels = {
                  personalization: "Personalização",
                  analytics: "Analytics",
                  whatsapp: "WhatsApp Business",
                  communication: "Comunicação",
                  marketing: "Marketing",
                };
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span>{labels[key as keyof typeof labels]}</span>
                    {value ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <h5 className="font-semibold text-blue-800 mb-2">
              🔄 Você pode alterar suas preferências:
            </h5>
            <ul className="space-y-1 text-blue-700">
              <li>• A qualquer momento no menu "Privacidade"</li>
              <li>• Revogar consentimentos específicos</li>
              <li>• Solicitar exclusão de dados</li>
              <li>• Baixar seus dados (portabilidade)</li>
            </ul>
          </div>

          <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded">
            <p>
              ⚖️ <strong>Base legal:</strong> Consentimento (Art. 7º, I, LGPD) e
              Legítimo interesse (Art. 7º, IX, LGPD) para dados essenciais. Você
              pode revogar seu consentimento a qualquer momento sem prejudicar a
              licitude do tratamento realizado antes da revogação.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirm = () => {
    onConsent(consent);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl m-4"
        >
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-green-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {steps[currentStep].title}
                </h2>
                <p className="text-gray-600 mt-1">
                  {steps[currentStep].description}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <span>
                  Etapa {currentStep + 1} de {steps.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentStep + 1) / steps.length) * 100}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {steps[currentStep].content}
            </motion.div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <a
                href="/privacidade"
                target="_blank"
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                Política de Privacidade
              </a>
            </div>

            <div className="flex items-center space-x-3">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  className="text-gray-600"
                >
                  Voltar
                </Button>
              )}

              {currentStep < steps.length - 1 ? (
                <PremiumButton
                  onClick={handleNext}
                  variant="default"
                  className="bg-gradient-to-r from-blue-500 to-green-500 text-white"
                >
                  Próxima Etapa
                </PremiumButton>
              ) : (
                <PremiumButton
                  onClick={handleConfirm}
                  variant="default"
                  className="bg-gradient-to-r from-green-500 to-blue-500 text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Confirmar Consentimentos
                </PremiumButton>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default LGPDConsentModal;
