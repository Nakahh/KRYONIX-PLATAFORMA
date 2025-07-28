import React from 'react';
import { Zap, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">KRYONIX</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Plataforma SaaS 100% autônoma por IA. 8 módulos integrados que funcionam 
              automaticamente, sem precisar de conhecimento técnico.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center text-sm text-gray-300">
                <Phone className="h-4 w-4 mr-2" />
                (17) 98180-5327
              </div>
            </div>
          </div>

          {/* Módulos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Módulos SaaS</h3>
            <ul className="space-y-2 text-gray-300">
              <li>📊 Análise Avançada</li>
              <li>📅 Agendamento IA</li>
              <li>💬 Atendimento Omnichannel</li>
              <li>👥 CRM & Vendas</li>
              <li>📧 Email Marketing</li>
              <li>📱 Redes Sociais</li>
              <li>📚 Portal do Cliente</li>
              <li>🏷️ Whitelabel</li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2 text-gray-300">
              <li>CEO: Vitor Jayme Fernandes Ferreira</li>
              <li>Instagram: @Kryon.ix</li>
              <li>Domínio: kryonix.com.br</li>
              <li>📍 Brasil</li>
            </ul>
            
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Contatos Técnicos:</h4>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>📧 contato@kryonix.com.br</li>
                <li>🛠️ suporte@kryonix.com.br</li>
                <li>💼 vendas@kryonix.com.br</li>
                <li>👨‍💻 dev@kryonix.com.br</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">
              © 2024 KRYONIX. Todos os direitos reservados. 
              <span className="block md:inline"> Plataforma SaaS 100% Autônoma por IA.</span>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-xs text-gray-500">Tecnologias:</span>
              <div className="flex space-x-2 text-xs">
                <span className="bg-blue-600 px-2 py-1 rounded">React</span>
                <span className="bg-green-600 px-2 py-1 rounded">Node.js</span>
                <span className="bg-purple-600 px-2 py-1 rounded">IA</span>
                <span className="bg-orange-600 px-2 py-1 rounded">Docker</span>
              </div>
            </div>
          </div>
        </div>

        {/* 32 Stacks Section */}
        <div className="border-t border-gray-800 mt-6 pt-6">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">
            🛠️ 32 Stacks Integradas Funcionando como "Engrenagem"
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 text-xs text-gray-500">
            <span>Traefik</span>
            <span>Portainer</span>
            <span>PostgreSQL</span>
            <span>MinIO</span>
            <span>Redis</span>
            <span>RabbitMQ</span>
            <span>Grafana</span>
            <span>Evolution API</span>
            <span>Chatwoot</span>
            <span>Typebot</span>
            <span>N8N</span>
            <span>Mautic</span>
            <span>Dify AI</span>
            <span>Ollama</span>
            <span>Metabase</span>
            <span>Supabase</span>
            <span>Strapi</span>
            <span>Directus</span>
            <span>NextCloud</span>
            <span>Keycloak</span>
            <span>Docuseal</span>
            <span>Stirling PDF</span>
            <span>Ntfy</span>
            <span>Uptime Kuma</span>
            <span>TwentyCRM</span>
            <span>ClickHouse</span>
            <span>RedisInsight</span>
            <span>WuzAPI</span>
            <span>WppConnect</span>
            <span>Langfuse</span>
            <span>VaultWarden</span>
            <span>E mais...</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
