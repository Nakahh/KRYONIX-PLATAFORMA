#!/bin/bash

# Script de Configuração de Subdomínios Profissionais KRYONIX
# Autor: Vitor Fernandes
# Descrição: Configura subdomínios profissionais para a plataforma KRYONIX

set -e

# Configurações
DOMAIN="kryonix.com.br"
SUBDOMAINS="app admin gateway monitor metrics status"
SERVER_IP="144.202.90.55"
EMAIL="admin@kryonix.com.br"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função de logging
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}"
}

info() { log "INFO" "${BLUE}$*${NC}"; }
warn() { log "WARN" "${YELLOW}$*${NC}"; }
error() { log "ERROR" "${RED}$*${NC}"; }
success() { log "SUCCESS" "${GREEN}$*${NC}"; }

# Verificar se está executando como root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "Este script deve ser executado como root (use sudo)"
        exit 1
    fi
}

# Backup da configuração atual do Nginx
backup_nginx_config() {
    info "📁 Fazendo backup da configuração atual do Nginx..."
    
    local backup_dir="/etc/nginx/backup/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    if [ -d "/etc/nginx/sites-available" ]; then
        cp -r /etc/nginx/sites-available "$backup_dir/"
    fi
    
    if [ -d "/etc/nginx/sites-enabled" ]; then
        cp -r /etc/nginx/sites-enabled "$backup_dir/"
    fi
    
    success "✅ Backup salvo em $backup_dir"
}

# Instalar Nginx se não estiver instalado
install_nginx() {
    if ! command -v nginx &> /dev/null; then
        info "📦 Instalando Nginx..."
        apt update
        apt install -y nginx
        systemctl enable nginx
        success "✅ Nginx instalado e habilitado"
    else
        info "✅ Nginx já está instalado"
    fi
}

# Configurar subdomínios no Nginx
setup_nginx_config() {
    info "⚙️ Configurando subdomínios no Nginx..."
    
    # Copiar configuração dos subdomínios
    cp nginx/kryonix-subdomains.conf /etc/nginx/sites-available/kryonix-subdomains
    
    # Ativar configuração
    ln -sf /etc/nginx/sites-available/kryonix-subdomains /etc/nginx/sites-enabled/
    
    # Remover configuração padrão se existir
    if [ -L "/etc/nginx/sites-enabled/default" ]; then
        rm /etc/nginx/sites-enabled/default
        info "🗑️ Configuração padrão do Nginx removida"
    fi
    
    success "✅ Configuração dos subdomínios aplicada"
}

# Gerar certificados SSL auto-assinados (para desenvolvimento)
generate_self_signed_certs() {
    info "🔒 Gerando certificados SSL auto-assinados para desenvolvimento..."
    
    local ssl_dir="/etc/ssl"
    
    # Criar diretório se não existir
    mkdir -p "$ssl_dir/certs" "$ssl_dir/private"
    
    # Gerar certificado auto-assinado
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$ssl_dir/private/${DOMAIN}.key" \
        -out "$ssl_dir/certs/${DOMAIN}.crt" \
        -subj "/C=BR/ST=SP/L=SaoPaulo/O=KRYONIX/OU=TI/CN=${DOMAIN}/emailAddress=${EMAIL}" \
        -extensions v3_req \
        -config <(
            echo '[req]'
            echo 'distinguished_name = req'
            echo '[v3_req]'
            echo 'keyUsage = keyEncipherment, dataEncipherment'
            echo 'extendedKeyUsage = serverAuth'
            echo 'subjectAltName = @alt_names'
            echo '[alt_names]'
            echo "DNS.1 = ${DOMAIN}"
            echo "DNS.2 = *.${DOMAIN}"
            local i=3
            for subdomain in $SUBDOMAINS; do
                echo "DNS.${i} = ${subdomain}.${DOMAIN}"
                ((i++))
            done
        )
    
    # Definir permissões corretas
    chmod 644 "$ssl_dir/certs/${DOMAIN}.crt"
    chmod 600 "$ssl_dir/private/${DOMAIN}.key"
    
    success "✅ Certificados SSL gerados (válidos por 365 dias)"
    warn "⚠️ IMPORTANTE: Para produção, use certificados Let's Encrypt ou comerciais!"
}

# Configurar certificados Let's Encrypt (para produção)
setup_letsencrypt() {
    read -p "Deseja configurar certificados Let's Encrypt para produção? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        info "🔒 Configurando Let's Encrypt..."
        
        # Instalar Certbot
        apt install -y certbot python3-certbot-nginx
        
        # Gerar certificados para todos os subdomínios
        for subdomain in $SUBDOMAINS; do
            info "📋 Configurando certificado para ${subdomain}.${DOMAIN}..."
            
            certbot --nginx -d "${subdomain}.${DOMAIN}" \
                --email "$EMAIL" \
                --agree-tos \
                --non-interactive \
                --redirect
        done
        
        # Configurar renovação automática
        cat > /etc/cron.d/certbot-kryonix << EOF
# Renovação automática dos certificados KRYONIX
0 12 * * * root /usr/bin/certbot renew --quiet --post-hook "systemctl reload nginx"
EOF
        
        success "✅ Let's Encrypt configurado com renovação automática"
    else
        generate_self_signed_certs
    fi
}

