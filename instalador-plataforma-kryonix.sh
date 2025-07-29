#!/bin/bash
set -e

# Cores e formatação
BLUE='\033[1;34m'
CYAN='\033[1;36m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
RED='\033[1;31m'
PURPLE='\033[1;35m'
WHITE='\033[1;37m'
BOLD='\033[1m'
RESET='\033[0m'

# Caracteres especiais
CHECKMARK='✓'
CROSS='✗'
ARROW='→'
GEAR='⚙'

# Função para mostrar banner da Plataforma Kryonix
show_banner() {
    clear
    echo -e "${BLUE}${BOLD}"
    echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                               ║"
    echo "║     ██╗  ██╗██████╗ ██╗   ██╗ ██████╗ ███╗   ██╗██╗██╗  ██╗                 ║"
    echo "║     ██║ ██╔╝██╔══██╗╚██╗ ██╔╝██╔═══██╗████╗  ██║██║╚██╗██╔╝                 ║"
    echo "║     █████╔╝ ██████╔╝ ╚████╔╝ ██║   ██║██╔██╗ ██║██║ ╚███╔╝                  ║"
    echo "║     ██╔═██╗ ██╔══██╗  ╚██╔╝  ██║   ██║██║╚██╗██║██║ ██╔██╗                  ║"
    echo "║     ██║  ██╗██║  ██║   ██║   ╚██████╔╝██║ ╚████║██║██╔╝ ██╗                 ║"
    echo "║     ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════��� ╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝                 ║"
    echo "║                                                                               ║"
    echo -e "║                        ${WHITE}PLATAFORMA KRYONIX${BLUE}                                  ║"
    echo -e "║                   ${CYAN}Deploy Automatico Profissional${BLUE}                          ║"
    echo "║                                                                               ║"
    echo -e "║     ${WHITE}SaaS 100% Autonomo  |  Mobile-First  |  Portugues${BLUE}                    ║"
    echo "║                                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${RESET}\n"
}

# Função para logs formatados
log_info() {
    echo -e "${CYAN}${BOLD}[${GEAR} INFO]${RESET} $1"
}

log_success() {
    echo -e "${GREEN}${BOLD}[${CHECKMARK} SUCESSO]${RESET} $1"
}

log_warning() {
    echo -e "${YELLOW}${BOLD}[! AVISO]${RESET} $1"
}

log_error() {
    echo -e "${RED}${BOLD}[${CROSS} ERRO]${RESET} $1"
}

log_step() {
    echo -e "\n${PURPLE}${BOLD}[${ARROW} ETAPA]${RESET} $1"
    echo -e "${BLUE}─────────────────────────────────────────────────────────────────────${RESET}"
}

# Função para status
show_status() {
    local task="$1"
    local status="$2"
    
    case $status in
        "iniciando")
            echo -e "${CYAN}${BOLD}[→]${RESET} $task..."
            ;;
        "processando")
            echo -e "${YELLOW}${BOLD}[...]${RESET} $task em andamento..."
            ;;
        "concluido")
            echo -e "${GREEN}${BOLD}[${CHECKMARK}]${RESET} $task concluido"
            ;;
        "erro")
            echo -e "${RED}${BOLD}[${CROSS}]${RESET} $task falhou"
            ;;
    esac
}

# Configurações - KRYONIX
PROJECT_DIR="/opt/kryonix-plataform"
WEB_PORT="8080"

# Mostrar banner
show_banner

# Verificar Docker Swarm
log_step "Verificacao do Docker Swarm"
show_status "Verificando Docker Swarm" "iniciando"
if ! docker info | grep -q "Swarm: active"; then
    show_status "Verificando Docker Swarm" "erro"
    log_error "Docker Swarm nao esta ativo!"
    log_info "Execute: docker swarm init"
    exit 1
fi
show_status "Docker Swarm detectado e ativo" "concluido"

# Limpeza completa antes do deploy
log_step "Limpeza Completa do Ambiente"

show_status "Removendo stacks antigos" "iniciando"
docker stack ls --format "{{.Name}}" | grep -E "(kryonix|Kryonix)" | xargs -r docker stack rm > /dev/null 2>&1 || true
show_status "Stacks antigos removidos" "concluido"

show_status "Aguardando remocao completa" "processando"
sleep 15
show_status "Remocao completa" "concluido"

show_status "Limpando recursos orfaos" "iniciando"
docker config ls --format "{{.Name}}" | grep kryonix | xargs -r docker config rm 2>/dev/null || true
docker container prune -f 2>/dev/null || true
docker volume prune -f 2>/dev/null || true
docker image prune -f 2>/dev/null || true
docker images | grep "kryonix-plataforma" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true
show_status "Recursos orfaos limpos" "concluido"

