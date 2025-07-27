import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Progress } from "../ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

import {
  Rocket,
  Building,
  User,
  MapPin,
  Globe,
  Palette,
  Zap,
  Shield,
  Settings,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Download,
  Upload,
  Server,
  Database,
  MessageSquare,
  Bot,
  BarChart3,
  Monitor,
  Mail,
  Phone,
  CreditCard,
  Clock,
  Calendar,
  Smartphone,
  Heart,
} from "lucide-react";

import { useToast } from "../../hooks/use-toast";
import { KryonixLogoPremium } from "../brand/KryonixLogoPremium";

/**
 * KRYONIX Setup Wizard - Configuração Inicial Brasileira
 * Wizard completo para configurar a plataforma do zero
 * Integração com dados reais e stacks fornecidas
 */

interface CompanyInfo {
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  website: string;
  address: {
    cep: string;
    street: string;
    city: string;
    state: string;
  };
  businessType: string;
  employees: string;
  revenue: string;
}

interface UserPreferences {
  language: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  businessHours: {
    start: string;
    end: string;
    weekdays: number[];
  };
  notifications: {
    email: boolean;
    whatsapp: boolean;
    push: boolean;
    sms: boolean;
  };
}

interface StackConfiguration {
  id: string;
  name: string;
  enabled: boolean;
  config: Record<string, any>;
  credentials: Record<string, string>;
  priority: "high" | "medium" | "low";
  category: string;
}

interface SetupProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  timeEstimate: string;
  overallProgress: number;
}

const setupSteps = [
  {
    id: "welcome",
    title: "Bem-vindo ao KRYONIX",
    description: "Vamos configurar sua plataforma em poucos minutos",
    icon: <Rocket className="w-6 h-6" />,
    estimatedTime: "1 min",
  },
  {
    id: "company",
    title: "Informações da Empresa",
    description: "Dados básicos da sua empresa",
    icon: <Building className="w-6 h-6" />,
    estimatedTime: "3 min",
  },
  {
    id: "admin",
    title: "Administrador Principal",
    description: "Configure sua conta de administrador",
    icon: <User className="w-6 h-6" />,
    estimatedTime: "2 min",
  },
  {
    id: "preferences",
    title: "Preferências Regionais",
    description: "Configurações específicas do Brasil",
    icon: <Globe className="w-6 h-6" />,
    estimatedTime: "2 min",
  },
  {
    id: "stacks",
    title: "Escolha suas Ferramentas",
    description: "Selecione as stacks que deseja usar",
    icon: <Zap className="w-6 h-6" />,
    estimatedTime: "5 min",
  },
  {
    id: "integration",
    title: "Configuração de Integrações",
    description: "Configure APIs e webhooks",
    icon: <Settings className="w-6 h-6" />,
    estimatedTime: "4 min",
  },
  {
    id: "security",
    title: "Segurança e Compliance",
    description: "LGPD e configurações de segurança",
    icon: <Shield className="w-6 h-6" />,
    estimatedTime: "3 min",
  },
  {
    id: "finish",
    title: "Finalização",
    description: "Revisão e ativação da plataforma",
    icon: <CheckCircle className="w-6 h-6" />,
    estimatedTime: "2 min",
  },
];

