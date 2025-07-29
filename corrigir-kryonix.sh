#!/bin/bash

echo "🔧 CORREÇÃO RÁPIDA KRYONIX PLATFORM"
echo "===================================="
echo

PROJECT_DIR="/opt/kryonix-plataform"

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCESSO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERRO]${NC} $1"
}

echo "1️⃣ Corrigindo ownership do Git..."
cd "$PROJECT_DIR"
sudo chown -R linuxuser:linuxuser "$PROJECT_DIR"
git config --global --add safe.directory "$PROJECT_DIR"
sudo git config --system --add safe.directory "$PROJECT_DIR"
log_success "Git ownership corrigido"
echo

echo "2️⃣ Verificando servidor de deploy (porta 9001)..."
if sudo systemctl is-active kryonix-deploy.service >/dev/null 2>&1; then
    log_success "Serviço kryonix-deploy está rodando"
    
    if curl -f -s "http://127.0.0.1:9001/" >/dev/null 2>&1; then
        log_success "Servidor de deploy respondendo na porta 9001"
    else
        log_warning "Reiniciando servidor de deploy..."
        sudo systemctl restart kryonix-deploy.service
        sleep 5
        if curl -f -s "http://127.0.0.1:9001/" >/dev/null 2>&1; then
            log_success "Servidor de deploy reiniciado com sucesso"
        else
            log_error "Servidor de deploy ainda não responde"
        fi
    fi
else
    log_warning "Reiniciando serviço de deploy..."
    sudo systemctl restart kryonix-deploy.service
    sleep 5
    if sudo systemctl is-active kryonix-deploy.service >/dev/null 2>&1; then
        log_success "Serviço reiniciado com sucesso"
    else
        log_error "Falha ao reiniciar serviço"
    fi
fi
echo

echo "3️⃣ Testando webhook..."
if curl -f -s -X POST "https://kryonix.com.br/api/github-webhook" \
   -H "Content-Type: application/json" \
   -H "X-GitHub-Event: push" \
   -d '{"ref":"refs/heads/main","repository":{"name":"KRYONIX-PLATAFORMA"}}' > /dev/null; then
    log_success "Webhook funcionando corretamente"
else
    log_warning "Webhook pode estar com problemas"
fi
echo

echo "4️⃣ Testando deploy manual..."
if [ -f "$PROJECT_DIR/webhook-deploy.sh" ]; then
    log_info "Executando deploy manual de teste..."
    cd "$PROJECT_DIR"
    # Corrigir novamente antes do deploy
    git config --global --add safe.directory "$PROJECT_DIR"
    ./webhook-deploy.sh manual
    log_success "Deploy manual executado"
else
    log_error "Script webhook-deploy.sh não encontrado"
fi
echo

echo "5️⃣ Status final dos serviços..."
docker service ls | grep Kryonix && log_success "Serviço Docker rodando" || log_error "Serviço Docker não encontrado"
sudo systemctl status kryonix-deploy.service --no-pager -l | head -5
echo

echo "✅ CORREÇÃO CONCLUÍDA!"
echo "🔍 Para verificar logs: docker service logs Kryonix_web"
echo "🧪 Para testar webhook: curl -X POST https://kryonix.com.br/api/github-webhook -H 'Content-Type: application/json' -d '{\"ref\":\"refs/heads/main\",\"repository\":{\"name\":\"KRYONIX-PLATAFORMA\"}}'"
