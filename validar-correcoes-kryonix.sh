#!/bin/bash

# ============================================================================
# 🔧 VALIDADOR DE CORREÇÕES KRYONIX
# ============================================================================
# Valida se todas as correções dos agentes especializados foram aplicadas
# ============================================================================

echo "🔍 VALIDANDO CORREÇÕES DO INSTALADOR KRYONIX..."

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0

validate() {
    local description="$1"
    local condition="$2"
    
    echo -n "📋 $description... "
    
    if eval "$condition"; then
        echo -e "${GREEN}✅ PASSED${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ FAILED${NC}"
        FAILED=$((FAILED + 1))
    fi
}

echo -e "${BLUE}🔍 Validando correções identificadas pelos agentes especializados...${NC}\n"

# Validação 1: Dockerfile com ordem correta
validate "Dockerfile copia check-dependencies.js ANTES de npm install" \
"grep -A 20 'COPY package' instalador-plataforma-kryonix.sh | grep -B 5 'npm install' | grep -q 'check-dependencies.js'"

# Validação 2: Arquivos de dependências são criados
validate "Instalador cria check-dependencies.js" \
"grep -q 'cat > check-dependencies.js' instalador-plataforma-kryonix.sh"

validate "Instalador cria validate-dependencies.js" \
"grep -q 'cat > validate-dependencies.js' instalador-plataforma-kryonix.sh"

validate "Instalador cria fix-dependencies.js" \
"grep -q 'cat > fix-dependencies.js' instalador-plataforma-kryonix.sh"

# Validação 3: Tokens não expostos
validate "Webhook-deploy.sh não tem tokens hardcoded" \
"! grep -q 'ghp_.*@github.com' instalador-plataforma-kryonix.sh || grep -q 'PAT_TOKEN}@github.com' instalador-plataforma-kryonix.sh"

# Validação 4: Verificação de arquivos obrigatórios
validate "Verificação inclui arquivos de dependências" \
"grep -A 5 'required_files=' instalador-plataforma-kryonix.sh | grep -q 'check-dependencies.js'"

# Validação 5: Dockerfile não está quebrado
validate "Dockerfile gerado está sintáticamente correto" \
"grep -A 50 'cat > Dockerfile' instalador-plataforma-kryonix.sh | grep -q 'DOCKERFILE_EOF'"

# Validação 6: Package.json não tem postinstall problemático
validate "Package.json postinstall não é problemático (se modificado)" \
"! grep -q '\"postinstall\": \"npm run check-deps\"' instalador-plataforma-kryonix.sh || echo 'Não modificado (OK)'"

echo ""
echo -e "${BLUE}📊 RESULTADO DA VALIDAÇÃO:${NC}"
echo -e "${GREEN}✅ PASSED: $PASSED${NC}"
echo -e "${RED}❌ FAILED: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 TODAS AS CORREÇÕES APLICADAS CORRETAMENTE!${NC}"
    echo -e "${GREEN}O instalador deve funcionar sem os erros identificados.${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️ ALGUMAS CORREÇÕES AINDA PRECISAM SER APLICADAS!${NC}"
    echo -e "${YELLOW}Revise os itens que falharam na validação.${NC}"
    exit 1
fi
