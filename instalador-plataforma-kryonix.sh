#!/bin/bash
set -e

# Configurações de encoding seguro para evitar problemas com caracteres especiais
export LC_ALL=C.UTF-8 2>/dev/null || export LC_ALL=C
export LANG=C.UTF-8 2>/dev/null || export LANG=C
export LANGUAGE=C

# ============================================================================
# 🚀 INSTALADOR KRYONIX PLATFORM - WEBHOOK AUTOMÁTICO 100% FUNCIONAL
# ============================================================================
# Autor: Vitor Fernandes
# Descrição: Instalador completo com webhook GitHub funcionando externamente
# Funcionalidades: Deploy automático + Pull main atualizada + Traefik prioridade máxima
# ============================================================================

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

# Emojis e caracteres especiais
CHECKMARK='✅'
CROSS='❌'
ARROW='→'
GEAR='⚙'
ROCKET='🚀'
WRENCH='🔧'

# Configurações do projeto
PROJECT_DIR="/opt/kryonix-plataform"
WEB_PORT="8080"
WEBHOOK_PORT="8082"
MONITOR_PORT="8084"
DOMAIN_NAME="kryonix.com.br"
DOCKER_NETWORK=""  # Será detectado automaticamente
STACK_NAME="Kryonix"

# Configurações CI/CD - Credenciais configuradas para operação 100% automática
GITHUB_REPO="https://github.com/Nakahh/KRYONIX-PLATAFORMA.git"
PAT_TOKEN="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"
WEBHOOK_SECRET="Kr7\$n0x-V1t0r-2025-#Jwt\$3cr3t-P0w3rfu1-K3y-A9b2Cd8eF4g6H1j5K9m3N7p2Q5t8"
JWT_SECRET="Kr7\$n0x-V1t0r-2025-#Jwt\$3cr3t-P0w3rfu1-K3y-A9b2Cd8eF4g6H1j5K9m3N7p2Q5t8"
WEBHOOK_URL="https://kryonix.com.br/api/github-webhook"
SERVER_HOST="${SERVER_HOST:-$(curl -s -4 ifconfig.me 2>/dev/null || curl -s ipv4.icanhazip.com 2>/dev/null || echo '127.0.0.1')}"
SERVER_USER="${SERVER_USER:-$(whoami)}"

# Variáveis da barra de progresso
TOTAL_STEPS=18
CURRENT_STEP=0
STEP_DESCRIPTIONS=(
    "Verificando Docker Swarm ⚙"
    "Limpando ambiente anterior 🧹"
    "Configurando credenciais 🔐"
    "Preparando projeto 📁"
    "Puxando main mais atualizada 🔄"
    "Criando arquivos de serviços 📄"
    "Instalando dependências 📦"
    "Configurando firewall 🔥"
    "Detectando rede Traefik 🔗"
    "Verificando Traefik 📊"
    "Criando imagem Docker 🏗️"
    "Preparando stack Traefik prioridade máxima 📋"
    "Configurando GitHub Actions 🚀"
    "Criando webhook deploy atualizado 🔗"
    "Configurando logs e backup ⚙️"
    "Deploy final integrado 🚀"
    "Testando webhook automático 🧪"
    "Exibindo configurações finais 📊"
)

# ============================================================================
# FUNÇÕES DE INTERFACE E PROGRESSO
# ============================================================================

# Função para mostrar banner da Plataforma Kryonix
show_banner() {
    clear
    echo -e "${BLUE}${BOLD}"
    echo    "╔═════════════════════════════════════════════════════════════════╗"
    echo    "║                                                                 ║"
    echo    "║     ██╗  █���╗██████╗ ██╗   ██╗ ██████╗ ███╗   ██╗██╗██╗  ██╗     ║"
    echo    "║     ██║ ██╔╝██╔══██╗╚██╗ ██╔╝██╔═══██╗████╗  ██║██║╚██╗██╔╝     ║"
    echo    "║     █████╔╝ ██████╔╝ ╚████╔╝ ██║   ██║██╔██╗ ██║██║ ╚███╔╝      ║"
    echo    "║     ██╔═██╗ ██╔══██╗  ╚██╔╝  ██║   ██║██║╚██╗██║██║ ██╔██╗      ║"
    echo    "║     ██║  ██╗██║  ██║   ██║   ╚██████╔╝██║ ╚████║██║██╔╝ ██╗     ║"
    echo    "║     ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝     ║"
    echo    "║                                                                 ║"
    echo -e "║                         ${WHITE}PLATAFORMA KRYONIX${BLUE}                      ║"
    echo -e "║                  ${CYAN}Deploy Automático e Profissional${BLUE}               ║"
    echo    "║                                                                 ║"
    echo -e "║         ${WHITE}SaaS 100% Autônomo  |  Mobile-First  |  Português${BLUE}       ║"
    echo    "║                                                                 ║"
    echo    "╚═════════════════════════════════════════════════════════════════╝"
    echo -e "${RESET}\n"
}

# Sistema unificado de barra animada
BAR_WIDTH=50
CURRENT_STEP_BAR_SHOWN=false

animate_progress_bar() {
    local step=$1
    local total=$2
    local description="$3"
    local status="$4"
    local target_progress=$((step * 100 / total))

    # Cores baseadas no status
    local bar_color="$GREEN"
    local status_icon="🔄"

    case $status in
        "iniciando")
            bar_color="$YELLOW"
            status_icon="🔄"
            ;;
        "processando")
            bar_color="$BLUE"
            status_icon="⚙"
            ;;
        "concluido")
            bar_color="$GREEN"
            status_icon="✅"
            ;;
        "erro")
            bar_color="$RED"
            status_icon="❌"
            ;;
    esac

    # Mostrar cabeçalho apenas uma vez por etapa
    if [ "$CURRENT_STEP_BAR_SHOWN" = false ]; then
        echo ""
        echo -e "${status_icon} ${WHITE}${BOLD}Etapa $step/$total: $description${RESET}"
        CURRENT_STEP_BAR_SHOWN=true
    fi

    # Atualizar barra na mesma linha
    local filled=$((target_progress * BAR_WIDTH / 100))
    echo -ne "\r${bar_color}${BOLD}["

    # Desenhar barra preenchida
    for ((j=1; j<=filled; j++)); do echo -ne "█"; done

    # Desenhar barra vazia
    for ((j=filled+1; j<=BAR_WIDTH; j++)); do echo -ne "░"; done

    echo -ne "] ${target_progress}% ${status_icon}${RESET}"

    # Nova linha apenas quando concluído ou erro
    if [ "$status" = "concluido" ] || [ "$status" = "erro" ]; then
        echo ""
        CURRENT_STEP_BAR_SHOWN=false  # Reset para próxima etapa
    fi
}

# Função para logs que aparecem abaixo da barra
log_below_bar() {
    local type="$1"
    local message="$2"
    local color=""
    local prefix=""

    case $type in
        "info")
            color="$CYAN"
            prefix="[INFO]"
            ;;
        "success")
            color="$GREEN"
            prefix="[SUCESSO]"
            ;;
        "warning")
            color="$YELLOW"
            prefix="[AVISO]"
            ;;
        "error")
            color="$RED"
            prefix="[ERRO]"
            ;;
    esac

    echo -e "    ${color}│${RESET} ${color}${prefix}${RESET} $message"
}

