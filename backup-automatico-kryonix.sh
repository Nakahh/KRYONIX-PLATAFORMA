#!/bin/bash

# 💾 KRYONIX - Sistema de Backup Automático Inteligente
# Backup completo com validação, compressão e notificações WhatsApp
# Sistema autônomo com recuperação automática

set -euo pipefail

# Configurações do backup
BACKUP_DIR="/backup/kryonix"
PROJECT_DIR="/opt/kryonix-plataform"
LOG_FILE="/var/log/kryonix-backup.log"
RETENTION_DAYS=30
MAX_BACKUP_SIZE="10G"

# Configurações de notificação
ADMIN_PHONE="5517981805327"
EVOLUTION_API_URL="https://api.kryonix.com.br"
EVOLUTION_API_KEY="2f4d6967043b87b5ebee57b872e0223a"
INSTANCE_NAME="kryonix-monitor"

# Configurações do banco de dados
DB_CONTAINER="keycloak-postgres"
DB_USER="keycloak"
DB_NAME="keycloak"
DB_PASSWORD="Kr7\$n0x-2025-K3ycl04k-DB-P4ssw0rd"

# Cores para logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Função de log com timestamp
log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local color=""
    
    case $level in
        "INFO")  color="$CYAN" ;;
        "SUCCESS") color="$GREEN" ;;
        "WARNING") color="$YELLOW" ;;
        "ERROR") color="$RED" ;;
        "DEBUG") color="$PURPLE" ;;
    esac
    
    echo -e "${color}[$timestamp] [$level]${NC} $message" | tee -a "$LOG_FILE"
}

# Função para enviar notificação WhatsApp
send_whatsapp_notification() {
    local message="$1"
    local priority="${2:-normal}"
    
    local emoji=""
    case $priority in
        "success") emoji="✅" ;;
        "warning") emoji="⚠️" ;;
        "error") emoji="❌" ;;
        "info") emoji="ℹ️" ;;
        *) emoji="📱" ;;
    esac
    
    local formatted_message="${emoji} *KRYONIX Backup*\n\n${message}\n\n_Sistema automático de backup_"
    
    curl -s -X POST "$EVOLUTION_API_URL/message/sendText/$INSTANCE_NAME" \
        -H "Content-Type: application/json" \
        -H "apikey: $EVOLUTION_API_KEY" \
        -d "{
            \"number\": \"${ADMIN_PHONE}@s.whatsapp.net\",
            \"text\": \"$formatted_message\"
        }" >/dev/null 2>&1 || true
}

# Função para verificar espaço em disco
check_disk_space() {
    log "INFO" "Verificando espaço em disco disponível..."
    
    local available_space=$(df -BG "$BACKUP_DIR" | awk 'NR==2 {print $4}' | sed 's/G//')
    local required_space=15 # GB mínimo necessário
    
    if [ "$available_space" -lt "$required_space" ]; then
        log "ERROR" "Espaço insuficiente: ${available_space}GB disponível, ${required_space}GB necessário"
        send_whatsapp_notification "❌ *Backup Falhou*\n\nEspaço insuficiente no disco:\n• Disponível: ${available_space}GB\n• Necessário: ${required_space}GB\n\nAção necessária: Liberar espaço em disco" "error"
        return 1
    fi
    
    log "SUCCESS" "Espaço em disco OK: ${available_space}GB disponível"
    return 0
}

# Função para criar estrutura de diretórios
create_backup_structure() {
    local backup_date="$1"
    local backup_path="$BACKUP_DIR/$backup_date"
    
    log "INFO" "Criando estrutura de backup: $backup_path"
    
    mkdir -p "$backup_path"/{database,application,config,logs,docker}
    
    if [ ! -d "$backup_path" ]; then
        log "ERROR" "Falha ao criar diretório de backup: $backup_path"
        return 1
    fi
    
    echo "$backup_path"
}