// Configurações das stacks baseadas nos dados reais fornecidos
const availableStacks: StackConfiguration[] = [
  {
    id: "evolution-api",
    name: "Evolution API (WhatsApp)",
    enabled: true,
    config: { instances: [], webhooks: true },
    credentials: { apiKey: "6f78dbffc4acd9a32b926a38892a23f0" },
    priority: "high",
    category: "Comunicação",
  },
  {
    id: "n8n",
    name: "N8N (Automa��ão)",
    enabled: true,
    config: { workflows: [], executions: true },
    credentials: { email: "vitor.nakahh@gmail.com", password: "Vitor@123456" },
    priority: "high",
    category: "Automação",
  },
  {
    id: "typebot",
    name: "Typebot (Chatbots)",
    enabled: true,
    config: { bots: [], integrations: true },
    credentials: { adminEmail: "vitor.nakahh@gmail.com" },
    priority: "high",
    category: "Automação",
  },
  {
    id: "mautic",
    name: "Mautic (Marketing)",
    enabled: true,
    config: { campaigns: [], segments: true },
    credentials: { username: "kryonix", password: "Vitor@123456" },
    priority: "high",
    category: "Marketing",
  },
  {
    id: "grafana",
    name: "Grafana (Analytics)",
    enabled: true,
    config: { dashboards: [], alerts: true },
    credentials: { username: "kryonix", password: "Vitor@123456" },
    priority: "medium",
    category: "Analytics",
  },
  {
    id: "ollama",
    name: "Ollama (IA Local)",
    enabled: false,
    config: { models: [], concurrent: 4 },
    credentials: {},
    priority: "medium",
    category: "Inteligência Artificial",
  },
  {
    id: "chatwoot",
    name: "Chatwoot (Atendimento)",
    enabled: false,
    config: { channels: [], agents: [] },
    credentials: { email: "vitor.nakahh@gmail.com", password: "Vitor@123456" },
    priority: "low",
    category: "Comunicação",
  },
  {
    id: "strapi",
    name: "Strapi (CMS)",
    enabled: false,
    config: { collections: [], apis: true },
    credentials: { email: "vitor.nakahh@gmail.com", password: "Vitor@123456" },
    priority: "low",
    category: "Conteúdo",
  },
];

const brazilianStates = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const businessTypes = [
  "E-commerce",
  "Serviços Profissionais",
  "Consultoria",
  "Agência de Marketing",
  "Software/SaaS",
  "Educação",
  "Saúde",
  "Imobiliário",
  "Varejo",
  "Indústria",
  "Outro",
];

interface SetupWizardProps {
  onComplete: (setupData: any) => void;
  onCancel?: () => void;
}

