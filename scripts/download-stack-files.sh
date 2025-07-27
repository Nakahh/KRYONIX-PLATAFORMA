#!/bin/bash

# KRYONIX - Download automático de arquivos das stacks
# Este script baixa todos os arquivos necessários para configurar uma stack específica

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função de log
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Função de ajuda
show_help() {
    echo "KRYONIX - Download de Arquivos das Stacks"
    echo ""
    echo "Uso: $0 [STACK_NAME] [OPÇÕES]"
    echo ""
    echo "Stacks disponíveis:"
    echo "  evolution-api    WhatsApp Business API"
    echo "  n8n             Workflows e automações"
    echo "  typebot         Chatbots e flows"
    echo "  mautic          Marketing automation"
    echo "  dify            IA workflows"
    echo "  ollama          Modelos IA locais"
    echo "  chatwoot        Central de atendimento"
    echo "  grafana         Dashboards"
    echo "  prometheus      Métricas"
    echo "  postgresql      Banco de dados"
    echo "  redis           Cache"
    echo "  minio           Object storage"
    echo "  all             Todas as stacks"
    echo ""
    echo "Opções:"
    echo "  -h, --help      Mostrar esta ajuda"
    echo "  -v, --verbose   Output verboso"
    echo "  -f, --force     Sobrescrever arquivos existentes"
    echo "  --dry-run       Apenas simular, não baixar"
    echo ""
    echo "Exemplos:"
    echo "  $0 evolution-api              # Baixar arquivos da Evolution API"
    echo "  $0 all --force               # Baixar todas as stacks (sobrescrever)"
    echo "  $0 n8n --verbose             # Baixar N8N com output detalhado"
}

# Variáveis padrão
STACK_NAME=""
VERBOSE=false
FORCE=false
DRY_RUN=false
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
UPLOAD_DIR="$PROJECT_ROOT/stack-uploads"

# Parse de argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        -*)
            log_error "Opção desconhecida: $1"
            show_help
            exit 1
            ;;
        *)
            if [[ -z "$STACK_NAME" ]]; then
                STACK_NAME="$1"
            else
                log_error "Múltiplos nomes de stack fornecidos"
                exit 1
            fi
            shift
            ;;
    esac
done

# Verificar se stack foi fornecida
if [[ -z "$STACK_NAME" ]]; then
    log_error "Nome da stack é obrigatório"
    show_help
    exit 1
fi

# Função para substituir variáveis de ambiente
substitute_variables() {
    local file="$1"
    local temp_file="${file}.tmp"
    
    if [[ "$VERBOSE" == true ]]; then
        log_info "Substituindo variáveis em: $(basename "$file")"
    fi
    
    # Substituições das variáveis
    sed \
        -e "s/\${DOMAIN}/kryonix.com.br/g" \
        -e "s/\${API_KEY}/$(openssl rand -hex 32)/g" \
        -e "s/\${WEBHOOK_URL}/https:\/\/webhooks.kryonix.com.br/g" \
        -e "s/\${DATABASE_URL}/postgresql:\/\/kryonix:$(openssl rand -hex 16)@postgres.kryonix.com.br:5432\/kryonix/g" \
        -e "s/\${REDIS_URL}/redis:\/\/redis.kryonix.com.br:6379/g" \
        -e "s/\${ADMIN_EMAIL}/admin@kryonix.com.br/g" \
        -e "s/\${SMTP_HOST}/smtp.gmail.com/g" \
        -e "s/\${SMTP_PORT}/587/g" \
        -e "s/\${EVOLUTION_API_KEY}/$(openssl rand -hex 32)/g" \
        -e "s/\${JWT_SECRET}/$(openssl rand -hex 64)/g" \
        -e "s/\${WHATSAPP_NUMBER}/5511999999999/g" \
        -e "s/\${WHATSAPP_TOKEN}/$(openssl rand -hex 32)/g" \
        -e "s/\${DIFY_API_KEY}/$(openssl rand -hex 32)/g" \
        -e "s/\${KRYONIX_API_KEY}/$(openssl rand -hex 32)/g" \
        -e "s/\${N8N_WEBHOOK_KEY}/$(openssl rand -hex 32)/g" \
        -e "s/\${TYPEBOT_API_KEY}/$(openssl rand -hex 32)/g" \
        -e "s/\${MAUTIC_API_KEY}/$(openssl rand -hex 32)/g" \
        -e "s/\${CHATWOOT_API_KEY}/$(openssl rand -hex 32)/g" \
        -e "s/\${DB_PASSWORD}/$(openssl rand -hex 24)/g" \
        "$file" > "$temp_file"
    
    mv "$temp_file" "$file"
}

