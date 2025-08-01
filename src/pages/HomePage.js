import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Smartphone,
  Brain,
  Zap,
  Shield,
  Cloud,
  MessageCircle,
  BarChart3,
  ArrowRight,
  Play,
  CheckCircle
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Se já estiver logado, redirecionar para dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: Brain,
      title: '15 Agentes IA',
      description: 'Inteligência artificial avançada trabalhando 24/7 para automatizar seus processos'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp Business',
      description: 'Central completa de atendimento com chatbots inteligentes e automação'
    },
    {
      icon: BarChart3,
      title: 'Analytics Avançado',
      description: 'Relatórios em tempo real com insights preditivos e análise de comportamento'
    },
    {
      icon: Cloud,
      title: '8 Módulos SaaS',
      description: 'Plataforma completa com CRM, marketing, vendas e muito mais'
    },
    {
      icon: Smartphone,
      title: 'Mobile-First',
      description: 'Interface otimizada para dispositivos móveis com performance de 60fps'
    },
    {
      icon: Shield,
      title: 'Segurança Enterprise',
      description: 'Criptografia avançada e conformidade com LGPD e padrões internacionais'
    }
  ];

  const stats = [
    { value: '99.9%', label: 'Uptime Garantido' },
    { value: '<50ms', label: 'Latência Média' },
    { value: '24/7', label: 'Suporte IA' },
    { value: '100%', label: 'Mobile Otimizado' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">KRYONIX</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Plataforma SaaS IA</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/login')}
                className="btn-secondary text-sm px-4 py-2"
              >
                Entrar
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-6">
            <Zap size={16} className="mr-2" />
            100% Autônomo por IA
          </div>
          
          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Transforme seu Negócio com
            <span className="text-gradient block mt-2">
              Inteligência Artificial
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            A primeira plataforma SaaS brasileira 100% autônoma. 
            WhatsApp Business, CRM, Analytics e mais, tudo automatizado por IA.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => navigate('/login')}
              className="btn-primary flex items-center justify-center text-lg px-8 py-4"
            >
              <Play size={20} className="mr-2" />
              Começar Grátis
            </button>
            <button className="btn-secondary flex items-center justify-center text-lg px-8 py-4">
              Ver Demo
              <ArrowRight size={20} className="ml-2" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`transition-all duration-1000 delay-${index * 100} ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card border border-gray-100 dark:border-gray-700">
                <div className="text-3xl font-bold text-kryonix-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Recursos Avançados
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Tudo que você precisa para revolucionar seu negócio em uma única plataforma
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`transition-all duration-1000 delay-${index * 100} ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-card border border-gray-100 dark:border-gray-700 hover:shadow-float transition-all duration-300 group">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para Começar?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se às empresas que já revolucionaram seus negócios com IA
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="bg-white text-kryonix-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center"
            >
              <CheckCircle size={20} className="mr-2" />
              Criar Conta Grátis
            </button>
            <button className="border border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors duration-200">
              Falar com Especialista
            </button>
          </div>
          
          <div className="mt-8 text-sm opacity-75">
            ✅ Teste grátis por 14 dias • ✅ Sem cartão de crédito • ✅ Suporte 24/7
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <h3 className="font-bold">KRYONIX</h3>
                <p className="text-sm text-gray-400">Ecossistema Tecnológico Inteligente</p>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-400 mb-1">
                📱 WhatsApp: +55 17 98180-5327
              </p>
              <p className="text-sm text-gray-400">
                📧 admin@kryonix.com.br
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 KRYONIX. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
