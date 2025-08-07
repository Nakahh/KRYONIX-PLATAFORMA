'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Smartphone, 
  Fingerprint,
  Shield,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authMethod, setAuthMethod] = useState('email') // email, whatsapp, biometric
  const [loading, setLoading] = useState(false)
  const [whatsappCode, setWhatsappCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulação de login
    setTimeout(() => {
      setLoading(false)
      // Redirect para dashboard
      window.location.href = '/dashboard'
    }, 2000)
  }

  const handleWhatsAppAuth = async () => {
    setLoading(true)
    // Simulação de envio de código
    setTimeout(() => {
      setCodeSent(true)
      setLoading(false)
    }, 1500)
  }

  const handleBiometricAuth = async () => {
    if ('credentials' in navigator) {
      try {
        setLoading(true)
        // Simulação de autenticação biométrica
        setTimeout(() => {
          setLoading(false)
          window.location.href = '/dashboard'
        }, 2000)
      } catch (error) {
        setLoading(false)
        alert('Erro na autenticação biométrica')
      }
    } else {
      alert('Autenticação biométrica não suportada neste navegador')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6">
            <Image
              src="/logo-kryonix.png"
              alt="KRYONIX Logo"
              width={48}
              height={48}
              className="rounded-lg"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-green-400 bg-clip-text text-transparent">
              KRYONIX
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Bem-vindo de volta
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Acesse sua conta para continuar
          </p>
        </div>

        {/* Auth Method Selector */}
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <button
              onClick={() => setAuthMethod('email')}
              className={`flex items-center justify-center p-2 rounded-md text-sm font-medium transition-all ${
                authMethod === 'email'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Mail className="w-4 h-4 mr-1" />
              Email
            </button>
            <button
              onClick={() => setAuthMethod('whatsapp')}
              className={`flex items-center justify-center p-2 rounded-md text-sm font-medium transition-all ${
                authMethod === 'whatsapp'
                  ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Smartphone className="w-4 h-4 mr-1" />
              WhatsApp
            </button>
            <button
              onClick={() => setAuthMethod('biometric')}
              className={`flex items-center justify-center p-2 rounded-md text-sm font-medium transition-all ${
                authMethod === 'biometric'
                  ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Fingerprint className="w-4 h-4 mr-1" />
              Bio
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          {authMethod === 'email' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Sua senha"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    Lembrar de mim
                  </span>
                </label>
                <Link href="/recuperar-senha" className="text-sm text-blue-600 hover:text-blue-700">
                  Esqueceu a senha?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {authMethod === 'whatsapp' && (
            <div className="space-y-6">
              {!codeSent ? (
                <>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Smartphone className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Login via WhatsApp
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Enviaremos um código de verificação para seu WhatsApp cadastrado
                    </p>
                  </div>

                  <button
                    onClick={handleWhatsAppAuth}
                    disabled={loading}
                    className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        Enviar Código
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Código Enviado!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Digite o código de 6 dígitos que enviamos para seu WhatsApp
                    </p>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={whatsappCode}
                      onChange={(e) => setWhatsappCode(e.target.value)}
                      className="block w-full py-3 px-4 text-center text-2xl font-mono border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>

                  <button
                    onClick={() => setCodeSent(false)}
                    className="w-full text-center text-sm text-green-600 hover:text-green-700"
                  >
                    Não recebeu o código? Reenviar
                  </button>
                </>
              )}
            </div>
          )}

          {authMethod === 'biometric' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Fingerprint className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Autenticação Biométrica
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Use sua impressão digital ou reconhecimento facial para entrar
                </p>
              </div>

              <button
                onClick={handleBiometricAuth}
                disabled={loading}
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    Autenticar
                    <Shield className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Funciona com Face ID, Touch ID ou Windows Hello
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Register Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600 dark:text-gray-400">
            Não tem uma conta?{' '}
            <Link href="/registro" className="text-blue-600 hover:text-blue-700 font-medium">
              Criar conta
            </Link>
          </p>
        </div>

        {/* Security Notice */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Segurança Máxima
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Seus dados são protegidos com criptografia de ponta e autenticação multi-fator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