# Função para gerar arquivos da Evolution API
generate_evolution_api_files() {
    local stack_dir="$UPLOAD_DIR/evolution-api"
    
    log_info "Gerando arquivos para Evolution API..."
    
    mkdir -p "$stack_dir"
    
    # config.json já existe, apenas substituir variáveis
    if [[ -f "$stack_dir/config.json" ]]; then
        substitute_variables "$stack_dir/config.json"
    fi
    
    if [[ -f "$stack_dir/webhook-config.json" ]]; then
        substitute_variables "$stack_dir/webhook-config.json"
    fi
    
    # Gerar arquivo de instâncias
    cat > "$stack_dir/instances.json" << 'EOF'
{
  "instances": [
    {
      "instanceName": "kryonix-main",
      "token": "${WHATSAPP_TOKEN}",
      "qrcode": true,
      "number": "${WHATSAPP_NUMBER}",
      "webhook": "https://webhooks.kryonix.com.br/whatsapp",
      "webhookByEvents": true,
      "events": [
        "APPLICATION_STARTUP",
        "QRCODE_UPDATED",
        "CONNECTION_UPDATE", 
        "MESSAGES_UPSERT"
      ]
    }
  ]
}
EOF
    
    substitute_variables "$stack_dir/instances.json"
    
    # Gerar arquivo de chaves de auth
    cat > "$stack_dir/auth-keys.json" << 'EOF'
{
  "api_keys": [
    {
      "name": "kryonix-main",
      "key": "${EVOLUTION_API_KEY}",
      "permissions": ["read", "write", "admin"],
      "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    }
  ],
  "jwt_secret": "${JWT_SECRET}",
  "encryption_key": "$(openssl rand -hex 32)"
}
EOF
    
    substitute_variables "$stack_dir/auth-keys.json"
}

# Função para gerar arquivos do N8N
generate_n8n_files() {
    local stack_dir="$UPLOAD_DIR/n8n"
    
    log_info "Gerando arquivos para N8N..."
    
    mkdir -p "$stack_dir/workflows"
    mkdir -p "$stack_dir/templates"
    
    # Credenciais N8N
    cat > "$stack_dir/credentials.json" << 'EOF'
{
  "credentials": {
    "kryonix_database": {
      "type": "postgres",
      "data": {
        "host": "postgres.kryonix.com.br",
        "port": 5432,
        "database": "kryonix",
        "user": "kryonix",
        "password": "${DB_PASSWORD}",
        "ssl": false
      }
    },
    "evolution_api": {
      "type": "httpHeaderAuth",
      "data": {
        "name": "apikey",
        "value": "${EVOLUTION_API_KEY}"
      }
    },
    "mautic_api": {
      "type": "mauticApi",
      "data": {
        "url": "https://mautic.kryonix.com.br",
        "username": "admin@kryonix.com.br",
        "password": "${MAUTIC_PASSWORD}"
      }
    }
  }
}
EOF
    
    substitute_variables "$stack_dir/credentials.json"
    
    # Settings N8N
    cat > "$stack_dir/settings.json" << 'EOF'
{
  "database": {
    "type": "postgresdb",
    "postgresdb": {
      "host": "postgres.kryonix.com.br",
      "port": 5432,
      "database": "n8n",
      "username": "kryonix",
      "password": "${DB_PASSWORD}"
    }
  },
  "executions": {
    "mode": "queue",
    "timeout": 300,
    "maxTimeout": 3600
  },
  "endpoints": {
    "rest": "rest",
    "webhook": "webhook",
    "webhookWaiting": "webhook-waiting",
    "webhookTest": "webhook-test"
  },
  "security": {
    "basicAuth": {
      "active": true,
      "user": "admin",
      "password": "${N8N_PASSWORD}",
      "hash": true
    }
  }
}
EOF
    
    substitute_variables "$stack_dir/settings.json"
}

# Função para gerar arquivos do Typebot
generate_typebot_files() {
    local stack_dir="$UPLOAD_DIR/typebot"
    
    log_info "Gerando arquivos para Typebot..."
    
    mkdir -p "$stack_dir/flows"
    mkdir -p "$stack_dir/themes"
    mkdir -p "$stack_dir/brazilian-templates"
    
    # Integrações Typebot
    cat > "$stack_dir/integrations.json" << 'EOF'
{
  "webhooks": {
    "kryonix_webhook": "https://api.kryonix.com.br/api/v1/typebot/webhook",
    "n8n_webhook": "https://webhookn8n.kryonix.com.br/webhook/typebot"
  },
  "ai_integrations": {
    "openai": {
      "api_key": "${OPENAI_API_KEY}",
      "model": "gpt-4o",
      "max_tokens": 1000
    },
    "dify": {
      "url": "https://dify.kryonix.com.br",
      "api_key": "${DIFY_API_KEY}"
    }
  },
  "database": {
    "url": "${DATABASE_URL}",
    "schema": "typebot"
  }
}
EOF
    
    substitute_variables "$stack_dir/integrations.json"
}

# Função para gerar arquivos do Mautic
generate_mautic_files() {
    local stack_dir="$UPLOAD_DIR/mautic"
    
    log_info "Gerando arquivos para Mautic..."
    
    mkdir -p "$stack_dir/campaigns"
    mkdir -p "$stack_dir/emails"
    mkdir -p "$stack_dir/forms"
    
    # Segmentação Mautic
    cat > "$stack_dir/segments.json" << 'EOF'
{
  "segments": [
    {
      "name": "Leads WhatsApp",
      "description": "Contatos que vieram via WhatsApp",
      "filters": [
        {
          "type": "leadlist",
          "field": "tags",
          "operator": "in",
          "value": ["whatsapp", "evolution-api"]
        }
      ]
    },
    {
      "name": "Leads Qualificados",
      "description": "Leads que passaram pela qualificação",
      "filters": [
        {
          "type": "leadlist", 
          "field": "stage",
          "operator": "eq",
          "value": "qualified"
        }
      ]
    }
  ]
}
EOF
    
    # Configuração Mautic
    cat > "$stack_dir/config.json" << 'EOF'
{
  "database": {
    "host": "postgres.kryonix.com.br",
    "port": 5432,
    "name": "mautic",
    "user": "kryonix",
    "password": "${DB_PASSWORD}",
    "prefix": "mautic_"
  },
  "site_url": "https://mautic.kryonix.com.br",
  "api": {
    "enabled": true,
    "access_token_lifetime": 3600,
    "refresh_token_lifetime": 86400
  },
  "webhook_settings": {
    "kryonix_webhook": "https://api.kryonix.com.br/api/v1/mautic/webhook"
  }
}
EOF
    
    substitute_variables "$stack_dir/config.json"
}

# Função principal para download
download_stack_files() {
    local stack="$1"
    
    if [[ "$DRY_RUN" == true ]]; then
        log_info "DRY RUN: Simulando download para $stack"
        return 0
    fi
    
    case "$stack" in
        evolution-api)
            generate_evolution_api_files
            ;;
        n8n)
            generate_n8n_files
            ;;
        typebot)
            generate_typebot_files
            ;;
        mautic)
            generate_mautic_files
            ;;
        all)
            log_info "Baixando arquivos de todas as stacks..."
            download_stack_files "evolution-api"
            download_stack_files "n8n"
            download_stack_files "typebot"
            download_stack_files "mautic"
            # Adicionar outras stacks aqui
            ;;
        *)
            log_error "Stack desconhecida: $stack"
            log_info "Use '$0 --help' para ver stacks disponíveis"
            exit 1
            ;;
    esac
}

