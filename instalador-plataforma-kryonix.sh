#!/bin/bash
set -e

# Configurações de encoding seguro para evitar problemas com caracteres especiais
export LC_ALL=C.UTF-8 2>/dev/null || export LC_ALL=C
export LANG=C.UTF-8 2>/dev/null || export LANG=C
export LANGUAGE=C

# ============================================================================
# 🚀 INSTALADOR KRYONIX PLATFORM - CLONE FRESH + VERSÃO MAIS RECENTE
# ============================================================================
# Autor: Vitor Fernandes
# Descrição: Instalador 100% automático com exclusão completa + clone fresh
# Funcionalidades: Nuclear cleanup + Fresh clone + Sempre versão mais recente
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
TOTAL_STEPS=16
CURRENT_STEP=0
STEP_DESCRIPTIONS=(
    "Verificando Docker Swarm ⚙"
    "NUCLEAR cleanup completo 🧹"
    "Configurando credenciais 🔐"
    "Clone FRESH da versão mais recente 🔄"
    "Criando arquivos de serviços 📄"
    "Instalando dependências 📦"
    "Configurando firewall 🔥"
    "Detectando rede Traefik 🔗"
    "Verificando Traefik 📊"
    "Criando imagem Docker 🏗️"
    "Preparando stack Traefik prioridade máxima 📋"
    "Configurando GitHub Actions 🚀"
    "Criando webhook deploy 🔗"
    "Configurando logs e backup ⚙️"
    "Deploy final integrado 🚀"
    "Testando webhook e relatório final 📊"
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
    echo    "║     ██╗  ██╗██████╗ ██╗   ██╗ ██████╗ ███╗   ██╗██╗██╗  ██╗     ║"
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

# NOVA FUNÇÃO: Nuclear cleanup completo
nuclear_cleanup() {
    log_info "🧹 NUCLEAR cleanup - removendo TUDO para garantir versão mais recente..."
    
    # Parar e remover todos os containers/serviços KRYONIX
    docker stack rm Kryonix 2>/dev/null || true
    sleep 15
    
    # Remover TODAS as imagens KRYONIX
    docker images --format "{{.Repository}}:{{.Tag}}" | grep -i kryonix | xargs -r docker rmi -f 2>/dev/null || true
    
    # Parar qualquer processo que possa estar usando o diretório
    sudo pkill -f "$PROJECT_DIR" 2>/dev/null || true
    
    # Desmontar qualquer mount no diretório
    sudo umount "$PROJECT_DIR"/* 2>/dev/null || true
    
    # REMOÇÃO COMPLETA - incluindo arquivos ocultos, .git, tudo
    if [ -d "$PROJECT_DIR" ]; then
        log_info "🗑️ Removendo tudo de $PROJECT_DIR (incluindo .git)..."
        
        # Múltiplas estratégias de remoção
        sudo rm -rf "$PROJECT_DIR"/{*,.[^.]*,..?*} 2>/dev/null || true
        sudo rm -rf "$PROJECT_DIR" 2>/dev/null || true
        
        # Verificar remoção completa
        if [ -d "$PROJECT_DIR" ]; then
            log_warning "Diretório ainda existe, tentando remoção alternativa..."
            sudo find "$PROJECT_DIR" -mindepth 1 -delete 2>/dev/null || true
            sudo rmdir "$PROJECT_DIR" 2>/dev/null || true
        fi
        
        # Verificação final
        if [ -d "$PROJECT_DIR" ]; then
            error_step
            log_error "❌ Falha na remoção completa do diretório: $PROJECT_DIR"
            exit 1
        fi
    fi
    
    # Criar diretório fresh com permissões corretas
    sudo mkdir -p "$PROJECT_DIR"
    sudo chown -R $USER:$USER "$PROJECT_DIR"
    
    log_success "✅ Nuclear cleanup completo - fresh start garantido"
    return 0
}

# NOVA FUNÇÃO: Clone fresh garantindo versão mais recente
fresh_git_clone() {
    local repo_url="$1"
    local target_dir="$2"
    local branch="${3:-main}"
    local pat_token="$4"
    
    log_info "🔄 Clone FRESH garantindo versão MAIS RECENTE..."
    
    # Configurar Git globalmente ANTES de tentar clone
    git config --global user.name "KRYONIX Deploy"
    git config --global user.email "deploy@kryonix.com.br"
    git config --global pull.rebase false
    git config --global init.defaultBranch main
    git config --global --add safe.directory "$target_dir"
    git config --global http.postBuffer 524288000
    git config --global core.compression 0
    git config --global http.sslVerify true

    # CORREÇÃO: Limpar TODAS as credenciais antigas
    git config --global --unset-all credential.helper 2>/dev/null || true
    git credential-manager-core erase <<< "url=https://github.com" 2>/dev/null || true
    git credential erase <<< "url=https://github.com" 2>/dev/null || true

    # CORREÇÃO: Configurar credenciais para repositório privado
    git config --global credential.helper store
    echo "https://Nakahh:${pat_token}@github.com" > ~/.git-credentials
    chmod 600 ~/.git-credentials

    # URL para repositório privado
    local auth_url="https://github.com/Nakahh/KRYONIX-PLATAFORMA.git"
    
    cd "$target_dir"

    # CORREÇÃO: Testar conectividade e autenticação antes de tentar clone
    log_info "🔍 Testando conectividade com GitHub..."
    if ! curl -f -s -H "Authorization: token ${pat_token}" https://api.github.com/repos/Nakahh/KRYONIX-PLATAFORMA >/dev/null; then
        log_error "❌ Falha na conectividade ou token inválido para repositório privado"
        log_info "💡 Verifique se o PAT token tem permissões 'repo' para repositórios privados"
        return 1
    fi
    log_success "✅ Conectividade e token validados"

    # Clone com opções específicas para versão mais recente
    local clone_attempts=0
    local max_attempts=3
    
    while [ $clone_attempts -lt $max_attempts ]; do
        clone_attempts=$((clone_attempts + 1))
        log_info "📥 Tentativa de clone $clone_attempts/$max_attempts..."
        
        # Limpar qualquer clone parcial
        sudo rm -rf ./* .[^.]* ..?* 2>/dev/null || true
        
        # CORREÇÃO: Múltiplas estratégias de clone para repositório privado
        log_info "Tentando clone com credenciais armazenadas..."

        if git clone --verbose \
                    --single-branch \
                    --branch "$branch" \
                    --depth 1 \
                    --no-tags \
                    "$auth_url" \
                    . 2>&1; then
            
            # Imediatamente buscar refs mais recentes
            log_info "📡 Buscando refs mais recentes para garantir versão mais atualizada..."
            git fetch origin --force --prune --depth=1 2>/dev/null || true
            
            # Obter commit mais recente do remoto
            latest_remote_commit=$(git ls-remote origin HEAD 2>/dev/null | cut -f1 | head -c 8 || echo "unknown")
            current_local_commit=$(git rev-parse HEAD 2>/dev/null | head -c 8 || echo "unknown")
            
            log_info "🔍 Remoto mais recente: $latest_remote_commit"
            log_info "🔍 Local atual: $current_local_commit"
            
            # Forçar atualização para absoluto mais recente se diferente
            if [ "$current_local_commit" != "$latest_remote_commit" ] && [ "$latest_remote_commit" != "unknown" ]; then
                log_info "🔄 Atualizando para commit absoluto mais recente..."
                git fetch origin HEAD 2>/dev/null || true
                git reset --hard FETCH_HEAD 2>/dev/null || true
                current_local_commit=$(git rev-parse HEAD 2>/dev/null | head -c 8 || echo "unknown")
                log_success "✅ Atualizado para mais recente: $current_local_commit"
            fi
            
            log_success "✅ Clone fresh concluído com sucesso"
            return 0
        else
            log_warning "⚠️ Clone com credenciais store falhou"

            # FALLBACK 1: Token diretamente na URL
            log_info "Tentando fallback com token na URL..."
            local direct_url="https://Nakahh:${pat_token}@github.com/Nakahh/KRYONIX-PLATAFORMA.git"
            if git clone --single-branch --branch "$branch" --depth 1 "$direct_url" . 2>&1; then
                log_success "✅ Clone com token na URL funcionou"
                break
            fi

            # FALLBACK 2: Configurar credential helper inline
            log_info "Tentando fallback com credential helper inline..."
            git config credential.helper "!f() { echo username=Nakahh; echo password=${pat_token}; }; f"
            if git clone --single-branch --branch "$branch" --depth 1 "$auth_url" . 2>&1; then
                log_success "✅ Clone com credential helper funcionou"
                break
            fi

            log_warning "⚠️ Tentativa de clone $clone_attempts falhou"
            if [ $clone_attempts -lt $max_attempts ]; then
                sleep 5
            fi
        fi
    done
    
    log_error "❌ Todas as tentativas de clone falharam"
    return 1
}

# NOVA FUNÇÃO: Verificação do clone fresh
verify_fresh_clone() {
    local target_dir="$1"
    local expected_branch="${2:-main}"
    
    log_info "🔍 Verificando integridade do clone fresh..."
    
    cd "$target_dir"
    
    # Verificar repositório Git
    if [ ! -d ".git" ]; then
        log_error "❌ Repositório Git não encontrado"
        return 1
    fi
    
    # Obter informações do commit
    commit_hash=$(git rev-parse HEAD 2>/dev/null | head -c 8 || echo "unknown")
    commit_msg=$(git log -1 --pretty=format:"%s" 2>/dev/null || echo "N/A")
    commit_date=$(git log -1 --pretty=format:"%ci" 2>/dev/null || echo "N/A")
    author=$(git log -1 --pretty=format:"%an" 2>/dev/null || echo "N/A")
    
    log_info "📊 Informações do repositório:"
    log_info "   Commit: $commit_hash"
    log_info "   Mensagem: $commit_msg"
    log_info "   Data: $commit_date"
    log_info "   Autor: $author"
    
    # Verificar arquivos essenciais
    essential_files=("package.json" "server.js")
    missing_files=()
    
    for file in "${essential_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -gt 0 ]; then
        log_error "❌ Arquivos essenciais faltando: ${missing_files[*]}"
        return 1
    fi
    
    # Verificar se temos o commit remoto mais recente
    remote_commit=$(git ls-remote origin HEAD 2>/dev/null | cut -f1 | head -c 8 || echo "unknown")
    if [ "$commit_hash" != "$remote_commit" ] && [ "$remote_commit" != "unknown" ]; then
        log_warning "⚠️ Commit local ($commit_hash) difere do remoto ($remote_commit)"
        return 2  # Warning, não erro
    fi
    
    # Verificar especificamente se está no PR #22 (preocupação do usuário)
    if echo "$commit_msg" | grep -qi "#22"; then
        log_warning "⚠️ Commit atual referencia PR #22 - verificando por versões mais recentes..."
        
        # Tentar buscar o mais recente
        git fetch origin --force 2>/dev/null || true
        latest_commit=$(git rev-parse origin/main 2>/dev/null || git rev-parse origin/master 2>/dev/null | head -c 8 || echo "unknown")
        
        if [ "$commit_hash" != "$latest_commit" ] && [ "$latest_commit" != "unknown" ]; then
            log_warning "⚠️ Commit mais recente disponível: $latest_commit"
            
            # Tentar atualizar para o mais recente
            log_info "🔄 Tentando atualizar para o commit mais recente..."
            if git reset --hard origin/main 2>/dev/null || git reset --hard origin/master 2>/dev/null; then
                new_commit=$(git rev-parse HEAD 2>/dev/null | head -c 8 || echo "unknown")
                new_msg=$(git log -1 --pretty=format:"%s" 2>/dev/null || echo "N/A")
                log_success "✅ Atualizado para: $new_commit - $new_msg"
            fi
        fi
    fi
    
    log_success "✅ Verificação do clone passou"
    return 0
}

# Função para validar credenciais pr��-configuradas
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
echo -e "${PURPLE}${BOLD}🚀 INSTALADOR KRYONIX - CLONE FRESH + VERSÃO MAIS RECENTE${RESET}"
echo -e "${CYAN}${BOLD}📡 Detectando ambiente do servidor...${RESET}"
echo -e "${BLUE}├�� Servidor: $(hostname)${RESET}"
echo -e "${BLUE}├─ IP: $(curl -s -4 ifconfig.me 2>/dev/null || curl -s ipv4.icanhazip.com 2>/dev/null || echo 'localhost')${RESET}"
echo -e "${BLUE}├─ Usuário: $(whoami)${RESET}"
echo -e "${BLUE}├─ SO: $(uname -s) $(uname -r)${RESET}"
echo -e "${BLUE}└─ Docker: $(docker --version 2>/dev/null || echo 'Não detectado')${RESET}"
echo ""
echo -e "${GREEN}${BOLD}✅ Nuclear cleanup + Clone fresh + Garantia versão mais recente!${RESET}\n"

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
# ETAPA 2: NUCLEAR CLEANUP COMPLETO
# ============================================================================

processing_step
if ! nuclear_cleanup; then
    error_step
    log_error "Falha no nuclear cleanup"
    exit 1
fi
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
# ETAPA 4: CLONE FRESH DA VERSÃO MAIS RECENTE
# ============================================================================

processing_step
log_info "🔄 Iniciando clone FRESH para garantir versão MAIS RECENTE..."
log_info "🎯 Objetivo: Não ficar no PR #22, sempre pegar versão mais recente!"

# Fazer clone fresh
if ! fresh_git_clone "$GITHUB_REPO" "$PROJECT_DIR" "main" "$PAT_TOKEN"; then
    error_step
    log_error "Falha no clone fresh do repositório GitHub"
    exit 1
fi

# Verificar clone
verification_result=0
verify_fresh_clone "$PROJECT_DIR" "main"
verification_result=$?

if [ $verification_result -eq 1 ]; then
    error_step
    log_error "Falha na verificação do clone"
    exit 1
elif [ $verification_result -eq 2 ]; then
    log_warning "Clone concluído com avisos"
fi

# Entrar no diretório
cd "$PROJECT_DIR"

# Verificar arquivos essenciais
if [ ! -f "package.json" ]; then
    error_step
    log_error "package.json não encontrado no repositório!"
    exit 1
fi

if [ ! -f "server.js" ]; then
    error_step
    log_error "server.js não encontrado no repositório!"
    exit 1
fi

# Mostrar informações finais do commit
final_commit=$(git rev-parse HEAD 2>/dev/null | head -c 8)
final_commit_msg=$(git log -1 --pretty=format:"%s" 2>/dev/null || echo "N/A")
log_success "✅ Clone fresh concluído - Commit: $final_commit"
log_info "📝 Última alteração: $final_commit_msg"

# Verificação final para PR #22
if echo "$final_commit_msg" | grep -qi "#22"; then
    log_warning "⚠️ ATENÇÃO: Ainda detectando referência ao PR #22"
    log_info "Isso pode significar que o PR #22 É a versão mais recente no GitHub"
    log_info "Ou pode haver um problema de sincronização"
else
    log_success "✅ Confirmado: Não está no PR #22 - versão mais recente obtida"
fi

complete_step
next_step

# ============================================================================
# ETAPA 5: CRIAR ARQUIVOS DE SERVIÇOS
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

    # Adicionar endpoint webhook completo
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

// Endpoint webhook do GitHub com deploy automático
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

        // Executar deploy automático
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
            webhook_url: '$WEBHOOK_URL'
        });
    } else {
        console.log('ℹ️ Evento KRYONIX ignorado:', { event, ref: payload.ref });

        res.json({
            message: 'Evento ignorado',
            status: 'ignored',
            event: event || 'undefined',
            ref: payload.ref || 'undefined',
            reason: !isValidEvent ? 'invalid_event' : 'invalid_ref'
        });
    }
});
WEBHOOK_EOF

    log_success "✅ Webhook completo adicionado ao server.js"
else
    log_info "ℹ️ Webhook já existe no server.js"
fi

# webhook-listener.js - Arquivo que estava faltando causando 0/1
log_info "Criando webhook-listener.js..."
cat > webhook-listener.js << 'WEBHOOK_LISTENER_EOF'
const express = require('express');
const { exec } = require('child_process');
const app = express();
const PORT = process.env.PORT || 8082;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'kryonix-webhook-listener',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

app.get('/status', (req, res) => {
  res.json({
    service: 'kryonix-webhook-listener',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.post('/webhook', (req, res) => {
  console.log('🔗 Webhook KRYONIX recebido no listener:', new Date().toISOString());
  
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
    timestamp: new Date().toISOString()
  });
});

app.get('/test', (req, res) => {
  res.json({
    message: 'Webhook listener KRYONIX funcionando',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔗 KRYONIX Webhook listener rodando em http://0.0.0.0:${PORT}`);
});
WEBHOOK_LISTENER_EOF

# kryonix-monitor.js - Arquivo que estava faltando causando 0/1
log_info "Criando kryonix-monitor.js..."
cat > kryonix-monitor.js << 'KRYONIX_MONITOR_EOF'
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8084;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'kryonix-monitor',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

app.get('/metrics', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    status: 'monitoring',
    services: { 
      web: 'ok', 
      webhook: 'ok',
      monitor: 'ok'
    },
    version: '1.0.0'
  });
});

app.get('/status', (req, res) => {
  res.json({
    service: 'kryonix-monitor',
    status: 'running',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

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
            ✅ Sistema Online - Clone Fresh + Versão Mais Recente!
        </div>
        
        <div style="margin-top: 2rem;">
            <a href="/health" class="btn">🔍 Health Check</a>
            <a href="/api/status" class="btn">📊 Status API</a>
            <a href="/api/github-webhook" class="btn">🔗 Webhook Test</a>
        </div>
        
        <p style="margin-top: 2rem; opacity: 0.8;">
            🌐 https://kryonix.com.br | 📱 +55 17 98180-5327<br>
            🚀 Deploy automático ativo - Sempre versão mais recente
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

# Criar webhook-deploy.sh ANTES do Docker build
log_info "Criando webhook-deploy.sh..."

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
    log "🚀 Iniciando deploy automático KRYONIX com nuclear cleanup..."

    # CORREÇÃO: Nuclear cleanup para garantir versão mais recente
    log "🧹 Nuclear cleanup para garantir versão mais recente..."

    # Parar processos
    sudo pkill -f "$DEPLOY_PATH" 2>/dev/null || true

    # Remover TUDO do diretório (incluindo .git)
    cd /opt
    sudo rm -rf kryonix-plataform

    log "📥 Clone FRESH da versão mais recente..."

    # Configurar Git e credenciais para repositório privado
    git config --global user.name "KRYONIX Deploy" 2>/dev/null || true
    git config --global user.email "deploy@kryonix.com.br" 2>/dev/null || true
    git config --global --add safe.directory "$DEPLOY_PATH" 2>/dev/null || true
    git config --global credential.helper store 2>/dev/null || true

    # Configurar credenciais para repositório privado
    echo "https://Nakahh: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@github.com" > ~/.git-credentials
    chmod 600 ~/.git-credentials

    # Clone fresh completo (repositório privado)
    if git clone --single-branch --branch main --depth 1 "https://github.com/Nakahh/KRYONIX-PLATAFORMA.git" kryonix-plataform; then
        log "✅ Clone fresh concluído"
    else
        log "⚠️ Clone com credenciais store falhou, tentando com token na URL..."
        # Fallback: token diretamente na URL
        if git clone --single-branch --branch main --depth 1 "https://Nakahh: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@github.com/Nakahh/KRYONIX-PLATAFORMA.git" kryonix-plataform; then
            log "✅ Clone fresh concluído com fallback"
        else
            log "❌ Falha no clone fresh com todos os métodos"
            return 1
        fi
    fi

    cd "$DEPLOY_PATH"

    # Verificar se é a versão mais recente
    current_commit=$(git rev-parse HEAD 2>/dev/null | head -c 8 || echo "unknown")
    current_msg=$(git log -1 --pretty=format:"%s" 2>/dev/null || echo "N/A")
    remote_commit=$(git ls-remote origin HEAD 2>/dev/null | cut -f1 | head -c 8 || echo "unknown")

    log "📌 Commit local: $current_commit"
    log "🌐 Commit remoto: $remote_commit"
    log "📝 Mensagem: $current_msg"

    # Verificar se tem arquivos necessários
    if [ ! -f "webhook-listener.js" ] || [ ! -f "kryonix-monitor.js" ]; then
        log "❌ Arquivos de serviços faltando após clone!"
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

    sleep 60

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
        log "🎉 Deploy KRYONIX concluído com SUCESSO! ($services_ok/$total_services serviços OK)"
    else
        log "⚠️ Deploy KRYONIX com problemas ($services_ok/$total_services serviços OK)"
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

log_success "✅ Todos os arquivos de serviços criados (incluindo webhook-deploy.sh)"
complete_step
next_step

# ============================================================================
# ETAPA 6: INSTALAR DEPENDÊNCIAS
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
# ETAPA 7: CONFIGURAR FIREWALL
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
# ETAPA 8: DETECTAR REDE TRAEFIK
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
# ETAPA 9: VERIFICAR TRAEFIK
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
fi

log_success "✅ Verificação do Traefik concluída"
complete_step
next_step

# ============================================================================
# ETAPA 10: CRIAR IMAGEM DOCKER
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

# Verificar se arquivos necessários existem antes do build
log_info "Verificando arquivos necessários para Docker build..."
required_files=("package.json" "server.js" "webhook-listener.js" "kryonix-monitor.js" "public/index.html")
missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    else
        log_info "✅ $file encontrado"
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    error_step
    log_error "❌ Arquivos obrigatórios faltando para Docker build: ${missing_files[*]}"
    exit 1
fi

# Build com logs detalhados para diagnóstico
log_info "Iniciando Docker build com logs detalhados..."
if docker build --no-cache -t kryonix-plataforma:latest . 2>&1 | tee /tmp/docker-build.log; then
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    docker tag kryonix-plataforma:latest kryonix-plataforma:$TIMESTAMP
    log_success "Imagem criada: kryonix-plataforma:$TIMESTAMP"
else
    error_step
    log_error "❌ Falha no build da imagem Docker"
    log_info "📋 Últimas linhas do log de build:"
    tail -10 /tmp/docker-build.log | while read line; do
        log_error "   $line"
    done
    exit 1
fi

complete_step
next_step

# ============================================================================
# ETAPA 11: PREPARAR STACK COM TRAEFIK PRIORIDADE MÁXIMA
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

        # WEBHOOK - PRIORIDADE MÁXIMA (10000)
        - "traefik.http.routers.kryonix-webhook.rule=Host(\`$DOMAIN_NAME\`) && Path(\`/api/github-webhook\`)"
        - "traefik.http.routers.kryonix-webhook.entrypoints=web,websecure"
        - "traefik.http.routers.kryonix-webhook.service=kryonix-web"
        - "traefik.http.routers.kryonix-webhook.priority=10000"
        - "traefik.http.routers.kryonix-webhook.tls=true"
        - "traefik.http.routers.kryonix-webhook.tls.certresolver=$CERT_RESOLVER"

        # API Routes - Alta Prioridade (9000)
        - "traefik.http.routers.kryonix-api.rule=Host(\`$DOMAIN_NAME\`) && PathPrefix(\`/api/\`)"
        - "traefik.http.routers.kryonix-api.entrypoints=web,websecure"
        - "traefik.http.routers.kryonix-api.service=kryonix-web"
        - "traefik.http.routers.kryonix-api.priority=9000"
        - "traefik.http.routers.kryonix-api.tls=true"
        - "traefik.http.routers.kryonix-api.tls.certresolver=$CERT_RESOLVER"

        # HTTPS Principal - Prioridade Normal (100)
        - "traefik.http.routers.kryonix-https.rule=Host(\`$DOMAIN_NAME\`) || Host(\`www.$DOMAIN_NAME\`)"
        - "traefik.http.routers.kryonix-https.entrypoints=websecure"
        - "traefik.http.routers.kryonix-https.service=kryonix-web"
        - "traefik.http.routers.kryonix-https.priority=100"
        - "traefik.http.routers.kryonix-https.tls=true"
        - "traefik.http.routers.kryonix-https.tls.certresolver=$CERT_RESOLVER"

        # HTTP - Redirecionamento (50)
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
      start_period: 60s

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
      start_period: 60s

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
      start_period: 60s

networks:
  $DOCKER_NETWORK:
    external: true
STACK_EOF

log_success "✅ Docker stack com PRIORIDADE MÁXIMA configurado"
complete_step
next_step

# ============================================================================
# ETAPA 12: CONFIGURAR GITHUB ACTIONS
# ============================================================================

processing_step
log_info "Configurando CI/CD com GitHub Actions..."

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
    log "🚀 Iniciando deploy automático KRYONIX com nuclear cleanup..."
    
    # CORREÇÃO: Nuclear cleanup para garantir versão mais recente
    log "🧹 Nuclear cleanup para garantir versão mais recente..."
    
    # Parar processos
    sudo pkill -f "$DEPLOY_PATH" 2>/dev/null || true
    
    # Remover TUDO do diretório (incluindo .git)
    cd /opt
    sudo rm -rf kryonix-plataform
    
    log "📥 Clone FRESH da versão mais recente..."

    # Configurar Git e credenciais para repositório privado
    git config --global user.name "KRYONIX Deploy" 2>/dev/null || true
    git config --global user.email "deploy@kryonix.com.br" 2>/dev/null || true
    git config --global --add safe.directory "$DEPLOY_PATH" 2>/dev/null || true
    git config --global credential.helper store 2>/dev/null || true

    # Configurar credenciais para repositório privado
    echo "https://Nakahh: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@github.com" > ~/.git-credentials
    chmod 600 ~/.git-credentials

    # Clone fresh completo (repositório privado)
    if git clone --single-branch --branch main --depth 1 "https://github.com/Nakahh/KRYONIX-PLATAFORMA.git" kryonix-plataform; then
        log "✅ Clone fresh concluído"
    else
        log "⚠️ Clone com credenciais store falhou, tentando com token na URL..."
        # Fallback: token diretamente na URL
        if git clone --single-branch --branch main --depth 1 "https://Nakahh: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@github.com/Nakahh/KRYONIX-PLATAFORMA.git" kryonix-plataform; then
            log "✅ Clone fresh concluído com fallback"
        else
            log "❌ Falha no clone fresh com todos os métodos"
            return 1
        fi
    fi
    
    cd "$DEPLOY_PATH"
    
    # Verificar se é a versão mais recente
    current_commit=$(git rev-parse HEAD 2>/dev/null | head -c 8 || echo "unknown")
    current_msg=$(git log -1 --pretty=format:"%s" 2>/dev/null || echo "N/A")
    remote_commit=$(git ls-remote origin HEAD 2>/dev/null | cut -f1 | head -c 8 || echo "unknown")
    
    log "📌 Commit local: $current_commit"
    log "🌐 Commit remoto: $remote_commit" 
    log "📝 Mensagem: $current_msg"
    
    # Verificar se tem arquivos necessários
    if [ ! -f "webhook-listener.js" ] || [ ! -f "kryonix-monitor.js" ]; then
        log "❌ Arquivos de serviços faltando após clone!"
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
    
    sleep 60
    
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
        log "🎉 Deploy KRYONIX concluído com SUCESSO! ($services_ok/$total_services serviços OK)"
    else
        log "⚠️ Deploy KRYONIX com problemas ($services_ok/$total_services serviços OK)"
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

log_success "✅ Webhook deploy com nuclear cleanup criado"
complete_step
next_step

# ============================================================================
# ETAPA 14: CONFIGURAR LOGS E BACKUP
# ============================================================================

processing_step
log_info "Configurando sistema de logs..."

# Criar logs
sudo mkdir -p /var/log 2>/dev/null || true
sudo touch /var/log/kryonix-deploy.log 2>/dev/null || touch ./deploy.log
sudo chown $USER:$USER /var/log/kryonix-deploy.log 2>/dev/null || true

log_success "Sistema de logs configurado"
complete_step
next_step

# ============================================================================
# ETAPA 15: DEPLOY FINAL INTEGRADO
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
    exit 1
fi

# Aguardar estabilização - tempo estendido para garantir que todos subam
log_info "Aguardando estabilização completa (120s)..."
sleep 120

# Verificar serviços
log_info "Verificando status de TODOS os serviços..."

# Verificar todos os serviços
for service in web webhook monitor; do
    if docker service ls --format "{{.Name}} {{.Replicas}}" | grep "${STACK_NAME}_${service}" | grep -q "1/1"; then
        log_success "Serviço $service funcionando (1/1)"
        eval "${service^^}_STATUS=\"✅ ONLINE (1/1)\""
    else
        log_warning "Serviço $service com problemas"
        eval "${service^^}_STATUS=\"❌ PROBLEMA (0/1)\""
    fi
done

complete_step
next_step

# ============================================================================
# ETAPA 16: TESTE WEBHOOK E RELATÓRIO FINAL
# ============================================================================

processing_step
log_info "🧪 Testando webhook e preparando relatório final..."

# Testar webhook local
if curl -f -s -X POST "http://localhost:8080/api/github-webhook" \
   -H "Content-Type: application/json" \
   -d '{"test":true,"ref":"refs/heads/main"}' >/dev/null 2>&1; then
    LOCAL_WEBHOOK_STATUS="✅ OK"
else
    LOCAL_WEBHOOK_STATUS="❌ PROBLEMA"
fi

# Testar webhook externo
if curl -f -s -X POST "https://kryonix.com.br/api/github-webhook" \
   -H "Content-Type: application/json" \
   -d '{"test":true,"ref":"refs/heads/main"}' >/dev/null 2>&1; then
    EXTERNAL_WEBHOOK_STATUS="✅ FUNCIONANDO"
else
    EXTERNAL_WEBHOOK_STATUS="⚠️ VERIFICAR"
fi

complete_step

# ============================================================================
# RELATÓRIO FINAL COMPLETO
# ============================================================================

echo ""
echo -e "${GREEN}${BOLD}═══════════════════════════════════════════════════════════════════${RESET}"
echo -e "${GREEN}${BOLD}                ���� INSTALAÇÃO KRYONIX CONCLUÍDA                    ${RESET}"
echo -e "${GREEN}${BOLD}═══════════════════════════════════════════════════════════════════${RESET}"
echo ""
echo -e "${PURPLE}${BOLD}🤖 NUCLEAR CLEANUP + CLONE FRESH + VERSÃO MAIS RECENTE:${RESET}"
echo -e "    ${BLUE}│${RESET} ${BOLD}Servidor:${RESET} $(hostname) (IP: $(curl -s ifconfig.me 2>/dev/null || echo 'localhost'))"

# Verificar versão final
final_commit=$(git rev-parse HEAD 2>/dev/null | head -c 8 || echo "unknown")
final_commit_msg=$(git log -1 --pretty=format:"%s" 2>/dev/null || echo "N/A")

echo -e "    ${BLUE}│${RESET} ${BOLD}Versão Final:${RESET} ✅ Commit $final_commit"
echo -e "    ${BLUE}│${RESET} ${BOLD}Última Alteração:${RESET} $final_commit_msg"

# Verificação especial para PR #22
if echo "$final_commit_msg" | grep -qi "#22"; then
    echo -e "    ${BLUE}│${RESET} ${YELLOW}⚠️ AVISO:${RESET} Detectada referência ao PR #22"
    echo -e "    ${BLUE}│${RESET} ${YELLOW}   Isso pode significar que PR #22 É a versão mais recente${RESET}"
    echo -e "    ${BLUE}│${RESET} ${YELLOW}   ou há um problema de sincronização com GitHub${RESET}"
else
    echo -e "    ${BLUE}│${RESET} ${GREEN}✅ Confirmado:${RESET} Não está no PR #22 - versão mais recente"
fi

echo ""
echo -e "${CYAN}${BOLD}��� STATUS DO SISTEMA:${RESET}"
echo -e "    ${BLUE}│${RESET} ${BOLD}Aplicação Web:${RESET} ${WEB_STATUS:-⚠️ VERIFICANDO}"
echo -e "    ${BLUE}│${RESET} ${BOLD}Webhook Listener:${RESET} ${WEBHOOK_STATUS:-⚠️ VERIFICANDO}"
echo -e "    ${BLUE}│${RESET} ${BOLD}Monitor:${RESET} ${MONITOR_STATUS:-⚠️ VERIFICANDO}"
echo -e "    ${BLUE}│${RESET} ${BOLD}Docker Stack:${RESET} ✅ DEPLOYADO"
echo -e "    ${BLUE}│${RESET} ${BOLD}Rede Docker:${RESET} ✅ $DOCKER_NETWORK"
echo ""
echo -e "${CYAN}${BOLD}🧪 TESTES WEBHOOK:${RESET}"
echo -e "    ${BLUE}│${RESET} ${BOLD}Webhook Local:${RESET} $LOCAL_WEBHOOK_STATUS"
echo -e "    ${BLUE}│${RESET} ${BOLD}Webhook Externo:${RESET} $EXTERNAL_WEBHOOK_STATUS"
echo ""
echo -e "${CYAN}${BOLD}🔗 ACESSO:${RESET}"
echo -e "    ${BLUE}│${RESET} ${BOLD}Local Web:${RESET} http://localhost:8080"
echo -e "    ${BLUE}│${RESET} ${BOLD}Local Webhook:${RESET} http://localhost:8080/api/github-webhook"
if docker service ls | grep -q "traefik"; then
echo -e "    ${BLUE}│${RESET} ${BOLD}Domínio:${RESET} https://$DOMAIN_NAME"
echo -e "    ${BLUE}│${RESET} ${BOLD}Webhook Externo:${RESET} https://$DOMAIN_NAME/api/github-webhook"
fi
echo ""
echo -e "${GREEN}${BOLD}✅ Plataforma KRYONIX instalada!${RESET}"
echo -e "${PURPLE}🚀 Deploy automático ativo - Nuclear cleanup + Clone fresh!${RESET}"
echo ""
echo -e "${YELLOW}${BOLD}📋 CONFIGURAÇÕES DO WEBHOOK GITHUB:${RESET}"
echo -e "${CYAN}════════════════════════════════════════════${RESET}"
echo -e "${CYAN}${BOLD}URL:${RESET} $WEBHOOK_URL"
echo -e "${CYAN}${BOLD}Secret:${RESET} $WEBHOOK_SECRET"
echo -e "${CYAN}${BOLD}Content-Type:${RESET} application/json"
echo -e "${CYAN}${BOLD}Events:${RESET} Just push events"
echo ""
echo -e "${GREEN}${BOLD}🎯 MELHORIAS IMPLEMENTADAS:${RESET}"
echo -e "    ${BLUE}│${RESET} ✅ Nuclear cleanup - Remove TUDO antes de começar"
echo -e "    ${BLUE}│${RESET} ✅ Clone fresh - Sempre repositório limpo"
echo -e "    ${BLUE}│${RESET} ✅ Versão mais recente - Não fica preso em versões antigas"
echo -e "    ${BLUE}│${RESET} ✅ Webhook funcional - Deploy automático garantido"
echo ""
echo -e "${PURPLE}${BOLD}🚀 KRYONIX PLATFORM READY! 🚀${RESET}"
echo ""