# Função para backup do banco de dados
backup_database() {
    local backup_path="$1"
    
    log "INFO" "Iniciando backup do banco de dados Keycloak..."
    
    # Verificar se container existe
    if ! docker ps -a --format "{{.Names}}" | grep -q "^${DB_CONTAINER}$"; then
        log "WARNING" "Container do banco de dados não encontrado: $DB_CONTAINER"
        return 1
    fi
    
    # Backup do PostgreSQL
    local db_backup_file="$backup_path/database/keycloak_$(date +%Y%m%d_%H%M%S).sql"
    
    if docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" > "$db_backup_file"; then
        
        # Comprimir backup
        gzip "$db_backup_file"
        db_backup_file="${db_backup_file}.gz"
        
        # Verificar integridade
        if [ -f "$db_backup_file" ] && [ -s "$db_backup_file" ]; then
            local file_size=$(du -h "$db_backup_file" | awk '{print $1}')
            log "SUCCESS" "Backup do banco concluído: $file_size"
            
            # Testar integridade do arquivo comprimido
            if gzip -t "$db_backup_file" >/dev/null 2>&1; then
                log "SUCCESS" "Integridade do backup do banco validada"
                echo "$db_backup_file"
                return 0
            else
                log "ERROR" "Arquivo de backup do banco corrompido"
                return 1
            fi
        else
            log "ERROR" "Arquivo de backup do banco vazio ou não criado"
            return 1
        fi
    else
        log "ERROR" "Falha no backup do banco de dados"
        return 1
    fi
}

# Função para backup da aplicação
backup_application() {
    local backup_path="$1"
    
    log "INFO" "Iniciando backup da aplicação..."
    
    if [ ! -d "$PROJECT_DIR" ]; then
        log "ERROR" "Diretório da aplicação não encontrado: $PROJECT_DIR"
        return 1
    fi
    
    local app_backup_file="$backup_path/application/kryonix-app_$(date +%Y%m%d_%H%M%S).tar.gz"
    
    # Criar backup excluindo node_modules e .git
    if tar -czf "$app_backup_file" \
        -C "$(dirname $PROJECT_DIR)" \
        --exclude="node_modules" \
        --exclude=".git" \
        --exclude="*.log" \
        --exclude="tmp" \
        "$(basename $PROJECT_DIR)"; then
        
        if [ -f "$app_backup_file" ] && [ -s "$app_backup_file" ]; then
            local file_size=$(du -h "$app_backup_file" | awk '{print $1}')
            log "SUCCESS" "Backup da aplicação concluído: $file_size"
            
            # Testar integridade do arquivo
            if tar -tzf "$app_backup_file" >/dev/null 2>&1; then
                log "SUCCESS" "Integridade do backup da aplicação validada"
                echo "$app_backup_file"
                return 0
            else
                log "ERROR" "Arquivo de backup da aplicação corrompido"
                return 1
            fi
        else
            log "ERROR" "Arquivo de backup da aplicação vazio ou não criado"
            return 1
        fi
    else
        log "ERROR" "Falha no backup da aplicação"
        return 1
    fi
}

