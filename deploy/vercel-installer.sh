#!/bin/bash

# ============================================
# SCRIPT INSTALADOR VERCEL - KRYONIX PLATFORM
# Deploy Completo e Automático para Vercel
# Criado por: Vitor Fernandes
# Versão: 2.0.0
# ============================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Project Configuration
PROJECT_NAME="kryonix-platform"
DOMAIN=""
GITHUB_REPO=""
VERCEL_ORG=""

echo -e "${BLUE}🚀 KRYONIX VERCEL DEPLOYMENT SCRIPT v2.0.0${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Verificando pré-requisitos..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js não está instalado. Instale Node.js 18.x ou superior."
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js versão 18 ou superior é necessária. Versão atual: $(node --version)"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm não está instalado."
        exit 1
    fi
    
    # Check if git is installed
    if ! command -v git &> /dev/null; then
        print_error "Git não está instalado."
        exit 1
    fi
    
    print_status "✅ Pré-requisitos verificados com sucesso!"
}

# Install Vercel CLI
install_vercel_cli() {
    print_status "Instalando Vercel CLI..."
    
    if ! command -v vercel &> /dev/null; then
        npm install -g vercel@latest
        print_status "✅ Vercel CLI instalado com sucesso!"
    else
        print_status "✅ Vercel CLI já está instalado!"
        vercel --version
    fi
}

# Login to Vercel
vercel_login() {
    print_status "Fazendo login no Vercel..."
    
    if ! vercel whoami &> /dev/null; then
        print_warning "Faça login no Vercel quando solicitado..."
        vercel login
    else
        print_status "✅ Já logado no Vercel: $(vercel whoami)"
    fi
}

# Collect project information
collect_project_info() {
    print_status "Coletando informações do projeto..."
    
    echo ""
    read -p "🔗 URL do repositório GitHub (ex: https://github.com/user/repo): " GITHUB_REPO
    read -p "🌐 Domínio personalizado (opcional, ex: kryonix.com.br): " DOMAIN
    read -p "🏢 Organização Vercel (opcional): " VERCEL_ORG
    
    echo ""
    print_status "Configurações coletadas:"
    print_status "  Repositório: $GITHUB_REPO"
    print_status "  Domínio: ${DOMAIN:-"Não especificado"}"
    print_status "  Organização: ${VERCEL_ORG:-"Conta pessoal"}"
}

# Create vercel.json configuration
create_vercel_config() {
    print_status "Criando configuração vercel.json..."
    
    cat > vercel.json << 'EOF'
{
  "version": 2,
  "name": "kryonix-platform",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "framework": "nextjs",
  "regions": ["gru1"],
  "functions": {
    "app/api/*/route.js": {
      "maxDuration": 30
    }
  },
  "env": {
    "NODE_ENV": "production",
    "NEXT_TELEMETRY_DISABLED": "1"
  },
  "build": {
    "env": {
      "NODE_ENV": "production",
      "NEXT_TELEMETRY_DISABLED": "1"
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/home",
      "destination": "/",
      "permanent": true
    },
    {
      "source": "/waitlist",
      "destination": "/fila-de-espera",
      "permanent": true
    }
  ],
  "rewrites": [
    {
      "source": "/health",
      "destination": "/api/health"
    },
    {
      "source": "/status",
      "destination": "/api/status"
    }
  ]
}
EOF
    
    print_status "✅ vercel.json criado com sucesso!"
}

