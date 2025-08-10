import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Clock, Users, Sparkles, CheckCircle, MessageCircle } from 'lucide-react'

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
  title: 'Fila de Espera - KRYONIX',
  description: 'Entre na fila de espera da KRYONIX e seja um dos primeiros a acessar a plataforma',
  keywords: ['fila de espera', 'early access', 'kryonix', 'beta', 'lançamento'],
  openGraph: {
    title: 'Fila de Espera KRYONIX - Acesso Antecipado',
    description: 'Garante seu lugar na fila de espera da plataforma SaaS mais aguardada',
    url: 'https://www.kryonix.com.br/pt-br/fila-de-espera',
    type: 'website',
    images: ['/logo-kryonix.png']
  }
}

export default function FilaEsperaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/pt-br"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao início
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium animate-pulse mb-6">
              <Clock className="w-4 h-4" />
              Lançamento: 10 de Fevereiro de 2026
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-bold mb-6">
              <span className="text-gray-900 dark:text-gray-100">Entre na</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Fila de Espera</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Seja um dos primeiros a experimentar a plataforma SaaS mais revolucionária do Brasil.
              <strong className="text-green-600"> Acesso antecipado garantido!</strong>
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Empresários Interessados</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-3xl font-bold text-green-600 mb-2">15</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Agentes IA Trabalhando</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">75+</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Tecnologias Integradas</div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
              Vantagens de estar na fila de espera
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Acesso Prioritário
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Seja um dos primeiros a testar a plataforma antes do lançamento oficial
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Desconto Especial
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    50% de desconto nos primeiros 6 meses de qualquer plano
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Suporte VIP
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Suporte direto com nossa equipe durante toda a fase beta
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Feedback Direto
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Influencie o desenvolvimento com suas sugestões e necessidades
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 text-white mb-8">
              <h3 className="text-2xl font-bold mb-4">
                Pronto para revolucionar seu negócio?
              </h3>
              <p className="text-blue-100 mb-6">
                Entre em contato pelo WhatsApp e reserve sua vaga na fila de espera
              </p>
              <a
                href="https://wa.me/5517981805327?text=Quero%20entrar%20na%20fila%20de%20espera%20da%20KRYONIX!%20Me%20conte%20mais%20sobre%20os%20benefícios%20e%20quando%20terei%20acesso."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                ENTRAR NA FILA DE ESPERA
              </a>
            </div>

            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Sem compromisso • Sem cobrança • Acesso garantido quando lançar
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
