#!/bin/bash

# ============================================================================
# 🧪 KRYONIX - VALIDADOR DO INSTALADOR
# ============================================================================
# Script para validar que todos os arquivos necessários existem
# ============================================================================

set -euo pipefail

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_warn() { echo -e "${YELLOW}⚠️ $1${NC}"; }
log_info() { echo -e "${BLUE}ℹ️ $1${NC}"; }

echo "🧪 KRYONIX - Validador do Instalador"
echo "===================================="

errors=0
warnings=0

# Função para verificar arquivo
check_file() {
    local file="$1"
    local description="$2"
    
    if [ -f "$file" ]; then
        log_success "$description: $file"
        return 0
    else
        log_error "$description: $file"
        ((errors++))
        return 1
    fi
}

# Função para verificar diretório
check_dir() {
    local dir="$1"
    local description="$2"
    
    if [ -d "$dir" ]; then
        log_success "$description: $dir/"
        return 0
    else
        log_error "$description: $dir/"
        ((errors++))
        return 1
    fi
}

echo ""
log_info "🔍 Verificando arquivos essenciais..."

# Arquivos principais do projeto
check_file "package.json" "Package.json"
check_file "server.js" "Servidor principal"
check_file "Dockerfile" "Docker configuration"
check_file "next.config.js" "Next.js configuration"

echo ""
log_info "🔍 Verificando arquivos de serviços..."

# Arquivos de serviços
check_file "webhook-listener.js" "Webhook listener"
check_file "kryonix-monitor.js" "Monitor de sistema"
check_file "check-dependencies.js" "Verificador de dependências"
check_file "webhook-deploy.sh" "Script de deploy"

echo ""
log_info "🔍 Verificando arquivos em utils/..."

# Arquivos em utils/
check_file "utils/validate-dependencies.js" "Validador de dependências"
check_file "utils/fix-dependencies.js" "Corretor de dependências"

echo ""
log_info "🔍 Verificando diretórios..."

# Diretórios necessários
check_dir "app" "App directory (Next.js)"
check_dir "lib" "Library directory"
check_dir "public" "Public directory"
check_dir "utils" "Utils directory"

echo ""
log_info "🔍 Verificando configurações..."

# Configurações específicas
check_file "tailwind.config.js" "Tailwind CSS config"
check_file "tsconfig.json" "TypeScript config"
check_file "postcss.config.js" "PostCSS config"

echo ""
log_info "🔍 Verificando arquivos do instalador..."

# Instalador principal
check_file "instalador-plataforma-kryonix.sh" "Instalador principal"

echo ""
log_info "🧪 Testando sintaxe de scripts..."

# Testar sintaxe dos scripts bash
scripts=("webhook-deploy.sh" "instalador-plataforma-kryonix.sh")

for script in "${scripts[@]}"; do
    if [ -f "$script" ]; then
        if bash -n "$script" 2>/dev/null; then
            log_success "Sintaxe OK: $script"
        else
            log_error "Sintaxe ERROR: $script"
            ((errors++))
        fi
    fi
done

echo ""
log_info "🔍 Verificando package.json..."

# Verificar se package.json é válido
if command -v node >/dev/null 2>&1; then
    if node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" 2>/dev/null; then
        log_success "package.json é um JSON válido"
    else
        log_error "package.json contém JSON inválido"
        ((errors++))
    fi
else
    log_warn "Node.js não encontrado, não foi possível validar package.json"
    ((warnings++))
fi

echo ""
log_info "📋 Verificando Dockerfile..."

# Verificar se todos os COPY no Dockerfile têm arquivos correspondentes
dockerfile_files=(
    "server.js"
    "webhook-listener.js"
    "kryonix-monitor.js"
    "check-dependencies.js"
    "utils/validate-dependencies.js"
    "utils/fix-dependencies.js"
    "webhook-deploy.sh"
)

for file in "${dockerfile_files[@]}"; do
    if [ -f "$file" ]; then
        log_success "Dockerfile COPY OK: $file"
    else
        log_error "Dockerfile COPY MISSING: $file"
        ((errors++))
    fi
done

echo ""
echo "========================================"
echo "📊 RELATÓRIO FINAL"
echo "========================================"

if [ $errors -eq 0 ]; then
    if [ $warnings -eq 0 ]; then
        log_success "🎉 PERFEITO! Instalador está 100% correto"
        echo ""
        echo "✅ Você pode executar o instalador agora:"
        echo "   sudo bash instalador-plataforma-kryonix.sh"
    else
        log_warn "⚠️ Instalador OK com $warnings avisos"
        echo ""
        echo "✅ Você pode executar o instalador:"
        echo "   sudo bash instalador-plataforma-kryonix.sh"
    fi
    exit 0
else
    log_error "❌ $errors erros encontrados!"
    if [ $warnings -gt 0 ]; then
        log_warn "⚠️ $warnings avisos"
    fi
    echo ""
    echo "🔧 Corrija os erros antes de executar o instalador"
    exit 1
fi