# Update Next.js config for Vercel
update_nextjs_config() {
    print_status "Criando next.config.js otimizado para Vercel..."
    
    cat > next.config.vercel.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  experimental: {
    esmExternals: 'loose',
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  productionBrowserSourceMaps: false,
  optimizeFonts: false,
  images: {
    unoptimized: true,
    domains: ['vercel.app'],
  },
  env: {
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
}

module.exports = nextConfig
EOF
    
    # Backup original e substitui
    if [ -f next.config.js ]; then
        cp next.config.js next.config.js.backup
    fi
    cp next.config.vercel.js next.config.js
    
    print_status "✅ next.config.js atualizado para Vercel!"
}

# Create environment variables template
create_env_template() {
    print_status "Criando template de variáveis de ambiente..."
    
    cat > .env.vercel.template << 'EOF'
# KRYONIX Platform - Variáveis de Ambiente para Vercel

# Application
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Backend API (Render)
NEXT_PUBLIC_API_URL=https://kryonix-backend.onrender.com
NEXT_PUBLIC_WS_URL=wss://kryonix-backend.onrender.com

# Vercel Specific
VERCEL_ENV=production
VERCEL_URL=
VERCEL_REGION=gru1

# WhatsApp/Push Notifications
NEXT_PUBLIC_VAPID_KEY=

# Analytics (se usar)
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_HOTJAR_ID=

# External Services
NEXT_PUBLIC_SENTRY_DSN=
EOF
    
    cat > .env.local.example << 'EOF'
# KRYONIX Platform - Desenvolvimento Local

NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1

# Local Backend
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080

# Local development
VERCEL_ENV=development
VERCEL_URL=localhost:3000
EOF
    
    print_status "✅ Templates de ambiente criados!"
    print_warning "Configure as variáveis de ambiente no Vercel Dashboard antes do deploy!"
}

# Update package.json scripts for Vercel
update_package_json_scripts() {
    print_status "Criando package.json otimizado para frontend..."
    
    # Create optimized package.json for frontend
    cat > package.frontend.json << 'EOF'
{
  "name": "kryonix-frontend",
  "version": "2.0.0",
  "description": "KRYONIX Platform - Frontend (Next.js)",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "vercel-build": "npm run build",
    "postbuild": "echo 'Build completed successfully'",
    "prestart": "echo 'Starting KRYONIX Platform on Vercel'"
  },
  "dependencies": {
    "next": "14.2.3",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "typescript": "^5",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.0.1",
    "postcss": "^8",
    "@tailwindcss/forms": "0.5.10",
    "lucide-react": "0.427.0",
    "clsx": "2.1.1",
    "next-intl": "^4.3.4",
    "@formatjs/intl-localematcher": "^0.6.1",
    "negotiator": "^1.0.0"
  },
  "devDependencies": {
    "@types/negotiator": "^0.6.4",
    "@types/node": "^20",
    "eslint": "^8",
    "eslint-config-next": "^14.2.3"
  },
  "engines": {
    "node": "18.x",
    "npm": ">=8.0.0"
  }
}
EOF

    print_status "✅ package.json otimizado criado!"
}

# Create health check API route
create_health_api() {
    print_status "Criando API de health check..."
    
    mkdir -p app/api/health
    
    cat > app/api/health/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const health = {
      status: 'healthy',
      service: 'kryonix-frontend',
      timestamp: Date.now(),
      uptime: process.uptime(),
      version: '2.0.0',
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
      region: process.env.VERCEL_REGION || 'unknown',
      memory: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB',
      platform: 'vercel'
    }

    return NextResponse.json(health, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Health check error:', error)
    
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: Date.now()
      },
      { status: 500 }
    )
  }
}

export async function HEAD(request: NextRequest) {
  return new NextResponse(null, { status: 200 })
}
EOF
    
    print_status "✅ API de health check criada!"
}

# Create Vercel deployment configuration
create_deployment_config() {
    print_status "Criando configuração de deployment..."
    
    # Create .vercelignore
    cat > .vercelignore << 'EOF'
# Dependencies
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build artifacts
.next
out
dist
build

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Backend files (não incluir no frontend)
server.js
webhook-listener.js
kryonix-monitor.js
lib/database/
lib/auth/
lib/keycloak/
lib/backup/

# Logs
logs
*.log

# Temporary files
.tmp
.temp

# Documentation
Documentação
Archive
relatorios
Escopo*
Prompts-Externos-IA

# Scripts
Scripts*
instalador-*
validar-*
*.sh

# Docker
Dockerfile*
docker-compose*

# Development
.vscode
.idea
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
EOF
    
    print_status "✅ Configuração de deployment criada!"
}

