#!/usr/bin/env node

/**
 * 🔧 KRYONIX - Corretor Automático de Dependências
 * 
 * Script para corrigir automaticamente problemas de dependências
 * em diferentes ambientes (Builder.io, Vultr, etc.)
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 KRYONIX - Corretor Automático de Dependências');
console.log('='.repeat(60));

function runCommand(command, description) {
    console.log(`📋 ${description}...`);
    try {
        const output = execSync(command, { 
            encoding: 'utf8', 
            stdio: 'pipe',
            timeout: 120000 // 2 minutos timeout
        });
        console.log(`✅ ${description} - Sucesso`);
        return { success: true, output };
    } catch (error) {
        console.error(`❌ ${description} - Falha:`, error.message);
        return { success: false, error: error.message };
    }
}

function checkNodeModules() {
    if (!fs.existsSync('./node_modules')) {
        console.log('📁 node_modules não encontrado, será criado durante a instalação');
        return false;
    }
    
    try {
        const modules = fs.readdirSync('./node_modules');
        console.log(`📁 node_modules encontrado com ${modules.length} módulos`);
        return true;
    } catch (e) {
        console.error('❌ Erro ao acessar node_modules:', e.message);
        return false;
    }
}

function main() {
    console.log('🔍 Verificando estado atual...');
    
    // Verificar package.json
    if (!fs.existsSync('./package.json')) {
        console.error('❌ package.json não encontrado!');
        process.exit(1);
    }
    console.log('✅ package.json encontrado');
    
    // Verificar node_modules
    const hasNodeModules = checkNodeModules();
    
    // 1. Limpar cache npm
    console.log('\n🧹 Fase 1: Limpeza');
    runCommand('npm cache clean --force', 'Limpando cache npm');
    
    // 2. Remover node_modules se houver problemas
    if (hasNodeModules) {
        console.log('🗑️ Removendo node_modules para instalação limpa...');
        try {
            execSync('rm -rf node_modules package-lock.json', { stdio: 'inherit' });
            console.log('✅ node_modules removido');
        } catch (e) {
            console.log('⚠️ Não foi possível remover node_modules automaticamente');
        }
    }
    
    // 3. Instalar dependências
    console.log('\n📦 Fase 2: Instalação');
    const installResult = runCommand('npm install --no-audit --no-fund', 'Instalando dependências');
    
    if (!installResult.success) {
        console.log('🔄 Tentando instalação forçada...');
        runCommand('npm install --force --no-audit --no-fund', 'Instalação forçada');
    }
    
    // 4. Verificar dependências críticas
    console.log('\n🔍 Fase 3: Verificação');
    
    const criticalDeps = [
        'next', 'react', 'react-dom', 'express', 'cors', 'helmet',
        'body-parser', 'morgan', 'pg', 'bcryptjs', 'jsonwebtoken'
    ];
    
    let allOk = true;
    criticalDeps.forEach(dep => {
        try {
            require.resolve(dep);
            console.log(`✅ ${dep}: OK`);
        } catch (e) {
            console.error(`❌ ${dep}: FALTANDO`);
            allOk = false;
        }
    });
    
    // 5. Resultado final
    console.log('\n' + '='.repeat(60));
    if (allOk) {
        console.log('🎉 CORREÇÃO CONCLUÍDA COM SUCESSO!');
        console.log('✅ Todas as dependências críticas estão funcionais');
        console.log('✅ Projeto pronto para o instalador');
        console.log('\n📋 Próximos passos no instalador:');
        console.log('   - npm install (será executado rapidamente)');
        console.log('   - npm run check-deps (passará na verificação)');
        console.log('   - Continuará para as próximas etapas');
        process.exit(0);
    } else {
        console.log('🚨 CORREÇÃO PARCIAL');
        console.log('❌ Algumas dependências ainda estão com problemas');
        console.log('\n🔧 Ações manuais necessárias:');
        console.log('   1. Verifique a conectividade de rede');
        console.log('   2. Verifique versões Node.js/npm');
        console.log('   3. Execute: npm install --legacy-peer-deps');
        process.exit(1);
    }
}

// Executar correção
main();