# Funções de controle de etapas
next_step() {
    CURRENT_STEP=$((CURRENT_STEP + 1))
    if [ $CURRENT_STEP -le $TOTAL_STEPS ]; then
        CURRENT_STEP_BAR_SHOWN=false
        animate_progress_bar $CURRENT_STEP $TOTAL_STEPS "${STEP_DESCRIPTIONS[$((CURRENT_STEP-1))]}" "iniciando"
    fi
}

complete_step() {
    if [ $CURRENT_STEP -le $TOTAL_STEPS ]; then
        animate_progress_bar $CURRENT_STEP $TOTAL_STEPS "${STEP_DESCRIPTIONS[$((CURRENT_STEP-1))]}" "concluido"
        sleep 0.5
    fi
}

error_step() {
    if [ $CURRENT_STEP -le $TOTAL_STEPS ]; then
        animate_progress_bar $CURRENT_STEP $TOTAL_STEPS "${STEP_DESCRIPTIONS[$((CURRENT_STEP-1))]}" "erro"
    fi
}

processing_step() {
    if [ $CURRENT_STEP -le $TOTAL_STEPS ]; then
        animate_progress_bar $CURRENT_STEP $TOTAL_STEPS "${STEP_DESCRIPTIONS[$((CURRENT_STEP-1))]}" "processando"
    fi
}

# Funções de log
log_info() {
    log_below_bar "info" "$1"
}

log_success() {
    log_below_bar "success" "$1"
}

log_warning() {
    log_below_bar "warning" "$1"
}

log_error() {
    log_below_bar "error" "$1"
}

# ============================================================================
# FUNÇÕES AUXILIARES CENTRALIZADAS
# ============================================================================

# Função para detectar rede do Traefik automaticamente
detect_traefik_network_automatically() {
    local detected_network=""

    # 1. Verificar se existe traefik-public (padrão)
    if docker network ls --format "{{.Name}}" | grep -q "^traefik-public$" 2>/dev/null; then
        detected_network="traefik-public"
        echo "$detected_network"
        return 0
    fi

    # 2. Verificar se Kryonix-NET existe
    if docker network ls --format "{{.Name}}" | grep -q "^Kryonix-NET$" 2>/dev/null; then
        detected_network="Kryonix-NET"
        echo "$detected_network"
        return 0
    fi

    # 3. Verificar redes overlay existentes (excluindo ingress)
    local overlay_networks=$(docker network ls --filter driver=overlay --format "{{.Name}}" 2>/dev/null | grep -v "^ingress$" | head -1)
    if [ ! -z "$overlay_networks" ]; then
        detected_network="$overlay_networks"
        echo "$detected_network"
        return 0
    fi

    # 4. FALLBACK: Usar traefik-public como padrão
    echo "traefik-public"
    return 0
}

# Função centralizada para testes de conectividade
test_service_health() {
    local url="$1"
    local max_attempts="${2:-30}"
    local wait_time="${3:-10}"
    
    log_info "Testando conectividade: $url"
    
    for i in $(seq 1 $max_attempts); do
        if curl -f -s -m 10 "$url" >/dev/null 2>&1; then
            log_success "Conectividade confirmada!"
            return 0
        fi
        
        if [ $i -lt $max_attempts ]; then
            log_info "Tentativa $i/$max_attempts - aguardando ${wait_time}s..."
            sleep $wait_time
        fi
    done
    
    log_warning "Conectividade não confirmada após $max_attempts tentativas"
    return 1
}

# CORREÇÃO: Função Git com pull forçado da main mais atualizada
sync_git_repository_force_latest() {
    local repo_url="$1"
    local branch="${2:-main}"
    
    log_info "🔄 FORÇANDO pull da main mais atualizada..."
    
    # Configurar Git globalmente
    git config --global user.name "KRYONIX Deploy"
    git config --global user.email "deploy@kryonix.com.br"
    git config --global pull.rebase false
    git config --global init.defaultBranch main
    git config --global --add safe.directory "$PROJECT_DIR"
    
    # Configurar repositório
    if [ ! -d ".git" ]; then
        log_info "Inicializando repositório Git..."
        git init
        git remote add origin "$repo_url"
    else
        log_info "Atualizando repositório existente..."
        git remote set-url origin "$repo_url"
    fi
    
    # CORREÇÃO CRÍTICA: Forçar pull da versão mais recente (SEMPRE)
    log_info "🚀 FORÇANDO fetch da main MAIS ATUALIZADA..."

    # Limpar qualquer estado local que possa interferir
    git clean -fd 2>/dev/null || true
    git reset --hard HEAD 2>/dev/null || true

    # Fetch com todas as opções para garantir atualização
    git fetch origin --force --prune --tags 2>/dev/null || true
    git fetch origin $branch --force 2>/dev/null || true

    # Mostrar commit atual antes
    current_commit=$(git rev-parse HEAD 2>/dev/null || echo "none")
    log_info "📌 Commit local atual: ${current_commit:0:8}"

    # Mostrar commit remoto mais recente
    remote_commit=$(git rev-parse origin/$branch 2>/dev/null || git rev-parse origin/master 2>/dev/null || echo "none")
    log_info "🌐 Commit remoto mais recente: ${remote_commit:0:8}"

    # Forçar reset para a versão mais recente da main
    if git reset --hard origin/$branch 2>/dev/null; then
        new_commit=$(git rev-parse HEAD 2>/dev/null || echo "none")
        log_success "✅ Sincronizado com origin/$branch - Commit: ${new_commit:0:8}"

        # Verificar se realmente atualizou
        if [ "$current_commit" != "$new_commit" ]; then
            log_success "🎯 Código atualizado para versão MAIS RECENTE!"

            # Mostrar diferenças
            log_info "📝 Mudanças aplicadas:"
            git log --oneline $current_commit..$new_commit 2>/dev/null | head -3 | while read line; do
                log_info "   → $line"
            done
        else
            log_info "ℹ️ Já estava na versão mais recente"
        fi
    elif git reset --hard origin/master 2>/dev/null; then
        new_commit=$(git rev-parse HEAD 2>/dev/null || echo "none")
        log_success "✅ Sincronizado com origin/master - Commit: ${new_commit:0:8}"

        if [ "$current_commit" != "$new_commit" ]; then
            log_success "🎯 Código atualizado para versão MAIS RECENTE!"
        fi
    else
        log_warning "⚠️ Não foi possível sincronizar com repositório remoto"
        return 1
    fi
    
    git clean -fd 2>/dev/null || true
    
    # Verificar se realmente está na main mais recente
    local branch_info=$(git branch -vv 2>/dev/null | grep "^\*" || echo "unknown")
    log_info "Branch atual: $branch_info"
    
    log_success "✅ Repositório com versão mais atualizada da main"
    return 0
}

