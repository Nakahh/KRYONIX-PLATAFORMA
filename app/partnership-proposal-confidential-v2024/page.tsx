'use client'

import { useState } from 'react'
import Link from 'next/link'
import Logo from '@/app/components/Logo'
import ViewCounter from '@/app/components/ViewCounter'
import { FileText, Download, Globe, ArrowRight, Lock, Eye, Users, TrendingUp, Server, Shield } from 'lucide-react'

const languages = [
  { code: 'pt', name: 'Português', flag: '🇧🇷', file: '05-PROPOSTA-COMERCIAL-PARCERIAS-SERVIDORES.md' },
  { code: 'en', name: 'English', flag: '🇺🇸', file: '05-COMMERCIAL-PROPOSAL-SERVER-PARTNERSHIPS-EN.md' },
  { code: 'es', name: 'Español', flag: '🇪🇸', file: '05-PROPUESTA-COMERCIAL-ALIANZAS-SERVIDORES-ES.md' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', file: '05-HANDELSVORSCHLAG-SERVER-PARTNERSCHAFTEN-DE.md' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', file: '05-КОММЕРЧЕСКОЕ-ПРЕДЛОЖЕНИЕ-СЕРВЕРЫ-ПАРТНЕРСТВО-RU.md' }
]

const documents = [
  {
    title: 'Análise Completa de Servidores',
    description: 'Requisitos técnicos detalhados para infraestrutura',
    file: '01-ANALISE-COMPLETA-SERVIDORES-KRYONIX.md',
    icon: Server,
    size: '2.4 MB'
  },
  {
    title: 'Tutorial Builder.io + MCP',
    description: 'Guia completo de integração e desenvolvimento',
    file: '02-TUTORIAL-BUILDERIO-MCP-KRYONIX.md',
    icon: FileText,
    size: '1.8 MB'
  },
  {
    title: 'Plano de Execução Completo',
    description: 'Cronograma detalhado de 38 semanas',
    file: '03-PLANO-EXECUCAO-COMPLETO-KRYONIX.md',
    icon: TrendingUp,
    size: '3.2 MB'
  },
  {
    title: 'Plano de Negócio Completo',
    description: 'Análise financeira e ROI detalhado',
    file: '04-PLANO-NEGOCIO-COMPLETO-KRYONIX.md',
    icon: TrendingUp,
    size: '2.7 MB'
  }
]

