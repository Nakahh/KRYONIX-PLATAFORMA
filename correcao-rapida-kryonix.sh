#!/bin/bash

# Correção rápida para problemas de Docker build KRYONIX
# Aplica as correções mais recentes identificadas

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔧 CORREÇÃO RÁPIDA KRYONIX - Docker Build${NC}"
echo "=============================================="

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: package.json não encontrado!${NC}"
    echo "Execute este script no diretório do projeto KRYONIX (/opt/kryonix-plataform)"
    exit 1
fi

echo -e "\n${YELLOW}1. Corrigindo package.json para Docker build:${NC}"

# Backup do package.json
cp package.json package.json.backup-$(date +%s)
echo -e "   ✅ Backup criado"

# Aplicar correção do postinstall
cat > /tmp/fix-postinstall.js << 'EOF'
const fs = require('fs');
console.log('🔧 Aplicando correção no package.json...');

try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Corrigir postinstall para ser compatível com Docker build
    if (pkg.scripts && pkg.scripts.postinstall === 'npm run check-deps') {
        pkg.scripts.postinstall = 'node -e "try { require(\'./check-dependencies.js\'); } catch(e) { console.log(\'⚠️ check-dependencies.js não encontrado durante build, continuando...\'); }"';
        console.log('✅ postinstall corrigido');
    }
    
    // Salvar arquivo corrigido
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    console.log('✅ package.json atualizado com sucesso');
    
} catch (error) {
    console.error('❌ Erro na correção:', error.message);
    process.exit(1);
}
EOF

node /tmp/fix-postinstall.js
rm -f /tmp/fix-postinstall.js

echo -e "\n${YELLOW}2. Verificando arquivos de dependências:${NC}"

# Verificar se arquivos de dependências existem
deps_files=("check-dependencies.js" "validate-dependencies.js" "fix-dependencies.js")
for file in "${deps_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "   ✅ $file existe"
    else
        echo -e "   ❌ $file faltando - criando..."
        case $file in
            "check-dependencies.js")
                cat > "$file" << 'EOF'
#!/usr/bin/env node
console.log('🔍 KRYONIX - Verificando dependências críticas...');
const deps = ['next', 'react', 'react-dom', 'express', 'cors', 'helmet', 'body-parser', 'morgan'];
let missing = [];
deps.forEach(dep => {
    try {
        require(dep);
        console.log('✅ ' + dep + ': OK');
    } catch(e) {
        console.error('❌ ' + dep + ': FALTANDO');
        missing.push(dep);
    }
});
if (missing.length === 0) {
    console.log('🎉 Todas as dependências críticas instaladas!');
    process.exit(0);
} else {
    console.error('❌ Dependências faltando: ' + missing.join(', '));
    process.exit(1);
}
EOF
                ;;
            "validate-dependencies.js")
                cat > "$file" << 'EOF'
#!/usr/bin/env node
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const deps = Object.keys(pkg.dependencies);
console.log('📦 Validando ' + deps.length + ' dependências...');
let installed = 0;
deps.forEach(dep => {
    try {
        require.resolve(dep);
        installed++;
    } catch(e) {
        console.error('❌ Falta: ' + dep);
    }
});
console.log('✅ Instaladas: ' + installed + '/' + deps.length);
if (installed !== deps.length) {
    process.exit(1);
}
EOF
                ;;
            "fix-dependencies.js")
                cat > "$file" << 'EOF'
#!/usr/bin/env node
console.log('🔧 KRYONIX - Corrigindo dependências...');
const { exec } = require('child_process');
exec('npm install --no-audit --no-fund', (error, stdout, stderr) => {
    if (error) {
        console.error('❌ Erro na correção:', error.message);
        process.exit(1);
    }
    console.log('✅ Dependências corrigidas');
    console.log(stdout);
});
EOF
                ;;
        esac
        echo -e "   ✅ $file criado"
    fi
done

echo -e "\n${YELLOW}3. Testando Docker build:${NC}"

# Fazer backup da imagem atual se existir
if docker images | grep -q "kryonix-plataforma"; then
    echo -e "   📦 Fazendo backup da imagem atual..."
    docker tag kryonix-plataforma:latest kryonix-plataforma:backup-$(date +%s) 2>/dev/null || true
fi

# Tentar build
echo -e "   🏗️ Iniciando build..."
if docker build --no-cache -t kryonix-plataforma:latest . 2>&1 | tee build-correcao.log; then
    echo -e "\n${GREEN}✅ BUILD SUCESSO!${NC}"
    
    # Verificar se a imagem foi criada
    if docker images | grep -q "kryonix-plataforma.*latest"; then
        echo -e "✅ Imagem criada com sucesso:"
        docker images | grep kryonix-plataforma | head -2
        
        # Tag com timestamp
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        docker tag kryonix-plataforma:latest kryonix-plataforma:$TIMESTAMP
        echo -e "✅ Tag criada: kryonix-plataforma:$TIMESTAMP"
    fi
    
else
    echo -e "\n${RED}❌ BUILD AINDA FALHA!${NC}"
    echo -e "\n${YELLOW}📋 Últimas linhas do erro:${NC}"
    tail -20 build-correcao.log
    
    echo -e "\n${YELLOW}💡 Próximos passos:${NC}"
    echo -e "1. Verificar logs completos: cat build-correcao.log"
    echo -e "2. Executar instalador completo novamente"
    echo -e "3. Verificar se todas as dependências estão instaladas localmente"
    
    exit 1
fi

echo -e "\n${YELLOW}4. Limpeza:${NC}"
rm -f build-correcao.log

echo -e "\n${GREEN}🎉 CORREÇÃO CONCLUÍDA COM SUCESSO!${NC}"
echo -e "Agora você pode executar o deploy:"
echo -e "   docker stack deploy -c docker-stack.yml Kryonix"
