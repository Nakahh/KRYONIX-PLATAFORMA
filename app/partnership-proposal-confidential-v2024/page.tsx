'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/app/components/Logo'
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
  const [viewCount, setViewCount] = useState(47) // Simulate view counter

  const selectedLang = languages.find(lang => lang.code === selectedLanguage)

  const handleDownload = (file: string) => {
    // Simulate download - in real implementation, this would download from the server
    console.log(`Downloading: ${file}`)
    setViewCount(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Security Header */}
      <div className="bg-red-600 text-white py-2 px-4 text-center text-sm font-medium">
        🔒 DOCUMENTO CONFIDENCIAL - ACESSO RESTRITO - NÃO COMPARTILHAR
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🤝 PROPOSTA COMERCIAL ESTRATÉGICA
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Parceria de Infraestrutura para Servidores
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{viewCount} visualizações</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="w-4 h-4" />
              <span>Acesso Confidencial</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>Somente Tomadores de Decisão</span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="text-3xl font-bold text-green-600 mb-2">$7.5M+</div>
            <div className="text-gray-600">Receita Conjunta (3 anos)</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="text-3xl font-bold text-blue-600 mb-2">850%</div>
            <div className="text-gray-600">ROI Projetado</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="text-3xl font-bold text-purple-600 mb-2">8K+</div>
            <div className="text-gray-600">Clientes Finais</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="text-3xl font-bold text-orange-600 mb-2">$334K</div>
            <div className="text-gray-600">Investimento Mínimo</div>
          </div>
        </div>

        {/* Language Selection */}
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-600" />
            Proposta Comercial Multilíngue
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedLanguage === lang.code
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-2">{lang.flag}</div>
                <div className="font-medium text-gray-900">{lang.name}</div>
              </button>
            ))}
          </div>

          {selectedLang && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedLang.flag} Proposta em {selectedLang.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Documento completo com 75+ stacks tecnológicos e análise financeira detalhada
                  </p>
                  <div className="text-sm text-gray-500">
                    Arquivo: {selectedLang.file} • Última atualização: {new Date().toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(selectedLang.file)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Supporting Documents */}
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-green-600" />
            Documentação Técnica Completa
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documents.map((doc, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <doc.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{doc.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{doc.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{doc.size}</span>
                      <button
                        onClick={() => handleDownload(doc.file)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
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
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-600" />
            Níveis de Parceria Disponíveis
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tier 1 */}
            <div className="border-2 border-yellow-400 rounded-lg p-6 bg-gradient-to-br from-yellow-50 to-orange-50 relative">
              <div className="absolute -top-3 left-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                RECOMENDADO
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">🏆 Patrocinador Fundador</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">$334,000</div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✅ Naming rights exclusivos</li>
                <li>✅ 15% revenue share</li>
                <li>✅ Exclusividade categoria (3 anos)</li>
                <li>✅ Co-marketing agreement</li>
                <li>✅ Dashboard dedicado</li>
              </ul>
            </div>

            {/* Tier 2 */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
              <h3 className="text-xl font-bold text-gray-900 mb-2">🤝 Parceiro Estratégico</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">$133,000</div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✅ Status provider preferido</li>
                <li>✅ 8% revenue share</li>
                <li>✅ Co-marketing opportunities</li>
                <li>✅ Technical showcase rights</li>
                <li>✅ Priority support access</li>
              </ul>
            </div>

            {/* Tier 3 */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gradient-to-br from-gray-50 to-slate-50">
              <h3 className="text-xl font-bold text-gray-900 mb-2">💼 Parceiro Comercial</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">$50,000</div>
              <ul className="space-y-2 text-sm text-gray-600">
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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white text-center">
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
          <div className="mt-6 pt-6 border-t border-blue-400">
            <p className="text-blue-100 text-sm">
              📅 Prazo para Resposta: 15 de Janeiro de 2025 • 🎯 ROI Esperado: 452% em 36 meses
            </p>
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
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
