#!/usr/bin/env node

/**
 * 🔍 KRYONIX - Validador Completo de Dependências
 * 
 * Validação avançada para garantir que todas as dependências estão funcionais
 * e compatíveis com a plataforma KRYONIX
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 KRYONIX - Validação Completa de Dependências');
console.log('=' .repeat(60));

let errorCount = 0;
let successCount = 0;

function logError(message) {
    console.error(`❌ ${message}`);
    errorCount++;
}

function logSuccess(message) {
    console.log(`✅ ${message}`);
    successCount++;
}

function logInfo(message) {
    console.log(`📋 ${message}`);
}

// 1. Verificar ambiente Node.js
logInfo('Verificando ambiente Node.js...');
const nodeVersion = process.version;
const npmVersion = process.env.npm_version || 'unknown';

logInfo(`Node.js: ${nodeVersion}`);
logInfo(`npm: ${npmVersion}`);
logInfo(`Plataforma: ${process.platform}`);
logInfo(`Arquitetura: ${process.arch}`);

// Verificar versão do Node.js
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
if (majorVersion >= 18) {
    logSuccess('Versão do Node.js compatível');
} else {
    logError(`Versão do Node.js ${nodeVersion} não suportada. Necessário Node.js 18+`);
}

// 2. Verificar package.json
logInfo('Verificando package.json...');
if (!fs.existsSync('package.json')) {
    logError('package.json não encontrado!');
    process.exit(1);
}

let packageData;
try {
    packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    logSuccess('package.json válido');
} catch (e) {
    logError(`Erro ao ler package.json: ${e.message}`);
    process.exit(1);
}

// 3. Verificar estrutura do projeto
logInfo('Verificando estrutura do projeto...');

const requiredDirs = ['app', 'lib', 'public'];
const requiredFiles = ['server.js', 'next.config.js', 'tailwind.config.js'];

requiredDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        logSuccess(`Diretório ${dir}/ encontrado`);
    } else {
        logError(`Diretório ${dir}/ não encontrado`);
    }
});

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        logSuccess(`Arquivo ${file} encontrado`);
    } else {
        logError(`Arquivo ${file} não encontrado`);
    }
});

// 4. Verificar node_modules
logInfo('Verificando node_modules...');
const nodeModulesPath = './node_modules';
if (!fs.existsSync(nodeModulesPath)) {
    logError('Pasta node_modules não encontrada!');
    logError('Execute: npm install');
    process.exit(1);
}

let moduleCount = 0;
try {
    moduleCount = fs.readdirSync(nodeModulesPath).length;
    logSuccess(`node_modules com ${moduleCount} módulos`);
} catch (e) {
    logError('Erro ao acessar node_modules');
}

// 5. Verificar todas as dependências
logInfo('Verificando todas as dependências...');

const allDeps = {
    ...packageData.dependencies || {},
    ...packageData.devDependencies || {}
};

const totalDeps = Object.keys(allDeps).length;
let installedCount = 0;
let missingDeps = [];

Object.keys(allDeps).forEach(dep => {
    try {
        require.resolve(dep);
        installedCount++;
    } catch (e) {
        missingDeps.push(dep);
    }
});

if (missingDeps.length === 0) {
    logSuccess(`Todas as ${totalDeps} dependências instaladas`);
} else {
    logError(`${missingDeps.length} dependências faltando: ${missingDeps.join(', ')}`);
}

// 6. Verificar dependências críticas especificamente
logInfo('Verificando dependências críticas...');

const criticalDeps = {
    // Frontend Framework
    'next': 'Framework Next.js',
    'react': 'Biblioteca React',
    'react-dom': 'React DOM',
    
    // Backend Core
    'express': 'Servidor Express',
    'cors': 'CORS middleware',
    'helmet': 'Segurança HTTP',
    'body-parser': 'Parser de body',
    'morgan': 'Logger HTTP',
    
    // Database & Auth
    'pg': 'PostgreSQL driver',
    'bcryptjs': 'Hash de senhas',
    'jsonwebtoken': 'JWT tokens',
    'ioredis': 'Redis client',
    
    // External Services
    'aws-sdk': 'AWS SDK',
    'socket.io': 'WebSocket',
    'axios': 'HTTP client',
    'dotenv': 'Variáveis de ambiente',
    
    // Utilities
    'multer': 'Upload de arquivos',
    'node-cron': 'Agendamento',
    'ws': 'WebSocket nativo'
};

let criticalMissing = [];

Object.entries(criticalDeps).forEach(([dep, description]) => {
    try {
        require.resolve(dep);
        logSuccess(`${dep}: ${description}`);
    } catch (e) {
        logError(`${dep}: ${description} - FALTANDO`);
        criticalMissing.push(dep);
    }
});

// 7. Verificar scripts npm
logInfo('Verificando scripts npm...');

const requiredScripts = ['dev', 'build', 'start', 'check-deps'];
requiredScripts.forEach(script => {
    if (packageData.scripts && packageData.scripts[script]) {
        logSuccess(`Script '${script}' configurado`);
    } else {
        logError(`Script '${script}' não encontrado`);
    }
});

// 8. Resumo final
console.log('\n' + '='.repeat(60));
console.log('📊 RESUMO DA VALIDAÇÃO');
console.log('='.repeat(60));

console.log(`✅ Sucessos: ${successCount}`);
console.log(`❌ Erros: ${errorCount}`);
console.log(`📦 Dependências instaladas: ${installedCount}/${totalDeps}`);

if (criticalMissing.length > 0) {
    console.log(`🚨 Dependências críticas faltando: ${criticalMissing.length}`);
    console.log(`   ${criticalMissing.join(', ')}`);
}

console.log(`📁 Módulos no node_modules: ${moduleCount}`);
console.log(`🔧 Node.js: ${nodeVersion}`);
console.log(`📋 package.json: válido`);

// Resultado final
if (errorCount === 0 && criticalMissing.length === 0) {
    console.log('\n🎉 VALIDAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('✅ Todas as dependências estão funcionais');
    console.log('✅ Projeto pronto para execução');
    process.exit(0);
} else {
    console.log('\n🚨 VALIDAÇÃO FALHOU!');
    console.log('❌ Existem problemas que precisam ser corrigidos');
    
    if (criticalMissing.length > 0) {
        console.log('\n🔧 AÇÕES RECOMENDADAS:');
        console.log('1. Execute: npm install');
        console.log('2. Execute: npm install --force');
        console.log('3. Verifique versões do Node.js e npm');
        console.log('4. Limpe cache: npm cache clean --force');
    }
    
    process.exit(1);
}
