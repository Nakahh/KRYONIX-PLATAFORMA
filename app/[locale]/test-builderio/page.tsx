import { Metadata } from 'next'
import BuilderIOStatus from '../../components/BuilderIOStatus'

export const metadata: Metadata = {
  title: 'Teste Builder.io - KRYONIX',
  description: 'Página de teste para verificar visibilidade no Builder.io',
  robots: 'noindex, follow'
}

export default function TestBuilderIOPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            ✅ Página Visível no Builder.io
          </h1>
          
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-700">
              <h2 className="text-xl font-semibold text-green-800 dark:text-green-300 mb-3">
                🎉 Teste de Visibilidade
              </h2>
              <p className="text-green-700 dark:text-green-200">
                Se você está vendo esta página no Builder.io, significa que a configuração está funcionando!
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">
                  📄 Páginas Disponíveis
                </h3>
                <ul className="space-y-2 text-blue-700 dark:text-blue-200">
                  <li>• /{'{locale}'} - Home</li>
                  <li>• /{'{locale}'}/progresso - Progresso</li>
                  <li>• /{'{locale}'}/parcerias-empresariais-contato - Parcerias</li>
                  <li>• /{'{locale}'}/test-builderio - Esta página</li>
                </ul>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-700">
                <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-3">
                  🌍 Locales Suportados
                </h3>
                <ul className="space-y-2 text-purple-700 dark:text-purple-200">
                  <li>• pt-br - Português (Brasil)</li>
                  <li>• en - English</li>
                  <li>• es - Español</li>
                  <li>• de - Deutsch</li>
                  <li>• fr - Français</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-700">
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-3">
                🔧 Configurações Aplicadas
              </h3>
              <ul className="space-y-2 text-yellow-700 dark:text-yellow-200">
                <li>✅ X-Frame-Options: ALLOWALL</li>
                <li>✅ CSP configurado para Builder.io</li>
                <li>✅ Sitemap.xml gerado</li>
                <li>✅ Robots.txt configurado</li>
                <li>✅ Metadata otimizada</li>
                <li>✅ Builder-pages.json criado</li>
              </ul>
            </div>
            
            <div className="text-center pt-6">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full font-medium">
                <span>🚀</span>
                <span>KRYONIX Platform - Builder.io Ready</span>
                <span>✨</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
