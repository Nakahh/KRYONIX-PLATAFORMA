import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CheckCircle,
  Star
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    
    // Rotate features every 3 seconds
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 6);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Brain,
      title: '15 Agentes IA',
      description: 'Inteligência artificial avançada trabalhando 24/7 para automatizar seus processos',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp Business',
      description: 'Central completa de atendimento com chatbots inteligentes e automação',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: BarChart3,
      title: 'Analytics Avançado',
      description: 'Relatórios em tempo real com insights preditivos e análise de comportamento',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Cloud,
      title: '8 Módulos SaaS',
      description: 'Plataforma completa com CRM, marketing, vendas e muito mais',
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      icon: Smartphone,
      title: 'Mobile-First',
      description: 'Interface otimizada para dispositivos móveis com performance de 60fps',
      color: 'from-pink-500 to-pink-600'
    },
    {
      icon: Shield,
      title: 'Segurança Enterprise',
      description: 'Criptografia avançada e conformidade com LGPD e padrões internacionais',
      color: 'from-red-500 to-red-600'
    }
  ];

  const stats = [
    { value: '99.9%', label: 'Uptime', icon: <Activity className="w-5 h-5" /> },
    { value: '<50ms', label: 'Latência', icon: <Zap className="w-5 h-5" /> },
    { value: '24/7', label: 'Suporte IA', icon: <Brain className="w-5 h-5" /> },
    { value: '100%', label: 'Mobile', icon: <Smartphone className="w-5 h-5" /> }
  ];

  const testimonials = [
    {
      name: "Carlos Silva",
      company: "TechCorp",
      text: "KRYONIX revolucionou nossa operação. Aumentamos 300% a eficiência.",
      rating: 5
    },
    {
      name: "Ana Costa",
      company: "Digital Pro",
      text: "A IA funciona de verdade. Nosso atendimento nunca para.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">KRYONIX</h1>
                <p className="text-xs text-gray-500">Plataforma SaaS IA</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/test')}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Demo
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Entrar
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-medium mb-8">
            <Zap size={16} className="mr-2" />
            🇧🇷 100% Autônomo por IA • Feito no Brasil
          </div>
          
          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
            O Futuro dos
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent block">
              Negócios é IA
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Primeira plataforma SaaS brasileira <strong>100% autônoma</strong>. 
            <br className="hidden md:block" />
            WhatsApp, CRM, Analytics e 15 agentes de IA trabalhando para você.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
            >
              <Play size={24} className="mr-3" />
              Começar Agora - Grátis
            </button>
            <button 
              onClick={() => navigate('/test')}
              className="bg-white border-2 border-gray-200 text-gray-700 px-10 py-4 rounded-xl font-bold text-lg hover:border-blue-300 hover:text-blue-600 transition-all duration-200 flex items-center justify-center"
            >
              Ver Demo Ao Vivo
              <ArrowRight size={24} className="ml-3" />
            </button>
          </div>

          {/* Trust Badge */}
          <div className="text-sm text-gray-500 mb-8">
            ✅ Teste grátis 14 dias • ✅ Sem cartão • ✅ Suporte 24/7 • ✅ LGPD Compliant
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-6 text-center shadow-lg transition-all duration-500 delay-${index * 100} ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <div className="text-blue-600 mb-3 flex justify-center">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 text-sm font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Tecnologia que Impressiona
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cada recurso foi desenvolvido para maximizar seus resultados com o mínimo de esforço
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = index === activeFeature;
              
              return (
                <div
                  key={index}
                  className={`bg-white rounded-3xl p-8 shadow-lg border transition-all duration-500 hover:shadow-2xl group cursor-pointer ${
                    isActive ? 'ring-2 ring-blue-500 transform scale-105' : 'hover:transform hover:scale-105'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={32} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-16">
            Clientes que Transformaram seus Negócios
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={20} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-lg mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div>
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="text-blue-200">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gray-900 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pronto para a Revolução?
          </h2>
          <p className="text-xl mb-12 text-gray-300 max-w-2xl mx-auto">
            Junte-se às empresas brasileiras que já estão no futuro
          </p>
          
          <button
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-5 rounded-xl font-bold text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-200 inline-flex items-center"
          >
            <CheckCircle size={28} className="mr-3" />
            Transformar Meu Negócio Agora
          </button>
          
          <div className="mt-8 text-sm text-gray-400">
            Mais de 10.000 empresas já confiam na KRYONIX
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">K</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">KRYONIX</h3>
                <p className="text-sm text-gray-400">O Futuro dos Negócios</p>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-400 mb-1">
                📱 WhatsApp: +55 17 98180-5327
              </p>
              <p className="text-sm text-gray-400">
                📧 contato@kryonix.com.br
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 KRYONIX. Transformando o Brasil com IA.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