# Função para backup das configurações
backup_configurations() {
    local backup_path="$1"
    
    log "INFO" "Iniciando backup das configurações..."
    
    local config_backup_file="$backup_path/config/kryonix-config_$(date +%Y%m%d_%H%M%S).tar.gz"
    
    # Lista de diretórios e arquivos de configuração
    local config_items=(
        "/etc/docker"
        "/etc/nginx"
        "/etc/ssl"
        "/etc/systemd/system/kryonix*"
        "/var/lib/docker/volumes"
        "$PROJECT_DIR/keycloak-config.json"
        "$PROJECT_DIR/docker-stack.yml"
        "$PROJECT_DIR/.env"
    )
    
    # Criar lista de itens existentes
    local existing_items=()
    for item in "${config_items[@]}"; do
        if [ -e "$item" ]; then
            existing_items+=("$item")
        fi
    done
    
    if [ ${#existing_items[@]} -eq 0 ]; then
        log "WARNING" "Nenhum arquivo de configuração encontrado para backup"
        return 1
    fi
    
    if tar -czf "$config_backup_file" "${existing_items[@]}" 2>/dev/null; then
        if [ -f "$config_backup_file" ] && [ -s "$config_backup_file" ]; then
            local file_size=$(du -h "$config_backup_file" | awk '{print $1}')
            log "SUCCESS" "Backup das configurações concluído: $file_size"
            echo "$config_backup_file"
            return 0
        fi
    fi
    
    log "WARNING" "Backup das configurações com problemas"
    return 1
}

# Função para backup dos logs
backup_logs() {
    local backup_path="$1"
    
    log "INFO" "Iniciando backup dos logs..."
    
    local logs_backup_file="$backup_path/logs/kryonix-logs_$(date +%Y%m%d_%H%M%S).tar.gz"
    
    # Lista de diretórios de logs
    local log_dirs=(
        "/var/log"
        "$PROJECT_DIR/logs"
    )
    
    local existing_logs=()
    for log_dir in "${log_dirs[@]}"; do
        if [ -d "$log_dir" ]; then
            existing_logs+=("$log_dir")
        fi
    done
    
    if [ ${#existing_logs[@]} -eq 0 ]; then
        log "WARNING" "Nenhum diretório de logs encontrado"
        return 1
    fi
    
    # Backup apenas dos últimos 7 dias
    if find "${existing_logs[@]}" -name "*.log" -mtime -7 -exec tar -czf "$logs_backup_file" {} + 2>/dev/null; then
        if [ -f "$logs_backup_file" ] && [ -s "$logs_backup_file" ]; then
            local file_size=$(du -h "$logs_backup_file" | awk '{print $1}')
            log "SUCCESS" "Backup dos logs concluído: $file_size"
            echo "$logs_backup_file"
            return 0
        fi
    fi
    
    log "WARNING" "Backup dos logs com problemas"
    return 1
}

# Função para backup das configurações Docker
backup_docker() {
    local backup_path="$1"
    
    log "INFO" "Iniciando backup das configurações Docker..."
    
    local docker_backup_file="$backup_path/docker/docker-info_$(date +%Y%m%d_%H%M%S).json"
    
    # Coletar informações dos containers e serviços
    {
        echo "=== DOCKER SYSTEM INFO ==="
        docker system df
        echo ""
        
        echo "=== DOCKER IMAGES ==="
        docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.Size}}"
        echo ""
        
        echo "=== DOCKER CONTAINERS ==="
        docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        echo ""
        
        echo "=== DOCKER NETWORKS ==="
        docker network ls
        echo ""
        
        echo "=== DOCKER VOLUMES ==="
        docker volume ls
        echo ""
        
        echo "=== DOCKER SERVICES ==="
        docker service ls 2>/dev/null || echo "Swarm não ativo"
        echo ""
        
        echo "=== DOCKER STACKS ==="
        docker stack ls 2>/dev/null || echo "Nenhum stack encontrado"
        
    } > "$docker_backup_file"
    
    if [ -f "$docker_backup_file" ] && [ -s "$docker_backup_file" ]; then
        local file_size=$(du -h "$docker_backup_file" | awk '{print $1}')
        log "SUCCESS" "Backup das configurações Docker concluído: $file_size"
        echo "$docker_backup_file"
        return 0
    else
        log "WARNING" "Backup das configurações Docker com problemas"
        return 1
    fi
}

# Função para verificar integridade dos backups
verify_backup_integrity() {
    local backup_path="$1"
    
    log "INFO" "Verificando integridade dos backups..."
    
    local errors=0
    local warnings=0
    
    # Verificar arquivos de backup
    find "$backup_path" -name "*.tar.gz" -o -name "*.gz" | while read -r file; do
        if [ -f "$file" ]; then
            if [[ "$file" == *.tar.gz ]]; then
                if ! tar -tzf "$file" >/dev/null 2>&1; then
                    log "ERROR" "Arquivo corrompido: $file"
                    ((errors++))
                else
                    log "DEBUG" "Arquivo OK: $(basename "$file")"
                fi
            elif [[ "$file" == *.gz ]]; then
                if ! gzip -t "$file" >/dev/null 2>&1; then
                    log "ERROR" "Arquivo corrompido: $file"
                    ((errors++))
                else
                    log "DEBUG" "Arquivo OK: $(basename "$file")"
                fi
            fi
        fi
    done
    
    # Verificar tamanhos mínimos
    local total_size=$(du -sb "$backup_path" | awk '{print $1}')
    local min_size=$((1024 * 1024 * 10)) # 10MB mínimo
    
    if [ "$total_size" -lt "$min_size" ]; then
        log "WARNING" "Backup muito pequeno: $(du -h "$backup_path" | awk '{print $1}')"
        ((warnings++))
    fi
    
    log "INFO" "Verificação concluída: $errors erros, $warnings avisos"
    return $((errors + warnings))
}

# Função para limpar backups antigos
cleanup_old_backups() {
    log "INFO" "Limpando backups antigos (>${RETENTION_DAYS} dias)..."
    
    local deleted_count=0
    local freed_space=0
    
    find "$BACKUP_DIR" -maxdepth 1 -type d -mtime +$RETENTION_DAYS | while read -r old_backup; do
        if [ -d "$old_backup" ] && [[ "$(basename "$old_backup")" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}_ ]]; then
            local backup_size=$(du -sb "$old_backup" | awk '{print $1}')
            log "INFO" "Removendo backup antigo: $(basename "$old_backup")"
            
            if rm -rf "$old_backup"; then
                ((deleted_count++))
                ((freed_space += backup_size))
                log "SUCCESS" "Backup removido: $(basename "$old_backup")"
            else
                log "ERROR" "Falha ao remover: $(basename "$old_backup")"
            fi
        fi
    done
    
    if [ $deleted_count -gt 0 ]; then
        local freed_mb=$((freed_space / 1024 / 1024))
        log "SUCCESS" "Limpeza concluída: $deleted_count backups removidos, ${freed_mb}MB liberados"
    else
        log "INFO" "Nenhum backup antigo para remover"
    fi
}

# Função para criar relatório de backup
create_backup_report() {
    local backup_path="$1"
    local start_time="$2"
    local end_time="$3"
    local status="$4"
    
    local report_file="$backup_path/backup-report.txt"
    local duration=$(($end_time - $start_time))
    local duration_formatted=$(printf "%02d:%02d:%02d" $((duration/3600)) $((duration%3600/60)) $((duration%60)))
    
    {
        echo "KRYONIX - Relatório de Backup"
        echo "=============================="
        echo ""
        echo "Data/Hora: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "Status: $status"
        echo "Duração: $duration_formatted"
        echo "Diretório: $backup_path"
        echo ""
        echo "Arquivos de Backup:"
        echo "==================="
        
        find "$backup_path" -name "*.tar.gz" -o -name "*.gz" -o -name "*.json" | while read -r file; do
            if [ -f "$file" ]; then
                local size=$(du -h "$file" | awk '{print $1}')
                local rel_path=${file#$backup_path/}
                echo "  $rel_path ($size)"
            fi
        done
        
        echo ""
        echo "Tamanho Total:"
        echo "=============="
        du -sh "$backup_path"
        
        echo ""
        echo "Verificação de Integridade:"
        echo "=========================="
        echo "Todos os arquivos foram verificados para integridade"
        
    } > "$report_file"
    
    log "SUCCESS" "Relatório de backup criado: $report_file"
}

# Função para enviar relatório detalhado via WhatsApp
send_backup_summary() {
    local backup_path="$1"
    local status="$2"
    local duration="$3"
    
    local total_size=$(du -sh "$backup_path" 2>/dev/null | awk '{print $1}' || echo "N/A")
    local file_count=$(find "$backup_path" -type f | wc -l)
    
    local summary=""
    case $status in
        "SUCCESS")
            summary="✅ *Backup Concluído com Sucesso*\n\n"
            summary+="📊 **Resumo:**\n"
            summary+="• Duração: $duration\n"
            summary+="• Tamanho: $total_size\n"
            summary+="• Arquivos: $file_count\n"
            summary+="• Local: $(basename "$backup_path")\n\n"
            summary+="🔍 **Componentes:**\n"
            summary+="• ✅ Banco de dados Keycloak\n"
            summary+="• ✅ Aplicação KRYONIX\n"
            summary+="• ✅ Configurações do sistema\n"
            summary+="• ✅ Logs e monitoramento\n"
            summary+="• ✅ Informações Docker\n\n"
            summary+="🛡️ **Segurança:**\n"
            summary+="• Integridade verificada\n"
            summary+="• Compressão aplicada\n"
            summary+="• Backup validado\n\n"
            summary+="📅 Próximo backup: $(date -d 'tomorrow' '+%d/%m/%Y às %H:%M')"
            send_whatsapp_notification "$summary" "success"
            ;;
        "PARTIAL")
            summary="⚠️ *Backup Parcialmente Concluído*\n\n"
            summary+="📊 **Resumo:**\n"
            summary+="• Duração: $duration\n"
            summary+="• Tamanho: $total_size\n"
            summary+="• Arquivos: $file_count\n\n"
            summary+="⚠️ **Atenção:** Alguns componentes falharam\n"
            summary+="Verificar logs para detalhes\n\n"
            summary+="📋 **Ação Recomendada:**\n"
            summary+="• Revisar logs de backup\n"
            summary+="• Executar backup manual se necessário"
            send_whatsapp_notification "$summary" "warning"
            ;;
        "FAILED")
            summary="❌ *Backup Falhou*\n\n"
            summary+="⚠️ **Problema Crítico Detectado**\n\n"
            summary+="🔍 **Possíveis Causas:**\n"
            summary+="• Espaço em disco insuficiente\n"
            summary+="• Falha nos serviços Docker\n"
            summary+="• Problemas de permissão\n"
            summary+="• Falha na conexão com banco\n\n"
            summary+="🚨 **Ação Urgente Necessária:**\n"
            summary+="• Verificar logs: tail -f $LOG_FILE\n"
            summary+="• Corrigir problemas identificados\n"
            summary+="• Executar backup manual\n\n"
            summary+="⏰ **Status:** Sistema sem backup válido"
            send_whatsapp_notification "$summary" "error"
            ;;
    esac
}

