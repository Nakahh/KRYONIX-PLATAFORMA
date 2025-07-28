import React from 'react';
import { BarChart3, Calendar, MessageSquare, Users, Mail, Share2, BookOpen, Palette } from 'lucide-react';

const ModulosSection = () => {
  const modulos = [
    {
      id: 1,
      icon: BarChart3,
      nome: "Análise Avançada e Inteligência Comercial",
      preco: "R$ 99/mês",
      descricao: "Dashboard multicanal com IA preditiva para análise de vendas e comportamento do cliente",
      funcionalidades: [
        "📊 Dashboard multicanal (WhatsApp, Instagram, Facebook, Google Analytics, TikTok)",
        "🔮 Previsão de vendas e churn com IA preditiva",
        "🗺️ Mapa de calor de acessos e interações",
        "⚔️ Benchmarking competitivo do setor",
        "💰 Análise de ROI por campanha e canal"
      ],
      extras: [
        "Relatórios automáticos por WhatsApp/Email (R$ 29/m��s)",
        "Atendimento por voz com IA (R$ 49/mês)",
        "Feed diário de sugestões personalizadas (R$ 34/mês)"
      ],
      usuarios: ["Agências de marketing digital", "E-commerces pequenos e médios", "Hotéis boutique e pousadas"],
      cor: "bg-blue-500"
    },
    {
      id: 2,
      icon: Calendar,
      nome: "Agendamento Inteligente com IA e Cobrança",
      preco: "R$ 119/mês",
      descricao: "Sistema de agendamento com buffer dinâmico e cobrança automatizada",
      funcionalidades: [
        "📅 Agenda integrada com Google Calendar, WhatsApp, Instagram",
        "🧠 Buffer dinâmico para evitar sobreposição de horários",
        "👥 Gestão de serviços e equipe com múltiplos turnos",
        "💳 Cobrança automática (Pix, cartão, boleto, Stripe)",
        "📲 Lembretes via WhatsApp, SMS, e-mail e chamadas por IA"
      ],
      extras: [
        "Cobrança antecipada integrada via Pix/Stripe (R$ 39/mês)",
        "Campanhas de reengajamento automáticas via IA (R$ 42/mês)",
        "Pesquisa detalhada de satisfação (R$ 23/mês)"
      ],
      usuarios: ["Clínicas médicas e odontológicas", "Academias e estúdios", "Salões de beleza"],
      cor: "bg-green-500"
    },
    {
      id: 3,
      icon: MessageSquare,
      nome: "Atendimento Omnichannel com IA Multimodal",
      preco: "R$ 159/mês",
      descricao: "Caixa única para todos os canais com IA que entende texto, voz, imagem e documentos",
      funcionalidades: [
        "📱 Caixa única (WhatsApp, Instagram, Messenger, SMS, e-mail, site, voz)",
        "🤖 IA multimodal (texto, voz, vídeo, imagens, documentos)",
        "🎯 Análise semântica e de sentimento para priorização",
        "📄 Reconhecimento e validação de documentos via OCR",
        "🌍 Tradução multilíngue em tempo real"
      ],
      extras: [
        "Integração com CRM externo (RD Station, Ploomes) – R$ 34/mês",
        "Atendimento por voz IA avançado – R$ 52/mês",
        "Tradução multilíngue automática – R$ 37/mês"
      ],
      usuarios: ["Lojas virtuais com atendimento 24/7", "Agências de suporte técnico", "Call centers"],
      cor: "bg-purple-500"
    },
    {
      id: 4,
      icon: Users,
      nome: "CRM & Funil de Vendas com Cobrança",
      preco: "R$ 179/mês",
      descricao: "Pipeline visual com qualificação de leads por IA e cobrança integrada",
      funcionalidades: [
        "🎯 Pipeline visual drag-and-drop customizável",
        "🤖 Qualificação e scoring de leads com IA",
        "📧 Follow-up automático via e-mail, SMS, WhatsApp, push",
        "📝 Propostas e contratos digitais automatizados",
        "💰 Cobrança integrada via Pix, cartão, boleto, Stripe"
      ],
      extras: [
        "Pipeline inteligente com IA para previsão e prioridade – R$ 37/mês",
        "Notificações avançadas em Telegram/WhatsApp – R$ 22/mês",
        "Painel financeiro com insights automáticos – R$ 32/mês"
      ],
      usuarios: ["Imobiliárias e corretores", "Empresas SaaS", "Infoprodutores", "Consultorias"],
      cor: "bg-orange-500"
    },
    {
      id: 5,
      icon: Mail,
      nome: "Email Marketing Multicanal com IA Generativa",
      preco: "R$ 219/mês",
      descricao: "Funil visual com IA que cria conteúdo automaticamente (texto, imagem, vídeo)",
      funcionalidades: [
        "🎨 Funil de marketing visual completo e personalizável",
        "🧠 Criação automatizada de conteúdo (texto, imagem, vídeo) via IA",
        "🔬 Testes A/B e otimização automática",
        "📱 Landing pages responsivas geradas por IA",
        "🎯 Triggers inteligentes baseados em comportamento"
      ],
      extras: [
        "Editor visual estilo Canva com assistente IA – R$ 47/m��s",
        "Criação automática de vídeos promocionais – R$ 62/mês",
        "Otimização contínua por IA em tempo real – R$ 44/mês"
      ],
      usuarios: ["Agências de marketing digital", "Lojas virtuais", "Influenciadores", "Setores de varejo"],
      cor: "bg-red-500"
    },
    {
      id: 6,
      icon: Share2,
      nome: "Gestão de Redes Sociais com IA + Agendamento",
      preco: "R$ 239/mês",
      descricao: "Calendário editorial multicanal com IA que sugere conteúdo e horários",
      funcionalidades: [
        "📅 Calendário editorial multicanal (Instagram, Facebook, TikTok, YouTube)",
        "🏷️ Sugestão de hashtags, temas e melhores horários via IA",
        "🔄 Repost e cross-post inteligente para ampliar alcance",
        "👁️ Monitoramento unificado de menções e comentários",
        "🎨 Editor visual integrado para criação de imagens e vídeos"
      ],
      extras: [
        "Sugestões de tendências via IA – R$ 38/mês",
        "Repost automático com agendamento inteligente – R$ 32/mês",
        "Caixa de comentários unificada – R$ 28/mês"
      ],
      usuarios: ["Influenciadores digitais", "Marcas de moda/beleza", "Restaurantes", "Startups"],
      cor: "bg-pink-500"
    },
    {
      id: 7,
      icon: BookOpen,
      nome: "Portal do Cliente, Treinamento & Gestão Documental",
      preco: "R$ 269/mês",
      descricao: "Portal white-label com treinamentos IA e gestão documental inteligente",
      funcionalidades: [
        "🏷️ Portal white-label customizável para clientes",
        "📚 Base de conhecimento treinada com IA para busca eficiente",
        "🎓 Módulo de treinamentos com vídeos, quizzes e certificados digitais",
        "📋 Workflow para aprovação e revisão de documentos",
        "✍️ Assinatura digital integrada para contratos"
      ],
      extras: [
        "Certificados digitais automáticos – R$ 26/mês",
        "Integração completa com ERP e folha de pagamento – R$ 54/mês",
        "Base de conhecimento IA treinada personalizada – R$ 43/mês"
      ],
      usuarios: ["Redes de franquias", "Universidades corporativas", "Consultorias", "Empresas com compliance"],
      cor: "bg-indigo-500"
    },
    {
      id: 8,
      icon: Palette,
      nome: "Whitelabel & Plataforma Customizável + Módulo Sob Medida",
      preco: "R$ 299/mês + setup R$ 997",
      descricao: "Instância isolada com branding total e desenvolvimento customizado",
      funcionalidades: [
        "🎨 Branding total com domínio e identidade visual customizáveis",
        "🏢 Instância isolada e dedicada (isolamento completo de dados)",
        "🔌 APIs abertas e documentadas para integrações customizadas",
        "👑 SLA personalizado e suporte premium 24/7",
        "🤖 IA treinada com dados específicos da marca"
      ],
      extras: [
        "Desenvolvimento de módulos exclusivos – orçamento personalizado",
        "IA com voz clonada da marca para atendimento – R$ 125/mês",
        "Pacote completo de implementação e treinamento premium – R$ 312"
      ],
      usuarios: ["Agências digitais", "Redes de franquias", "Empresas tech", "Plataformas SaaS"],
      cor: "bg-gradient-to-r from-blue-600 to-purple-600"
    }
  ];

  return (
    <section id="modulos" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            8 Módulos SaaS Integrados
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Cada módulo opera de forma 100% autônoma por IA. Escolha os módulos que precisa 
            ou use nossos combos com desconto.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {modulos.map((modulo) => {
            const IconComponent = modulo.icon;
            return (
              <div key={modulo.id} className="card hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`${modulo.cor} p-3 rounded-lg mr-4`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{modulo.nome}</h3>
                      <p className="text-2xl font-bold text-blue-600">{modulo.preco}</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{modulo.descricao}</p>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">✨ Funcionalidades Principais:</h4>
                  <ul className="space-y-1">
                    {modulo.funcionalidades.slice(0, 3).map((func, index) => (
                      <li key={index} className="text-sm text-gray-600">{func}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">🎁 Extras Disponíveis:</h4>
                  <ul className="space-y-1">
                    {modulo.extras.slice(0, 2).map((extra, index) => (
                      <li key={index} className="text-sm text-gray-500">{extra}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">👥 Ideal para:</h4>
                  <div className="flex flex-wrap gap-2">
                    {modulo.usuarios.slice(0, 2).map((usuario, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {usuario}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="btn-primary flex-1">
                    🚀 Testar Grátis
                  </button>
                  <button className="btn-secondary">
                    📋 Detalhes
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ModulosSection;
