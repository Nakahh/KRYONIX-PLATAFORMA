'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import SimpleLanguageSwitcher from '../components/SimpleLanguageSwitcher'

export default function SimpleHomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-blue-600">KRYONIX</h1>
              <p className="text-sm text-gray-600">Plataforma SaaS 100% Autônoma por IA</p>
            </div>
            <div className="flex items-center space-x-4">
              <SimpleLanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6">
            Sua Empresa Funcionando Sozinha
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            WhatsApp, vendas, atendimento e cobrança - tudo no automático
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="https://wa.me/5517981805327"
              className="bg-green-600 text-white px-6 py-3 rounded-lg"
            >
              Automatizar Negócio
            </a>
            <Link
              href="/progresso"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg"
            >
              Ver Progresso
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Recursos Principais
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">IA 100% Autônoma</h3>
              <p className="text-gray-600">15 agentes especializados trabalhando 24/7</p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">WhatsApp Business</h3>
              <p className="text-gray-600">Integração completa com Evolution API</p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Multi-Tenancy</h3>
              <p className="text-gray-600">Criação automática em 2-5 minutos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 KRYONIX. Desenvolvido por Vitor Jayme Fernandes Ferreira.</p>
        </div>
      </footer>
    </div>
  )
}