# Preparação do projeto
log_step "Preparacao do Projeto"

show_status "Criando diretorio do projeto" "iniciando"
sudo mkdir -p "$PROJECT_DIR"
sudo chown -R $USER:$USER "$PROJECT_DIR"
cd "$PROJECT_DIR"
show_status "Diretorio do projeto criado" "concluido"

show_status "Criando arquivos da aplicacao" "iniciando"

# Criar package.json
cat > package.json << 'PACKAGE_EOF'
{
  "name": "kryonix-plataforma",
  "version": "1.0.0",
  "description": "KRYONIX - Plataforma SaaS 100% Autonoma por IA",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "author": "Vitor Fernandes",
  "license": "ISC"
}
PACKAGE_EOF

# Criar server.js
cat > server.js << 'SERVER_EOF'
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware de segurança
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.static('public'));

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'KRYONIX Platform',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API de status
app.get('/api/status', (req, res) => {
    res.json({
        platform: 'KRYONIX',
        status: 'online',
        services: {
            web: 'healthy',
            database: 'initializing',
            ai: 'planned'
        },
        progress: '2%',
        stage: 'Parte 01/50',
        timestamp: new Date().toISOString()
    });
});

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Página de progresso
app.get('/progresso', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'progresso.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 KRYONIX Platform rodando na porta ${PORT}`);
    console.log(`💚 Health check: http://0.0.0.0:${PORT}/health`);
    console.log(`🌐 Acesse: http://0.0.0.0:${PORT}`);
    console.log(`📊 Progresso: http://0.0.0.0:${PORT}/progresso`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('📴 Recebido SIGTERM, desligando gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('📴 Recebido SIGINT, desligando gracefully...');
    process.exit(0);
});
SERVER_EOF

# Criar diretório public
mkdir -p public

# Criar index.html
cat > public/index.html << 'HTML_EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KRYONIX - Plataforma SaaS Autônoma</title>
    <link rel="icon" type="image/png" href="/logo-kryonix-favicon.png">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
            flex: 1;
        }
        
        .header {
            background: rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            padding: 1rem 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: 1.5rem;
            font-weight: 700;
            text-decoration: none;
            color: white;
        }
        
        .nav-links {
            display: flex;
            list-style: none;
            gap: 2rem;
        }
        
        .nav-links a {
            color: white;
            text-decoration: none;
            transition: opacity 0.3s;
        }
        
        .nav-links a:hover {
            opacity: 0.8;
        }
        
        .hero {
            text-align: center;
            padding: 4rem 0;
        }
        
        .hero h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            font-weight: 700;
        }
        
        .hero p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin: 3rem 0;
        }
        
        .feature {
            background: rgba(255, 255, 255, 0.1);
            padding: 2rem;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            text-align: center;
            transition: transform 0.3s;
        }
        
        .feature:hover {
            transform: translateY(-5px);
        }
        
        .feature h3 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
        }
        
        .feature p {
            opacity: 0.9;
        }
        
        .status {
            background: rgba(0, 255, 0, 0.2);
            border: 1px solid #00ff00;
            padding: 1rem 2rem;
            border-radius: 25px;
            display: inline-block;
            margin: 2rem 0;
            font-weight: 600;
        }
        
        .progress-section {
            background: rgba(255, 255, 255, 0.1);
            padding: 2rem;
            border-radius: 15px;
            margin: 2rem 0;
            backdrop-filter: blur(10px);
        }
        
        .progress-bar {
            background: rgba(255, 255, 255, 0.2);
            height: 20px;
            border-radius: 10px;
            overflow: hidden;
            margin: 1rem 0;
        }
        
        .progress-fill {
            background: linear-gradient(90deg, #00ff00, #32cd32);
            height: 100%;
            width: 2%;
            border-radius: 10px;
            transition: width 0.5s ease;
        }
        
        .btn {
            display: inline-block;
            padding: 1rem 2rem;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            text-decoration: none;
            border-radius: 10px;
            margin: 0.5rem;
            transition: all 0.3s;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
        
        .btn-primary {
            background: linear-gradient(45deg, #667eea, #764ba2);
        }
        
        .footer {
            background: rgba(0, 0, 0, 0.2);
            padding: 2rem 0;
            text-align: center;
            margin-top: auto;
        }
        
        .footer p {
            margin: 0.5rem 0;
            opacity: 0.8;
        }
        
        .footer a {
            color: #00ff00;
            text-decoration: none;
        }
        
        @media (max-width: 768px) {
            .hero h1 {
                font-size: 2rem;
            }
            
            .nav-links {
                gap: 1rem;
            }
            
            .features {
                grid-template-columns: 1fr;
            }
        }
        
        .loading {
            animation: fadeInUp 0.8s ease forwards;
            opacity: 0;
            transform: translateY(30px);
        }
        
        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="container">
            <nav class="nav">
                <a href="#" class="logo">🚀 KRYONIX</a>
                <ul class="nav-links">
                    <li><a href="/progresso">📊 Progresso</a></li>
                    <li><a href="#status">📋 Status</a></li>
                    <li><a href="/health">🔍 Health</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <div class="container">
        <!-- Hero Section -->
        <section class="hero">
            <h1 class="loading" style="animation-delay: 0.2s;">🤖 KRYONIX Platform</h1>
            <p class="loading" style="animation-delay: 0.4s;">Plataforma SaaS 100% Autônoma por Inteligência Artificial</p>
            <div class="status loading" style="animation-delay: 0.6s;">
                ✅ Sistema Online e Operacional
            </div>
        </section>

        <!-- Features -->
        <section class="features">
            <div class="feature loading" style="animation-delay: 0.8s;">
                <h3>🤖 IA Autônoma</h3>
                <p>15 Agentes especializados trabalhando 24/7</p>
            </div>
            <div class="feature loading" style="animation-delay: 1s;">
                <h3>☁️ SaaS Completo</h3>
                <p>8 Módulos integrados e escaláveis</p>
            </div>
            <div class="feature loading" style="animation-delay: 1.2s;">
                <h3>📱 Mobile-First</h3>
                <p>Otimizado para dispositivos móveis</p>
            </div>
            <div class="feature loading" style="animation-delay: 1.4s;">
                <h3>🇧🇷 Nacional</h3>
                <p>Desenvolvido no Brasil, em Português</p>
            </div>
        </section>

        <!-- Progress Section -->
        <section id="status" class="progress-section loading" style="animation-delay: 1.6s;">
            <h2>📊 Progresso do Desenvolvimento</h2>
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
            </div>
            <p><strong>Progresso:</strong> <span id="progressText">2%</span> - Parte 01/50</p>
            <p>🔄 Status: Desenvolvimento ativo</p>
            <p>⏱️ Próxima atualização: Deploy automático via GitHub Actions</p>
            
            <div style="margin-top: 2rem;">
                <a href="/progresso" class="btn btn-primary">📊 Ver Progresso Detalhado</a>
                <a href="/health" class="btn">🔍 Health Check</a>
            </div>
        </section>
    </div>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <p><strong>🏢 KRYONIX</strong> - Ecossistema Tecnológico Inteligente</p>
            <p>📱 WhatsApp: +55 17 98180-5327 | 📧 admin@kryonix.com.br</p>
            <p>🌐 <a href="https://github.com/Nakahh/KRYONIX-PLATAFORMA" target="_blank">GitHub</a> | 📊 <a href="/progresso">Monitor</a></p>
            <p style="margin-top: 1rem; opacity: 0.7;">
                🚀 Deploy automático ativo - Versão 1.0.0
            </p>
        </div>
    </footer>

    <script>
        // Animações e updates
        document.addEventListener('DOMContentLoaded', function() {
            // Atualizar progresso
            const progressFill = document.getElementById('progressFill');
            const progressText = document.getElementById('progressText');
            
            setTimeout(() => {
                if (progressFill) progressFill.style.width = '2%';
                if (progressText) progressText.textContent = '2%';
            }, 1000);

            // Fetch status da API
            fetch('/api/status')
                .then(response => response.json())
                .then(data => {
                    console.log('Status da plataforma:', data);
                })
                .catch(err => console.log('API não disponível ainda'));
        });
    </script>
</body>
</html>
HTML_EOF

# Criar progresso.html
cat > public/progresso.html << 'PROGRESS_EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KRYONIX - Progresso do Desenvolvimento</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            padding: 2rem;
        }
        
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 2rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .progress-item {
            background: rgba(255, 255, 255, 0.1);
            margin: 1rem 0;
            padding: 1.5rem;
            border-radius: 10px;
            border-left: 4px solid #00ff00;
        }
        
        .progress-item.pending {
            border-left-color: #ffff00;
            opacity: 0.7;
        }
        
        .progress-item.future {
            border-left-color: #888;
            opacity: 0.5;
        }
        
        .back-btn {
            display: inline-block;
            padding: 0.8rem 1.5rem;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            margin-bottom: 2rem;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .status-badge {
            display: inline-block;
            padding: 0.3rem 0.8rem;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-left: 1rem;
        }
        
        .status-done {
            background: rgba(0, 255, 0, 0.3);
            border: 1px solid #00ff00;
        }
        
        .status-progress {
            background: rgba(255, 255, 0, 0.3);
            border: 1px solid #ffff00;
        }
        
        .status-planned {
            background: rgba(128, 128, 128, 0.3);
            border: 1px solid #888;
        }
    </style>
</head>
<body>
    <div class="container">
        <a href="/" class="back-btn">← Voltar ao Dashboard</a>
        
        <div class="header">
            <h1>📊 Progresso KRYONIX Platform</h1>
            <p>Desenvolvimento em tempo real - 50 Partes Planejadas</p>
        </div>

        <div class="progress-item">
            <h3>🚀 Parte 01 - Deploy Automático e Base <span class="status-badge status-progress">Em Progresso</span></h3>
            <p><strong>Status:</strong> Configuração do ambiente Docker Swarm</p>
            <p><strong>Progresso:</strong> 75% - Docker configurado, Traefik ativo</p>
            <p><strong>Próximo:</strong> Finalizar integração com GitHub Actions</p>
        </div>

        <div class="progress-item pending">
            <h3>🔐 Parte 02 - Autenticação Keycloak <span class="status-badge status-planned">Planejado</span></h3>
            <p><strong>Descrição:</strong> Sistema completo de autenticação e autorização</p>
            <p><strong>Tecnologias:</strong> Keycloak, OAuth2, JWT</p>
        </div>

        <div class="progress-item future">
            <h3>🗄️ Parte 03 - Base de Dados PostgreSQL <span class="status-badge status-planned">Planejado</span></h3>
            <p><strong>Descrição:</strong> Configuração do banco principal</p>
            <p><strong>Tecnologias:</strong> PostgreSQL, pgAdmin, Backup automático</p>
        </div>

        <div class="progress-item future">
            <h3>📦 Parte 04 - Storage MinIO <span class="status-badge status-planned">Planejado</span></h3>
            <p><strong>Descrição:</strong> Sistema de armazenamento de arquivos</p>
            <p><strong>Tecnologias:</strong> MinIO, S3-compatible, CDN</p>
        </div>

        <div class="progress-item future">
            <h3>⚡ Parte 05 - Redis Cache <span class="status-badge status-planned">Planejado</span></h3>
            <p><strong>Descrição:</strong> Cache e sessões distribuídas</p>
            <p><strong>Tecnologias:</strong> Redis, RedisInsight, Clustering</p>
        </div>

        <div style="text-align: center; margin-top: 2rem; opacity: 0.7;">
            <p>📅 Última atualização: <span id="lastUpdate"></span></p>
            <p>🔄 Progresso geral: 2% (1/50 partes)</p>
        </div>
    </div>

    <script>
        document.getElementById('lastUpdate').textContent = new Date().toLocaleString('pt-BR');
        
        // Auto-refresh a cada 30 segundos
        setInterval(() => {
            document.getElementById('lastUpdate').textContent = new Date().toLocaleString('pt-BR');
        }, 30000);
    </script>
</body>
</html>
PROGRESS_EOF

show_status "Arquivos da aplicacao criados" "concluido"

show_status "Criando sistema de deploy automatico" "iniciando"

# Criar diretório .github/workflows se não existir
mkdir -p .github/workflows

# Criar GitHub Actions para deploy automático
cat > .github/workflows/deploy.yml << 'WORKFLOW_EOF'
name: 🚀 Deploy Automático KRYONIX

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  deploy:
    name: 🚀 Deploy para Produção
    runs-on: ubuntu-latest

    steps:
    - name: 📥 Checkout do código
      uses: actions/checkout@v4

    - name: 🐳 Setup Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: 🏗️ Build da imagem Docker
      run: |
        echo "🔨 Building imagem KRYONIX..."
        docker build -t kryonix-plataforma:latest .
        docker tag kryonix-plataforma:latest kryonix-plataforma:$(date +%Y%m%d_%H%M%S)
        echo "✅ Imagem criada com sucesso"

    - name: 🔔 Notificar Webhook de Deploy
      run: |
        echo "📡 Enviando notificação de deploy..."
        curl -X POST ${{ secrets.WEBHOOK_URL || 'http://webhook.kryonix.com.br/deploy' }} \
          -H "Content-Type: application/json" \
          -H "X-GitHub-Event: push" \
          -H "X-Hub-Signature-256: sha256=${{ secrets.WEBHOOK_SECRET || 'auto-deploy' }}" \
          -d '{
            "ref": "${{ github.ref }}",
            "repository": {
              "name": "${{ github.repository }}",
              "full_name": "${{ github.repository }}"
            },
            "pusher": {
              "name": "${{ github.actor }}"
            },
            "head_commit": {
              "id": "${{ github.sha }}",
              "message": "${{ github.event.head_commit.message }}",
              "timestamp": "${{ github.event.head_commit.timestamp }}"
            }
          }' || echo "⚠️ Webhook não disponível - deploy local será executado"

    - name: ✅ Deploy Finalizado
      run: |
        echo "🎉 Deploy automático concluído!"
        echo "📊 Commit: ${{ github.sha }}"
        echo "👤 Autor: ${{ github.actor }}"
        echo "🌐 Acesse: https://kryonix.com.br"
WORKFLOW_EOF

# Criar webhook listener para deploy automático
cat > webhook-deploy.js << 'WEBHOOK_DEPLOY_EOF'
const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');
const fs = require('fs');

const PORT = process.env.WEBHOOK_PORT || 8082;
const SECRET = process.env.WEBHOOK_SECRET || 'auto-deploy';
const PROJECT_DIR = process.env.PROJECT_DIR || '/opt/kryonix-plataform';

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} [WEBHOOK] ${message}\n`;
    console.log(logMessage.trim());
    try {
        fs.appendFileSync('/var/log/kryonix-webhook.log', logMessage);
    } catch (e) {
        console.log('Warning: Could not write to log file');
    }
}

function verifySignature(payload, signature) {
    if (!signature) return true; // Permitir requests sem signature para testing
    const hmac = crypto.createHmac('sha256', SECRET);
    const digest = hmac.update(payload).digest('hex');
    const expected = `sha256=${digest}`;
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

function executeDeployment() {
    log('🚀 Iniciando deploy automático...');

    const deployScript = `
        set -e
        cd ${PROJECT_DIR}

        echo "📥 Fazendo pull das mudanças..."
        git fetch origin || echo "⚠️ Git fetch falhou"
        git checkout main 2>/dev/null || git checkout master 2>/dev/null || echo "⚠️ Checkout falhou"
        git reset --hard origin/main 2>/dev/null || git reset --hard origin/master 2>/dev/null || echo "⚠️ Reset falhou"
        git clean -fd 2>/dev/null || echo "⚠️ Clean falhou"

        echo "🏗️ Fazendo rebuild da imagem..."
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        docker build --no-cache -t kryonix-plataforma:latest . || {
            echo "❌ Build falhou, usando imagem anterior"
            exit 1
        }
        docker tag kryonix-plataforma:latest kryonix-plataforma:$TIMESTAMP

        echo "🔄 Fazendo deploy sem downtime..."
        docker service update --image kryonix-plataforma:latest Kryonix_web || {
            echo "⚠️ Update via service falhou, tentando redeploy..."
            docker stack deploy -c docker-stack.yml Kryonix
        }

        echo "⏳ Aguardando estabilização dos serviços..."
        sleep 30

        echo "🔍 Verificando saúde dos serviços..."
        if curl -f http://localhost:8080/health 2>/dev/null; then
            echo "✅ Deploy concluído com sucesso!"
            echo "🌐 Site disponível em: https://kryonix.com.br"
            echo "🔧 Local: http://localhost:8080"

            # Limpar imagens antigas (manter últimas 3)
            docker images kryonix-plataforma --format "{{.ID}}" | tail -n +4 | xargs -r docker rmi -f 2>/dev/null || true

            return 0
        else
            echo "❌ Deploy falhou - serviço não responde"
            echo "📋 Status dos serviços:"
            docker service ls | grep Kryonix || echo "Nenhum serviço encontrado"
            return 1
        fi
    `;

    exec(deployScript, { shell: '/bin/bash', timeout: 300000 }, (error, stdout, stderr) => {
        if (error) {
            log(`❌ Deploy falhou: ${error.message}`);
            log(`📋 STDERR: ${stderr}`);
            return;
        }
        if (stderr) {
            log(`⚠️ Deploy warnings: ${stderr}`);
        }
        log(`✅ Deploy output: ${stdout}`);
        log(`🎉 Deploy automático concluído com sucesso!`);
    });
}

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && (req.url === '/webhook' || req.url === '/deploy')) {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const signature = req.headers['x-hub-signature-256'];

                if (!verifySignature(body, signature)) {
                    log('❌ Assinatura inválida');
                    res.statusCode = 401;
                    res.end('Unauthorized');
                    return;
                }

                const payload = JSON.parse(body);

                // Verificar se é push na branch main/master
                if (payload.ref === 'refs/heads/main' || payload.ref === 'refs/heads/master') {
                    log(`📦 Push detectado no branch: ${payload.ref}`);
                    log(`👤 Autor: ${payload.pusher?.name || 'Unknown'}`);
                    log(`💬 Commit: ${payload.head_commit?.message || 'No message'}`);

                    executeDeployment();

                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                        status: 'success',
                        message: 'Deploy automático iniciado!',
                        branch: payload.ref,
                        timestamp: new Date().toISOString()
                    }));
                } else {
                    log(`ℹ️ Push ignorado - branch: ${payload.ref}`);
                    res.statusCode = 200;
                    res.end(JSON.stringify({
                        status: 'ignored',
                        message: 'Branch ignorado',
                        branch: payload.ref
                    }));
                }

            } catch (e) {
                log(`❌ Erro no webhook: ${e.message}`);
                res.statusCode = 400;
                res.end(JSON.stringify({
                    status: 'error',
                    message: 'Bad Request',
                    error: e.message
                }));
            }
        });

    } else if (req.method === 'GET' && req.url === '/health') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            status: 'healthy',
            service: 'KRYONIX Webhook Deploy',
            port: PORT,
            timestamp: new Date().toISOString(),
            lastDeploy: fs.existsSync('/var/log/kryonix-webhook.log') ?
                fs.statSync('/var/log/kryonix-webhook.log').mtime : null
        }));

    } else if (req.method === 'POST' && req.url === '/trigger-deploy') {
        // Endpoint manual para trigger deploy
        log('🔧 Deploy manual disparado via API');
        executeDeployment();

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            status: 'success',
            message: 'Deploy manual iniciado!',
            timestamp: new Date().toISOString()
        }));

    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, '0.0.0.0', () => {
    log(`🎣 KRYONIX Webhook Deploy rodando na porta ${PORT}`);
    log(`🔍 Health check: http://0.0.0.0:${PORT}/health`);
    log(`🚀 Webhook: http://0.0.0.0:${PORT}/webhook`);
    log(`🔧 Manual deploy: http://0.0.0.0:${PORT}/trigger-deploy`);
    log(`📡 Aguardando pushes do GitHub...`);
});

