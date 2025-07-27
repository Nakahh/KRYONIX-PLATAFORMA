import React from "react";
import { motion } from "framer-motion";
import { KryonixLogoPremium } from "../brand/KryonixLogoPremium";
import {
  Heart,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Shield,
  Zap,
  Crown,
  Star,
  Globe,
  MessageSquare,
} from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface KryonixFooterProps {
  variant?: "default" | "minimal" | "premium";
  className?: string;
}

export function KryonixFooter({
  variant = "default",
  className,
}: KryonixFooterProps) {
  const currentYear = new Date().getFullYear();

  if (variant === "minimal") {
    return (
      <footer
        className={cn(
          "bg-white/80 backdrop-blur-sm border-t border-gray-200/50",
          className,
        )}
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <KryonixLogoPremium
                variant="horizontal"
                size="sm"
                theme="gradient"
                animated
              />
            </div>

            <div className="text-sm text-gray-500 text-center">
              © {currentYear} KRYONIX. Todos os direitos reservados.
              <span className="mx-2">•</span>
              Feito com <Heart className="w-3 h-3 text-red-500 inline mx-1" />{" "}
              no Brasil
            </div>
          </div>
        </div>
      </footer>
    );
  }

  if (variant === "premium") {
    return (
      <footer
        className={cn(
          "bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden",
          className,
        )}
      >
        {/* Background Effects */}
        <div
          className={
            'absolute inset-0 bg-[url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')] opacity-30'
          }
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
          {/* Header do Footer */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <KryonixLogoPremium
                variant="hero"
                size="xl"
                theme="glass"
                animated
                glowEffect
                pulseEffect
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-300 max-w-2xl mx-auto"
            >
              A plataforma de automação inteligente mais avançada do Brasil.
              Conectando 25+ stacks em uma única solução premium.
            </motion.p>
          </div>

          {/* Conteúdo Principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Produto */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-400" />
                Produto
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a
                    href="/features"
                    className="hover:text-white transition-colors"
                  >
                    Funcionalidades
                  </a>
                </li>
                <li>
                  <a
                    href="/pricing"
                    className="hover:text-white transition-colors"
                  >
                    Preços
                  </a>
                </li>
                <li>
                  <a
                    href="/integrations"
                    className="hover:text-white transition-colors"
                  >
                    Integrações
                  </a>
                </li>
                <li>
                  <a
                    href="/automation"
                    className="hover:text-white transition-colors"
                  >
                    Automação IA
                  </a>
                </li>
                <li>
                  <a
                    href="/analytics"
                    className="hover:text-white transition-colors"
                  >
                    Analytics
                  </a>
                </li>
              </ul>
            </motion.div>

            {/* Recursos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-400" />
                Recursos
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a
                    href="/documentation"
                    className="hover:text-white transition-colors"
                  >
                    Documentação
                  </a>
                </li>
                <li>
                  <a href="/api" className="hover:text-white transition-colors">
                    API Reference
                  </a>
                </li>
                <li>
                  <a
                    href="/tutorials"
                    className="hover:text-white transition-colors"
                  >
                    Tutoriais
                  </a>
                </li>
                <li>
                  <a
                    href="/templates"
                    className="hover:text-white transition-colors"
                  >
                    Templates
                  </a>
                </li>
                <li>
                  <a
                    href="/community"
                    className="hover:text-white transition-colors"
                  >
                    Comunidade
                  </a>
                </li>
              </ul>
            </motion.div>

            {/* Empresa */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Empresa
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a
                    href="/about"
                    className="hover:text-white transition-colors"
                  >
                    Sobre Nós
                  </a>
                </li>
                <li>
                  <a
                    href="/careers"
                    className="hover:text-white transition-colors"
                  >
                    Carreiras
                  </a>
                </li>
                <li>
                  <a
                    href="/blog"
                    className="hover:text-white transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="/news"
                    className="hover:text-white transition-colors"
                  >
                    Notícias
                  </a>
                </li>
                <li>
                  <a
                    href="/partners"
                    className="hover:text-white transition-colors"
                  >
                    Parceiros
                  </a>
                </li>
              </ul>
            </motion.div>

            {/* Suporte */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-400" />
                Suporte
              </h3>
              <ul className="space-y-2 text-gray-300 mb-4">
                <li>
                  <a
                    href="/support"
                    className="hover:text-white transition-colors"
                  >
                    Central de Ajuda
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Contato
                  </a>
                </li>
                <li>
                  <a
                    href="/status"
                    className="hover:text-white transition-colors"
                  >
                    Status do Sistema
                  </a>
                </li>
                <li>
                  <a
                    href="/security"
                    className="hover:text-white transition-colors"
                  >
                    Segurança
                  </a>
                </li>
              </ul>

              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+55 11 99999-9999</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>suporte@kryonix.com.br</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>São Paulo, Brasil</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center py-8 border-t border-white/10"
          >
            <h3 className="text-2xl font-bold mb-4">
              Pronto para revolucionar seu negócio?
            </h3>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              Comece sua jornada de automação inteligente hoje mesmo
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl"
              >
                Começar Gratuitamente
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10"
              >
                Agendar Demo
              </Button>
            </div>
          </motion.div>

          {/* Redes Sociais e Links Legais */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Copyright */}
              <div className="text-center lg:text-left">
                <p className="text-gray-400 text-sm">
                  © {currentYear} KRYONIX Automação Inteligente Ltda.
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Todos os direitos reservados. CNPJ: XX.XXX.XXX/0001-XX
                </p>
              </div>

              {/* Redes Sociais */}
              <div className="flex items-center gap-4">
                <motion.a
                  href="https://github.com/kryonix"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Github className="w-5 h-5" />
                </motion.a>
                <motion.a
                  href="https://twitter.com/kryonix"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Twitter className="w-5 h-5" />
                </motion.a>
                <motion.a
                  href="https://linkedin.com/company/kryonix"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Linkedin className="w-5 h-5" />
                </motion.a>
              </div>

              {/* Links Legais */}
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <a
                  href="/privacy"
                  className="hover:text-white transition-colors"
                >
                  Privacidade
                </a>
                <span>•</span>
                <a href="/terms" className="hover:text-white transition-colors">
                  Termos
                </a>
                <span>•</span>
                <a
                  href="/cookies"
                  className="hover:text-white transition-colors"
                >
                  Cookies
                </a>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <a
                    href="/lgpd"
                    className="hover:text-white transition-colors"
                  >
                    LGPD
                  </a>
                </div>
              </div>
            </div>

            {/* Selo de Qualidade */}
            <div className="text-center mt-6 pt-6 border-t border-white/5">
              <div className="inline-flex items-center gap-2 text-xs text-gray-500">
                <Heart className="w-3 h-3 text-red-400" />
                <span>Desenvolvido com amor em São Paulo, Brasil</span>
                <span>•</span>
                <Globe className="w-3 h-3 text-blue-400" />
                <span>Servindo empresas brasileiras desde 2024</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Default variant
  return (
    <footer
      className={cn(
        "bg-white/90 backdrop-blur-sm border-t border-gray-200/50",
        className,
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="md:col-span-1">
            <KryonixLogoPremium
              variant="horizontal"
              size="lg"
              theme="gradient"
              animated
              className="mb-4"
            />
            <p className="text-gray-600 text-sm mb-4">
              Plataforma de automação inteligente que conecta suas ferramentas
              favoritas em um só lugar.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm">
                <Github className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Linkedin className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Links rápidos */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Produto</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a
                  href="/features"
                  className="hover:text-gray-900 transition-colors"
                >
                  Funcionalidades
                </a>
              </li>
              <li>
                <a
                  href="/pricing"
                  className="hover:text-gray-900 transition-colors"
                >
                  Preços
                </a>
              </li>
              <li>
                <a
                  href="/integrations"
                  className="hover:text-gray-900 transition-colors"
                >
                  Integrações
                </a>
              </li>
              <li>
                <a
                  href="/api"
                  className="hover:text-gray-900 transition-colors"
                >
                  API
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Recursos</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a
                  href="/docs"
                  className="hover:text-gray-900 transition-colors"
                >
                  Documentação
                </a>
              </li>
              <li>
                <a
                  href="/tutorials"
                  className="hover:text-gray-900 transition-colors"
                >
                  Tutoriais
                </a>
              </li>
              <li>
                <a
                  href="/blog"
                  className="hover:text-gray-900 transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="/community"
                  className="hover:text-gray-900 transition-colors"
                >
                  Comunidade
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Suporte</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a
                  href="/help"
                  className="hover:text-gray-900 transition-colors"
                >
                  Central de Ajuda
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="hover:text-gray-900 transition-colors"
                >
                  Contato
                </a>
              </li>
              <li>
                <a
                  href="/status"
                  className="hover:text-gray-900 transition-colors"
                >
                  Status
                </a>
              </li>
              <li>
                <a
                  href="/security"
                  className="hover:text-gray-900 transition-colors"
                >
                  Segurança
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm text-gray-500">
            © {currentYear} KRYONIX. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4 mt-4 sm:mt-0 text-sm text-gray-500">
            <a
              href="/privacy"
              className="hover:text-gray-700 transition-colors"
            >
              Privacidade
            </a>
            <a href="/terms" className="hover:text-gray-700 transition-colors">
              Termos
            </a>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <a href="/lgpd" className="hover:text-gray-700 transition-colors">
                LGPD
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default KryonixFooter;