# Create GitHub Actions workflow
create_github_actions() {
    print_status "Criando workflow do GitHub Actions..."
    
    mkdir -p .github/workflows
    
    cat > .github/workflows/vercel-deploy.yml << 'EOF'
name: Vercel Deploy - KRYONIX Frontend

on:
  push:
    branches: [main, master]
    paths:
      - 'app/**'
      - 'public/**'
      - 'locales/**'
      - 'package.json'
      - 'next.config.js'
      - 'tailwind.config.js'
  pull_request:
    branches: [main, master]
    paths:
      - 'app/**'
      - 'public/**'
      - 'locales/**'

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run build
        run: npm run build
        
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
        
      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}
        
      - name: Build Project Artifacts
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}
        
      - name: Deploy Project Artifacts to Vercel
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
        
      - name: Deploy Preview
        if: github.event_name == 'pull_request'
        run: vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }}
EOF
    
    print_status "✅ GitHub Actions workflow criado!"
    print_warning "Configure os secrets no GitHub:"
    print_warning "  VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID"
}

# Deploy to Vercel
deploy_to_vercel() {
    print_status "Iniciando deploy para Vercel..."
    
    # Initialize Vercel project
    if [ -n "$VERCEL_ORG" ]; then
        vercel --scope="$VERCEL_ORG" --confirm
    else
        vercel --confirm
    fi
    
    # Set environment variables
    print_status "Configurando variáveis de ambiente essenciais..."
    
    vercel env add NODE_ENV production <<< "production"
    vercel env add NEXT_TELEMETRY_DISABLED production <<< "1"
    
    # Ask for backend URL
    read -p "🔗 URL do backend (ex: https://kryonix-backend.onrender.com): " BACKEND_URL
    if [ -n "$BACKEND_URL" ]; then
        vercel env add NEXT_PUBLIC_API_URL production <<< "$BACKEND_URL"
        WS_URL="${BACKEND_URL/https:/wss:}"
        vercel env add NEXT_PUBLIC_WS_URL production <<< "$WS_URL"
    fi
    
    # Deploy to production
    print_status "Fazendo deploy para produção..."
    vercel --prod
    
    print_status "✅ Deploy realizado com sucesso!"
}

# Configure custom domain
configure_domain() {
    if [ -n "$DOMAIN" ]; then
        print_status "Configurando domínio personalizado: $DOMAIN"
        
        vercel domains add "$DOMAIN"
        
        print_status "✅ Domínio configurado!"
        print_warning "Configure os DNS do seu domínio para apontar para Vercel:"
        print_warning "  Type: CNAME"
        print_warning "  Name: @ (ou www)"
        print_warning "  Value: cname.vercel-dns.com"
    fi
}

# Main installation process
main() {
    echo -e "${BLUE}Iniciando instalação do KRYONIX Frontend no Vercel...${NC}"
    echo ""
    
    check_prerequisites
    install_vercel_cli
    vercel_login
    collect_project_info
    
    echo ""
    print_status "Configurando projeto para deploy no Vercel..."
    
    create_vercel_config
    update_nextjs_config
    create_env_template
    update_package_json_scripts
    create_health_api
    create_deployment_config
    create_github_actions
    
    echo ""
    read -p "🚀 Deseja fazer o deploy agora? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        deploy_to_vercel
        configure_domain
        
        echo ""
        print_status "🎉 DEPLOY FRONTEND CONCLUÍDO COM SUCESSO!"
        print_status "🌐 Seu frontend KRYONIX está no ar!"
        
        if [ -n "$DOMAIN" ]; then
            print_status "🔗 URL: https://$DOMAIN"
        fi
        
        print_status "📊 Vercel Dashboard: https://vercel.com/dashboard"
        
    else
        print_status "Configuração concluída!"
        print_status "Para fazer o deploy manualmente, execute: vercel --prod"
    fi
    
    echo ""
    print_status "📝 PRÓXIMOS PASSOS:"
    print_status "1. Configure as variáveis de ambiente no Vercel Dashboard"
    print_status "2. Configure os DNS se usar domínio personalizado"
    print_status "3. Configure os secrets do GitHub Actions"
    print_status "4. Conecte com o backend no Render"
    
    echo ""
    echo -e "${GREEN}✅ INSTALADOR FRONTEND KRYONIX VERCEL CONCLUÍDO!${NC}"
}

# Run main function
main "$@"