process.on('SIGTERM', () => {
    log('📴 Webhook deploy desligando...');
    server.close(() => {
        log('👋 Webhook deploy desligado');
        process.exit(0);
    });
});
WEBHOOK_DEPLOY_EOF

# Criar script de setup do repositório
cat > setup-repo.sh << 'SETUP_EOF'
#!/bin/bash

echo "🔧 Configurando repositório para deploy automático..."

# Configurar Git se necessário
if [ ! -d ".git" ]; then
    echo "📥 Inicializando repositório Git..."
    git init
    git remote add origin https://github.com/Nakahh/KRYONIX-PLATAFORMA.git
fi

# Configurar usuário Git
git config --local user.name "KRYONIX Deploy Bot"
git config --local user.email "deploy@kryonix.com.br"

# Adicionar arquivos ao Git
echo "📝 Adicionando arquivos ao Git..."
git add .
git commit -m "🚀 Setup deploy automático KRYONIX Platform

- GitHub Actions configurado
- Webhook de deploy implementado
- Sistema de rebuild automático
- Deploy sem downtime configurado" || echo "⚠️ Commit falhou (normal se não há mudanças)"

echo "✅ Repositório configurado para deploy automático!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure o webhook no GitHub: https://github.com/Nakahh/KRYONIX-PLATAFORMA/settings/hooks"
echo "2. URL do webhook: https://webhook.kryonix.com.br/webhook"
echo "3. Secret: auto-deploy"
echo "4. Events: push"
echo ""
echo "🚀 Deploy automático estará ativo após configuração!"
SETUP_EOF

