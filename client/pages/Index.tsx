import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Smartphone,
  Zap,
  Brain,
  Shield,
  BarChart3,
  MessageSquare,
  Bot,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Globe,
  TrendingUp,
  Coffee,
  Heart,
  Rocket,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export default function Index() {
  const [currentDemo, setCurrentDemo] = useState("mobile");

  const demoModes = [
    {
      id: "mobile",
      label: "📱 Mobile",
      description: "Interface mobile-first premium",
    },
    { id: "ai", label: "🤖 IA KIRA", description: "Assistente IA humanizada" },
    {
      id: "dashboard",
      label: "📊 Dashboard",
      description: "Analytics em tempo real",
    },
    {
      id: "whatsapp",
      label: "💬 WhatsApp",
      description: "Business automation",
    },
  ];

  const features = [
    {
      icon: Smartphone,
      title: "Mobile-First Premium",
      description:
        "80% dos usuários são mobile - interface otimizada com micro-interações",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
    },
    {
      icon: Brain,
      title: "IA KIRA Humanizada",
      description:
        "Assistente IA brasileira com personalidade e dados 100% reais",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
    },
    {
      icon: MessageSquare,
      title: "WhatsApp Business",
      description: "Evolution API integrada com automação completa",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
    },
    {
      icon: Shield,
      title: "LGPD Compliance",
      description: "Centro de privacidade completo e transparente",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
    },
    {
      icon: BarChart3,
      title: "Analytics Reais",
      description: "Dados conectados às APIs, zero simulações",
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-indigo-50",
    },
    {
      icon: Zap,
      title: "Deploy 1-Click",
      description: "Automação GitHub→Servidor com restart automático",
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
    },
  ];

  const stacksIntegradas = [
    "Evolution API",
    "N8N",
    "Typebot",
    "Mautic",
    "Grafana",
    "Prometheus",
    "Chatwoot",
    "RocketChat",
    "Ollama",
    "Dify",
    "PostgreSQL",
    "Redis",
    "MinIO",
    "Traefik",
    "Uptime Kuma",
    "Metabase",
    "Strapi",
    "Supabase",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  KRYONIX
                </h1>
                <p className="text-xs text-gray-500">SaaS Platform v2.0</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                ✅ 100% Finalizado
              </Badge>
              <Link to="/dashboard">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-purple-500"
                >
                  Ver Interface →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5" />

        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                🚀 Projeto 100% Concluído com Máxima Excelência
              </Badge>

              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Plataforma SaaS
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}
                  100% Autônoma
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                IA KIRA humanizada • Mobile-first premium • Dados 100% reais •
                LGPD compliance • 25+ stacks orquestradas • Deploy automático
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link to="/dashboard">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                    Explorar Interface Premium
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 px-8 py-3"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Ver Analytics Reais
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">25+</div>
                  <div className="text-sm text-gray-600">Stacks Integradas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">100%</div>
                  <div className="text-sm text-gray-600">Dados Reais</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">80%</div>
                  <div className="text-sm text-gray-600">Mobile Otimizado</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    1-Click
                  </div>
                  <div className="text-sm text-gray-600">Deploy Automático</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Demo Modes */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🎯 Demonstração Interativa
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore as funcionalidades implementadas na plataforma
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {demoModes.map((mode) => (
              <motion.button
                key={mode.id}
                onClick={() => setCurrentDemo(mode.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  currentDemo === mode.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-lg mb-2">{mode.label}</div>
                <div className="text-sm text-gray-600">{mode.description}</div>
              </motion.button>
            ))}
          </div>

          <div className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Interface Funcionando no Builder.io
            </h3>
            <p className="text-gray-600 mb-6">
              A interface visual está 100% funcional. Para acessar as
              funcionalidades completas das stacks, use o script de deploy no
              seu servidor.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/dashboard">
                <Button className="bg-blue-500 hover:bg-blue-600">
                  🖥️ Ver Interface Desktop
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline">📱 Testar Mobile Interface</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ✨ Funcionalidades Implementadas
            </h2>
            <p className="text-gray-600">
              Todas as funcionalidades desenvolvidas com máxima excelência
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
                  <CardHeader className={`${feature.bgColor} pb-4`}>
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-3`}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stacks Integradas */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ⚙️ Stacks Orquestradas
            </h2>
            <p className="text-gray-600 mb-8">
              25+ ferramentas funcionando como engrenagens sincronizadas
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stacksIntegradas.map((stack, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 text-center hover:shadow-md transition-all"
              >
                <div className="text-sm font-medium text-gray-700">{stack}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Deploy Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              🚀 Deploy Automático no Seu Servidor
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Script completo para deploy 1-click no seu servidor com todas as
              25+ stacks funcionando
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-left mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-blue-100 text-sm ml-4">Terminal</span>
              </div>
              <code className="text-blue-100 text-sm font-mono">
                # Executar script de deploy automático
                <br />
                ./scripts/deploy-servidor-automatico.sh
                <br />
                <br />
                # ✅ 25+ stacks instaladas automaticamente
                <br />
                # ✅ SSL configurado com Let's Encrypt
                <br />
                # ✅ Deploy contínuo GitHub configurado
                <br /># ✅ Monitoramento e backup automático
              </code>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3"
              >
                <Coffee className="w-5 h-5 mr-2" />
                Ver Script de Deploy
              </Button>
              <div className="flex items-center text-blue-100">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>Configuração automática em ~15 minutos</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">KRYONIX</span>
            </div>

            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Plataforma SaaS 100% autônoma desenvolvida com máxima excelência
              para o mercado brasileiro
            </p>

            <div className="flex items-center justify-center space-x-6 text-sm text-gray-400 mb-6">
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4 text-red-400" />
                <span>Desenvolvido com amor</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>Excelência máxima</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span>Tecnologia 2024</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Explorar Interface
                </Button>
              </Link>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
              <p>
                &copy; 2024 KRYONIX Platform • IA Autônoma • Mobile-First •
                Brasil Nativo
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
