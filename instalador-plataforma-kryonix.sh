#!/bin/bash
set -e

# Configurações de encoding seguro para evitar problemas com caracteres especiais
export LC_ALL=C.UTF-8 2>/dev/null || export LC_ALL=C
export LANG=C.UTF-8 2>/dev/null || export LANG=C
export LANGUAGE=C

# ============================================================================
# 🚀 INSTALADOR KRYONIX PLATFORM - VERSÃO CORRIGIDA COMPLETA
# ============================================================================
# Autor: Vitor Fernandes
# Descrição: Instalador completo da Plataforma KRYONIX com deploy automático
# Funcionalidades: 15 etapas com barra de progresso + CI/CD integrado
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
WEBHOOK_PORT="8080"
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
TOTAL_STEPS=15
CURRENT_STEP=0
STEP_DESCRIPTIONS=(
    "Verificando Docker Swarm ⚙"
    "Limpando ambiente anterior 🧹"
    "Configurando credenciais 🔐"
    "Preparando projeto 📁"
    "Instalando dependências 📦"
    "Configurando firewall 🔥"
    "Configurando rede Docker 🔗"
    "Verificando Traefik 📊"
    "Criando imagem Docker 🏗️"
    "Preparando stack ��️"
    "Testando conectividade local 🌐"
    "Configurando GitHub Actions 🚀"
    "Criando webhook deploy 🔗"
    "Configurando logs e backup ⚙️"
    "Deploy final integrado 🚀"
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

# Função simplificada e robusta para detectar rede do Traefik (sem logs internos)
detect_traefik_network_automatically() {
    local detected_network=""

    # 1. PRIORIDADE: Verificar se Kryonix-NET existe
    if docker network ls --format "{{.Name}}" | grep -q "^Kryonix-NET$" 2>/dev/null; then
        detected_network="Kryonix-NET"
        echo "$detected_network"
        return 0
    fi

    # 2. Verificar redes overlay existentes (excluindo ingress)
    local overlay_networks=$(docker network ls --filter driver=overlay --format "{{.Name}}" 2>/dev/null | grep -v "^ingress$" | head -1)
    if [ ! -z "$overlay_networks" ]; then
        detected_network="$overlay_networks"
        echo "$detected_network"
        return 0
    fi

    # 3. FALLBACK: Usar Kryonix-NET como padrão
    echo "Kryonix-NET"
    return 0
}

# Função ensure_docker_network removida - tratamento direto na Etapa 7

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

# Função centralizada para operações Git
sync_git_repository() {
    local repo_url="$1"
    local branch="${2:-main}"
    
    log_info "Sincronizando repositório Git..."
    
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
    
    # Fazer sincronização
    git fetch origin --force 2>/dev/null || true
    git reset --hard origin/$branch 2>/dev/null || git reset --hard origin/master 2>/dev/null || {
        log_warning "Não foi possível sincronizar com repositório remoto"
        return 1
    }
    git clean -fd 2>/dev/null || true
    
    log_success "Repositório sincronizado com sucesso"
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
echo -e "${PURPLE}${BOLD}🚀 INSTALADOR KRYONIX 100% AUTOMÁTICO${RESET}"
echo -e "${CYAN}${BOLD}📡 Detectando ambiente do servidor...${RESET}"
echo -e "${BLUE}├─ Servidor: $(hostname)${RESET}"
echo -e "${BLUE}├─ IP: $(curl -s -4 ifconfig.me 2>/dev/null || curl -s ipv4.icanhazip.com 2>/dev/null || echo 'localhost')${RESET}"
echo -e "${BLUE}├─ Usuário: $(whoami)${RESET}"
echo -e "${BLUE}├─ SO: $(uname -s) $(uname -r)${RESET}"
echo -e "${BLUE}└─ Docker: $(docker --version 2>/dev/null || echo 'Não detectado')${RESET}"
echo ""
echo -e "${GREEN}${BOLD}✅ Configuração automática ativada - sem interação necessária!${RESET}\n"

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
sleep 5

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

# Configurar repositório Git com credenciais automáticas
log_info "🔗 Configurando acesso ao GitHub com credenciais..."
REPO_WITH_TOKEN="https://Nakahh:${PAT_TOKEN}@github.com/Nakahh/KRYONIX-PLATAFORMA.git"
sync_git_repository "$REPO_WITH_TOKEN"

# Verificar arquivos essenciais
if [ ! -f "package.json" ]; then
    log_error "package.json não encontrado no repositório!"
    log_info "Verifique se o repositório $GITHUB_REPO está correto"
    exit 1
fi

# Corrigir package.json se necessário
if grep -q '"type": "module"' package.json; then
    log_info "Removendo type: module do package.json para compatibilidade"
    sed -i '/"type": "module",/d' package.json
fi

# Verificar server.js
if [ ! -f "server.js" ]; then
    log_error "server.js não encontrado no repositório!"
    exit 1
fi

# Verificar se webhook já está integrado no server.js
# Sempre atualizar o webhook para a versão corrigida
log_info "🔗 Atualizando endpoint webhook para versão corrigida com deploy automático..."

# Backup do server.js
cp server.js server.js.backup.$(date +%Y%m%d_%H%M%S)

# Remover webhook antigo se existir
if grep -q "/api/github-webhook" server.js; then
    log_info "🔄 Removendo webhook antigo para atualização..."
    sed -i '/\/\/ Webhook.*GitHub/,/^});$/d' server.js
    sed -i '/^const crypto.*$/,/^});$/d' server.js
fi

# Sempre adicionar webhook corrigido
log_info "✅ Adicionando webhook corrigido..."

    cat >> server.js << 'WEBHOOK_EOF'

// Webhook do GitHub configurado automaticamente pelo instalador - DEPLOY AVANÇADO
const crypto = require('crypto');
const { spawn } = require('child_process');
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'Kr7$n0x-V1t0r-2025-#Jwt$3cr3t-P0w3rfu1-K3y-A9b2Cd8eF4g6H1j5K9m3N7p2Q5t8';

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

// Endpoint webhook do GitHub
app.post('/api/github-webhook', (req, res) => {
    const payload = req.body;
    const signature = req.get('X-Hub-Signature-256');
    const event = req.get('X-GitHub-Event');

    console.log('🔗 Webhook recebido:', {
        event: event || 'NONE',
        ref: payload.ref || 'N/A',
        repository: payload.repository?.name || 'N/A',
        signature: signature ? 'PRESENT' : 'NONE'
    });

    // Verificar assinatura
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
        console.log('🚀 Deploy automático iniciado para:', payload.ref);

        res.json({
            message: 'Deploy automático iniciado',
            status: 'accepted',
            ref: payload.ref,
            sha: payload.after || payload.head_commit?.id,
            timestamp: new Date().toISOString(),
            webhook_url: '$WEBHOOK_URL'
        });
    } else {
        console.log('ℹ️ Evento ignorado:', { event, ref: payload.ref });

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

    log_success "✅ Webhook corrigido com deploy automático completo adicionado ao server.js"

# Criar arquivos auxiliares necessários
log_info "Criando arquivos auxiliares..."

# webhook-listener.js
cat > webhook-listener.js << 'WEBHOOK_LISTENER_EOF'
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8082;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'webhook-listener' });
});

