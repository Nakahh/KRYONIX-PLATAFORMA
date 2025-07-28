#!/bin/bash
set -e

echo "🚀 KRYONIX - Deploy Corrigido com Traefik HTTPS"
echo "================================================"

# Função para logs coloridos
log_info() {
    echo -e "\033[1;34m[INFO]\033[0m $1"
}

log_success() {
    echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

log_warning() {
    echo -e "\033[1;33m[WARNING]\033[0m $1"
}

log_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
}

# Verifica se o Traefik está rodando
log_info "Verificando se Traefik está funcionando..."
if docker service ls | grep -q traefik; then
    log_success "Traefik detectado no Docker Swarm ✓"
else
    log_warning "Traefik não encontrado - verifique se está rodando"
fi

# Remove stack existente
log_info "Removendo stack Kryonix existente..."
docker stack rm Kryonix || true
sleep 10

# Limpa imagens antigas
log_info "Limpando imagens antigas..."
docker image rm kryonix-plataforma:latest || true

# Build nova imagem
log_info "Building nova imagem com correções..."
docker build -t kryonix-plataforma:latest .

# Verificar redes necessárias
log_info "Verificando redes do Docker..."
if ! docker network ls | grep -q traefik-public; then
    log_info "Criando rede traefik-public..."
    docker network create --driver=overlay --attachable traefik-public
fi

if ! docker network ls | grep -q Kryonix-NET; then
    log_info "Criando rede Kryonix-NET..."
    docker network create --driver=overlay --attachable Kryonix-NET
fi

# Deploy com stack corrigido
log_info "Fazendo deploy do stack corrigido..."
docker stack deploy -c docker-stack.yml Kryonix

# Aguarda serviços
log_info "Aguardando inicialização dos serviços..."
sleep 30

# Verifica status
log_info "Verificando status dos serviços..."
docker service ls | grep Kryonix

# Testa conectividade local
log_info "Testando conectividade local..."
timeout 10 bash -c 'until curl -f http://localhost:8080/health; do sleep 1; done' || log_warning "Teste local falhou"

log_success "Deploy concluído! Agora teste:"
log_info "🌐 Local: http://localhost:8080"
log_info "🌐 IP: http://144.202.90.55:8080"
log_info "🌐 Domínio: https://www.kryonix.com.br"
log_info ""
log_info "Se o domínio não funcionar, verifique:"
log_info "1. DNS aponta para 144.202.90.55"
log_info "2. Traefik está rodando e configurado"
log_info "3. Certificado SSL foi gerado"
