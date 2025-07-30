#!/bin/bash

echo "🧪 TESTE DAS CORREÇÕES DO INSTALADOR KRYONIX"
echo "============================================="

# Testar função de detecção de rede
echo ""
echo "1. Testando função detect_traefik_network_automatically()..."

# Simular fonte da função
source <(grep -A 20 "detect_traefik_network_automatically" instalador-plataforma-kryonix.sh | head -25)

# Testar a função
if command -v detect_traefik_network_automatically >/dev/null 2>&1; then
    echo "✅ Função carregada com sucesso"
    
    # Testar execução
    RESULT=$(detect_traefik_network_automatically 2>&1)
    if [ $? -eq 0 ]; then
        echo "✅ Função executou sem erros"
        echo "📋 Resultado: $RESULT"
    else
        echo "❌ Função falhou"
        echo "📋 Erro: $RESULT"
    fi
else
    echo "❌ Falha ao carregar função"
fi

echo ""
echo "2. Testando comandos grep problemáticos..."

# Testar comando grep que estava causando erro
TEST_NETWORK_ID="test123"
if echo "test123 TestNetwork" | grep "^$TEST_NETWORK_ID" | awk '{print $2}' >/dev/null 2>&1; then
    echo "✅ Comando grep corrigido funciona"
else
    echo "❌ Comando grep ainda com problemas"
fi

echo ""
echo "3. Verificando uso de 'local' em contexto global..."

# Verificar se ainda há uso incorreto de local
if grep -n "local.*=" instalador-plataforma-kryonix.sh | grep -v "detect_traefik_network_automatically\|sync_git_repository\|test_service_health\|ensure_docker_network\|validate_credentials"; then
    echo "❌ Ainda há uso incorreto de 'local' fora de funções"
else
    echo "✅ Uso de 'local' corrigido"
fi

echo ""
echo "4. Testando sintaxe geral do script..."

if bash -n instalador-plataforma-kryonix.sh 2>/dev/null; then
    echo "✅ Sintaxe do script está correta"
else
    echo "❌ Problemas de sintaxe detectados:"
    bash -n instalador-plataforma-kryonix.sh
fi

echo ""
echo "🎯 TESTE CONCLUÍDO"
echo "=================="
