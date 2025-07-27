#!/bin/sh
# Script de entrada para container KRYONIX
# Configurações específicas para produção brasileira

set -e

echo "🇧🇷 Iniciando KRYONIX v1.0.0..."
echo "Timestamp: $(date)"
echo "Timezone: $(date +%Z)"
echo "Node.js: $(node --version)"
echo "Environment: ${NODE_ENV:-production}"

# Verificar variáveis essenciais
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL não configurada"
fi

if [ -z "$REDIS_URL" ]; then
    echo "⚠️  REDIS_URL não configurada"
fi

# Configurar logs
mkdir -p /app/logs
touch /app/logs/app.log
touch /app/logs/error.log
touch /app/logs/access.log

# Configurar timezone se diferente
if [ "$TZ" != "America/Sao_Paulo" ]; then
    echo "⚠️  Timezone não é America/Sao_Paulo, ajustando..."
    export TZ=America/Sao_Paulo
fi

# Verificar saúde do banco de dados (se configurado)
if [ -n "$DATABASE_URL" ]; then
    echo "🔍 Verificando conexão com banco de dados..."
    timeout 30 node -e "
        const { Pool } = require('pg');
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        pool.query('SELECT 1').then(() => {
            console.log('✅ Banco de dados conectado');
            process.exit(0);
        }).catch(err => {
            console.error('❌ Erro no banco:', err.message);
            process.exit(1);
        });
    " || echo "⚠️  Banco de dados não disponível, continuando..."
fi

# Verificar Redis (se configurado)
if [ -n "$REDIS_URL" ]; then
    echo "🔍 Verificando conexão com Redis..."
    timeout 10 node -e "
        const redis = require('ioredis');
        const client = new redis(process.env.REDIS_URL);
        client.ping().then(() => {
            console.log('✅ Redis conectado');
            client.disconnect();
            process.exit(0);
        }).catch(err => {
            console.error('❌ Erro no Redis:', err.message);
            process.exit(1);
        });
    " || echo "⚠️  Redis não disponível, continuando..."
fi

# Executar migrações de banco se necessário
if [ "$RUN_MIGRATIONS" = "true" ] && [ -n "$DATABASE_URL" ]; then
    echo "🔄 Executando migrações do banco..."
    npm run db:migrate || echo "⚠️  Migrações falharam, continuando..."
fi

# Configurar monitoramento se habilitado
if [ "$ENABLE_MONITORING" = "true" ]; then
    echo "📊 Habilitando monitoramento..."
    export PROMETHEUS_ENABLED=true
    export HEALTH_CHECK_ENABLED=true
fi

# Configurar rate limiting baseado no ambiente
if [ "$NODE_ENV" = "production" ]; then
    export RATE_LIMIT_WINDOW_MS=900000  # 15 minutos
    export RATE_LIMIT_MAX_REQUESTS=1000
    export RATE_LIMIT_ENABLED=true
else
    export RATE_LIMIT_ENABLED=false
fi

# Configurações de segurança para produção
if [ "$NODE_ENV" = "production" ]; then
    export HELMET_ENABLED=true
    export CORS_ORIGIN="https://*.kryonix.com.br"
    export TRUST_PROXY=true
else
    export HELMET_ENABLED=false
    export CORS_ORIGIN="*"
    export TRUST_PROXY=false
fi

# Configurar limites de memória baseado no container
MEMORY_LIMIT=$(cat /sys/fs/cgroup/memory/memory.limit_in_bytes 2>/dev/null || echo "1073741824")
if [ "$MEMORY_LIMIT" -lt 2147483648 ]; then  # < 2GB
    export NODE_OPTIONS="--max-old-space-size=512 --optimize-for-size"
elif [ "$MEMORY_LIMIT" -lt 4294967296 ]; then  # < 4GB
    export NODE_OPTIONS="--max-old-space-size=1024"
else
    export NODE_OPTIONS="--max-old-space-size=2048"
fi

echo "💾 Limite de memória Node.js: $NODE_OPTIONS"

# Configurar workers baseado no número de CPUs
CPU_COUNT=$(nproc)
if [ "$CPU_COUNT" -gt 4 ]; then
    export CLUSTER_WORKERS=4
elif [ "$CPU_COUNT" -gt 2 ]; then
    export CLUSTER_WORKERS=2
else
    export CLUSTER_WORKERS=1
fi

echo "⚡ Workers configurados: $CLUSTER_WORKERS"

# Aguardar dependências externas se necessário
if [ "$WAIT_FOR_DEPS" = "true" ]; then
    echo "⏳ Aguardando dependências externas..."
    
    # Aguardar WhatsApp API se configurada
    if [ -n "$WHATSAPP_API_URL" ]; then
        echo "📱 Aguardando WhatsApp API..."
        timeout 60 sh -c 'until curl -f "$WHATSAPP_API_URL/health" >/dev/null 2>&1; do sleep 2; done' || echo "⚠️  WhatsApp API não disponível"
    fi
    
    # Aguardar N8N se configurado
    if [ -n "$N8N_API_URL" ]; then
        echo "🔄 Aguardando N8N..."
        timeout 60 sh -c 'until curl -f "$N8N_API_URL/healthz" >/dev/null 2>&1; do sleep 2; done' || echo "⚠️  N8N não disponível"
    fi
fi

# Criar arquivo PID para monitoramento
echo $$ > /app/kryonix.pid

# Configurar tratamento de sinais para graceful shutdown
trap 'echo "🛑 Recebido sinal de parada, finalizando gracefully..."; kill -TERM $PID; wait $PID; exit 0' TERM
trap 'echo "🔄 Recebido sinal de reload, recarregando..."; kill -USR2 $PID' USR2

# Função para log estruturado
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$1] $2" | tee -a /app/logs/app.log
}

log "INFO" "Iniciando aplicação KRYONIX..."
log "INFO" "Environment: $NODE_ENV"
log "INFO" "Port: ${PORT:-3000}"
log "INFO" "Workers: $CLUSTER_WORKERS"
log "INFO" "Memory limit: $NODE_OPTIONS"

# Verificar se a aplicação existe
if [ ! -f "/app/dist/server/node-build.mjs" ]; then
    log "ERROR" "Aplicação não encontrada em /app/dist/server/node-build.mjs"
    exit 1
fi

# Executar aplicação em background
echo "🚀 Iniciando servidor KRYONIX..."
node /app/dist/server/node-build.mjs &
PID=$!

# Aguardar a aplicação estar pronta
echo "⏳ Aguardando aplicação estar pronta..."
timeout 60 sh -c "
    while ! curl -f http://localhost:${PORT:-3000}/api/ping >/dev/null 2>&1; do
        sleep 1
    done
" && log "INFO" "✅ Aplicação pronta!" || log "ERROR" "❌ Aplicação não iniciou corretamente"

# Aguardar processo principal
wait $PID

log "INFO" "Aplicação finalizada"