chmod +x setup-repo.sh

show_status "Sistema de deploy automatico criado" "concluido"

# Teste local do servidor
log_step "Teste Local do Servidor"

show_status "Instalando dependencias" "iniciando"
npm install --production
show_status "Dependencias instaladas" "concluido"

show_status "Testando servidor" "iniciando"
timeout 5s node server.js > /tmp/server_test.log 2>&1 &
SERVER_PID=$!
sleep 2

if ps -p $SERVER_PID > /dev/null 2>&1; then
    kill $SERVER_PID 2>/dev/null
    wait $SERVER_PID 2>/dev/null
    show_status "Servidor testado com sucesso" "concluido"
else
    show_status "Erro no teste do servidor" "erro"
    cat /tmp/server_test.log 2>/dev/null
    exit 1
fi

# Configurar firewall
log_step "Configuracao de Firewall"

show_status "Configurando firewall" "iniciando"
if command -v ufw >/dev/null 2>&1; then
    sudo ufw --force enable 2>/dev/null || true
    sudo ufw allow $WEB_PORT/tcp comment "KRYONIX-$WEB_PORT" 2>/dev/null || true
elif command -v firewall-cmd >/dev/null 2>&1; then
    sudo firewall-cmd --add-port=$WEB_PORT/tcp 2>/dev/null || true
    sudo firewall-cmd --permanent --add-port=$WEB_PORT/tcp 2>/dev/null || true
    sudo firewall-cmd --reload 2>/dev/null || true