export default function PartnershipProposal() {
  const [selectedLanguage, setSelectedLanguage] = useState('pt')

  const selectedLang = languages.find(lang => lang.code === selectedLanguage)

  const handleDownload = (file: string) => {
    try {
      // Criar um link temporário para download
      const link = document.createElement('a')

      // Para arquivos .md, criar um blob com conteúdo simulado
      let content = ''

      if (file.includes('PROPOSTA-COMERCIAL')) {
        content = `# PROPOSTA COMERCIAL ESTRATÉGICA KRYONIX\n\n## Parceria de Infraestrutura para Servidores\n\nData: ${new Date().toLocaleDateString('pt-BR')}\n\n### Resumo Executivo\n\nA KRYONIX é uma plataforma SaaS 100% autônoma powered by IA, desenvolvida para revolucionar a automação empresarial. Nossa solução integra mais de 75 stacks tecnológicos em um ecossistema unificado.\n\n### Métricas Principais\n\n- **Receita Conjunta Projetada**: R$ 45M+ (3 anos)\n- **ROI Projetado**: 452%\n- **Clientes Potenciais**: 8.000+\n- **Stacks Tecnológicos**: 75+\n\n### Tipos de Parceria\n\n#### 1. Patrocinador Fundador - R$ 2.004.000\n- Naming rights exclusivos\n- 15% revenue share\n- Exclusividade categoria (3 anos)\n- Co-marketing agreement\n- Dashboard dedicado\n\n#### 2. Parceiro Estratégico - R$ 798.000\n- Status provider preferido\n- 8% revenue share\n- Co-marketing opportunities\n- Technical showcase rights\n- Priority support access\n\n#### 3. Parceiro Comercial - R$ 300.000\n- Listed partner status\n- 3% revenue share\n- Referral program access\n- Technical documentation\n- Support collaboration\n\n### Prazo para Proposta\n**10 de Agosto à 15 de Outubro de 2025**\n\n### Contato Estratégico\n\n**CEO & Founder**: Vitor Fernandes\n- Email: vitor@kryonix.com.br\n- WhatsApp: +55 17 98180-5327\n\n**Business Development**\n- Email: partnerships@kryonix.com.br\n- Website: www.kryonix.com.br\n\n---\n\n*Este documento contém informações confidenciais e estratégicas da KRYONIX*\n*Distribuição restrita apenas para tomadores de decisão autorizados*\n`
      } else if (file.includes('ANALISE-COMPLETA-SERVIDORES')) {
        content = `# ANÁLISE COMPLETA DE SERVIDORES - KRYONIX\n\n## Requisitos Técnicos Detalhados\n\n### Infraestrutura Base\n\n- **CPU**: 16+ cores, 2.4GHz+\n- **RAM**: 64GB DDR4\n- **Storage**: 2TB NVMe SSD\n- **Network**: 10Gbps\n\n### Stacks Tecnológicos (75+)\n\n1. **Backend**: Node.js, Python, Go\n2. **Database**: PostgreSQL, Redis, MongoDB\n3. **Container**: Docker, Kubernetes\n4. **Monitoring**: Grafana, Prometheus\n5. **Security**: Keycloak, MinIO\n\n### Estimativa de Recursos\n\n- **Desenvolvimento**: 38 semanas\n- **Infraestrutura**: R$ 2.5M/ano\n- **Manutenção**: R$ 500K/ano\n\n### ROI Projetado\n\n**Ano 1**: 125%\n**Ano 2**: 285%\n**Ano 3**: 452%\n\n---\n\n*Análise técnica completa para parceiros qualificados*\n`
      } else {
        content = `# ${file.replace('.md', '').replace(/-/g, ' ').toUpperCase()}\n\n## Documento KRYONIX\n\nData de geração: ${new Date().toLocaleDateString('pt-BR')}\n\nEste é um documento da plataforma KRYONIX com informações detalhadas sobre o projeto.\n\n### Informações Principais\n\n- Plataforma SaaS 100% autônoma\n- Powered by IA avançada\n- 75+ stacks tecnológicos integrados\n- ROI projetado de 452%\n\n### Contato\n\npartnerships@kryonix.com.br\n+55 17 98180-5327\n\n---\n\n*KRYONIX - Automatização Empresarial Inteligente*\n`
      }

      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)

      link.href = url
      link.download = file
      link.style.display = 'none'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Limpar URL do blob
      setTimeout(() => URL.revokeObjectURL(url), 100)

      console.log(`Download iniciado: ${file}`)
    } catch (error) {
      console.error('Erro no download:', error)
      alert('Erro ao baixar o arquivo. Tente novamente.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-50 mb-4">
            🤝 PROPOSTA COMERCIAL ESTRATÉGICA
          </h1>
          <p className="text-xl text-gray-600 dark:text-slate-300 mb-2">
            Parceria de Infraestrutura para Servidores
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-slate-400">
            <ViewCounter
              pageId="partnership-proposal-confidential"
              className=""
              showIcon={true}
              animated={true}
            />
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>Proposta Comercial Estratégica</span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-600">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">R$ 45M+</div>
            <div className="text-gray-600 dark:text-slate-300">Receita Conjunta (3 anos)</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-600">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">452%</div>
            <div className="text-gray-600 dark:text-slate-300">ROI Projetado</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-600">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">8K+</div>
            <div className="text-gray-600 dark:text-slate-300">Clientes Finais</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-600">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">R$ 2M</div>
            <div className="text-gray-600 dark:text-slate-300">Investimento Mínimo</div>
          </div>
        </div>

        {/* Language Selection */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-slate-600 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50 mb-6 flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Proposta Comercial Multilíngue
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedLanguage === lang.code
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400 shadow-md'
                    : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
              >
                <div className="text-2xl mb-2">{lang.flag}</div>
                <div className="font-medium text-gray-900 dark:text-slate-100">{lang.name}</div>
              </button>
            ))}
          </div>

          {selectedLang && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-lg p-6 border border-blue-200 dark:border-slate-600">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
                    {selectedLang.flag} Proposta em {selectedLang.name}
                  </h3>
                  <p className="text-gray-600 dark:text-slate-300 mb-4">
                    Documento completo com 75+ stacks tecnológicos e análise financeira detalhada
                  </p>
                  <div className="text-sm text-gray-500 dark:text-slate-400">
                    Arquivo: {selectedLang.file} • Última atualização: {new Date().toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(selectedLang.file)}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Supporting Documents */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-slate-600 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50 mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
            Documentação Técnica Completa
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documents.map((doc, index) => (
              <div key={index} className="border border-gray-200 dark:border-slate-600 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                    <doc.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2">{doc.title}</h3>
                    <p className="text-gray-600 dark:text-slate-300 text-sm mb-3">{doc.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-slate-400">{doc.size}</span>
                      <button
                        onClick={() => handleDownload(doc.file)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm flex items-center gap-1"
                      >
                        Download
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Partnership Tiers */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-slate-600 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50 mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Níveis de Parceria Disponíveis
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tier 1 */}
            <div className="border-2 border-yellow-400 dark:border-yellow-500 rounded-lg p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 relative">
              <div className="absolute -top-3 left-4 bg-yellow-400 dark:bg-yellow-500 text-yellow-900 dark:text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                RECOMENDADO
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">🏆 Patrocinador Fundador</h3>
              <div className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-4">R$ 2.004.000</div>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-slate-300">
                <li>✅ Naming rights exclusivos</li>
                <li>✅ 15% revenue share</li>
                <li>✅ Exclusividade categoria (3 anos)</li>
                <li>✅ Co-marketing agreement</li>
                <li>✅ Dashboard dedicado</li>
              </ul>
            </div>

            {/* Tier 2 */}
            <div className="border border-gray-200 dark:border-slate-600 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">🤝 Parceiro Estratégico</h3>
              <div className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-4">R$ 798.000</div>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-slate-300">
                <li>✅ Status provider preferido</li>
                <li>✅ 8% revenue share</li>
                <li>✅ Co-marketing opportunities</li>
                <li>✅ Technical showcase rights</li>
                <li>✅ Priority support access</li>
              </ul>
            </div>

            {/* Tier 3 */}
            <div className="border border-gray-200 dark:border-slate-600 rounded-lg p-6 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-slate-700 dark:to-slate-600">
              <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">💼 Parceiro Comercial</h3>
              <div className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-4">R$ 300.000</div>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-slate-300">
                <li>✅ Listed partner status</li>
                <li>✅ 3% revenue share</li>
                <li>✅ Referral program access</li>
                <li>✅ Technical documentation</li>
                <li>✅ Support collaboration</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Contato Estratégico</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div>
              <h3 className="font-semibold mb-2">CEO & Founder</h3>
              <p>Vitor Fernandes</p>
              <p>vitor@kryonix.com.br</p>
              <p>+55 17 98180-5327</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Business Development</h3>
              <p>partnerships@kryonix.com.br</p>
              <p>www.kryonix.com.br</p>
              <p>São Paulo, SP - Brasil</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Technical Contact</h3>
              <p>tech@kryonix.com.br</p>
              <p>docs.kryonix.com.br</p>
              <p>Documentação Técnica</p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-blue-400 dark:border-blue-500">
            <p className="text-blue-100 dark:text-blue-200 text-sm">
              📅 Prazo para Proposta: 10 de Agosto à 15 de Outubro de 2025 • 🎯 ROI Esperado: 452% em 36 meses
            </p>
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-slate-400">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Lock className="w-4 h-4" />
            <span>Este documento contém informações confidenciais e estratégicas da KRYONIX</span>
          </div>
          <p>Distribuição restrita apenas para tomadores de decisão autorizados</p>
          <p className="mt-2 text-xs">URL: /partnership-proposal-confidential-v2024</p>
        </div>
      </div>
    </div>
  )
}