# Função principal de backup
main_backup() {
    local start_time=$(date +%s)
    local backup_date=$(date '+%Y-%m-%d_%H%M%S')
    local status="FAILED"
    local success_count=0
    local total_components=5
    
    log "INFO" "=== INICIANDO BACKUP AUTOMÁTICO KRYONIX ==="
    log "INFO" "Data/Hora: $(date '+%Y-%m-%d %H:%M:%S')"
    log "INFO" "Backup ID: $backup_date"
    
    # Verificar pré-requisitos
    if ! check_disk_space; then
        log "ERROR" "Pré-requisitos não atendidos - cancelando backup"
        return 1
    fi
    
    # Criar estrutura de backup
    local backup_path
    if ! backup_path=$(create_backup_structure "$backup_date"); then
        log "ERROR" "Falha ao criar estrutura de backup"
        return 1
    fi
    
    log "INFO" "Diretório de backup: $backup_path"
    
    # Executar componentes do backup
    log "INFO" "Iniciando backup dos componentes..."
    
    # 1. Backup do banco de dados
    if backup_database "$backup_path"; then
        ((success_count++))
    fi
    
    # 2. Backup da aplicação
    if backup_application "$backup_path"; then
        ((success_count++))
    fi
    
    # 3. Backup das configurações
    if backup_configurations "$backup_path"; then
        ((success_count++))
    fi
    
    # 4. Backup dos logs
    if backup_logs "$backup_path"; then
        ((success_count++))
    fi
    
    # 5. Backup das configurações Docker
    if backup_docker "$backup_path"; then
        ((success_count++))
    fi
    
    # Verificar integridade
    log "INFO" "Verificando integridade dos backups..."
    if verify_backup_integrity "$backup_path"; then
        log "SUCCESS" "Integridade dos backups verificada"
    else
        log "WARNING" "Problemas de integridade detectados"
    fi
    
    # Determinar status final
    if [ $success_count -eq $total_components ]; then
        status="SUCCESS"
        log "SUCCESS" "Backup completo: $success_count/$total_components componentes"
    elif [ $success_count -gt 0 ]; then
        status="PARTIAL"
        log "WARNING" "Backup parcial: $success_count/$total_components componentes"
    else
        status="FAILED"
        log "ERROR" "Backup falhou: $success_count/$total_components componentes"
    fi
    
    # Limpar backups antigos
    cleanup_old_backups
    
    # Calcular duração
    local end_time=$(date +%s)
    local duration=$(($end_time - $start_time))
    local duration_formatted=$(printf "%02d:%02d:%02d" $((duration/3600)) $((duration%3600/60)) $((duration%60)))
    
    # Criar relatório
    create_backup_report "$backup_path" "$start_time" "$end_time" "$status"
    
    # Enviar notificação
    send_backup_summary "$backup_path" "$status" "$duration_formatted"
    
    log "INFO" "=== BACKUP FINALIZADO ==="
    log "INFO" "Status: $status"
    log "INFO" "Duração: $duration_formatted"
    log "INFO" "Componentes: $success_count/$total_components"
    
    # Retornar código baseado no status
    case $status in
        "SUCCESS") return 0 ;;
        "PARTIAL") return 1 ;;
        "FAILED") return 2 ;;
    esac
}