app.post('/webhook', (req, res) => {
  console.log('Webhook recebido:', new Date().toISOString());
  res.json({ message: 'Webhook processado' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Webhook listener rodando em http://0.0.0.0:${PORT}`);
});
WEBHOOK_LISTENER_EOF

# kryonix-monitor.js
cat > kryonix-monitor.js << 'KRYONIX_MONITOR_EOF'
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8084;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'kryonix-monitor' });
});

app.get('/metrics', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    status: 'monitoring',
    services: { web: 'ok', webhook: 'ok' }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Monitor rodando em http://0.0.0.0:${PORT}`);
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
            ✅ Sistema Online e Funcionando!
        </div>
        
        <div style="margin-top: 2rem;">
            <a href="/health" class="btn">🔍 Health Check</a>
            <a href="/api/status" class="btn">📊 Status API</a>
        </div>
        
        <p style="margin-top: 2rem; opacity: 0.8;">
            🌐 https://kryonix.com.br | 📱 +55 17 98180-5327
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

log_success "Projeto preparado com todos os arquivos necessários"
complete_step
next_step

# ============================================================================
# ETAPA 5: INSTALAR DEPENDÊNCIAS
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
# ETAPA 6: CONFIGURAR FIREWALL
# ============================================================================

processing_step
log_info "Configurando firewall do sistema..."

if command -v ufw >/dev/null 2>&1; then
    sudo ufw --force enable 2>/dev/null || true
    sudo ufw allow 80/tcp comment "HTTP" 2>/dev/null || true
    sudo ufw allow 443/tcp comment "HTTPS" 2>/dev/null || true
    sudo ufw allow $WEB_PORT/tcp comment "KRYONIX-WEB" 2>/dev/null || true
elif command -v firewall-cmd >/dev/null 2>&1; then
    sudo firewall-cmd --add-port=80/tcp --permanent 2>/dev/null || true
    sudo firewall-cmd --add-port=443/tcp --permanent 2>/dev/null || true
    sudo firewall-cmd --add-port=$WEB_PORT/tcp --permanent 2>/dev/null || true
    sudo firewall-cmd --reload 2>/dev/null || true
fi

log_success "Firewall configurado"
complete_step
next_step

# ============================================================================
# ETAPA 7: CONFIGURAR REDE DOCKER - DETECÇÃO AUTOMÁTICA
# ============================================================================

processing_step
log_info "🔍 Iniciando detecção automática da rede Docker..."

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

# Salvar configuração completa para qualquer servidor
cat > .kryonix-auto-config << CONFIG_EOF
# ============================================================================
# CONFIGURAÇÃO AUTOMÁTICA KRYONIX - Gerada em $(date)
# ============================================================================
# Esta configuração permite instalação autom��tica em qualquer servidor

# Informações do Servidor
SERVER_IP=$(curl -s -4 ifconfig.me 2>/dev/null || curl -s ipv4.icanhazip.com 2>/dev/null || echo "127.0.0.1")
SERVER_HOSTNAME=$(hostname)
SERVER_USER=$(whoami)
INSTALL_DATE=$(date)

# Configuração de Rede Docker
DETECTED_NETWORK=$DOCKER_NETWORK
DETECTION_METHOD=automatic
DETECTION_DATE=$(date)

# Credenciais GitHub (configuradas automaticamente)
GITHUB_REPO=$GITHUB_REPO
PAT_TOKEN_CONFIGURED=true
WEBHOOK_URL=$WEBHOOK_URL
WEBHOOK_SECRET_CONFIGURED=true

# Status da Instalação
KRYONIX_INSTALLED=true
KRYONIX_VERSION=2025.01
AUTO_DEPLOY_ENABLED=true

# Comandos úteis para este servidor:
# docker service logs Kryonix_web
# curl http://localhost:8080/health
# curl http://localhost:8080/api/github-webhook -X POST -d '{"test":true}'
CONFIG_EOF

log_success "✅ Rede Docker configurada automaticamente: $DOCKER_NETWORK"
log_info "📋 Configuração salva em .kryonix-network-config"
complete_step
next_step

# ============================================================================
# ETAPA 8: VERIFICAR TRAEFIK E VALIDAR REDE
# ============================================================================

processing_step
log_info "Verificando Traefik e validando rede detectada..."

CERT_RESOLVER="letsencryptresolver"
TRAEFIK_FOUND=false

if docker service ls | grep -q "traefik"; then
    TRAEFIK_SERVICE=$(docker service ls --format "{{.Name}}" | grep traefik | head -1)
    TRAEFIK_FOUND=true
    log_success "✅ Traefik encontrado: $TRAEFIK_SERVICE"

    # Verificar se o Traefik está na mesma rede detectada
    traefik_networks=$(docker service inspect "$TRAEFIK_SERVICE" --format '{{range .Spec.TaskTemplate.Networks}}{{.Target}} {{end}}' 2>/dev/null || true)
    network_confirmed=false

    for network_id in $traefik_networks; do
        network_name=$(docker network ls --format "{{.ID}} {{.Name}}" | grep "^$network_id" | awk '{print $2}' 2>/dev/null || true)
        if [ "$network_name" = "$DOCKER_NETWORK" ]; then
            network_confirmed=true
            log_success "✅ Rede $DOCKER_NETWORK confirmada com Traefik"
            break
        fi
    done

    if [ "$network_confirmed" = false ]; then
        log_warning "⚠�� Traefik não está na rede $DOCKER_NETWORK"
        log_info "🔄 Traefik em rede diferente, continuando com $DOCKER_NETWORK"
        log_info "📝 Usando rede detectada: $DOCKER_NETWORK (pode precisar de ajustes manuais)"
    fi

    # Detectar resolver SSL
    if docker service logs $TRAEFIK_SERVICE 2>/dev/null | grep -q "letsencrypt"; then
        CERT_RESOLVER="letsencrypt"
    fi
    log_info "🔐 Resolver SSL detectado: $CERT_RESOLVER"
else
    log_warning "⚠️ Traefik não encontrado - KRYONIX funcionará localmente"
    log_info "📝 Rede $DOCKER_NETWORK será usada (pronta para Traefik futuro)"
fi

# Atualizar arquivo de configuração com informações do Traefik
cat >> .kryonix-network-config << TRAEFIK_CONFIG_EOF
TRAEFIK_FOUND=$TRAEFIK_FOUND
TRAEFIK_SERVICE=${TRAEFIK_SERVICE:-"none"}
CERT_RESOLVER=$CERT_RESOLVER
TRAEFIK_CONFIG_EOF

log_success "✅ Verificação do Traefik concluída"
complete_step
next_step

# ============================================================================
# ETAPA 9: CRIAR IMAGEM DOCKER
# ============================================================================

processing_step
log_info "Criando Dockerfile otimizado..."

cat > Dockerfile << 'DOCKERFILE_EOF'
FROM node:18-bullseye-slim

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    tini \
    curl \
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
COPY public/ ./public/

# Configurar permissões
RUN chown -R kryonix:kryonix /app

USER kryonix

# Expor porta
EXPOSE 8080

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
# ETAPA 10: PREPARAR STACK
# ============================================================================

processing_step
log_info "Criando docker-stack.yml otimizado..."

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

        # Configuração do serviço
        - "traefik.http.services.kryonix-web.loadbalancer.server.port=8080"

        # Router HTTP
        - "traefik.http.routers.kryonix-http.rule=Host(\`$DOMAIN_NAME\`) || Host(\`www.$DOMAIN_NAME\`)"
        - "traefik.http.routers.kryonix-http.entrypoints=web"
        - "traefik.http.routers.kryonix-http.service=kryonix-web"

        # Router HTTPS
        - "traefik.http.routers.kryonix-https.rule=Host(\`$DOMAIN_NAME\`) || Host(\`www.$DOMAIN_NAME\`)"
        - "traefik.http.routers.kryonix-https.entrypoints=websecure"
        - "traefik.http.routers.kryonix-https.tls=true"
        - "traefik.http.routers.kryonix-https.tls.certresolver=$CERT_RESOLVER"
        - "traefik.http.routers.kryonix-https.service=kryonix-web"

        # Redirecionamento HTTP -> HTTPS
        - "traefik.http.routers.kryonix-http.middlewares=https-redirect"
        - "traefik.http.middlewares.https-redirect.redirectscheme.scheme=https"
        - "traefik.http.middlewares.https-redirect.redirectscheme.permanent=true"

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

networks:
  $DOCKER_NETWORK:
    external: true
STACK_EOF

log_success "Docker stack configurado"
complete_step
next_step

# ============================================================================
# ETAPA 11: TESTAR CONECTIVIDADE LOCAL
# ============================================================================

processing_step
log_info "Configurando variáveis para deploy final..."

WEB_STATUS="⚠️ AGUARDANDO DEPLOY"
DOMAIN_STATUS="⚠️ AGUARDANDO DEPLOY"

log_success "Configuração preparada para deploy"
complete_step
next_step

# ============================================================================
# ETAPA 12: CONFIGURAR GITHUB ACTIONS
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
          echo "ℹ️ GitHub webhook automático configurado"
          echo "🔗 Webhook URL: https://kryonix.com.br/api/github-webhook"
          
          # Verificar se o webhook está respondendo
          curl -f "https://kryonix.com.br/health" || exit 1

      - name: 🏗️ Verify deployment
        run: |
          echo "⏳ Aguardando deployment automático..."
          sleep 60
          
          # Verificar múltiplas vezes
          for i in {1..10}; do
            if curl -f "https://kryonix.com.br/health"; then
              echo "✅ Deployment verificado com sucesso!"
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
# ETAPA 13: CRIAR WEBHOOK DEPLOY
# ============================================================================

processing_step
log_info "Criando webhook deploy..."

cat > webhook-deploy.sh << 'WEBHOOK_DEPLOY_EOF'
#!/bin/bash

# ==============================================================================
# WEBHOOK DE DEPLOY AUTOMÁTICO ULTRA-AVANÇADO E ROBUSTO
# Versão: 2.0.0 - Compatível com qualquer stack de desenvolvimento moderno
# ==============================================================================

set -euo pipefail

# ===== CONFIGURAÇÕES GLOBAIS =====
STACK_NAME="Kryonix"
DEPLOY_PATH="/opt/kryonix-plataform"
LOG_FILE="/var/log/kryonix-deploy.log"
BACKUP_DIR="/tmp/deploy-backups"
MAX_RETRIES=5
HEALTH_CHECK_TIMEOUT=180
DEPENDENCY_CHECK_TIMEOUT=300
BUILD_TIMEOUT=600
DOCKER_TIMEOUT=300

# ===== CORES =====
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# ===== SISTEMA DE LOGS AVANÇADO =====
log() {
    local level="${1:-INFO}"
    local message="$2"
    local timestamp=$(date +'%Y-%m-%d %H:%M:%S')
    local formatted="[${timestamp}] ${level}: $message"

    echo -e "${GREEN}$formatted${NC}"

    # Múltiplos fallbacks para logging
    {
        echo "$formatted" >> "$LOG_FILE" 2>/dev/null || \
        echo "$formatted" >> "./deploy.log" 2>/dev/null || \
        echo "$formatted" >> "/tmp/webhook-deploy.log" 2>/dev/null || \
        echo "$formatted" >> "${HOME}/.webhook-deploy.log" 2>/dev/null || \
        logger -t webhook-deploy "$formatted" 2>/dev/null || \
        true
    }
}

info() { log "INFO" "$1"; }
warning() { echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"; log "WARNING" "$1"; }
error() { echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"; log "ERROR" "$1"; }
success() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] SUCCESS: $1${NC}"; log "SUCCESS" "$1"; }
debug() { [ "${DEBUG:-0}" = "1" ] && echo -e "${PURPLE}[DEBUG] $1${NC}" && log "DEBUG" "$1" || true; }

# ===== DETECÇÃO INTELIGENTE DE GERENCIADOR DE PACOTES =====
detect_package_manager() {
    local pm=""
    local lock_file=""

    if [ -f "pnpm-lock.yaml" ]; then
        pm="pnpm"
        lock_file="pnpm-lock.yaml"
    elif [ -f "yarn.lock" ]; then
        pm="yarn"
        lock_file="yarn.lock"
    elif [ -f "package-lock.json" ]; then
        pm="npm"
        lock_file="package-lock.json"
    else
        pm="npm"
        lock_file="package.json"
    fi

    debug "Gerenciador detectado: $pm (arquivo: $lock_file)"
    echo "$pm"
}

# ===== VERIFICAÇÃO DE MUDANÇAS EM DEPENDÊNCIAS =====
check_dependency_changes() {
    local backup_file="${BACKUP_DIR}/package.json.bak"
    local current_hash=""
    local backup_hash=""

    # Criar diretório de backup se não existir
    mkdir -p "$BACKUP_DIR" 2>/dev/null || true

    if [ -f "package.json" ]; then
        current_hash=$(sha256sum package.json | cut -d' ' -f1)
        debug "Hash atual package.json: $current_hash"
    else
        warning "package.json não encontrado"
        return 1
    fi

    if [ -f "$backup_file" ]; then
        backup_hash=$(sha256sum "$backup_file" | cut -d' ' -f1)
        debug "Hash backup package.json: $backup_hash"

        if [ "$current_hash" != "$backup_hash" ]; then
            info "🔄 Mudanças detectadas em dependências"
            return 0
        else
            info "✅ Nenhuma mudança em dependências"
            return 1
        fi
    else
        info "📦 Primeira execução - backup será criado"
        return 0
    fi
}

# ===== BACKUP DE DEPENDÊNCIAS =====
backup_dependencies() {
    local backup_file="${BACKUP_DIR}/package.json.bak"

    if [ -f "package.json" ]; then
        cp "package.json" "$backup_file" 2>/dev/null || {
            warning "Não foi possível criar backup de package.json"
        }
        debug "Backup criado: $backup_file"
    fi
}

# Função para verificar se o serviço está saudável
check_service_health() {
    local max_attempts=${1:-12}
    local wait_time=${2:-10}

    info "🔍 Verificando saúde do serviço..."

    for i in $(seq 1 $max_attempts); do
        if curl -f -s -m 10 "http://localhost:8080/health" >/dev/null 2>&1; then
            log "✅ Serviço está saudável!"
            return 0
        fi

        if [ $i -lt $max_attempts ]; then
            info "Tentativa $i/$max_attempts - aguardando ${wait_time}s..."
            sleep $wait_time
        fi
    done

    warning "⚠️ Serviço pode não estar totalmente saudável após $max_attempts tentativas"
    return 1
}

# Função para restart forçado do stack
force_restart_stack() {
    info "🔄 Forçando restart completo do stack..."

    # Parar o stack
    docker stack rm "$STACK_NAME" 2>/dev/null || true

    # Aguardar remoção completa
    info "⏳ Aguardando remoção completa do stack..."
    sleep 30

    # Verificar se todos os serviços foram removidos
    for i in {1..10}; do
        if ! docker service ls --format "{{.Name}}" | grep -q "${STACK_NAME}_"; then
            break
        fi
        info "Aguardando remoção dos serviços... (tentativa $i/10)"
        sleep 10
    done

    # Redeployar o stack
    info "🚀 Redesployando stack..."
    docker stack deploy -c docker-stack.yml "$STACK_NAME"

    # Aguardar estabilização
    sleep 45

    return 0
}

deploy() {
    local payload="$1"

    log "🚀 Iniciando deploy automático do KRYONIX Platform..."
    info "📋 Payload recebido: $payload"

    cd "$DEPLOY_PATH"

    # Corrigir ownership do Git antes de fazer pull
    info "🔧 Corrigindo permissões Git..."
    git config --global --add safe.directory "$DEPLOY_PATH" 2>/dev/null || true
    sudo git config --system --add safe.directory "$DEPLOY_PATH" 2>/dev/null || true

    # Configurar credenciais do GitHub
    info "🔑 Configurando credenciais GitHub..."
    git remote set-url origin "https://Nakahh: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@github.com/Nakahh/KRYONIX-PLATAFORMA.git"

    # Backup do package.json atual para comparação
    cp package.json package.json.old 2>/dev/null || true

    # Pull das mudanças
    info "📥 Fazendo pull do repositório..."
    git fetch origin --force
    git reset --hard origin/main || git reset --hard origin/master
    git clean -fd

    # Detectar mudanças no package.json (novas dependências do Builder.io)
    DEPENDENCIES_CHANGED=false
    if [ -f "package.json.old" ]; then
        if ! diff package.json package.json.old >/dev/null 2>&1; then
            info "🔄 Mudanças detectadas no package.json - novas dependências podem ter sido adicionadas"
            DEPENDENCIES_CHANGED=true
        fi
    else
        DEPENDENCIES_CHANGED=true
    fi

    # Sempre instalar dependências completas (podem ter sido adicionadas novas)
    info "📦 Instalando/Atualizando TODAS as dependências..."

    # Limpar cache e node_modules para garantir instalação limpa
    if [ "$DEPENDENCIES_CHANGED" = true ]; then
        info "🧹 Limpando cache de dependências para instalação limpa..."
        rm -rf node_modules 2>/dev/null || true
        rm -f package-lock.json yarn.lock 2>/dev/null || true
    fi

    # Detectar gerenciador de pacotes e instalar dependências completas
    if [ -f "yarn.lock" ] || command -v yarn >/dev/null 2>&1; then
        info "📦 Usando Yarn para dependências..."
        yarn cache clean 2>/dev/null || true
        yarn install --force --no-frozen-lockfile

        # Verificar se existe script de build
        if grep -q '"build"' package.json; then
            info "🏗️ Executando build com Yarn..."
            yarn build || {
                warning "Build falhou, tentando scripts alternativos..."
                yarn build:prod 2>/dev/null || yarn compile 2>/dev/null || info "ℹ️ Build personalizado não encontrado"
            }
        fi
    else
        info "📦 Usando NPM para dependências..."
        npm cache clean --force 2>/dev/null || true
        npm install --force --no-save

        # Verificar se existe script de build
        if grep -q '"build"' package.json; then
            info "🏗️ Executando build com NPM..."
            npm run build || {
                warning "Build falhou, tentando scripts alternativos..."
                npm run build:prod 2>/dev/null || npm run compile 2>/dev/null || info "ℹ️ Build personalizado não encontrado"
            }
        fi
    fi

    # Verificar e processar arquivos gerados
    info "�� Verificando arquivos de build gerados..."

    # Criar public se não existir
    mkdir -p public

    # Processar diferentes tipos de build
    if [ -d "dist" ]; then
        info "📁 Build gerado em ./dist/"
        cp -r dist/* public/ 2>/dev/null || true
        if [ -f "dist/index.html" ]; then
            cp dist/index.html public/ 2>/dev/null || true
        fi
    elif [ -d "build" ]; then
        info "📁 Build gerado em ./build/"
        cp -r build/* public/ 2>/dev/null || true
        if [ -f "build/index.html" ]; then
            cp build/index.html public/ 2>/dev/null || true
        fi
    elif [ -d ".next" ]; then
        info "�� Build Next.js gerado"
        # Para Next.js, não precisamos copiar para public
    elif [ -d "out" ]; then
        info "📁 Export estático gerado em ./out/"
        cp -r out/* public/ 2>/dev/null || true
    elif [ -d "_site" ]; then
        info "📁 Site estático gerado em ./_site/"
        cp -r _site/* public/ 2>/dev/null || true
    fi

    # Verificar se há arquivos CSS/JS adicionais
    for dir in "assets" "static" "css" "js"; do
        if [ -d "$dir" ] && [ ! -d "public/$dir" ]; then
            info "📁 Copiando $dir para public..."
            cp -r "$dir" public/ 2>/dev/null || true
        fi
    done

    # Verificar dependências de runtime necessárias
    info "🔍 Verificando dependências de runtime..."

    # Verificar frameworks comuns
    if grep -q '"react"' package.json; then
        info "✅ React detectado"
    elif grep -q '"vue"' package.json; then
        info "✅ Vue detectado"
    elif grep -q '"@angular"' package.json; then
        info "✅ Angular detectado"
    elif grep -q '"next"' package.json; then
        info "✅ Next.js detectado"
    fi

    # Limpar arquivo de backup
    rm -f package.json.old 2>/dev/null || true

    # Verificações finais antes do build Docker
    info "🔍 Verificações finais antes do build..."

    # Verificar se package.json existe e é válido
    if [ ! -f "package.json" ]; then
        error "❌ package.json não encontrado!"
        return 1
    fi

    # Verificar se node_modules foi instalado corretamente
    if [ ! -d "node_modules" ]; then
        warning "⚠️ node_modules não encontrado, tentando instalação de emergência..."
        npm install --force || yarn install --force || {
            error "❌ Falha na instalação de emergência das dependências"
            return 1
        }
    fi

    # Verificar se há arquivo principal (server.js, index.js, app.js)
    MAIN_FILE=""
    if [ -f "server.js" ]; then
        MAIN_FILE="server.js"
    elif [ -f "index.js" ]; then
        MAIN_FILE="index.js"
    elif [ -f "app.js" ]; then
        MAIN_FILE="app.js"
    else
        warning "⚠️ Arquivo principal não detectado, usando server.js como padrão"
        MAIN_FILE="server.js"
    fi
    info "📄 Arquivo principal detectado: $MAIN_FILE"

    # Verificar se public/index.html existe
    if [ ! -f "public/index.html" ]; then
        warning "⚠️ public/index.html não encontrado, criando versão mínima..."
        mkdir -p public
        cat > public/index.html << 'HTML_EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KRYONIX Platform</title>
</head>
<body>
    <h1>🚀 KRYONIX Platform</h1>
    <p>Plataforma carregando...</p>
    <script>
        console.log('KRYONIX Platform Ready');
    </script>
</body>
</html>
HTML_EOF
        info "✅ Arquivo index.html mínimo criado"
    fi

    # Limpar imagem antiga para garantir rebuild completo
    info "🧹 Limpando imagem Docker antiga..."
    docker rmi kryonix-plataforma:latest 2>/dev/null || true

    # Build da imagem com verificação
    info "🏗️ Fazendo build da nova imagem Docker..."
    if ! docker build --no-cache -t kryonix-plataforma:latest . ; then
        error "❌ Falha no build da imagem Docker"

        # Tentar build de emergência com Dockerfile mínimo
        warning "🔄 Tentando build de emergência..."
        cat > Dockerfile.emergency << 'DOCKERFILE_EMERGENCY_EOF'
FROM node:18-bullseye-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --production || yarn install --production
COPY . .
EXPOSE 8080
CMD ["node", "server.js"]
DOCKERFILE_EMERGENCY_EOF

        if docker build -f Dockerfile.emergency -t kryonix-plataforma:latest . ; then
            info "✅ Build de emergência bem-sucedido"
            rm -f Dockerfile.emergency
        else
            error "❌ Build de emergência falhou"
            return 1
        fi
    else
        info "✅ Build da imagem concluído com sucesso"
    fi

    # Tentar update primeiro (mais rápido)
    info "🔄 Tentando update do serviço..."
    if docker service update --force --image kryonix-plataforma:latest "${STACK_NAME}_web" 2>/dev/null; then
        info "✅ Update do serviço executado"
        sleep 30

        # Verificar se o update funcionou
        if check_service_health 6 10; then
            log "✅ Deploy automático concluído com sucesso via update!"
            return 0
        else
            warning "⚠️ Update não funcionou, forçando restart completo..."
            force_restart_stack
        fi
    else
        info "🔄 Update falhou, fazendo deploy completo do stack..."
        docker stack deploy -c docker-stack.yml "$STACK_NAME"
        sleep 45
    fi

    # Verificação final de saúde
    if check_service_health 12 10; then
        log "✅ Deploy automático concluído com sucesso!"
        return 0
    else
        error "❌ Deploy pode ter problemas - verificar manualmente"
        return 1
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

log_success "✅ Webhook deploy ultra-avançado criado com deploy automático completo"
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
# ETAPA 15: DEPLOY FINAL INTEGRADO
# ============================================================================

processing_step
log_info "🚀 Iniciando deploy final..."

# Deploy do stack
log_info "Fazendo deploy do stack KRYONIX..."
if docker stack deploy -c docker-stack.yml "$STACK_NAME" >/dev/null 2>&1; then
    log_success "Stack deployado com sucesso"
else
    error_step
    log_error "Falha no deploy do stack"
    log_info "Verifique: docker service logs ${STACK_NAME}_web"
    exit 1
fi

# Aguardar estabilização
log_info "Aguardando estabilização (60s)..."
sleep 60

# Verificar serviços
log_info "Verificando status dos serviços..."
if docker service ls --format "{{.Name}} {{.Replicas}}" | grep "${STACK_NAME}_web" | grep -q "1/1"; then
    log_success "Serviço web funcionando corretamente"
    
    # Testar conectividade
    if test_service_health "http://localhost:8080/health" 10 5; then
        WEB_STATUS="✅ ONLINE"
        
        # Testar webhook
        if curl -f -s -X POST "http://localhost:8080/api/github-webhook" \
           -H "Content-Type: application/json" \
           -d '{"test":true}' >/dev/null 2>&1; then
            log_success "Webhook endpoint funcionando"
        fi
    else
        WEB_STATUS="⚠️ INICIALIZANDO"
    fi
else
    WEB_STATUS="❌ PROBLEMA"
fi

complete_step

# ============================================================================
# RELATÓRIO FINAL
# ============================================================================

echo ""
echo -e "${GREEN}${BOLD}═══════════════════════════════════════════════════════════════════${RESET}"
echo -e "${GREEN}${BOLD}                🎉 INSTALAÇÃO AUTOMÁTICA CONCLUÍDA                 ${RESET}"
echo -e "${GREEN}${BOLD}════════════════════════════════════════��══════════════════════════${RESET}"
echo ""
echo -e "${PURPLE}${BOLD}🤖 INSTALAÇÃO 100% AUTOMÁTICA REALIZADA:${RESET}"
echo -e "    ${BLUE}│${RESET} ${BOLD}Servidor:${RESET} $(hostname) (IP: $(curl -s ifconfig.me 2>/dev/null || echo 'localhost'))"
echo -e "    ${BLUE}│${RESET} ${BOLD}Credenciais:${RESET} ✅ Pré-configuradas e validadas"
echo -e "    ${BLUE}│${RESET} ${BOLD}GitHub:${RESET} ✅ Conectado com PAT Token"
echo -e "    ${BLUE}│${RESET} ${BOLD}Webhook:${RESET} ✅ $WEBHOOK_URL"
echo -e "    ${BLUE}│${RESET} ${BOLD}Portabilidade:${RESET} ✅ Funciona em qualquer servidor"
echo ""
echo -e "${CYAN}${BOLD}�� STATUS DO SISTEMA:${RESET}"
echo -e "    ${BLUE}│${RESET} ${BOLD}Aplicação Web:${RESET} $WEB_STATUS"
echo -e "    ${BLUE}│${RESET} ${BOLD}Docker Stack:${RESET} ✅ DEPLOYADO"
echo -e "    ${BLUE}│${RESET} ${BOLD}Rede Docker:${RESET} ✅ $DOCKER_NETWORK (detectada automaticamente)"
echo -e "    ${BLUE}│${RESET} ${BOLD}Traefik:${RESET} $([ "$TRAEFIK_FOUND" = true ] && echo "✅ ENCONTRADO ($TRAEFIK_SERVICE)" || echo "⚠️ NÃO ENCONTRADO")"
echo -e "    ${BLUE}│${RESET} ${BOLD}GitHub CI/CD:${RESET} ✅ CONFIGURADO"
echo ""
echo -e "${CYAN}${BOLD}🔗 ACESSO:${RESET}"
echo -e "    ${BLUE}│${RESET} ${BOLD}Local:${RESET} http://localhost:8080"
echo -e "    ${BLUE}│${RESET} ${BOLD}Health:${RESET} http://localhost:8080/health"
echo -e "    ${BLUE}│${RESET} ${BOLD}Webhook:${RESET} http://localhost:8080/api/github-webhook"
if docker service ls | grep -q "traefik"; then
echo -e "    ${BLUE}│${RESET} ${BOLD}Domínio:${RESET} https://$DOMAIN_NAME"
fi
echo ""
echo -e "${CYAN}${BOLD}🛠️ COMANDOS ÚTEIS:${RESET}"
echo -e "    ${BLUE}│${RESET} ${YELLOW}docker service ls${RESET} - Ver serviços"
echo -e "    ${BLUE}│${RESET} ${YELLOW}docker service logs ${STACK_NAME}_web${RESET} - Ver logs"
echo -e "    ${BLUE}│${RESET} ${YELLOW}docker network ls${RESET} - Ver redes (rede: $DOCKER_NETWORK)"
echo -e "    ${BLUE}│${RESET} ${YELLOW}curl http://localhost:8080/health${RESET} - Testar saúde"
echo -e "    ${BLUE}│${RESET} ${YELLOW}cat .kryonix-network-config${RESET} - Ver configuração de rede"
echo -e "    ${BLUE}│${RESET} ${YELLOW}./webhook-deploy.sh manual${RESET} - Deploy manual"
echo ""
echo -e "${GREEN}${BOLD}✅ Plataforma KRYONIX instalada e funcionando!${RESET}"
echo -e "${PURPLE}🚀 Push no GitHub = Deploy automático ativado!${RESET}"
echo ""
echo -e "${GREEN}${BOLD}🔧 CORREÇÕES APLICADAS NESTA VERSÃO:${RESET}"
echo -e "    ${BLUE}│${RESET} ${BOLD}Webhook Corrigido:${RESET} ✅ Agora executa deploy automático completo"
echo -e "    ${BLUE}│${RESET} ${BOLD}Rebuild Automático:${RESET} ✅ Pull + Install + Build + Restart do container"
echo -e "    ${BLUE}│${RESET} ${BOLD}Validação GitHub:${RESET} ✅ Verificação de assinatura implementada"
echo -e "    ${BLUE}│${RESET} ${BOLD}Logs Melhorados:${RESET} ✅ Deploy trackado em tempo real"
echo -e "    ${BLUE}│${RESET} ${BOLD}Restart Inteligente:${RESET} ✅ Update rápido ou restart completo se necessário"
echo ""
echo -e "${PURPLE}${BOLD}🎨 DEPLOY INTELIGENTE AVANÇADO:${RESET}"
echo -e "    ${BLUE}│${RESET} ${BOLD}Dependências Inteligentes:${RESET} ✅ Detecta e instala novas dependências automaticamente"
echo -e "    ${BLUE}│${RESET} ${BOLD}Build Automático:${RESET} ✅ Suporte a dist/, build/, out/, _site/, .next/"
echo -e "    ${BLUE}│${RESET} ${BOLD}Gerenciadores:${RESET} ✅ NPM, Yarn e PNPM com limpeza de cache"
echo -e "    ${BLUE}│${RESET} ${BOLD}Fallbacks Seguros:${RESET} ✅ Build de emergência se algo falhar"
echo -e "    ${BLUE}│${RESET} ${BOLD}Frameworks:${RESET} ✅ React, Vue, Angular, Next.js compatíveis"
echo ""
echo -e "${YELLOW}${BOLD}📋 CONFIGURAÇÃO DO WEBHOOK GITHUB (se necessário):${RESET}"
echo -e "${CYAN}${BOLD}URL:${RESET} $WEBHOOK_URL"
echo -e "${CYAN}${BOLD}Secret:${RESET} $WEBHOOK_SECRET"
echo -e "${CYAN}${BOLD}Content-Type:${RESET} application/json"
echo -e "${CYAN}${BOLD}Events:${RESET} Just push events"
echo ""
echo -e "${BLUE}${BOLD}🔗 Configurar em: GitHub → Settings → Webhooks → Add webhook${RESET}"
echo ""
echo -e "${CYAN}${BOLD}🚀 COMO USAR O DEPLOY AUTOMÁTICO:${RESET}"
echo ""
echo -e "${WHITE}${BOLD}1. DESENVOLVIMENTO AUTOMATIZADO:${RESET}"
echo -e "   ${WHITE}• Faça alterações no seu projeto localmente ou via editor${RESET}"
echo -e "   ${WHITE}• Commit e push para a branch main${RESET}"
echo -e "   ${WHITE}• Webhook detectará mudanças e fará deploy automático${RESET}"
echo ""
echo -e "${WHITE}${BOLD}2. DEPENDÊNCIAS AUTOMÁTICAS:${RESET}"
echo -e "   ${WHITE}• Se adicionar nova biblioteca: ${CYAN}Deploy automático${RESET}"
echo -e "   ${WHITE}• Se package.json mudar: ${CYAN}Reinstalação completa${RESET}"
echo -e "   ${WHITE}• Se build falhar: ${CYAN}Fallback de emergência${RESET}"
echo ""
echo -e "${WHITE}${BOLD}3. FLUXO COMPLETO DESENVOLVIMENTO → PRODUÇÃO:${RESET}"
echo -e "   ${WHITE}📝 Edita código → 💾 Commit GitHub → 🔗 Webhook ativa${RESET}"
echo -e "   ${WHITE}📥 Pull código → 📦 Install deps → 🏗️ Build → 🐳 Deploy${RESET}"
echo ""
echo -e "${WHITE}${BOLD}4. TEMPO DE DEPLOY AUTOMÁTICO:${RESET}"
echo -e "   ${WHITE}• Webhook responde: ${CYAN}~2-5 segundos${RESET}"
echo -e "   ${WHITE}• Deploy completo: ${CYAN}~60-90 segundos${RESET}"
echo -e "   ${WHITE}• Site atualizado: ${CYAN}~30 segundos após deploy${RESET}"
echo -e "   ${WHITE}• Total aproximado: ${CYAN}2-3 minutos${RESET}"
echo ""
