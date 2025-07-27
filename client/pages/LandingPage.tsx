import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useMobile } from "../hooks/use-mobile";
import {
  ArrowRight,
  Play,
  CheckCircle,
  Star,
  Zap,
  Shield,
  Smartphone,
  TrendingUp,
  Users,
  Globe,
  Bot,
  Rocket,
  MessageSquare,
  BarChart3,
  Settings,
  Heart,
  Award,
  Target,
  Layers,
  Gauge,
  Clock,
  DollarSign,
  Lock,
  Wifi,
  Headphones,
  ChevronDown,
  Menu,
  X,
  Send,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
} from "lucide-react";

interface Depoimento {
  nome: string;
  cargo: string;
  empresa: string;
  avatar: string;
  comentario: string;
  rating: number;
}

interface Estatistica {
  numero: string;
  label: string;
  icon: React.ReactNode;
  cor: string;
}

interface Funcionalidade {
  titulo: string;
  descricao: string;
  icon: React.ReactNode;
  cor: string;
  beneficios: string[];
}

const LandingPage: React.FC = () => {
  const isMobile = useMobile();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState("hero");
  const [isScrolled, setIsScrolled] = useState(false);

  // Controle de scroll para navbar transparente
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Estatísticas em tempo real
  const estatisticas: Estatistica[] = [
    {
      numero: "25+",
      label: "Stacks Integradas",
      icon: <Layers className="h-6 w-6" />,
      cor: "text-blue-600",
    },
    {
      numero: "99.9%",
      label: "Uptime Garantido",
      icon: <Shield className="h-6 w-6" />,
      cor: "text-green-600",
    },
    {
      numero: "1000+",
      label: "Empresas Ativas",
      icon: <Users className="h-6 w-6" />,
      cor: "text-purple-600",
    },
    {
      numero: "5M+",
      label: "Mensagens/Mês",
      icon: <MessageSquare className="h-6 w-6" />,
      cor: "text-orange-600",
    },
  ];

  // Funcionalidades principais
  const funcionalidades: Funcionalidade[] = [
    {
      titulo: "IA Autônoma Avançada",
      descricao:
        "Sistema inteligente que gerencia toda sua infraestrutura automaticamente",
      icon: <Bot className="h-8 w-8" />,
      cor: "bg-blue-500",
      beneficios: [
        "Automação 100%",
        "Decisões inteligentes",
        "Aprendizado contínuo",
      ],
    },
    {
      titulo: "WhatsApp Business API",
      descricao:
        "Integração oficial completa com recursos empresariais avançados",
      icon: <MessageSquare className="h-8 w-8" />,
      cor: "bg-green-500",
      beneficios: ["API oficial", "Múltiplas instâncias", "Chatbots avançados"],
    },
    {
      titulo: "Analytics Inteligente",
      descricao:
        "Métricas avançadas com insights automáticos e relatórios personalizados",
      icon: <BarChart3 className="h-8 w-8" />,
      cor: "bg-purple-500",
      beneficios: [
        "Dashboards em tempo real",
        "Relatórios IA",
        "Métricas avançadas",
      ],
    },
    {
      titulo: "Orquestração de Stacks",
      descricao: "Gerenciamento inteligente de todas as tecnologias integradas",
      icon: <Settings className="h-8 w-8" />,
      cor: "bg-orange-500",
      beneficios: ["25+ stacks", "Deploy automático", "Monitoramento 24/7"],
    },
    {
      titulo: "Segurança Empresarial",
      descricao:
        "Proteção avançada com compliance LGPD e certificações internacionais",
      icon: <Shield className="h-8 w-8" />,
      cor: "bg-red-500",
      beneficios: ["LGPD compliance", "SSL avançado", "Backup automático"],
    },
    {
      titulo: "Suporte Premium 24/7",
      descricao: "Atendimento especializado com equipe técnica dedicada",
      icon: <Headphones className="h-8 w-8" />,
      cor: "bg-indigo-500",
      beneficios: [
        "Suporte 24/7",
        "Equipe especializada",
        "Implementação gratuita",
      ],
    },
  ];

  // Depoimentos reais
  const depoimentos: Depoimento[] = [
    {
      nome: "Carlos Eduardo",
      cargo: "CEO",
      empresa: "TechSolutions SP",
      avatar: "/api/placeholder/64/64",
      comentario:
        "KRYONIX revolucionou nossa operação. A IA autônoma economizou 70% do tempo da nossa equipe técnica.",
      rating: 5,
    },
    {
      nome: "Marina Santos",
      cargo: "Diretora de Marketing",
      empresa: "Digital Commerce RJ",
      avatar: "/api/placeholder/64/64",
      comentario:
        "Integramos 15 ferramentas em uma só plataforma. O ROI foi impressionante já no primeiro mês.",
      rating: 5,
    },
    {
      nome: "Roberto Lima",
      cargo: "CTO",
      empresa: "StartupTech MG",
      avatar: "/api/placeholder/64/64",
      comentario:
        "A automação do WhatsApp Business aumentou nossas conversões em 340%. Simplesmente incrível!",
      rating: 5,
    },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setCurrentSection(sectionId);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-lg shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              onClick={() => scrollToSection("hero")}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span
                className={`text-xl font-bold ${isScrolled ? "text-gray-900" : "text-white"}`}
              >
                KRYONIX
              </span>
            </motion.div>

            {/* Desktop Menu */}
            {!isMobile && (
              <div className="hidden md:flex items-center space-x-8">
                <button
                  onClick={() => scrollToSection("funcionalidades")}
                  className={`text-sm font-medium transition-colors ${
                    isScrolled
                      ? "text-gray-700 hover:text-blue-600"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  Funcionalidades
                </button>
                <button
                  onClick={() => scrollToSection("precos")}
                  className={`text-sm font-medium transition-colors ${
                    isScrolled
                      ? "text-gray-700 hover:text-blue-600"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  Preços
                </button>
                <button
                  onClick={() => scrollToSection("depoimentos")}
                  className={`text-sm font-medium transition-colors ${
                    isScrolled
                      ? "text-gray-700 hover:text-blue-600"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  Clientes
                </button>
                <button
                  onClick={() => scrollToSection("contato")}
                  className={`text-sm font-medium transition-colors ${
                    isScrolled
                      ? "text-gray-700 hover:text-blue-600"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  Contato
                </button>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
                className={
                  isScrolled
                    ? "text-gray-700 hover:text-blue-600"
                    : "text-white hover:text-white/80"
                }
              >
                Entrar
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/register")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white gap-2"
              >
                Começar Grátis
                <ArrowRight className="h-4 w-4" />
              </Button>

              {/* Mobile Menu Button */}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className={isScrolled ? "text-gray-700" : "text-white"}
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-200 shadow-lg"
            >
              <div className="px-4 py-3 space-y-3">
                <button
                  onClick={() => {
                    scrollToSection("funcionalidades");
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-700 hover:text-blue-600 py-2"
                >
                  Funcionalidades
                </button>
                <button
                  onClick={() => {
                    scrollToSection("precos");
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-700 hover:text-blue-600 py-2"
                >
                  Preços
                </button>
                <button
                  onClick={() => {
                    scrollToSection("depoimentos");
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-700 hover:text-blue-600 py-2"
                >
                  Clientes
                </button>
                <button
                  onClick={() => {
                    scrollToSection("contato");
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-700 hover:text-blue-600 py-2"
                >
                  Contato
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900" />

        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20">
              🚀 Plataforma SaaS Mais Avançada do Mercado
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Automatize Seu Negócio com{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Inteligência Artificial
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
              Plataforma completa que integra <strong>25+ ferramentas</strong>{" "}
              em uma só, com IA autônoma que gerencia tudo automaticamente.
              <span className="text-blue-300">
                WhatsApp Business, Analytics, CRM, E-commerce
              </span>{" "}
              e muito mais.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                size="lg"
                onClick={() => navigate("/register")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg gap-3 shadow-2xl"
              >
                <Rocket className="h-5 w-5" />
                Começar Grátis por 7 Dias
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => scrollToSection("demo")}
                className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg gap-3"
              >
                <Play className="h-5 w-5" />
                Ver Demonstração
              </Button>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {estatisticas.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="text-center"
                >
                  <div className={`${stat.cor} mb-2 flex justify-center`}>
                    {stat.icon}
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {stat.numero}
                  </div>
                  <div className="text-sm text-white/70">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="h-6 w-6 text-white/60" />
        </motion.div>
      </section>

      {/* Funcionalidades Section */}
      <section id="funcionalidades" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
              🎯 Funcionalidades Avançadas
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Tudo que Sua Empresa Precisa em{" "}
              <span className="text-blue-600">Uma Plataforma</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Integração completa de todas as ferramentas essenciais com
              automação inteligente que funciona 24/7 sem intervenção humana.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {funcionalidades.map((func, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div
                      className={`w-16 h-16 ${func.cor} rounded-xl flex items-center justify-center text-white mb-4`}
                    >
                      {func.icon}
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {func.titulo}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {func.descricao}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {func.beneficios.map((beneficio, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm text-gray-700"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          {beneficio}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200">
              📱 Demonstração Ao Vivo
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Veja a Plataforma em <span className="text-purple-600">Ação</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Interface intuitiva, design responsivo e funcionalidades avançadas
              que impressionam desde o primeiro acesso.
            </p>

            <Button
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg gap-3 shadow-xl"
            >
              <Target className="h-5 w-5" />
              Acessar Dashboard Demo
            </Button>
          </motion.div>

          {/* Demo Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 shadow-2xl">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <div className="flex-1 text-center text-gray-600 text-sm">
                    dashboard.kryonix.com.br
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-gray-900">
                        WhatsApp API
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      1,247
                    </div>
                    <div className="text-sm text-gray-600">Mensagens hoje</div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-gray-900">
                        Conversões
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      34.2%
                    </div>
                    <div className="text-sm text-gray-600">Taxa de sucesso</div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Gauge className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-gray-900">
                        Performance
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      99.9%
                    </div>
                    <div className="text-sm text-gray-600">Uptime</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Depoimentos Section */}
      <section id="depoimentos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-green-100 text-green-700 border-green-200">
              💬 Depoimentos Reais
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Mais de <span className="text-green-600">1000 Empresas</span> Já
              Transformaram Seus Negócios
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Veja como empresas reais estão conseguindo resultados
              impressionantes com nossa plataforma de automação inteligente.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {depoimentos.map((depoimento, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(depoimento.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>

                    <p className="text-gray-700 mb-6 italic">
                      "{depoimento.comentario}"
                    </p>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {depoimento.nome
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {depoimento.nome}
                        </div>
                        <div className="text-sm text-gray-600">
                          {depoimento.cargo} • {depoimento.empresa}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-orange-100 text-orange-700 border-orange-200">
              💰 Planos e Preços
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Planos que se Adaptam ao{" "}
              <span className="text-orange-600">Seu Negócio</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comece grátis e evolua conforme seu negócio cresce. Todos os
              planos incluem suporte premium e atualizações automáticas.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Plano Starter */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                    Starter
                  </CardTitle>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    R$ 97
                    <span className="text-lg font-normal text-gray-600">
                      /mês
                    </span>
                  </div>
                  <CardDescription>
                    Ideal para pequenas empresas e startups
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">5 stacks integradas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Até 1.000 mensagens/mês</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Dashboard básico</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Suporte por email</span>
                    </li>
                  </ul>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => navigate("/register?plan=starter")}
                  >
                    Começar Grátis
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Plano Professional */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-2 border-blue-500 shadow-xl hover:shadow-2xl transition-all duration-300 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1">
                    Mais Popular
                  </Badge>
                </div>
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                    Professional
                  </CardTitle>
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    R$ 297
                    <span className="text-lg font-normal text-gray-600">
                      /mês
                    </span>
                  </div>
                  <CardDescription>
                    Para empresas em crescimento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">15 stacks integradas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Até 10.000 mensagens/mês</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">IA avançada + automação</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Suporte prioritário 24/7</span>
                    </li>
                  </ul>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => navigate("/register?plan=professional")}
                  >
                    Começar Teste Grátis
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Plano Enterprise */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                    Enterprise
                  </CardTitle>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    R$ 997
                    <span className="text-lg font-normal text-gray-600">
                      /mês
                    </span>
                  </div>
                  <CardDescription>
                    Para grandes empresas e corporações
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">25+ stacks integradas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Mensagens ilimitadas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">White-label completo</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Gerente de conta dedicado</span>
                    </li>
                  </ul>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => navigate("/register?plan=enterprise")}
                  >
                    Falar com Vendas
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Pronto para Automatizar Seu Negócio?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Junte-se a mais de 1000 empresas que já transformaram seus
              resultados com nossa plataforma de IA autônoma.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/register")}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg gap-3 shadow-xl"
              >
                <Rocket className="h-5 w-5" />
                Começar Grátis Agora
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => scrollToSection("contato")}
                className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg gap-3"
              >
                <Phone className="h-5 w-5" />
                Falar com Especialista
              </Button>
            </div>

            <p className="text-white/70 text-sm mt-4">
              ✨ 7 dias grátis • Sem cartão de crédito • Cancelamento a qualquer
              momento
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Entre em Contato
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nossa equipe está pronta para ajudar você a implementar a
              automação perfeita para seu negócio.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Telefone</h4>
                      <p className="text-gray-600">(11) 99999-9999</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Email</h4>
                      <p className="text-gray-600">contato@kryonix.com.br</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Endereço</h4>
                      <p className="text-gray-600">São Paulo, SP</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Seu nome completo"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="seu@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Empresa
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nome da sua empresa"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mensagem
                      </label>
                      <textarea
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Como podemos ajudar você?"
                      />
                    </div>

                    <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
                      <Send className="h-4 w-4" />
                      Enviar Mensagem
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">KRYONIX</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Plataforma SaaS mais avançada do mercado, integrando 25+
                ferramentas com inteligência artificial autônoma para
                automatizar seu negócio.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white p-2"
                >
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white p-2"
                >
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white p-2"
                >
                  <Linkedin className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white p-2"
                >
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white p-2"
                >
                  <Youtube className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => scrollToSection("funcionalidades")}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Funcionalidades
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("precos")}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Preços
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/login")}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Login
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/register")}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Cadastro
                  </button>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Central de Ajuda
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Documentação
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("contato")}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Contato
                  </button>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Status do Sistema
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 KRYONIX. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Política de Privacidade
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Termos de Uso
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                LGPD
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
