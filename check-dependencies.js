#!/usr/bin/env node

/**
 * 🔍 KRYONIX - Verificador de Dependências
 * 
 * Este arquivo garante que o instalador possa verificar as dependências
 * de forma consistente entre diferentes ambientes (Builder.io, Vultr, etc.)
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 KRYONIX - Verificando dependências críticas...');

// Dependências críticas que precisam estar disponíveis
const criticalDeps = [
    'next',
    'react', 
    'react-dom',
    'express',
    'cors',
    'helmet',
    'body-parser',
    'morgan',
    'multer',
    'pg',
    'bcryptjs',
    'jsonwebtoken',
    'ioredis',
    'aws-sdk',
    'socket.io',
    'node-cron',
    'axios',
    'dotenv',
    'ws'
];

let missingDeps = [];
let installedDeps = [];

// Verificar cada dependência crítica
criticalDeps.forEach(dep => {
    try {
        require.resolve(dep);
        console.log(`✅ ${dep}: OK`);
        installedDeps.push(dep);
    } catch (e) {
        console.error(`❌ ${dep}: FALTANDO`);
        missingDeps.push(dep);
    }
});

// Verificar se package.json existe
if (!fs.existsSync('package.json')) {
    console.error('❌ package.json não encontrado!');
    process.exit(1);
}

// Ler e validar package.json
let packageData;
try {
    packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
} catch (e) {
    console.error('❌ Erro ao ler package.json:', e.message);
    process.exit(1);
}

// Verificar se node_modules existe
const nodeModulesPath = './node_modules';
if (!fs.existsSync(nodeModulesPath)) {
    console.error('❌ Pasta node_modules não encontrada!');
    console.error('Execute: npm install');
    process.exit(1);
}

// Contar módulos instalados
let moduleCount = 0;
try {
    moduleCount = fs.readdirSync(nodeModulesPath).length;
    console.log(`📦 Módulos instalados: ${moduleCount}`);
} catch (e) {
    console.log('📦 Não foi possível contar módulos instalados');
}

// Verificar dependências do package.json
const allDeps = {
    ...packageData.dependencies || {},
    ...packageData.devDependencies || {}
};

const totalDeps = Object.keys(allDeps).length;
console.log(`📋 Total de dependências no package.json: ${totalDeps}`);

// Resultado final
if (missingDeps.length === 0) {
    console.log('🎉 Todas as dependências críticas instaladas!');
    console.log(`✅ Instaladas: ${installedDeps.length}/${criticalDeps.length}`);
    
    // Informações adicionais de sucesso
    console.log('📊 Resumo da verificação:');
    console.log(`   Dependências críticas: ${criticalDeps.length}`);
    console.log(`   Instaladas com sucesso: ${installedDeps.length}`);
    console.log(`   Módulos no node_modules: ${moduleCount}`);
    console.log(`   Package.json válido: ✅`);
    
    process.exit(0);
} else {
    console.error(`❌ Dependências faltando: ${missingDeps.join(', ')}`);
    console.error(`❌ Faltam: ${missingDeps.length}/${criticalDeps.length} dependências críticas`);
    
    // Sugestões de correção
    console.error('🔧 Sugestões de correção:');
    console.error('   1. Execute: npm install');
    console.error('   2. Execute: npm run validate-install');
    console.error('   3. Verifique se há erros de permissão');
    console.error('   4. Tente: npm install --force');
    
    process.exit(1);
}
