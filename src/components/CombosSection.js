import React from 'react';
import { Check, Star, Zap } from 'lucide-react';

const CombosSection = () => {
  const combos = [
    {
      nome: "Starter",
      preco: "99",
      precoMax: "299",
      periodo: "/mês",
      descricao: "1 módulo à escolha",
      popular: false,
      modulos: ["Módulo à sua escolha"],
      recursos: [
        "✅ IA 100% Autônoma",
        "✅ Interface Mobile-First",
        "✅ Suporte em Português",
        "✅ 7 dias teste grátis",
        "✅ SSL automático"
      ],
      cor: "border-gray-200"
    },
    {
      nome: "Business",
      preco: "279",
      periodo: "/mês",
      descricao: "Módulos 1 a 3",
      popular: true,
      economia: "Economia de R$ 79/mês",
      modulos: [
        "📊 Análise Avançada (R$ 99)",
        "📅 Agendamento IA (R$ 119)",
        "💬 Atendimento Omnichannel (R$ 159)"
      ],
      recursos: [
        "✅ Tudo do Starter",
        "✅ Dashboard multicanal",
        "✅ Agendamento inteligente",
        "✅ Atendimento IA multimodal",
        "✅ Suporte prioritário"
      ],
      cor: "border-blue-500 ring-2 ring-blue-200"
    },
    {
      nome: "Professional",
      preco: "599",
      periodo: "/mês",
      descricao: "Módulos 1 a 5",
      popular: false,
      economia: "Economia de R$ 177/mês",
      modulos: [
        "📊 Análise Avançada",
        "📅 Agendamento IA", 
        "💬 Atendimento Omnichannel",
        "👥 CRM & Funil de Vendas",
        "📧 Email Marketing IA"
      ],
      recursos: [
        "✅ Tudo do Business",
        "✅ CRM completo com IA",
        "✅ Email marketing automático",
        "✅ Funil de vendas visual",
        "✅ Suporte dedicado"
      ],
      cor: "border-purple-500"
    },
    {
      nome: "Agency",
      preco: "1.099",
      periodo: "/mês",
      descricao: "Módulos 1 a 7",
      popular: false,
      economia: "Economia de R$ 264/mês",
      modulos: [
        "📊 Análise Avançada",
        "📅 Agendamento IA",
        "💬 Atendimento Omnichannel", 
        "👥 CRM & Funil de Vendas",
        "📧 Email Marketing IA",
        "📱 Redes Sociais IA",
        "📚 Portal do Cliente"
      ],
      recursos: [
        "✅ Tudo do Professional",
        "✅ Gestão redes sociais IA",
        "✅ Portal cliente white-label",
        "✅ Treinamentos automáticos",
        "✅ Suporte VIP 24/7"
      ],
      cor: "border-green-500"
    },
    {
      nome: "Premium Whitelabel",
      preco: "1.349",
      periodo: "/mês",
      descricao: "Todos os 8 módulos + whitelabel",
      popular: false,
      destaque: true,
      economia: "Economia de R$ 1.346/mês",
      modulos: [
        "🎯 TODOS os 8 módulos SaaS",
        "🏷️ Whitelabel completo",
        "🎨 Branding personalizado",
        "🔧 Desenvolvimento sob medida"
      ],
      recursos: [
        "✅ Plataforma completa",
        "✅ Instância isolada dedicada",
        "✅ IA treinada para sua marca",
        "✅ APIs abertas e documentadas",
        "✅ SLA personalizado Premium"
      ],
      cor: "border-gradient-to-r from-yellow-400 to-orange-500 bg-gradient-to-r from-yellow-50 to-orange-50"
    }
  ];

  return (
    <section id="combos" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Combos com Desconto Progressivo
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Quanto mais módulos você escolher, maior o desconto. Todos com 7 dias de teste grátis.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {combos.map((combo, index) => (
            <div 
              key={combo.nome} 
              className={`
                relative bg-white rounded-lg p-6 shadow-lg border-2 transition-all duration-300 hover:shadow-xl
                ${combo.popular ? 'border-blue-500 ring-2 ring-blue-200 transform scale-105' : combo.cor}
                ${combo.destaque ? 'bg-gradient-to-b from-yellow-50 to-orange-50 border-orange-400' : ''}
              `}
            >
              {combo.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Mais Popular
                  </span>
                </div>
              )}

              {combo.destaque && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                    <Zap className="h-4 w-4 mr-1" />
                    Completo
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{combo.nome}</h3>
                <div className="mb-2">
                  {combo.precoMax ? (
                    <span className="text-3xl font-bold text-gray-900">
                      R$ {combo.preco} - {combo.precoMax}
                      <span className="text-lg font-normal text-gray-600">{combo.periodo}</span>
                    </span>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900">
                      R$ {combo.preco}
                      <span className="text-lg font-normal text-gray-600">{combo.periodo}</span>
                    </span>
                  )}
                </div>
                <p className="text-gray-600">{combo.descricao}</p>
                {combo.economia && (
                  <p className="text-green-600 font-semibold text-sm mt-1">{combo.economia}</p>
                )}
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Módulos inclusos:</h4>
                <ul className="space-y-2">
                  {combo.modulos.map((modulo, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      {modulo}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Recursos:</h4>
                <ul className="space-y-2">
                  {combo.recursos.map((recurso, idx) => (
                    <li key={idx} className="text-sm text-gray-700">
                      {recurso}
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                className={`
                  w-full py-3 px-4 rounded-lg font-semibold transition-colors duration-200
                  ${combo.popular 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : combo.destaque
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }
                `}
              >
                🚀 Começar Teste Grátis
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-2">
                7 dias grátis • Sem cartão de crédito
              </p>
            </div>
          ))}
        </div>

        {/* Guarantee section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center bg-green-50 border border-green-200 rounded-lg px-6 py-4">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-full mr-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-green-800">Garantia de 30 dias</h3>
                <p className="text-green-700 text-sm">
                  Não ficou satisfeito? Devolvemos 100% do seu dinheiro, sem perguntas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CombosSection;