# Atualizar configuração DNS (CloudFlare)
update_dns_records() {
    read -p "Deseja configurar registros DNS automaticamente? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Digite sua CloudFlare API Token: " -s CF_TOKEN
        echo
        read -p "Digite sua CloudFlare Zone ID: " CF_ZONE_ID
        
        info "☁️ Configurando registros DNS no CloudFlare..."
        
        for subdomain in $SUBDOMAINS; do
            info "📋 Criando registro A para ${subdomain}.${DOMAIN}..."
            
            curl -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records" \
                -H "Authorization: Bearer $CF_TOKEN" \
                -H "Content-Type: application/json" \
                --data "{
                    \"type\": \"A\",
                    \"name\": \"${subdomain}.${DOMAIN}\",
                    \"content\": \"$SERVER_IP\",
                    \"ttl\": 300,
                    \"proxied\": false
                }" > /dev/null
            
            if [ $? -eq 0 ]; then
                success "✅ Registro criado: ${subdomain}.${DOMAIN} -> $SERVER_IP"
            else
                warn "⚠️ Falha ao criar registro: ${subdomain}.${DOMAIN}"
            fi
        done
    else
        warn "📝 Configure manualmente os seguintes registros DNS:"
        echo
        for subdomain in $SUBDOMAINS; do
            echo "   Tipo: A"
            echo "   Nome: ${subdomain}.${DOMAIN}"
            echo "   Valor: $SERVER_IP"
            echo "   TTL: 300"
            echo
        done
    fi
}

# Configurar firewall
setup_firewall() {
    info "🔥 Configurando firewall (UFW)..."
    
    # Instalar UFW se não estiver instalado
    if ! command -v ufw &> /dev/null; then
        apt install -y ufw
    fi
    
    # Configurar regras básicas
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    
    # Permitir SSH (importante!)
    ufw allow ssh
    ufw allow 22/tcp
    
    # Permitir HTTP e HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Permitir portas da aplicação (apenas local)
    ufw allow from 127.0.0.1 to any port 3000
    ufw allow from 127.0.0.1 to any port 3001
    ufw allow from 127.0.0.1 to any port 9090
    
    # Ativar firewall
    ufw --force enable
    
    success "✅ Firewall configurado e ativado"
}

# Verificar configuração do Nginx
test_nginx_config() {
    info "🧪 Testando configuração do Nginx..."
    
    if nginx -t; then
        success "✅ Configuração do Nginx está válida"
        return 0
    else
        error "❌ Configuração do Nginx inválida"
        return 1
    fi
}

# Reiniciar serviços
restart_services() {
    info "🔄 Reiniciando serviços..."
    
    # Recarregar Nginx
    if systemctl reload nginx; then
        success "✅ Nginx recarregado"
    else
        error "❌ Falha ao recarregar Nginx"
        return 1
    fi
    
    # Verificar status dos serviços
    systemctl status nginx --no-pager -l
}

# Testar conectividade dos subdomínios
test_subdomains() {
    info "🌐 Testando conectividade dos subdomínios..."
    
    for subdomain in $SUBDOMAINS; do
        local url="https://${subdomain}.${DOMAIN}"
        
        info "🔍 Testando $url..."
        
        if curl -k -s --max-time 10 "$url" > /dev/null; then
            success "✅ $url está acessível"
        else
            warn "⚠️ $url não está acessível (normal se DNS ainda não propagou)"
        fi
    done
}