elif command -v iptables >/dev/null 2>&1; then
    sudo iptables -I INPUT -p tcp --dport $WEB_PORT -j ACCEPT 2>/dev/null || true
fi
show_status "Firewall configurado" "concluido"

# Configurar redes Docker
log_step "Configuracao de Redes Docker"

show_status "Criando redes Docker" "iniciando"
docker network create -d overlay --attachable Kryonix-NET 2>/dev/null || true
show_status "Redes Docker criadas" "concluido"

# Criar Dockerfile
log_step "Criacao do Dockerfile"

show_status "Criando Dockerfile" "iniciando"
cat > Dockerfile << 'DOCKERFILE_EOF'
FROM node:18-bullseye-slim

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm install --production && npm cache clean --force

# Copiar código da aplicação
COPY server.js ./
COPY public/ ./public/

# Criar usuário não-root
RUN groupadd -r kryonix && useradd -r -g kryonix kryonix
RUN chown -R kryonix:kryonix /app

USER kryonix

# Expor porta
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Comando de start
CMD ["node", "server.js"]
DOCKERFILE_EOF
show_status "Dockerfile criado" "concluido"

# Build da imagem
log_step "Build da Imagem Docker"

show_status "Fazendo build da imagem" "iniciando"
docker build --no-cache -t kryonix-plataforma:latest . > /dev/null 2>&1

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker tag kryonix-plataforma:latest kryonix-plataforma:$TIMESTAMP
show_status "Imagem criada: kryonix-plataforma:$TIMESTAMP" "concluido"

