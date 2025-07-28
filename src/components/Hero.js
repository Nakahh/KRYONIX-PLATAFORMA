import React, { useState } from 'react';
import { ArrowRight, Bot, Smartphone, Globe } from 'lucide-react';

const Hero = () => {
  const [projectDescription, setProjectDescription] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');

  const handleAIAnalysis = () => {
    // Simulate AI analysis
    if (projectDescription.toLowerCase().includes('delivery') || projectDescription.toLowerCase().includes('entrega')) {
      setAiSuggestion('🍕 Recomendamos: Combo Marketplace Completo (R$ 697) - Ideal para apps de delivery como iFood. Inclui: Cadastro Multilado + Pagamento Split + Busca + Chat + Notificações');
    } else if (projectDescription.toLowerCase().includes('saas') || projectDescription.toLowerCase().includes('plataforma')) {
      setAiSuggestion('💻 Recomendamos: Combo SaaS Lançamento (R$ 297) - Perfeito para startups SaaS. Inclui: Auth + Dashboard + Pagamento + IA + E-mail');
    } else if (projectDescription.toLowerCase().includes('blog') || projectDescription.toLowerCase().includes('conteúdo')) {
      setAiSuggestion('📝 Recomendamos: Combo Blog & Monetização (R$ 129) - Ideal para criadores de conteúdo. Inclui: CMS + Newsletter + Adsense Ready + SEO + Comentários');
    } else {
      setAiSuggestion('🤖 Com base na sua descrição, nossa IA sugere uma análise mais detalhada. Entre em contato para um orçamento personalizado!');
    }
  };

  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Plataforma SaaS
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              100% Autônoma por IA
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            8 módulos integrados que funcionam automaticamente. Sua empresa gerenciada 
            por inteligência artificial, sem precisar de conhecimento técnico.
          </p>
          
          {/* IA Project Analysis Box */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center">
                <Bot className="h-5 w-5 mr-2 text-blue-600" />
                🤖 Descreva seu projeto e nossa IA criará a solução ideal
              </h3>
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Ex: Quero criar um app de delivery como iFood para minha cidade..."
                className="w-full p-4 border border-gray-300 rounded-lg resize-none h-20 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              />
              <button
                onClick={handleAIAnalysis}
                disabled={!projectDescription.trim()}
                className="mt-4 w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✨ Analisar com IA
              </button>
              
              {aiSuggestion && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 font-medium">{aiSuggestion}</p>
                  <button className="mt-2 text-blue-600 hover:text-blue-800 font-semibold">
                    Ver detalhes →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Key Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center p-6">
              <div className="bg-blue-100 p-3 rounded-full mb-4">
                <Bot className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">🤖 IA Autônoma</h3>
              <p className="text-gray-600 text-center">
                Sistema opera 100% automaticamente. A IA toma todas as decisões e executa todas as tarefas.
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6">
              <div className="bg-green-100 p-3 rounded-full mb-4">
                <Smartphone className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">📱 Mobile-First</h3>
              <p className="text-gray-600 text-center">
                80% dos usuários usam mobile. Interface otimizada para dispositivos móveis.
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6">
              <div className="bg-purple-100 p-3 rounded-full mb-4">
                <Globe className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">🇧🇷 100% Português</h3>
              <p className="text-gray-600 text-center">
                Interface descomplicada em português para quem não entende de programação.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
              🚀 Começar Teste Grátis 7 Dias
            </button>
            <button className="btn-secondary text-lg px-8 py-4">
              📊 Ver Demonstração
            </button>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            ✅ Sem cartão de crédito • ✅ Cancelamento a qualquer momento • ✅ Suporte em português
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600">8</div>
            <div className="text-gray-600">Módulos SaaS</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">32</div>
            <div className="text-gray-600">Stacks Integradas</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600">100%</div>
            <div className="text-gray-600">IA Autônoma</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600">80%</div>
            <div className="text-gray-600">Mobile-First</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