# Função para configurar backup automático
setup_automatic_backup() {
    log "INFO" "Configurando backup automático diário..."
    
    # Criar entrada no crontab
    local cron_entry="0 2 * * * $0 --run-backup >/dev/null 2>&1"
    
    # Verificar se já existe
    if crontab -l 2>/dev/null | grep -q "$0"; then
        log "INFO" "Backup automático já configurado"
    else
        # Adicionar ao crontab
        (crontab -l 2>/dev/null; echo "$cron_entry") | crontab -
        log "SUCCESS" "Backup automático configurado para executar diariamente às 02:00"
        
        send_whatsapp_notification "⚙️ *Backup Automático Configurado*\n\nSistema de backup configurado com sucesso!\n\n📅 **Agendamento:** Diário às 02:00\n🔧 **Comando:** $0\n📍 **Local:** $BACKUP_DIR\n\n✅ Backup automático ativo" "info"
    fi
}

# Função para teste de backup
test_backup() {
    log "INFO" "Executando teste de backup..."
    
    # Criar diretório de teste
    local test_dir="$BACKUP_DIR/test_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$test_dir"
    
    # Executar backup de teste (componentes básicos)
    local test_success=true
    
    # Testar backup da aplicação
    if backup_application "$test_dir"; then
        log "SUCCESS" "Teste: Backup da aplicação OK"
    else
        log "ERROR" "Teste: Falha no backup da aplicação"
        test_success=false
    fi
    
    # Testar backup do banco se disponível
    if docker ps --format "{{.Names}}" | grep -q "$DB_CONTAINER"; then
        if backup_database "$test_dir"; then
            log "SUCCESS" "Teste: Backup do banco OK"
        else
            log "WARNING" "Teste: Falha no backup do banco"
        fi
    fi
    
    # Limpar teste
    rm -rf "$test_dir"
    
    if $test_success; then
        log "SUCCESS" "Teste de backup concluído com sucesso"
        send_whatsapp_notification "🧪 *Teste de Backup*\n\n✅ Teste executado com sucesso!\n\nSistema de backup está funcionando corretamente." "success"
        return 0
    else
        log "ERROR" "Teste de backup falhou"
        send_whatsapp_notification "🧪 *Teste de Backup*\n\n❌ Teste falhou!\n\nVerificar configurações do sistema de backup." "error"
        return 1
    fi
}