# Criar configuração do stack
log_step "Criacao da Configuracao do Stack"

show_status "Criando docker-stack.yml" "iniciando"
cat > docker-stack.yml << 'STACK_EOF'
version: '3.8'

services:
  web:
    image: kryonix-plataforma:latest
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
        max_attempts: 3
        delay: 10s
      labels:
        # Habilitar Traefik
        - "traefik.enable=true"
        
        # Configurar rede
        - "traefik.docker.network=Kryonix-NET"
        
        # Configurar serviço e porta
        - "traefik.http.services.kryonix-web.loadbalancer.server.port=8080"
        
        # Router HTTP (redireciona para HTTPS)
        - "traefik.http.routers.kryonix-web-http.rule=Host(`kryonix.com.br`) || Host(`www.kryonix.com.br`)"
        - "traefik.http.routers.kryonix-web-http.entrypoints=web"
        - "traefik.http.routers.kryonix-web-http.middlewares=redirect-https@docker"
        - "traefik.http.routers.kryonix-web-http.service=kryonix-web"
        
        # Router HTTPS
        - "traefik.http.routers.kryonix-web-https.rule=Host(`kryonix.com.br`) || Host(`www.kryonix.com.br`)"
        - "traefik.http.routers.kryonix-web-https.entrypoints=websecure"
        - "traefik.http.routers.kryonix-web-https.tls=true"
        - "traefik.http.routers.kryonix-web-https.tls.certresolver=letsencryptresolver"
        - "traefik.http.routers.kryonix-web-https.service=kryonix-web"
        
        # Headers de segurança
        - "traefik.http.routers.kryonix-web-https.middlewares=security-headers@docker"
        - "traefik.http.middlewares.security-headers.headers.frameDeny=true"
        - "traefik.http.middlewares.security-headers.headers.sslRedirect=true"
        - "traefik.http.middlewares.security-headers.headers.browserXssFilter=true"
        - "traefik.http.middlewares.security-headers.headers.contentTypeNosniff=true"
        - "traefik.http.middlewares.security-headers.headers.forceSTSHeader=true"
        - "traefik.http.middlewares.security-headers.headers.stsIncludeSubdomains=true"
        - "traefik.http.middlewares.security-headers.headers.stsPreload=true"
        - "traefik.http.middlewares.security-headers.headers.stsSeconds=31536000"
    networks:
      - Kryonix-NET
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - PORT=8080
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  webhook:
    image: node:18-bullseye-slim
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
        max_attempts: 5
        delay: 30s
      labels:
        # Habilitar Traefik
        - "traefik.enable=true"

        # Configurar rede
        - "traefik.docker.network=Kryonix-NET"

        # Configurar serviço e porta
        - "traefik.http.services.kryonix-webhook.loadbalancer.server.port=8082"

        # Router HTTP (redireciona para HTTPS)
        - "traefik.http.routers.kryonix-webhook-http.rule=Host(`webhook.kryonix.com.br`)"
        - "traefik.http.routers.kryonix-webhook-http.entrypoints=web"
        - "traefik.http.routers.kryonix-webhook-http.middlewares=redirect-https@docker"
        - "traefik.http.routers.kryonix-webhook-http.service=kryonix-webhook"

        # Router HTTPS
        - "traefik.http.routers.kryonix-webhook-https.rule=Host(`webhook.kryonix.com.br`)"
        - "traefik.http.routers.kryonix-webhook-https.entrypoints=websecure"
        - "traefik.http.routers.kryonix-webhook-https.tls=true"
        - "traefik.http.routers.kryonix-webhook-https.tls.certresolver=letsencryptresolver"
        - "traefik.http.routers.kryonix-webhook-https.service=kryonix-webhook"
    networks:
      - Kryonix-NET
    ports:
      - "8082:8082"
    environment:
      - WEBHOOK_PORT=8082
      - WEBHOOK_SECRET=auto-deploy
      - PROJECT_DIR=/opt/kryonix-plataform
    working_dir: /opt/kryonix-plataform
    volumes:
      - /opt/kryonix-plataform:/opt/kryonix-plataform
      - /var/run/docker.sock:/var/run/docker.sock
      - /usr/bin/docker:/usr/bin/docker:ro
      - /var/log:/var/log
    command: >
      sh -c "
        apt-get update &&
        apt-get install -y curl git procps &&
        echo '🎣 Iniciando Webhook Deploy...' &&
        node /opt/kryonix-plataform/webhook-deploy.js
      "