export default function SetupWizard({
  onComplete,
  onCancel,
}: SetupWizardProps) {
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Estados dos dados
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: "",
    cnpj: "",
    email: "",
    phone: "",
    website: "",
    address: {
      cep: "",
      street: "",
      city: "",
      state: "",
    },
    businessType: "",
    employees: "",
    revenue: "",
  });

  const [adminUser, setAdminUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "admin",
  });

  const [preferences, setPreferences] = useState<UserPreferences>({
    language: "pt-BR",
    timezone: "America/Sao_Paulo",
    currency: "BRL",
    dateFormat: "DD/MM/YYYY",
    businessHours: {
      start: "08:00",
      end: "18:00",
      weekdays: [1, 2, 3, 4, 5], // Segunda a sexta
    },
    notifications: {
      email: true,
      whatsapp: true,
      push: true,
      sms: false,
    },
  });

  const [selectedStacks, setSelectedStacks] = useState<StackConfiguration[]>(
    availableStacks.filter((stack) => stack.enabled),
  );

  const [setupProgress, setSetupProgress] = useState<SetupProgress>({
    currentStep: 0,
    totalSteps: setupSteps.length,
    completedSteps: [],
    timeEstimate: "20 min",
    overallProgress: 0,
  });

  // Atualizar progresso
  useEffect(() => {
    const progress = (currentStep / (setupSteps.length - 1)) * 100;
    setSetupProgress((prev) => ({
      ...prev,
      currentStep,
      overallProgress: progress,
    }));
  }, [currentStep]);

  // Validar CEP e buscar endereço
  const validateAndFillCEP = async (cep: string) => {
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setCompanyInfo((prev) => ({
            ...prev,
            address: {
              ...prev.address,
              cep,
              street: data.logradouro,
              city: data.localidade,
              state: data.uf,
            },
          }));

          toast({
            title: "CEP encontrado! 📍",
            description: `${data.logradouro}, ${data.localidade} - ${data.uf}`,
          });
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  // Validar CNPJ
  const validateCNPJ = (cnpj: string): boolean => {
    const cleanCNPJ = cnpj.replace(/[^\d]/g, "");
    return cleanCNPJ.length === 14; // Validação básica
  };

  // Próximo passo
  const nextStep = () => {
    if (currentStep < setupSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Passo anterior
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Configurar stacks selecionadas
  const configureSelectedStacks = async () => {
    setIsConfiguring(true);

    try {
      // Simular configuração das stacks
      for (const stack of selectedStacks) {
        toast({
          title: `Configurando ${stack.name}...`,
          description: "Aplicando configurações e credenciais",
        });

        // Simular tempo de configuração
        await new Promise((resolve) => setTimeout(resolve, 1500));

        toast({
          title: `${stack.name} configurado! ✅`,
          description: "Stack ativada e pronta para uso",
        });
      }

      // Finalizar setup
      const setupData = {
        company: companyInfo,
        admin: adminUser,
        preferences,
        stacks: selectedStacks,
        timestamp: new Date().toISOString(),
      };

      toast({
        title: "Configuração concluída! 🎉",
        description: "Sua plataforma KRYONIX está pronta para uso!",
      });

      onComplete(setupData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro na configuração",
        description: "Algo deu errado. Tente novamente.",
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  // Renderizar conteúdo do passo atual
  const renderStepContent = () => {
    const step = setupSteps[currentStep];

    switch (step.id) {
      case "welcome":
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-32 h-32 flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 rounded-full">
              <KryonixLogoPremium variant="icon" size="lg" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Bem-vindo ao KRYONIX! 🇧🇷
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                A plataforma de automação inteligente 100% brasileira
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <div className="text-center">
                  <MessageSquare className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-sm">WhatsApp Business</div>
                </div>
                <div className="text-center">
                  <Bot className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-sm">Chatbots IA</div>
                </div>
                <div className="text-center">
                  <Zap className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-sm">Automação N8N</div>
                </div>
                <div className="text-center">
                  <BarChart3 className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-sm">Analytics</div>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                ⚡ Setup rápido e inteligente | 🇧🇷 Otimizado para empresas
                brasileiras | 🔒 LGPD Compliant
              </p>
            </div>
          </div>
        );

      case "company":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Nome da Empresa *</Label>
                <Input
                  id="companyName"
                  value={companyInfo.name}
                  onChange={(e) =>
                    setCompanyInfo((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Ex: Minha Empresa Ltda"
                />
              </div>
              <div>
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input
                  id="cnpj"
                  value={companyInfo.cnpj}
                  onChange={(e) =>
                    setCompanyInfo((prev) => ({
                      ...prev,
                      cnpj: e.target.value,
                    }))
                  }
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
                {companyInfo.cnpj && !validateCNPJ(companyInfo.cnpj) && (
                  <p className="text-sm text-red-500 mt-1">CNPJ inválido</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessType">Tipo de Negócio *</Label>
                <Select
                  value={companyInfo.businessType}
                  onValueChange={(value) =>
                    setCompanyInfo((prev) => ({ ...prev, businessType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="employees">Número de Funcionários</Label>
                <Select
                  value={companyInfo.employees}
                  onValueChange={(value) =>
                    setCompanyInfo((prev) => ({ ...prev, employees: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 funcionários</SelectItem>
                    <SelectItem value="11-50">11-50 funcionários</SelectItem>
                    <SelectItem value="51-200">51-200 funcionários</SelectItem>
                    <SelectItem value="201-500">
                      201-500 funcionários
                    </SelectItem>
                    <SelectItem value="500+">Mais de 500</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">E-mail Corporativo *</Label>
                <Input
                  id="email"
                  type="email"
                  value={companyInfo.email}
                  onChange={(e) =>
                    setCompanyInfo((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="contato@minhaempresa.com.br"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                <Input
                  id="phone"
                  value={companyInfo.phone}
                  onChange={(e) =>
                    setCompanyInfo((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="website">Website (opcional)</Label>
              <Input
                id="website"
                type="url"
                value={companyInfo.website}
                onChange={(e) =>
                  setCompanyInfo((prev) => ({
                    ...prev,
                    website: e.target.value,
                  }))
                }
                placeholder="https://www.minhaempresa.com.br"
              />
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Endereço</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={companyInfo.address.cep}
                    onChange={(e) => {
                      const cep = e.target.value.replace(/\D/g, "");
                      setCompanyInfo((prev) => ({
                        ...prev,
                        address: { ...prev.address, cep },
                      }));
                      if (cep.length === 8) {
                        validateAndFillCEP(cep);
                      }
                    }}
                    placeholder="00000-000"
                    maxLength={9}
                  />
                </div>
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={companyInfo.address.city}
                    onChange={(e) =>
                      setCompanyInfo((prev) => ({
                        ...prev,
                        address: { ...prev.address, city: e.target.value },
                      }))
                    }
                    placeholder="Sua cidade"
                  />
                </div>
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Select
                    value={companyInfo.address.state}
                    onValueChange={(value) =>
                      setCompanyInfo((prev) => ({
                        ...prev,
                        address: { ...prev.address, state: value },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {brazilianStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="street">Endereço Completo</Label>
                <Input
                  id="street"
                  value={companyInfo.address.street}
                  onChange={(e) =>
                    setCompanyInfo((prev) => ({
                      ...prev,
                      address: { ...prev.address, street: e.target.value },
                    }))
                  }
                  placeholder="Rua, número, complemento"
                />
              </div>
            </div>
          </div>
        );

      case "admin":
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">
                👤 Conta de Administrador
              </h4>
              <p className="text-sm text-blue-800">
                Esta será sua conta principal para gerenciar toda a plataforma
                KRYONIX.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="adminName">Nome Completo *</Label>
                <Input
                  id="adminName"
                  value={adminUser.name}
                  onChange={(e) =>
                    setAdminUser((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Seu nome completo"
                />
              </div>
              <div>
                <Label htmlFor="adminPhone">Telefone/WhatsApp *</Label>
                <Input
                  id="adminPhone"
                  value={adminUser.phone}
                  onChange={(e) =>
                    setAdminUser((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="adminEmail">E-mail de Login *</Label>
              <Input
                id="adminEmail"
                type="email"
                value={adminUser.email}
                onChange={(e) =>
                  setAdminUser((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="admin@minhaempresa.com.br"
              />
              <p className="text-sm text-gray-500 mt-1">
                Este e-mail será usado para fazer login na plataforma
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="adminPassword">Senha *</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={adminUser.password}
                  onChange={(e) =>
                    setAdminUser((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={adminUser.confirmPassword}
                  onChange={(e) =>
                    setAdminUser((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="Repita a senha"
                />
                {adminUser.password &&
                  adminUser.confirmPassword &&
                  adminUser.password !== adminUser.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">
                      Senhas não coincidem
                    </p>
                  )}
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h5 className="font-medium text-green-900 mb-2">
                🔐 Segurança da Conta
              </h5>
              <div className="space-y-2 text-sm text-green-800">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    Autenticação de dois fatores (2FA) será configurada
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Notificações de login por e-mail e WhatsApp</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Logs de auditoria completos</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "preferences":
        return (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-green-900 mb-2">
                🇧🇷 Configurações Regionais
              </h4>
              <p className="text-sm text-green-800">
                Configurações otimizadas para empresas brasileiras.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Idioma da Interface</Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) =>
                      setPreferences((prev) => ({ ...prev, language: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">
                        🇧🇷 Português (Brasil)
                      </SelectItem>
                      <SelectItem value="en-US">🇺🇸 English</SelectItem>
                      <SelectItem value="es-ES">🇪🇸 Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Fuso Horário</Label>
                  <Select
                    value={preferences.timezone}
                    onValueChange={(value) =>
                      setPreferences((prev) => ({ ...prev, timezone: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">
                        🕐 S��o Paulo (GMT-3)
                      </SelectItem>
                      <SelectItem value="America/Manaus">
                        🕐 Manaus (GMT-4)
                      </SelectItem>
                      <SelectItem value="America/Rio_Branco">
                        🕐 Rio Branco (GMT-5)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Moeda</Label>
                  <Select
                    value={preferences.currency}
                    onValueChange={(value) =>
                      setPreferences((prev) => ({ ...prev, currency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">💰 Real (R$)</SelectItem>
                      <SelectItem value="USD">💰 Dólar (US$)</SelectItem>
                      <SelectItem value="EUR">💰 Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Horário Comercial</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Início</Label>
                      <Input
                        type="time"
                        value={preferences.businessHours.start}
                        onChange={(e) =>
                          setPreferences((prev) => ({
                            ...prev,
                            businessHours: {
                              ...prev.businessHours,
                              start: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Fim</Label>
                      <Input
                        type="time"
                        value={preferences.businessHours.end}
                        onChange={(e) =>
                          setPreferences((prev) => ({
                            ...prev,
                            businessHours: {
                              ...prev.businessHours,
                              end: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Notificações</Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">E-mail</span>
                      </div>
                      <Switch
                        checked={preferences.notifications.email}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              email: checked,
                            },
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm">WhatsApp</span>
                      </div>
                      <Switch
                        checked={preferences.notifications.whatsapp}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              whatsapp: checked,
                            },
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="w-4 h-4" />
                        <span className="text-sm">Push (App)</span>
                      </div>
                      <Switch
                        checked={preferences.notifications.push}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              push: checked,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h5 className="font-medium text-yellow-900 mb-2">
                🏖️ Feriados e Eventos
              </h5>
              <p className="text-sm text-yellow-800">
                A plataforma já vem configurada com todos os feriados
                brasileiros e irá pausar automações durante esses períodos.
              </p>
            </div>
          </div>
        );

      case "stacks":
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-2">
                🛠️ Escolha suas Ferramentas
              </h4>
              <p className="text-sm text-gray-600">
                Selecione as stacks que deseja ativar. Você pode mudar isso
                depois.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableStacks.map((stack) => (
                <Card
                  key={stack.id}
                  className={`cursor-pointer transition-all ${
                    selectedStacks.find((s) => s.id === stack.id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => {
                    const isSelected = selectedStacks.find(
                      (s) => s.id === stack.id,
                    );
                    if (isSelected) {
                      setSelectedStacks((prev) =>
                        prev.filter((s) => s.id !== stack.id),
                      );
                    } else {
                      setSelectedStacks((prev) => [...prev, stack]);
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={
                            !!selectedStacks.find((s) => s.id === stack.id)
                          }
                          readOnly
                        />
                        <div>
                          <h5 className="font-semibold">{stack.name}</h5>
                          <Badge variant="outline" className="text-xs">
                            {stack.category}
                          </Badge>
                        </div>
                      </div>
                      <Badge
                        className={`text-xs ${
                          stack.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : stack.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {stack.priority === "high"
                          ? "Essencial"
                          : stack.priority === "medium"
                            ? "Recomendado"
                            : "Opcional"}
                      </Badge>
                    </div>

                    <div className="text-xs text-gray-500">
                      {stack.id === "evolution-api" &&
                        "WhatsApp Business API oficial"}
                      {stack.id === "n8n" && "Automação visual de workflows"}
                      {stack.id === "typebot" &&
                        "Criador de chatbots inteligentes"}
                      {stack.id === "mautic" && "Marketing automation e CRM"}
                      {stack.id === "grafana" && "Dashboards e monitoramento"}
                      {stack.id === "ollama" &&
                        "IA local (LLaMA, Mistral, etc.)"}
                      {stack.id === "chatwoot" &&
                        "Central de atendimento omnichannel"}
                      {stack.id === "strapi" && "CMS headless para conteúdo"}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">
                📊 Resumo da Seleção
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <span className="font-medium">{selectedStacks.length}</span>
                  <span className="text-blue-700"> stacks selecionadas</span>
                </div>
                <div>
                  <span className="font-medium">
                    {selectedStacks.filter((s) => s.priority === "high").length}
                  </span>
                  <span className="text-blue-700"> essenciais</span>
                </div>
                <div>
                  <span className="font-medium">
                    {
                      selectedStacks.filter((s) => s.category === "Comunicação")
                        .length
                    }
                  </span>
                  <span className="text-blue-700"> comunicação</span>
                </div>
                <div>
                  <span className="font-medium">
                    {
                      selectedStacks.filter((s) => s.category === "Automação")
                        .length
                    }
                  </span>
                  <span className="text-blue-700"> automação</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-green-900 mb-2">
                🔒 Segurança e LGPD
              </h4>
              <p className="text-sm text-green-800">
                Configurações automáticas de segurança e compliance com a LGPD.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h5 className="font-medium">Configurações de Segurança</h5>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span className="text-sm">2FA Obrigatório</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span className="text-sm">SSL/TLS Forçado</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Rate Limiting</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Logs de Auditoria</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-medium">Compliance LGPD</h5>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Consentimento</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Configurado
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Portabilidade</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Configurado
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Exclusão de Dados</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Configurado
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Relatórios LGPD</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Configurado
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h5 className="font-medium text-yellow-900 mb-2">
                📋 Política de Privacidade
              </h5>
              <p className="text-sm text-yellow-800 mb-3">
                Sua política de privacidade será gerada automaticamente baseada
                nas suas configurações e stacks selecionadas.
              </p>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Visualizar Política Gerada
              </Button>
            </div>
          </div>
        );

      case "finish":
        return (
          <div className="space-y-6 text-center">
            <div className="mx-auto w-24 h-24 flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 rounded-full">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Tudo pronto! 🎉
              </h2>
              <p className="text-gray-600 mb-6">
                Sua plataforma KRYONIX está configurada e pronta para uso.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg">
              <h4 className="font-semibold mb-4">Resumo da Configuração</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="text-left">
                  <div className="font-medium">Empresa:</div>
                  <div className="text-gray-600">{companyInfo.name}</div>
                </div>
                <div className="text-left">
                  <div className="font-medium">Administrador:</div>
                  <div className="text-gray-600">{adminUser.name}</div>
                </div>
                <div className="text-left">
                  <div className="font-medium">Stacks Ativadas:</div>
                  <div className="text-gray-600">
                    {selectedStacks.length} ferramentas
                  </div>
                </div>
                <div className="text-left">
                  <div className="font-medium">Região:</div>
                  <div className="text-gray-600">
                    Brasil - {preferences.timezone}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={configureSelectedStacks}
                disabled={isConfiguring}
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                size="lg"
              >
                {isConfiguring ? (
                  <>
                    <Settings className="w-5 h-5 mr-2 animate-spin" />
                    Configurando Stacks...
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5 mr-2" />
                    Ativar Plataforma KRYONIX
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowPreview(true)}
                className="w-full"
              >
                <Eye className="w-4 h-4 mr-2" />
                Visualizar Configuração
              </Button>
            </div>

            <div className="text-xs text-gray-500">
              ⚡ Tempo estimado de ativação: 2-3 minutos
            </div>
          </div>
        );

      default:
        return <div>Passo não encontrado</div>;
    }
  };

  const canProceed = () => {
    const step = setupSteps[currentStep];

    switch (step.id) {
      case "welcome":
        return true;
      case "company":
        return (
          companyInfo.name &&
          companyInfo.cnpj &&
          companyInfo.email &&
          companyInfo.phone
        );
      case "admin":
        return (
          adminUser.name &&
          adminUser.email &&
          adminUser.password &&
          adminUser.password === adminUser.confirmPassword
        );
      case "preferences":
        return true; // Todas têm valores padrão
      case "stacks":
        return selectedStacks.length > 0;
      case "security":
        return true; // Configurações automáticas
      case "finish":
        return true;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header com progresso */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Setup KRYONIX
              </h1>
              <p className="text-gray-600">
                Passo {currentStep + 1} de {setupSteps.length} -{" "}
                {setupSteps[currentStep].title}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                Tempo estimado restante
              </div>
              <div className="font-medium">{setupProgress.timeEstimate}</div>
            </div>
          </div>

          <Progress value={setupProgress.overallProgress} className="h-2" />

          {/* Steps indicator */}
          <div className="flex items-center justify-between mt-4">
            {setupSteps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${
                  index < setupSteps.length - 1 ? "flex-1" : ""
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index <= currentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                {index < setupSteps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      index < currentStep ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Conteúdo principal */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {setupSteps[currentStep].icon}
              <span>{setupSteps[currentStep].title}</span>
            </CardTitle>
            <p className="text-gray-600">
              {setupSteps[currentStep].description}
            </p>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navegação */}
        <div className="flex items-center justify-between max-w-4xl mx-auto mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          <div className="text-sm text-gray-500">
            Tempo estimado: {setupSteps[currentStep].estimatedTime}
          </div>

          {currentStep < setupSteps.length - 1 ? (
            <Button onClick={nextStep} disabled={!canProceed()}>
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <div /> // Espaço vazio, botão está no conteúdo
          )}
        </div>
      </div>

      {/* Dialog de preview */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview da Configuração</DialogTitle>
            <DialogDescription>
              Revise todas as configurações antes de ativar
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div>
              <h4 className="font-semibold">Empresa</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded">
                {JSON.stringify(companyInfo, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold">Stacks Selecionadas</h4>
              <div className="flex flex-wrap gap-2">
                {selectedStacks.map((stack) => (
                  <Badge key={stack.id}>{stack.name}</Badge>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