# Função para verificar dependências
check_dependencies() {
    local deps=("openssl" "sed")
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            log_error "Dependência não encontrada: $dep"
            log_info "Instale com: apt-get install $dep"
            exit 1
        fi
    done
}

# Função principal
main() {
    log_info "KRYONIX - Download de Arquivos das Stacks"
    log_info "============================================"
    
    # Verificar dependências
    check_dependencies
    
    # Criar diretório base se não existir
    if [[ ! -d "$UPLOAD_DIR" ]]; then
        log_info "Criando diretório: $UPLOAD_DIR"
        mkdir -p "$UPLOAD_DIR"
    fi
    
    # Verificar se deve sobrescrever
    if [[ "$FORCE" == false && -d "$UPLOAD_DIR/$STACK_NAME" && "$STACK_NAME" != "all" ]]; then
        log_warning "Arquivos já existem para $STACK_NAME"
        read -p "Sobrescrever? [y/N]: " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Operação cancelada"
            exit 0
        fi
    fi
    
    # Download dos arquivos
    log_info "Iniciando download para: $STACK_NAME"
    download_stack_files "$STACK_NAME"
    
    # Resumo final
    log_success "Download concluído com sucesso!"
    
    if [[ "$STACK_NAME" == "all" ]]; then
        log_info "Arquivos gerados em: $UPLOAD_DIR/"
    else
        log_info "Arquivos gerados em: $UPLOAD_DIR/$STACK_NAME/"
    fi
    
    log_info ""
    log_info "Próximos passos:"
    log_info "1. Revise os arquivos gerados"
    log_info "2. Execute: ./scripts/upload-to-stack.sh $STACK_NAME"
    log_info "3. Ou faça upload manual conforme README"
}

# Executar função principal
main "$@"