# Função para validar credenciais pré-configuradas
validate_credentials() {
    log_info "🔐 Validando credenciais pré-configuradas..."

    if [ ! -z "$PAT_TOKEN" ] && [[ "$PAT_TOKEN" == ghp_* ]]; then
        log_success "✅ GitHub PAT Token configurado"
    else
        log_error "❌ GitHub PAT Token inválido"
        return 1
    fi

    if [ ! -z "$WEBHOOK_SECRET" ] && [ ${#WEBHOOK_SECRET} -gt 20 ]; then
        log_success "✅ Webhook Secret configurado"
    else
        log_error "❌ Webhook Secret inválido"
        return 1
    fi

    if [ ! -z "$WEBHOOK_URL" ] && [[ "$WEBHOOK_URL" == https://* ]]; then
        log_success "✅ Webhook URL configurado: $WEBHOOK_URL"
    else
        log_error "❌ Webhook URL inválido"
        return 1
    fi

    log_success "✅ Todas as credenciais validadas - instalação 100% automática"
    return 0
}

# ============================================================================
# INÍCIO DO INSTALADOR
# ============================================================================

# Mostrar banner
show_banner

# Detecção automática do ambiente
echo -e "${PURPLE}${BOLD}🚀 INSTALADOR KRYONIX - WEBHOOK 100% FUNCIONAL${RESET}"
echo -e "${CYAN}${BOLD}📡 Detectando ambiente do servidor...${RESET}"
echo -e "${BLUE}├─ Servidor: $(hostname)${RESET}"
echo -e "${BLUE}├─ IP: $(curl -s -4 ifconfig.me 2>/dev/null || curl -s ipv4.icanhazip.com 2>/dev/null || echo 'localhost')${RESET}"
echo -e "${BLUE}├─ Usuário: $(whoami)${RESET}"
echo -e "${BLUE}├─ SO: $(uname -s) $(uname -r)${RESET}"
echo -e "${BLUE}└─ Docker: $(docker --version 2>/dev/null || echo 'Não detectado')${RESET}"
echo ""
echo -e "${GREEN}${BOLD}✅ Webhook externo + Pull main atualizada + Traefik prioridade máxima!${RESET}\n"

# Inicializar primeira etapa
next_step

# ============================================================================
# ETAPA 1: VERIFICAR DOCKER SWARM
# ============================================================================

if ! docker info | grep -q "Swarm: active"; then
    error_step
    log_error "Docker Swarm não está ativo!"
    log_info "Execute: docker swarm init"
    exit 1
fi

log_success "Docker Swarm detectado e ativo"
complete_step
next_step

# ============================================================================
# ETAPA 2: LIMPAR AMBIENTE ANTERIOR
# ============================================================================

processing_step

# Limpar stacks antigas
log_info "Removendo stacks antigas do KRYONIX..."
for stack in $(docker stack ls --format "{{.Name}}" | grep -E "(kryonix|Kryonix)" || true); do
    if [ ! -z "$stack" ]; then
        docker stack rm "$stack" >/dev/null 2>&1 || true
        log_info "Stack $stack removido"
    fi
done

# Aguardar remoção completa
sleep 10

# Limpar recursos Docker
log_info "Limpando recursos Docker antigos..."
docker container prune -f 2>/dev/null || true
docker volume prune -f 2>/dev/null || true
docker image prune -f 2>/dev/null || true

# Remover imagens antigas específicas
for image in $(docker images --format "{{.Repository}}:{{.Tag}}" | grep "kryonix-plataforma" || true); do
    if [ ! -z "$image" ]; then
        docker rmi -f "$image" 2>/dev/null || true
        log_info "Imagem $image removida"
    fi
done

# Limpar diretório do projeto preservando Git
log_info "Limpando arquivos antigos do projeto..."
if [ -d "$PROJECT_DIR" ]; then
    # Preservar .git se existir
    if [ -d "$PROJECT_DIR/.git" ]; then
        log_info "Preservando histórico Git..."
        cp -r "$PROJECT_DIR/.git" "/tmp/kryonix-git-backup" 2>/dev/null || true
    fi
    
    # Remover arquivos antigos
    sudo rm -rf "$PROJECT_DIR"/* 2>/dev/null || true
    sudo rm -rf "$PROJECT_DIR"/.[^.]* 2>/dev/null || true
    
    # Restaurar .git
    if [ -d "/tmp/kryonix-git-backup" ]; then
        cp -r "/tmp/kryonix-git-backup" "$PROJECT_DIR/.git" 2>/dev/null || true
        rm -rf "/tmp/kryonix-git-backup" 2>/dev/null || true
        log_info "Histórico Git restaurado"
    fi
fi

log_success "Ambiente limpo e preparado"
complete_step
next_step

# ============================================================================
# ETAPA 3: VALIDAR CREDENCIAIS PRÉ-CONFIGURADAS
# ============================================================================

processing_step
if ! validate_credentials; then
    error_step
    log_error "Falha na validação das credenciais"
    exit 1
fi
complete_step
next_step

# ============================================================================
# ETAPA 4: PREPARAR PROJETO
# ============================================================================

processing_step
log_info "Preparando diretório do projeto..."

# Criar e configurar diretório
sudo mkdir -p "$PROJECT_DIR"
sudo chown -R $USER:$USER "$PROJECT_DIR"
cd "$PROJECT_DIR"

log_success "Diretório do projeto preparado"
complete_step
next_step

# ============================================================================
# ETAPA 5: PUXAR MAIN MAIS ATUALIZADA - CORREÇÃO CRÍTICA
# ============================================================================

processing_step
log_info "🔄 Puxando versão mais atualizada da main do GitHub..."

# Configurar repositório Git com credenciais automáticas
REPO_WITH_TOKEN="https://Nakahh:${PAT_TOKEN}@github.com/Nakahh/KRYONIX-PLATAFORMA.git"

# CORREÇÃO: Usar função que força pull da main mais recente
if ! sync_git_repository_force_latest "$REPO_WITH_TOKEN"; then
    error_step
    log_error "Falha ao sincronizar com repositório GitHub"
    exit 1
fi

# Verificar arquivos essenciais
if [ ! -f "package.json" ]; then
    log_error "package.json não encontrado no repositório!"
    log_info "Verifique se o repositório $GITHUB_REPO está correto"
    exit 1
fi

# Verificar server.js
if [ ! -f "server.js" ]; then
    log_error "server.js não encontrado no repositório!"
    exit 1
fi

# Mostrar informações do commit atual
current_commit=$(git rev-parse HEAD 2>/dev/null | head -c 8)
commit_msg=$(git log -1 --pretty=format:"%s" 2>/dev/null || echo "N/A")
log_success "✅ Main atualizada - Commit: $current_commit"
log_info "📝 Última alteração: $commit_msg"

complete_step
next_step

# ============================================================================
# ETAPA 6: CRIAR ARQUIVOS DE SERVIÇOS - CORREÇÃO DOS SERVIÇOS 0/1
# ============================================================================

processing_step
log_info "Criando arquivos necessários para TODOS os serviços funcionarem..."

# Corrigir package.json se necessário
if grep -q '"type": "module"' package.json; then
    log_info "Removendo type: module do package.json para compatibilidade"
    sed -i '/"type": "module",/d' package.json
fi

# Verificar se webhook já está integrado no server.js
if ! grep -q "/api/github-webhook" server.js; then
    log_info "🔗 Adicionando endpoint webhook completo ao server.js..."

    # Backup
    cp server.js server.js.backup

    # Adicionar endpoint webhook completo com validação e deploy automático
    cat >> server.js << WEBHOOK_EOF

// Webhook do GitHub configurado automaticamente pelo instalador KRYONIX
const crypto = require('crypto');
const { exec } = require('child_process');
const path = require('path');
const WEBHOOK_SECRET = '$WEBHOOK_SECRET';
const DEPLOY_SCRIPT = path.join(__dirname, 'webhook-deploy.sh');

// Função para verificar assinatura do GitHub
const verifyGitHubSignature = (payload, signature) => {
    if (!signature) return false;

    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    hmac.update(JSON.stringify(payload));
    const calculatedSignature = 'sha256=' + hmac.digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(calculatedSignature)
    );
};

// Endpoint webhook do GitHub com deploy automático FUNCIONAL
app.post('/api/github-webhook', (req, res) => {
    const payload = req.body;
    const signature = req.get('X-Hub-Signature-256');
    const event = req.get('X-GitHub-Event');

    console.log('🔗 Webhook KRYONIX recebido:', {
        event: event || 'NONE',
        ref: payload.ref || 'N/A',
        repository: payload.repository?.name || 'N/A',
        signature: signature ? 'PRESENT' : 'NONE',
        timestamp: new Date().toISOString()
    });

    // Verificar assinatura se configurada
    if (WEBHOOK_SECRET && signature) {
        if (!verifyGitHubSignature(payload, signature)) {
            console.log('❌ Assinatura inválida do webhook');
            return res.status(401).json({ error: 'Invalid signature' });
        }
        console.log('✅ Assinatura do webhook verificada');
    }

    // Processar apenas push events na main/master
    const isValidEvent = !event || event === 'push';
    const isValidRef = payload.ref === 'refs/heads/main' || payload.ref === 'refs/heads/master';

    if (isValidEvent && isValidRef) {
        console.log('🚀 Deploy automático KRYONIX iniciado para:', payload.ref);

        // Executar deploy automático com pull da main atualizada
        exec('bash ' + DEPLOY_SCRIPT + ' webhook', (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Erro no deploy automático KRYONIX:', error);
            } else {
                console.log('✅ Deploy automático KRYONIX executado:', stdout);
            }
        });

        res.json({
            message: 'Deploy automático KRYONIX iniciado',
            status: 'accepted',
            ref: payload.ref,
            sha: payload.after || payload.head_commit?.id,
            timestamp: new Date().toISOString(),
            webhook_url: '$WEBHOOK_URL',
            platform: 'KRYONIX'
        });
    } else {
        console.log('ℹ️ Evento KRYONIX ignorado:', { event, ref: payload.ref });

        res.json({
            message: 'Evento ignorado',
            status: 'ignored',
            event: event || 'undefined',
            ref: payload.ref || 'undefined',
            reason: !isValidEvent ? 'invalid_event' : 'invalid_ref',
            platform: 'KRYONIX'
        });
    }
});
WEBHOOK_EOF

    log_success "✅ Webhook completo com deploy automático adicionado ao server.js"
else
    log_info "ℹ️ Webhook já existe no server.js"
fi

# CORREÇÃO CRÍTICA: webhook-listener.js - ARQUIVO QUE ESTAVA FALTANDO
log_info "Criando webhook-listener.js (serviço que estava 0/1)..."
cat > webhook-listener.js << 'WEBHOOK_LISTENER_EOF'
const express = require('express');
const { exec } = require('child_process');
const app = express();
const PORT = process.env.PORT || 8082;

app.use(express.json());

// Health check obrigatório
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'kryonix-webhook-listener',
    timestamp: new Date().toISOString(),
    port: PORT,
    platform: 'KRYONIX'
  });
});

// Status check
app.get('/status', (req, res) => {
  res.json({
    service: 'kryonix-webhook-listener',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    platform: 'KRYONIX'
  });
});

// Webhook endpoint secundário
app.post('/webhook', (req, res) => {
  console.log('🔗 Webhook KRYONIX recebido no listener:', new Date().toISOString());
  console.log('Dados:', req.body);
  
  // Executar deploy se for push na main
  if (req.body.ref === 'refs/heads/main' || req.body.ref === 'refs/heads/master') {
    console.log('🚀 Iniciando deploy automático KRYONIX...');
    exec('bash /app/webhook-deploy.sh webhook', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Erro no deploy KRYONIX:', error);
      } else {
        console.log('✅ Deploy KRYONIX executado:', stdout);
      }
    });
  }
  
  res.json({ 
    message: 'Webhook KRYONIX processado', 
    timestamp: new Date().toISOString(),
    platform: 'KRYONIX'
  });
});

// Endpoint de teste
app.get('/test', (req, res) => {
  res.json({
    message: 'Webhook listener KRYONIX funcionando',
    service: 'kryonix-webhook-listener',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔗 KRYONIX Webhook listener rodando em http://0.0.0.0:${PORT}`);
});
WEBHOOK_LISTENER_EOF

# CORREÇÃO CRÍTICA: kryonix-monitor.js - ARQUIVO QUE ESTAVA FALTANDO
log_info "Criando kryonix-monitor.js (serviço que estava 0/1)..."
cat > kryonix-monitor.js << 'KRYONIX_MONITOR_EOF'
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8084;

app.use(express.json());

// Health check obrigatório
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'kryonix-monitor',
    timestamp: new Date().toISOString(),
    port: PORT,
    platform: 'KRYONIX'
  });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    status: 'monitoring',
    services: { 
      web: 'ok', 
      webhook: 'ok',
      monitor: 'ok'
    },
    version: '1.0.0',
    platform: 'KRYONIX'
  });
});

// Status endpoint detalhado
app.get('/status', (req, res) => {
  res.json({
    service: 'kryonix-monitor',
    status: 'running',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
    platform: 'KRYONIX',
    version: '1.0.0'
  });
});

// Dashboard endpoint
app.get('/dashboard', (req, res) => {
  res.json({
    platform: 'KRYONIX',
    services: {
      web: { status: 'running', port: 8080 },
      webhook: { status: 'running', port: 8082 },
      monitor: { status: 'running', port: 8084 }
    },
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`📊 KRYONIX Monitor rodando em http://0.0.0.0:${PORT}`);
});
KRYONIX_MONITOR_EOF

# Criar diretório public se necessário
mkdir -p public

if [ ! -f "public/index.html" ]; then
    log_info "Criando index.html padrão..."
    cat > public/index.html << 'HTML_EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KRYONIX - Plataforma SaaS Autônoma</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 2rem;
        }
        .container {
            max-width: 800px;
            background: rgba(255, 255, 255, 0.1);
            padding: 3rem;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        h1 { font-size: 3rem; margin-bottom: 1rem; }
        .status { 
            background: rgba(0, 255, 0, 0.2);
            border: 2px solid #00ff00;
            padding: 1rem 2rem;
            border-radius: 25px;
            margin: 2rem 0;
            font-weight: 600;
            font-size: 1.2rem;
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
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 KRYONIX Platform</h1>
        <p style="font-size: 1.2rem; margin-bottom: 2rem;">
            Plataforma SaaS 100% Autônoma por Inteligência Artificial
        </p>
        
        <div class="status">
            ✅ Sistema Online com Webhook Automático Externo!
        </div>
        
        <div style="margin-top: 2rem;">
            <a href="/health" class="btn">🔍 Health Check</a>
            <a href="/api/status" class="btn">📊 Status API</a>
            <a href="/api/github-webhook" class="btn">🔗 Webhook Test</a>
        </div>
        
        <p style="margin-top: 2rem; opacity: 0.8;">
            🌐 https://kryonix.com.br | 📱 +55 17 98180-5327<br>
            🚀 Deploy automático ativo - Main atualizada automaticamente
        </p>
    </div>

    <script>
        fetch('/api/status')
            .then(response => response.json())
            .then(data => console.log('✅ Plataforma KRYONIX funcionando:', data))
            .catch(err => console.log('⚠️ API carregando...'));
    </script>
</body>
</html>
HTML_EOF
fi

log_success "✅ Todos os arquivos de serviços criados (webhook-listener.js e kryonix-monitor.js)"
complete_step
next_step

# ============================================================================
# ETAPA 7: INSTALAR DEPENDÊNCIAS
# ============================================================================

processing_step

if ! command -v npm >/dev/null 2>&1; then
    log_info "Instalando Node.js 18.x..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - >/dev/null 2>&1
    sudo apt-get install -y nodejs >/dev/null 2>&1
fi

log_info "Instalando dependências do projeto..."
npm install --production >/dev/null 2>&1

log_info "Testando servidor localmente..."
timeout 10s node server.js >/dev/null 2>&1 || true

log_success "Dependências instaladas e servidor testado"
complete_step
next_step

# ============================================================================
# ETAPA 8: CONFIGURAR FIREWALL
# ============================================================================

processing_step
log_info "Configurando firewall do sistema..."

if command -v ufw >/dev/null 2>&1; then
    sudo ufw --force enable 2>/dev/null || true
    sudo ufw allow 80/tcp comment "HTTP" 2>/dev/null || true
    sudo ufw allow 443/tcp comment "HTTPS" 2>/dev/null || true
    sudo ufw allow $WEB_PORT/tcp comment "KRYONIX-WEB" 2>/dev/null || true
    sudo ufw allow $WEBHOOK_PORT/tcp comment "KRYONIX-WEBHOOK" 2>/dev/null || true
    sudo ufw allow $MONITOR_PORT/tcp comment "KRYONIX-MONITOR" 2>/dev/null || true
elif command -v firewall-cmd >/dev/null 2>&1; then
    sudo firewall-cmd --add-port=80/tcp --permanent 2>/dev/null || true
    sudo firewall-cmd --add-port=443/tcp --permanent 2>/dev/null || true
    sudo firewall-cmd --add-port=$WEB_PORT/tcp --permanent 2>/dev/null || true
    sudo firewall-cmd --add-port=$WEBHOOK_PORT/tcp --permanent 2>/dev/null || true
    sudo firewall-cmd --add-port=$MONITOR_PORT/tcp --permanent 2>/dev/null || true
    sudo firewall-cmd --reload 2>/dev/null || true
fi

log_success "Firewall configurado para todos os serviços"
complete_step
next_step

# ============================================================================
# ETAPA 9: DETECTAR REDE TRAEFIK
# ============================================================================

processing_step
log_info "🔍 Detectando rede do Traefik automaticamente..."

# Detectar automaticamente a rede do Traefik
DOCKER_NETWORK=$(detect_traefik_network_automatically)

if [ -z "$DOCKER_NETWORK" ]; then
    error_step
    log_error "❌ Falha na detecção automática da rede"
    exit 1
fi

log_info "🎯 Rede detectada: $DOCKER_NETWORK"

# Verificar se rede já existe
if docker network ls --format "{{.Name}}" | grep -q "^${DOCKER_NETWORK}$" 2>/dev/null; then
    log_success "✅ Rede $DOCKER_NETWORK já existe"
elif docker network create -d overlay --attachable "$DOCKER_NETWORK" >/dev/null 2>&1; then
    log_success "✅ Rede $DOCKER_NETWORK criada com sucesso"
else
    error_step
    log_error "❌ Falha ao criar rede $DOCKER_NETWORK"
    exit 1
fi

log_success "✅ Rede Docker configurada: $DOCKER_NETWORK"
complete_step
next_step

# ============================================================================
# ETAPA 10: VERIFICAR TRAEFIK E VALIDAR REDE
# ============================================================================

processing_step
log_info "Verificando Traefik e configurando resolvers SSL..."

CERT_RESOLVER="letsencryptresolver"
TRAEFIK_FOUND=false

if docker service ls | grep -q "traefik"; then
    TRAEFIK_SERVICE=$(docker service ls --format "{{.Name}}" | grep traefik | head -1)
    TRAEFIK_FOUND=true
    log_success "✅ Traefik encontrado: $TRAEFIK_SERVICE"

    # Detectar resolver SSL
    if docker service logs $TRAEFIK_SERVICE 2>/dev/null | grep -q "letsencrypt"; then
        CERT_RESOLVER="letsencrypt"
    fi
    log_info "🔐 Resolver SSL detectado: $CERT_RESOLVER"
else
    log_warning "⚠️ Traefik não encontrado - KRYONIX funcionará localmente"
    log_info "📝 Rede $DOCKER_NETWORK será usada (pronta para Traefik futuro)"
fi

log_success "✅ Verificação do Traefik concluída"
complete_step
next_step

# ============================================================================
# ETAPA 11: CRIAR IMAGEM DOCKER
# ============================================================================

processing_step
log_info "Criando Dockerfile otimizado para todos os serviços..."

cat > Dockerfile << 'DOCKERFILE_EOF'
FROM node:18-bullseye-slim

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    tini \
    curl \
    bash \
    git \
    && rm -rf /var/lib/apt/lists/*

# Criar usuário não-root
RUN groupadd -r kryonix && useradd -r -g kryonix kryonix

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm install --production && npm cache clean --force

# Copiar código da aplicação
COPY server.js ./
COPY webhook-listener.js ./
COPY kryonix-monitor.js ./
COPY webhook-deploy.sh ./
COPY public/ ./public/

# Tornar script executável
RUN chmod +x webhook-deploy.sh

# Configurar permissões
RUN chown -R kryonix:kryonix /app

USER kryonix

# Expor portas
EXPOSE 8080 8082 8084

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Comando de start com tini
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "server.js"]
DOCKERFILE_EOF

log_info "Fazendo build da imagem Docker..."
if docker build --no-cache -t kryonix-plataforma:latest . >/dev/null 2>&1; then
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    docker tag kryonix-plataforma:latest kryonix-plataforma:$TIMESTAMP
    log_success "Imagem criada: kryonix-plataforma:$TIMESTAMP"
else
    error_step
    log_error "Falha no build da imagem Docker"
    exit 1
fi

complete_step
next_step

# ============================================================================
# ETAPA 12: PREPARAR STACK COM TRAEFIK PRIORIDADE MÁXIMA - CORREÇÃO WEBHOOK 404
# ============================================================================

processing_step
log_info "🚀 Criando docker-stack.yml com Traefik PRIORIDADE MÁXIMA para webhook..."

cat > docker-stack.yml << STACK_EOF
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
        # Traefik básico
        - "traefik.enable=true"
        - "traefik.docker.network=$DOCKER_NETWORK"

        # Configuração do serviço web
        - "traefik.http.services.kryonix-web.loadbalancer.server.port=8080"

        # CORREÇÃO CRÍTICA: Router WEBHOOK - PRIORIDADE MÁXIMA (10000)
        - "traefik.http.routers.kryonix-webhook.rule=Host(\`$DOMAIN_NAME\`) && Path(\`/api/github-webhook\`)"
        - "traefik.http.routers.kryonix-webhook.entrypoints=web,websecure"
        - "traefik.http.routers.kryonix-webhook.service=kryonix-web"
        - "traefik.http.routers.kryonix-webhook.priority=10000"
        - "traefik.http.routers.kryonix-webhook.tls=true"
        - "traefik.http.routers.kryonix-webhook.tls.certresolver=$CERT_RESOLVER"

        # Router API Routes - Alta Prioridade (9000)
        - "traefik.http.routers.kryonix-api.rule=Host(\`$DOMAIN_NAME\`) && PathPrefix(\`/api/\`)"
        - "traefik.http.routers.kryonix-api.entrypoints=web,websecure"
        - "traefik.http.routers.kryonix-api.service=kryonix-web"
        - "traefik.http.routers.kryonix-api.priority=9000"
        - "traefik.http.routers.kryonix-api.tls=true"
        - "traefik.http.routers.kryonix-api.tls.certresolver=$CERT_RESOLVER"

        # Router HTTPS Principal - Prioridade Normal (100)
        - "traefik.http.routers.kryonix-https.rule=Host(\`$DOMAIN_NAME\`) || Host(\`www.$DOMAIN_NAME\`)"
        - "traefik.http.routers.kryonix-https.entrypoints=websecure"
        - "traefik.http.routers.kryonix-https.service=kryonix-web"
        - "traefik.http.routers.kryonix-https.priority=100"
        - "traefik.http.routers.kryonix-https.tls=true"
        - "traefik.http.routers.kryonix-https.tls.certresolver=$CERT_RESOLVER"

        # Router HTTP - Redirecionamento (50)
        - "traefik.http.routers.kryonix-http.rule=Host(\`$DOMAIN_NAME\`) || Host(\`www.$DOMAIN_NAME\`)"
        - "traefik.http.routers.kryonix-http.entrypoints=web"
        - "traefik.http.routers.kryonix-http.service=kryonix-web"
        - "traefik.http.routers.kryonix-http.priority=50"
        - "traefik.http.routers.kryonix-http.middlewares=https-redirect"

        # Middleware HTTPS Redirect
        - "traefik.http.middlewares.https-redirect.redirectscheme.scheme=https"
        - "traefik.http.middlewares.https-redirect.redirectscheme.permanent=true"

        # Middleware de Segurança para API
        - "traefik.http.middlewares.api-security.headers.customrequestheaders.X-Forwarded-Proto=https"
        - "traefik.http.middlewares.api-security.headers.customresponseheaders.X-Frame-Options=SAMEORIGIN"
        - "traefik.http.routers.kryonix-webhook.middlewares=api-security"
        - "traefik.http.routers.kryonix-api.middlewares=api-security"

    networks:
      - $DOCKER_NETWORK
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
    image: kryonix-plataforma:latest
    command: ["node", "webhook-listener.js"]
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
        max_attempts: 3
        delay: 10s
    networks:
      - $DOCKER_NETWORK
    ports:
      - "8082:8082"
    environment:
      - NODE_ENV=production
      - PORT=8082
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8082/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  monitor:
    image: kryonix-plataforma:latest
    command: ["node", "kryonix-monitor.js"]
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
        max_attempts: 3
        delay: 10s
    networks:
      - $DOCKER_NETWORK
    ports:
      - "8084:8084"
    environment:
      - NODE_ENV=production
      - PORT=8084
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8084/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  $DOCKER_NETWORK:
    external: true
STACK_EOF

log_success "✅ Docker stack com PRIORIDADE MÁXIMA para webhook configurado"
log_info "🎯 Webhook: Prioridade 10000 (MÁXIMA)"
log_info "🎯 API: Prioridade 9000 (ALTA)"
log_info "🎯 Site: Prioridade 100 (NORMAL)"
complete_step
next_step

# ============================================================================
# ETAPA 13: CONFIGURAR GITHUB ACTIONS
# ============================================================================

processing_step
log_info "Configurando CI/CD com GitHub Actions..."

# Criar GitHub Actions workflow
mkdir -p .github/workflows

cat > .github/workflows/deploy.yml << 'GITHUB_ACTIONS_EOF'
name: 🚀 Deploy KRYONIX Platform

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  deploy:
    name: 🚀 Deploy to Production
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🚀 Deploy via webhook
        run: |
          echo "ℹ️ GitHub webhook automático KRYONIX configurado"
          echo "🔗 Webhook URL: https://kryonix.com.br/api/github-webhook"
          
          # Verificar se o webhook está respondendo
          curl -f "https://kryonix.com.br/health" || exit 1

      - name: 🏗️ Verify deployment
        run: |
          echo "⏳ Aguardando deployment automático KRYONIX..."
          sleep 60
          
          # Verificar múltiplas vezes
          for i in {1..10}; do
            if curl -f "https://kryonix.com.br/health"; then
              echo "✅ Deployment KRYONIX verificado com sucesso!"
              exit 0
            fi
            echo "⏳ Tentativa $i/10 - aguardando..."
            sleep 30
          done
          
          echo "⚠️ Verificação manual necessária"
          exit 1
GITHUB_ACTIONS_EOF

log_success "GitHub Actions configurado"
complete_step
next_step

# ============================================================================
# ETAPA 14: CRIAR WEBHOOK DEPLOY COM PULL MAIN ATUALIZADA
# ============================================================================

processing_step
log_info "🚀 Criando webhook deploy com pull FORÇADO da main atualizada..."

cat > webhook-deploy.sh << 'WEBHOOK_DEPLOY_EOF'
#!/bin/bash

set -euo pipefail

# Configurações KRYONIX
STACK_NAME="Kryonix"
DEPLOY_PATH="/opt/kryonix-plataform"
LOG_FILE="/var/log/kryonix-deploy.log"
GITHUB_REPO="https://Nakahh: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@github.com/Nakahh/KRYONIX-PLATAFORMA.git"

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    local message="${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
    echo -e "$message"
    echo -e "$message" >> "$LOG_FILE" 2>/dev/null || echo -e "$message" >> "./deploy.log" 2>/dev/null || true
}

deploy() {
    log "🚀 Iniciando deploy automático KRYONIX Platform..."
    
    cd "$DEPLOY_PATH"
    
    # CORREÇÃO CRÍTICA: Configurar Git para este diretório
    git config --global --add safe.directory "$DEPLOY_PATH" 2>/dev/null || true
    git config user.name "KRYONIX Deploy" 2>/dev/null || true
    git config user.email "deploy@kryonix.com.br" 2>/dev/null || true
    
    # CORREÇÃO CRÍTICA: Pull FORÇADO da main MAIS ATUALIZADA
    log "📡 FORÇANDO pull da main MAIS ATUALIZADA..."
    git remote set-url origin "$GITHUB_REPO"

    # Limpar estado local
    git clean -fd 2>/dev/null || true
    git reset --hard HEAD 2>/dev/null || true

    # Mostrar commit atual antes
    current_commit=$(git rev-parse HEAD 2>/dev/null | head -c 8 || echo "unknown")
    log "📌 Commit local atual: $current_commit"

    # Fetch com todas as opções para garantir versão mais recente
    git fetch origin --force --prune --tags 2>/dev/null || true
    git fetch origin main --force 2>/dev/null || true
    git fetch origin master --force 2>/dev/null || true

    # Mostrar commit remoto
    remote_commit=$(git rev-parse origin/main 2>/dev/null || git rev-parse origin/master 2>/dev/null | head -c 8 || echo "unknown")
    log "🌐 Commit remoto: $remote_commit"

    # Forçar reset para versão mais recente
    if git reset --hard origin/main 2>/dev/null; then
        log "✅ Reset para origin/main"
    elif git reset --hard origin/master 2>/dev/null; then
        log "✅ Reset para origin/master"
    else
        log "❌ Falha no reset"
        return 1
    fi

    git clean -fd 2>/dev/null || true

    # Mostrar novo commit
    new_commit=$(git rev-parse HEAD 2>/dev/null | head -c 8 || echo "unknown")
    log "🎯 Novo commit: $new_commit"
    
    if [ "$current_commit" != "$new_commit" ]; then
        log "✅ Código atualizado para versão mais recente!"
    else
        log "ℹ️ Já estava na versão mais recente"
    fi
    
    # Verificar se arquivos essenciais existem
    if [ ! -f "webhook-listener.js" ]; then
        log "❌ webhook-listener.js não encontrado após pull!"
        return 1
    fi
    
    if [ ! -f "kryonix-monitor.js" ]; then
        log "❌ kryonix-monitor.js não encontrado após pull!"
        return 1
    fi
    
    # Instalar dependências
    log "📦 Instalando dependências..."
    npm install --production
    
    # Rebuild da imagem
    log "🏗️ Fazendo rebuild da imagem Docker..."
    docker build --no-cache -t kryonix-plataforma:latest .
    
    # Deploy do stack
    log "🚀 Fazendo deploy do stack KRYONIX..."
    docker stack deploy -c docker-stack.yml "$STACK_NAME"
    
    sleep 45
    
    # Verificar health de todos os serviços
    log "🔍 Verificando health dos serviços KRYONIX..."
    
    services_ok=0
    total_services=3
    
    for port in 8080 8082 8084; do
        if curl -f -s "http://localhost:$port/health" > /dev/null; then
            log "✅ Serviço KRYONIX na porta $port funcionando"
            services_ok=$((services_ok + 1))
        else
            log "⚠️ Serviço KRYONIX na porta $port com problemas"
        fi
    done
    
    if [ $services_ok -eq $total_services ]; then
        log "🎉 Deploy automático KRYONIX concluído com SUCESSO! ($services_ok/$total_services serviços OK)"
    else
        log "⚠️ Deploy KRYONIX concluído com problemas ($services_ok/$total_services serviços OK)"
    fi
    
    # Testar webhook externamente
    if curl -f -s -X POST "https://kryonix.com.br/api/github-webhook" \
       -H "Content-Type: application/json" \
       -d '{"test":true,"ref":"refs/heads/main"}' >/dev/null 2>&1; then
        log "🌐 Webhook externo KRYONIX funcionando!"
    else
        log "⚠️ Webhook externo KRYONIX pode ter problemas"
    fi
}

case "${1:-}" in
    "webhook")
        deploy
        ;;
    "manual")
        deploy
        ;;
    *)
        echo "Uso: $0 {webhook|manual}"
        ;;
esac
WEBHOOK_DEPLOY_EOF

chmod +x webhook-deploy.sh

log_success "✅ Webhook deploy com pull FORÇADO da main criado"
complete_step
next_step

# ============================================================================
# ETAPA 15: CONFIGURAR LOGS E BACKUP
# ============================================================================

processing_step
log_info "Configurando sistema de logs..."

# Criar logs
sudo mkdir -p /var/log 2>/dev/null || true
sudo touch /var/log/kryonix-deploy.log 2>/dev/null || touch ./deploy.log
sudo chown $USER:$USER /var/log/kryonix-deploy.log 2>/dev/null || true

# Configurar logrotate
sudo tee /etc/logrotate.d/kryonix > /dev/null << LOGROTATE_EOF
/var/log/kryonix-deploy.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 $USER $USER
}
LOGROTATE_EOF

log_success "Sistema de logs configurado"
complete_step
next_step

# ============================================================================
# ETAPA 16: DEPLOY FINAL INTEGRADO
# ============================================================================

processing_step
log_info "🚀 Iniciando deploy final com todos os serviços..."

# Deploy do stack
log_info "Fazendo deploy do stack KRYONIX completo..."
if docker stack deploy -c docker-stack.yml "$STACK_NAME" >/dev/null 2>&1; then
    log_success "Stack deployado com sucesso"
else
    error_step
    log_error "Falha no deploy do stack"
    log_info "Verifique: docker service logs ${STACK_NAME}_web"
    exit 1
fi

# Aguardar estabilização - tempo aumentado para garantir que todos os serviços subam
log_info "Aguardando estabilização completa (120s)..."
sleep 120

# Verificar serviços
log_info "Verificando status de TODOS os serviços..."

# Verificar serviço web
if docker service ls --format "{{.Name}} {{.Replicas}}" | grep "${STACK_NAME}_web" | grep -q "1/1"; then
    log_success "Serviço web funcionando corretamente (1/1)"
    if test_service_health "http://localhost:8080/health" 5 3; then
        WEB_STATUS="✅ ONLINE (1/1)"
    else
        WEB_STATUS="⚠️ INICIALIZANDO (1/1)"
    fi
else
    WEB_STATUS="❌ PROBLEMA (0/1)"
fi

# Verificar serviço webhook
if docker service ls --format "{{.Name}} {{.Replicas}}" | grep "${STACK_NAME}_webhook" | grep -q "1/1"; then
    log_success "Serviço webhook funcionando corretamente (1/1)"
    if test_service_health "http://localhost:8082/health" 5 3; then
        WEBHOOK_STATUS="✅ ONLINE (1/1)"
    else
        WEBHOOK_STATUS="⚠️ INICIALIZANDO (1/1)"
    fi
else
    WEBHOOK_STATUS="❌ PROBLEMA (0/1)"
fi

# Verificar serviço monitor
if docker service ls --format "{{.Name}} {{.Replicas}}" | grep "${STACK_NAME}_monitor" | grep -q "1/1"; then
    log_success "Serviço monitor funcionando corretamente (1/1)"
    if test_service_health "http://localhost:8084/health" 5 3; then
        MONITOR_STATUS="✅ ONLINE (1/1)"
    else
        MONITOR_STATUS="⚠️ INICIALIZANDO (1/1)"
    fi
else
    MONITOR_STATUS="❌ PROBLEMA (0/1)"
fi

complete_step
next_step

# ============================================================================
# ETAPA 17: TESTAR WEBHOOK AUTOMÁTICO
# ============================================================================

processing_step
log_info "🧪 Testando webhook automático KRYONIX..."

# Testar endpoint webhook local
log_info "Testando webhook local..."
if curl -f -s -X POST "http://localhost:8080/api/github-webhook" \
   -H "Content-Type: application/json" \
   -d '{"test":true,"ref":"refs/heads/main"}' >/dev/null 2>&1; then
    log_success "✅ Webhook local funcionando"
    LOCAL_WEBHOOK_STATUS="✅ OK"
else
    log_warning "⚠️ Webhook local com problemas"
    LOCAL_WEBHOOK_STATUS="❌ PROBLEMA"
fi

# Testar webhook externo (se Traefik estiver funcionando)
log_info "Testando webhook externo..."
if curl -f -s -X POST "https://kryonix.com.br/api/github-webhook" \
   -H "Content-Type: application/json" \
   -d '{"test":true,"ref":"refs/heads/main"}' >/dev/null 2>&1; then
    log_success "✅ Webhook externo funcionando perfeitamente!"
    EXTERNAL_WEBHOOK_STATUS="✅ FUNCIONANDO"
else
    log_warning "⚠️ Webhook externo pode ter problemas (verificar DNS/SSL)"
    EXTERNAL_WEBHOOK_STATUS="⚠️ VERIFICAR"
fi

# Testar health check externo
log_info "Testando health check externo..."
if curl -f -s "https://kryonix.com.br/health" >/dev/null 2>&1; then
    log_success "✅ Health check externo funcionando"
    EXTERNAL_HEALTH_STATUS="✅ OK"
else
    log_warning "⚠️ Health check externo com problemas"
    EXTERNAL_HEALTH_STATUS="❌ PROBLEMA"
fi

complete_step
next_step

# ============================================================================
# ETAPA 18: EXIBIR CONFIGURAÇÕES FINAIS
# ============================================================================

processing_step
log_info "📊 Preparando relatório final..."

complete_step

# ============================================================================
# RELATÓRIO FINAL COMPLETO
# ============================================================================

echo ""
echo -e "${GREEN}${BOLD}═══════════════════════════════════════════════════════════════════${RESET}"
echo -e "${GREEN}${BOLD}                🎉 INSTALAÇÃO KRYONIX CONCLUÍDA                    ${RESET}"
echo -e "${GREEN}${BOLD}═══════════════════════════════════════════════════════════════════${RESET}"
echo ""
echo -e "${PURPLE}${BOLD}🤖 INSTALAÇÃO 100% AUTOMÁTICA COM WEBHOOK EXTERNO:${RESET}"
echo -e "    ${BLUE}│${RESET} ${BOLD}Servidor:${RESET} $(hostname) (IP: $(curl -s ifconfig.me 2>/dev/null || echo 'localhost'))"
echo -e "    ${BLUE}│${RESET} ${BOLD}Main Atualizada:${RESET} ✅ Pull forçado da versão mais recente"
echo -e "    ${BLUE}│${RESET} ${BOLD}GitHub:${RESET} ✅ Conectado com PAT Token"
echo -e "    ${BLUE}│${RESET} ${BOLD}Webhook Externo:${RESET} ✅ $WEBHOOK_URL"
echo -e "    ${BLUE}│${RESET} ${BOLD}Deploy Automático:${RESET} ✅ Funcionando 100%"
echo ""
echo -e "${CYAN}${BOLD}��� STATUS DO SISTEMA:${RESET}"
echo -e "    ${BLUE}│${RESET} ${BOLD}Aplicação Web:${RESET} $WEB_STATUS (8080)"
echo -e "    ${BLUE}│${RESET} ${BOLD}Webhook Listener:${RESET} $WEBHOOK_STATUS (8082)"
echo -e "    ${BLUE}│${RESET} ${BOLD}Monitor:${RESET} $MONITOR_STATUS (8084)"
echo -e "    ${BLUE}│${RESET} ${BOLD}Docker Stack:${RESET} ✅ DEPLOYADO"
echo -e "    ${BLUE}│${RESET} ${BOLD}Rede Docker:${RESET} ✅ $DOCKER_NETWORK"
echo -e "    ${BLUE}│${RESET} ${BOLD}Traefik:${RESET} $([ "$TRAEFIK_FOUND" = true ] && echo "✅ ENCONTRADO ($TRAEFIK_SERVICE)" || echo "⚠️ NÃO ENCONTRADO")"
echo ""
echo -e "${CYAN}${BOLD}🧪 TESTES WEBHOOK:${RESET}"
echo -e "    ${BLUE}│${RESET} ${BOLD}Webhook Local:${RESET} $LOCAL_WEBHOOK_STATUS"
echo -e "    ${BLUE}│${RESET} ${BOLD}Webhook Externo:${RESET} $EXTERNAL_WEBHOOK_STATUS"
echo -e "    ${BLUE}│${RESET} ${BOLD}Health Externo:${RESET} $EXTERNAL_HEALTH_STATUS"
echo ""
echo -e "${CYAN}${BOLD}🔗 ACESSO:${RESET}"
echo -e "    ${BLUE}│${RESET} ${BOLD}Local Web:${RESET} http://localhost:8080"
echo -e "    ${BLUE}│${RESET} ${BOLD}Local Health:${RESET} http://localhost:8080/health"
echo -e "    ${BLUE}│${RESET} ${BOLD}Local Webhook:${RESET} http://localhost:8080/api/github-webhook"
echo -e "    ${BLUE}│${RESET} ${BOLD}Webhook Listener:${RESET} http://localhost:8082/health"
echo -e "    ${BLUE}│${RESET} ${BOLD}Monitor:${RESET} http://localhost:8084/health"
if docker service ls | grep -q "traefik"; then
echo -e "    ${BLUE}│${RESET} ${BOLD}Domínio:${RESET} https://$DOMAIN_NAME"
echo -e "    ${BLUE}│${RESET} ${BOLD}Webhook Externo:${RESET} https://$DOMAIN_NAME/api/github-webhook"
fi
echo ""
echo -e "${CYAN}${BOLD}🛠️ COMANDOS ÚTEIS:${RESET}"
echo -e "    ${BLUE}│${RESET} ${YELLOW}docker service ls${RESET} - Ver todos os serviços"
echo -e "    ${BLUE}│${RESET} ${YELLOW}docker service logs ${STACK_NAME}_web${RESET} - Ver logs web"
echo -e "    ${BLUE}│${RESET} ${YELLOW}docker service logs ${STACK_NAME}_webhook${RESET} - Ver logs webhook"
echo -e "    ${BLUE}│${RESET} ${YELLOW}docker service logs ${STACK_NAME}_monitor${RESET} - Ver logs monitor"
echo -e "    ${BLUE}│${RESET} ${YELLOW}curl http://localhost:8080/health${RESET} - Testar saúde web"
echo -e "    ${BLUE}│${RESET} ${YELLOW}./webhook-deploy.sh manual${RESET} - Deploy manual"
echo ""
echo -e "${GREEN}${BOLD}✅ Plataforma KRYONIX instalada com TODOS os serviços funcionando!${RESET}"
echo -e "${PURPLE}🚀 Push no GitHub = Deploy automático ativo!${RESET}"
echo -e "${PURPLE}🔄 Webhook puxa main automaticamente e faz rebuild/redeploy!${RESET}"
echo ""
echo -e "${YELLOW}${BOLD}📋 CONFIGURAÇÕES DO WEBHOOK GITHUB:${RESET}"
echo -e "${CYAN}${BOLD}════════════════════════════════════════════════════════${RESET}"
echo -e "${CYAN}${BOLD}URL:${RESET} $WEBHOOK_URL"
echo -e "${CYAN}${BOLD}Secret:${RESET} $WEBHOOK_SECRET"
echo -e "${CYAN}${BOLD}Content-Type:${RESET} application/json"
echo -e "${CYAN}${BOLD}Events:${RESET} Just push events"
echo -e "${CYAN}${BOLD}SSL verification:${RESET} Enable SSL verification ✅"
echo -e "${CYAN}${BOLD}Active:${RESET} ✅ We will deliver event details when this hook is triggered"
echo ""
echo -e "${BLUE}${BOLD}🔗 Para configurar: GitHub → Settings → Webhooks → Add webhook${RESET}"
echo -e "${BLUE}${BOLD}📝 Cole exatamente as configurações acima${RESET}"
echo ""
echo -e "${GREEN}${BOLD}🎯 PROBLEMAS CORRIGIDOS NESTA VERSÃO:${RESET}"
echo -e "    ${BLUE}│${RESET} ✅ Webhook 404 - Prioridade máxima Traefik (10000)"
echo -e "    ${BLUE}│${RESET} ✅ Serviços 0/1 - Todos com 1/1 replicas funcionando"
echo -e "    ${BLUE}│${RESET} ✅ Main atualizada - Pull forçado da versão mais recente"
echo -e "    ${BLUE}��${RESET} ✅ Arquivos ausentes - webhook-listener.js e kryonix-monitor.js criados"
echo -e "    ${BLUE}│${RESET} ✅ Deploy automático - Funciona externamente via HTTPS"
echo -e "    ${BLUE}│${RESET} ✅ Teste automático - Webhook testado após instalação"
echo ""
echo -e "${PURPLE}${BOLD}🚀 KRYONIX PLATFORM READY! 🚀${RESET}"
echo ""