# Função principal
main() {
    # Criar diretórios necessários
    sudo mkdir -p "$BACKUP_DIR" 2>/dev/null || true
    sudo chown -R $USER:$USER "$BACKUP_DIR" 2>/dev/null || true
    sudo touch "$LOG_FILE" 2>/dev/null || true
    sudo chown $USER:$USER "$LOG_FILE" 2>/dev/null || true
    
    case "${1:-}" in
        "--run-backup")
            main_backup
            ;;
        "--setup")
            setup_automatic_backup
            ;;
        "--test")
            test_backup
            ;;
        "--cleanup")
            cleanup_old_backups
            ;;
        "--help"|"-h")
            echo "KRYONIX - Sistema de Backup Automático"
            echo ""
            echo "Uso: $0 [OPÇÃO]"
            echo ""
            echo "Opções:"
            echo "  --run-backup    Executar backup completo"
            echo "  --setup         Configurar backup automático"
            echo "  --test          Executar teste de backup"
            echo "  --cleanup       Limpar backups antigos"
            echo "  --help, -h      Mostrar esta ajuda"
            echo ""
            ;;
        "")
            main_backup
            ;;
        *)
            echo "Opção inválida: $1"
            echo "Use '$0 --help' para ver as opções disponíveis"
            exit 1
            ;;
    esac
}

# Executar função principal
main "$@"
