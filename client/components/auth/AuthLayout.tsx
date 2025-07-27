import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Smartphone, Zap } from "lucide-react";
import { KryonixLogo } from "../brand/KryonixLogo";

/**
 * Layout para páginas de autenticação
 * KRYONIX - Design brasileiro mobile-first
 */

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  showBrand?: boolean;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  showBackButton = false,
  showBrand = true,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      {/* Background Pattern Brasil */}
      <div
        className={
          'absolute inset-0 bg-[url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%2300A651" fill-opacity="0.03"%3E%3Ccircle cx="7" cy="7" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')] opacity-40'
        }
      ></div>

      <div className="relative flex min-h-screen">
        {/* Side Panel - Hidden on mobile, visible on tablet+ */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-green-600 to-blue-600 text-white">
          <div className="flex flex-col justify-center px-12 xl:px-16">
            {/* Logo e Brand */}
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-6">
                <KryonixLogo variant="full" size="xl" theme="white" animated />
              </div>
              <p className="text-emerald-100 text-lg leading-relaxed">
                Plataforma SaaS Autônoma e Inteligente para Empreendedores.
                <br />
                <span className="text-emerald-200 font-medium">
                  100% IA Autônoma • Mobile-First • Dados Reais
                </span>
              </p>
            </div>

            {/* Features Brasil */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    Mobile-First Brasileiro
                  </h3>
                  <p className="text-emerald-100">
                    Interface otimizada para 80% dos usuários mobile brasileiros
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Segurança Avançada</h3>
                  <p className="text-emerald-100">
                    OAuth2, 2FA e LGPD compliance para máxima proteção
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">IA Autônoma</h3>
                  <p className="text-emerald-100">
                    Inteligência artificial gerencia automações e otimizações
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Brasileiras */}
            <div className="mt-12 grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">25+</div>
                <div className="text-sm text-emerald-100">
                  Stacks Integradas
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-sm text-emerald-100">Português BR</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-sm text-emerald-100">Automação IA</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center px-6 lg:px-12">
          <div className="w-full max-w-md mx-auto">
            {/* Mobile Brand - Only on small screens */}
            {showBrand && (
              <div className="lg:hidden text-center mb-8">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">KRYONIX</h1>
                </div>
                <p className="text-gray-600 text-sm">
                  Plataforma SaaS Brasileira
                </p>
              </div>
            )}

            {/* Back Button */}
            {showBackButton && (
              <Link
                to="/dashboard"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Link>
            )}

            {/* Title & Subtitle */}
            <div className="text-center mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {title}
              </h2>
              {subtitle && <p className="text-gray-600">{subtitle}</p>}
            </div>

            {/* Content */}
            <div className="space-y-6">{children}</div>

            {/* Footer Links */}
            <div className="mt-8 text-center space-y-4">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <Link
                  to="/privacy"
                  className="hover:text-gray-700 transition-colors"
                >
                  Privacidade
                </Link>
                <span>•</span>
                <Link
                  to="/terms"
                  className="hover:text-gray-700 transition-colors"
                >
                  Termos de Uso
                </Link>
                <span>•</span>
                <Link
                  to="/support"
                  className="hover:text-gray-700 transition-colors"
                >
                  Suporte
                </Link>
              </div>

              <div className="text-xs text-gray-400">
                © 2024 KRYONIX. Todos os direitos reservados.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