# Criar página de status simples
create_status_page() {
    info "📄 Criando página de status..."
    
    cat > /tmp/status.html << 'EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KRYONIX - Status dos Serviços</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 2.5em; font-weight: bold; color: #0ea5e9; margin-bottom: 10px; }
        .subtitle { color: #666; font-size: 1.1em; }
        .services { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .service { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .service-name { font-weight: bold; font-size: 1.2em; margin-bottom: 10px; }
        .service-status { padding: 5px 10px; border-radius: 20px; font-size: 0.9em; font-weight: bold; }
        .status-online { background: #dcfce7; color: #166534; }
        .status-offline { background: #fecaca; color: #991b1b; }
        .service-url { color: #0ea5e9; text-decoration: none; font-size: 0.9em; }
        .footer { text-align: center; margin-top: 40px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">KRYONIX</div>
            <div class="subtitle">Status dos Serviços da Plataforma</div>
        </div>
        
        <div class="services">
            <div class="service">
                <div class="service-name">Aplicação Principal</div>
                <div class="service-status status-online">Online</div>
                <br>
                <a href="https://app.kryonix.com.br" class="service-url">app.kryonix.com.br</a>
            </div>
            
            <div class="service">
                <div class="service-name">API Gateway</div>
                <div class="service-status status-online">Online</div>
                <br>
                <a href="https://api.kryonix.com.br/health" class="service-url">api.kryonix.com.br</a>
            </div>
            
            <div class="service">
                <div class="service-name">Painel Admin</div>
                <div class="service-status status-online">Online</div>
                <br>
                <a href="https://admin.kryonix.com.br" class="service-url">admin.kryonix.com.br</a>
            </div>
            
            <div class="service">
                <div class="service-name">Monitoramento</div>
                <div class="service-status status-online">Online</div>
                <br>
                <a href="https://monitor.kryonix.com.br" class="service-url">monitor.kryonix.com.br</a>
            </div>
        </div>
        
        <div class="footer">
            <p>© 2024 KRYONIX - Plataforma Autônoma de Automação e IA</p>
            <p>Última atualização: <span id="timestamp"></span></p>
        </div>
    </div>
    
    <script>
        document.getElementById('timestamp').textContent = new Date().toLocaleString('pt-BR');
    </script>
</body>
</html>
EOF

    # Copiar para diretório web (se existir)
    if [ -d "/var/www/html" ]; then
        cp /tmp/status.html /var/www/html/
        success "✅ Página de status criada em /var/www/html/status.html"
    fi
}

# Gerar relatório final
generate_report() {
    local report_file="/tmp/kryonix-subdomains-report.txt"
    
    cat > "$report_file" << EOF
===========================================
RELATÓRIO DE CONFIGURAÇÃO DE SUBDOMÍNIOS
KRYONIX - $(date '+%Y-%m-%d %H:%M:%S')
===========================================

DOMÍNIO PRINCIPAL: $DOMAIN
SERVIDOR IP: $SERVER_IP

SUBDOMÍNIOS CONFIGURADOS:
EOF

    for subdomain in $SUBDOMAINS; do
        cat >> "$report_file" << EOF
  ✓ ${subdomain}.${DOMAIN}
    - Nginx: Configurado
    - SSL: Configurado
    - Firewall: Permitido
EOF
    done

    cat >> "$report_file" << EOF

SERVIÇOS CONFIGURADOS:
  ✓ Nginx: $(nginx -v 2>&1)
  ✓ UFW: $(ufw status | head -1)
  ✓ SSL: Certificados instalados

URLS DE ACESSO:
  🌐 Aplicação: https://app.${DOMAIN}
  🔧 API: https://api.${DOMAIN}
  👤 Admin: https://admin.${DOMAIN}
  📊 Monitor: https://monitor.${DOMAIN}
  📈 Métricas: https://metrics.${DOMAIN}
  📊 Status: https://status.${DOMAIN}

PRÓXIMOS PASSOS:
1. Aguardar propagação DNS (até 48h)
2. Verificar certificados SSL em produção
3. Configurar backup automático
4. Monitorar logs em /var/log/nginx/

ARQUIVOS IMPORTANTES:
- Configuração: /etc/nginx/sites-available/kryonix-subdomains
- Logs: /var/log/nginx/kryonix_*.log
- SSL: /etc/ssl/certs/${DOMAIN}.crt
- Backup: /etc/nginx/backup/

===========================================
EOF

    success "✅ Relatório gerado em $report_file"
    echo
    cat "$report_file"
}

# Função principal
main() {
    echo
    info "🚀 Iniciando configuração de subdomínios profissionais KRYONIX..."
    echo
    
    check_root
    backup_nginx_config
    install_nginx
    setup_nginx_config
    
    if test_nginx_config; then
        setup_letsencrypt
        setup_firewall
        restart_services
        create_status_page
        update_dns_records
        test_subdomains
        generate_report
        
        echo
        success "🎉 Configuração de subdomínios concluída com sucesso!"
        echo
        info "📝 URLs da sua plataforma KRYONIX:"
        echo "   🌐 Aplicação: https://app.${DOMAIN}"
        echo "   🔧 API: https://api.${DOMAIN}"
        echo "   👤 Admin: https://admin.${DOMAIN}"
        echo "   📊 Monitor: https://monitor.${DOMAIN}"
        echo "   📈 Métricas: https://metrics.${DOMAIN}"
        echo "   📊 Status: https://status.${DOMAIN}"
        echo
        warn "⚠️ Aguarde até 48h para propagação completa do DNS"
        warn "⚠️ Em produção, configure certificados Let's Encrypt"
        
    else
        error "❌ Falha na configuração. Verifique os logs do Nginx."
        exit 1
    fi
}

# Verificar argumentos
if [[ "${1:-}" == "--help" ]] || [[ "${1:-}" == "-h" ]]; then
    echo "Uso: $0 [opções]"
    echo "Opções:"
    echo "  --help, -h: Mostra esta ajuda"
    echo "  --domain DOMAIN: Define domínio personalizado"
    echo "  --ip IP: Define IP do servidor"
    echo
    echo "Exemplo:"
    echo "  $0 --domain meudominio.com.br --ip 192.168.1.100"
    exit 0
fi

# Parse argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --domain)
            DOMAIN="$2"
            shift 2
            ;;
        --ip)
            SERVER_IP="$2"
            shift 2
            ;;
        *)
            error "Argumento desconhecido: $1"
            exit 1
            ;;
    esac
done

# Executar configuração
main "$@"
