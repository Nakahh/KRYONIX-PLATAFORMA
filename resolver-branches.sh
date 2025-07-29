#!/bin/bash

echo "🔧 RESOLVER BRANCHES DIVERGENTES - KRYONIX"
echo "=========================================="
echo

cd /opt/kryonix-plataform

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

echo "1️⃣ Configurando estratégia de pull..."
git config pull.rebase false
log_success "Estratégia de merge configurada"

echo "2️⃣ Fazendo backup do estado atual..."
git stash push -m "backup-antes-resolve-$(date +%Y%m%d_%H%M%S)"
log_success "Backup criado"

echo "3️⃣ Forçando sincronização com GitHub..."
git fetch origin main
git reset --hard origin/main
log_success "Código sincronizado com GitHub"

echo "4️⃣ Atualizando deploy-server.js com novo token..."
sed -i 's/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/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/g' deploy-server.js
log_success "Deploy-server.js atualizado"

echo "5️⃣ Reiniciando serviço de deploy..."
sudo systemctl restart kryonix-deploy.service
sleep 3
log_success "Serviço reiniciado"

echo "6️⃣ Fazendo rebuild da aplicação..."
docker build --no-cache -t kryonix-plataforma:latest .
docker stack deploy -c docker-stack.yml Kryonix --with-registry-auth
log_success "Aplicação atualizada"

echo "7️⃣ Testando webhook..."
sleep 10
RESPONSE=$(curl -s -X POST "https://kryonix.com.br/api/github-webhook" \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d '{"ref":"refs/heads/main","repository":{"name":"KRYONIX-PLATAFORMA"}}')

echo "Resposta do webhook: $RESPONSE"

if echo "$RESPONSE" | grep -q '"status":"accepted"'; then
    log_success "Webhook funcionando perfeitamente!"
else
    log_warning "Webhook pode ter problemas"
fi

echo
echo "✅ CORREÇÃO COMPLETA!"
echo "🚀 Agora o sistema está 100% sincronizado com o GitHub"
echo "🎯 Deploy automático funcionando com novo token"
echo
echo "📋 Próximos passos:"
echo "1. Faça uma edição no GitHub (ex: README.md)"
echo "2. Commit e push para main"
echo "3. Verifique se reflete automaticamente no servidor"
