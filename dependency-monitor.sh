#!/bin/bash

# Monitor contínuo de dependências KRYONIX
DEPLOY_PATH="/opt/kryonix-plataform"
LOG_FILE="/var/log/kryonix-deps-monitor.log"

log_monitor() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Verificar se estamos no diretório correto
if [ ! -d "$DEPLOY_PATH" ]; then
    log_monitor "❌ Diretório KRYONIX não encontrado: $DEPLOY_PATH"
    exit 1
fi

cd "$DEPLOY_PATH" || exit 1

# Verificar se há atualizações disponíveis
if command -v ncu >/dev/null 2>&1; then
    # Verificar atualizações disponíveis
    updates_output=$(ncu --jsonUpgraded 2>/dev/null)
    
    if [ $? -eq 0 ] && [ ! -z "$updates_output" ]; then
        # Contar atualizações usando jq se disponível, senão contar chaves manualmente
        if command -v jq >/dev/null 2>&1; then
            updates_available=$(echo "$updates_output" | jq -r 'keys | length' 2>/dev/null || echo "0")
        else
            # Fallback: contar linhas que contêm ":"
            updates_available=$(echo "$updates_output" | grep -o '"[^"]*":' | wc -l)
        fi
    else
        updates_available=0
    fi
    
    if [ "$updates_available" -gt 0 ]; then
        log_monitor "📦 $updates_available atualizações de dependências disponíveis"
        
        # Auto-update em horários específicos (3:00 AM)
        current_hour=$(date +%H)
        if [ "$current_hour" = "03" ]; then
            log_monitor "🔄 Iniciando auto-update programado..."
            
            # Executar deploy com auto-update
            if [ -f "webhook-deploy.sh" ]; then
                bash webhook-deploy.sh manual >> "$LOG_FILE" 2>&1
                log_monitor "✅ Auto-update programado concluído"
            else
                log_monitor "❌ webhook-deploy.sh não encontrado"
            fi
        fi
    else
        log_monitor "✅ Dependências atualizadas"
    fi
else
    log_monitor "⚠️ npm-check-updates não encontrado"
fi

# Verificar health dos serviços
services_ok=0
total_services=3

for port in 8080 8082 8084; do
    if curl -f -s "http://localhost:$port/health" >/dev/null 2>&1; then
        services_ok=$((services_ok + 1))
    fi
done

if [ $services_ok -eq $total_services ]; then
    log_monitor "✅ Todos os serviços KRYONIX funcionando ($services_ok/$total_services)"
else
    log_monitor "⚠️ Problemas detectados nos serviços KRYONIX ($services_ok/$total_services OK)"
fi

# Verificar espaço em disco
disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$disk_usage" -gt 85 ]; then
    log_monitor "⚠️ Espaço em disco baixo: ${disk_usage}%"
fi

# Verificar uso de memória
memory_usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
if [ "$memory_usage" -gt 85 ]; then
    log_monitor "⚠️ Uso de memória alto: ${memory_usage}%"
fi

# Log de status geral
log_monitor "📊 Status: ${services_ok}/${total_services} serviços, ${updates_available} updates disponíveis, Disco: ${disk_usage}%, RAM: ${memory_usage}%"