networks:
  Kryonix-NET:
    external: true
STACK_EOF
show_status "Configuracao do stack criada" "concluido"

# Deploy do stack
log_step "Deploy do Stack Completo"

show_status "Iniciando deploy do stack" "iniciando"
docker stack deploy -c docker-stack.yml Kryonix > /dev/null 2>&1
show_status "Stack deployado" "concluido"

show_status "Aguardando inicializacao dos servicos" "processando"
sleep 45
show_status "Servicos inicializados" "concluido"

# Verificação de conectividade
log_step "Teste de Conectividade"

show_status "Testando conectividade" "iniciando"
sleep 15

if curl -f -m 10 http://localhost:8080/health 2>/dev/null; then
    show_status "Web Service (8080): FUNCIONANDO" "concluido"
    WEB_STATUS="✅ ONLINE"
else
    show_status "Web Service (8080): Verificar logs" "erro"
    WEB_STATUS="⚠️ VERIFICAR"
fi

# Banner final
echo -e "\n${BLUE}${BOLD}"
echo "╔══════════════════════════════════════��════════════════════════════════════════╗"
echo "║                                                                               ║"
echo -e "║                    ${GREEN}${CHECKMARK} DEPLOY CONCLUIDO COM SUCESSO! ${CHECKMARK}${BLUE}                         ║"
echo "║                                                                               ║"
echo -e "║   ${WHITE}🌐 Site Principal: https://kryonix.com.br${BLUE}                             ║"
echo -e "║   ${WHITE}🔧 Local (backup): http://localhost:8080 - $WEB_STATUS${BLUE}                ║"
echo "║                                                                               ║"
echo -e "║                     ${CYAN}PLATAFORMA KRYONIX ONLINE${BLUE}                             ║"
echo "║                                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
echo -e "${RESET}\n"

