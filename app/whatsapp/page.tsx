'use client'

import { ArrowLeft, MessageCircle, Shield, Zap, CheckCircle } from 'lucide-react'
import MobileMenu from '../components/MobileMenu'

export default function WhatsAppPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MobileMenu />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container-custom py-6">
          <div className="flex items-center space-x-4">
            <a href="/" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </a>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">WhatsApp Business</h1>
              <p className="text-gray-600">Integração completa com Evolution API</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="py-8">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Recursos */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Recursos Disponíveis</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>WhatsApp OTP para autenticação</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Notificações de sistema</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Alertas de monitoramento</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Mensagens automatizadas</span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Status do Sistema</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Evolution API</span>
                  <div className="flex items-center space-x-2">
                    <div className="status-online"></div>
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>WhatsApp OTP</span>
                  <div className="flex items-center space-x-2">
                    <div className="status-online"></div>
                    <span className="text-sm text-green-600">Funcionando</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Instância KRYONIX</span>
                  <div className="flex items-center space-x-2">
                    <div className="status-online"></div>
                    <span className="text-sm text-green-600">Conectada</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configurações */}
          <div className="mt-8 card">
            <h2 className="text-xl font-semibold mb-4">Configuração Atual</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API URL</label>
                <div className="p-3 bg-gray-100 rounded-lg text-sm">
                  https://api.kryonix.com.br
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instância</label>
                <div className="p-3 bg-gray-100 rounded-lg text-sm">
                  kryonix
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Número de Alertas</label>
                <div className="p-3 bg-gray-100 rounded-lg text-sm">
                  +55 17 98180-5327
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="p-3 bg-green-100 rounded-lg text-sm text-green-800">
                  Ativo e Monitorado 24/7
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <a href="/" className="btn-primary">
              Voltar ao Início
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