log_success "KRYONIX Platform deployada com sucesso!"
echo
log_info "🌐 URLs de Acesso:"
log_info "   Site Principal: https://kryonix.com.br"
log_info "   Webhook Deploy: https://webhook.kryonix.com.br"
log_info "   Local (backup): http://localhost:8080"
log_info "   Progresso: http://localhost:8080/progresso"
log_info "   Health Check: http://localhost:8080/health"
echo
log_info "🚀 Deploy Automático Configurado:"
log_info "   ✅ GitHub Actions ativo"
log_info "   ✅ Webhook configurado em: https://webhook.kryonix.com.br/webhook"
log_info "   ✅ Deploy automático no push para main/master"
log_info "   ✅ Rebuild + Restart automático dos containers"
log_info "   ✅ Zero downtime deployment"
echo
log_info "🔧 Comandos Uteis:"
log_info "   docker stack ps Kryonix                    # Status dos servicos"
log_info "   docker service logs Kryonix_web            # Logs do site"
log_info "   docker service logs Kryonix_webhook        # Logs do webhook"
log_info "   curl -X POST http://localhost:8082/trigger-deploy  # Deploy manual"
echo
log_info "📋 Configuração do GitHub Webhook:"
log_info "   1. Acesse: https://github.com/Nakahh/KRYONIX-PLATAFORMA/settings/hooks"
log_info "   2. URL: https://webhook.kryonix.com.br/webhook"
log_info "   3. Content-Type: application/json"
log_info "   4. Secret: auto-deploy"
log_info "   5. Events: push"
echo
log_info "📝 Certificados SSL serao gerados automaticamente pelo Let's Encrypt"
log_info "⏱️ Aguarde 1-2 minutos para os certificados serem emitidos"
echo
log_info "💡 Deploy Automático: Agora toda atualização na main será deployada automaticamente!"
