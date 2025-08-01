#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 KRYONIX - Verificador de Dependências\n');

// Check if package.json exists
if (!fs.existsSync('package.json')) {
    console.error('❌ package.json não encontrado!');
    process.exit(1);
}

// Read package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log(`📦 Projeto: ${packageJson.name} v${packageJson.version}`);

// Get dependencies
const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
};

const criticalDeps = [
    'next',
    'react', 
    'react-dom',
    'express',
    'cors',
    'helmet',
    'body-parser',
    'morgan'
];

console.log(`\n📋 Total de dependências declaradas: ${Object.keys(dependencies).length}`);

// Check node_modules
if (!fs.existsSync('node_modules')) {
    console.error('❌ Diretório node_modules não encontrado!');
    console.log('💡 Execute: npm install');
    process.exit(1);
}

console.log('✅ Diretório node_modules encontrado');

// Check critical dependencies
console.log('\n🎯 Verificando dependências críticas:');
let missingCritical = [];

criticalDeps.forEach(dep => {
    const depPath = path.join('node_modules', dep);
    if (fs.existsSync(depPath)) {
        // Try to get version
        try {
            const depPackageJson = JSON.parse(fs.readFileSync(path.join(depPath, 'package.json'), 'utf8'));
            console.log(`   ✅ ${dep}: v${depPackageJson.version}`);
        } catch {
            console.log(`   ✅ ${dep}: OK`);
        }
    } else {
        console.log(`   ❌ ${dep}: FALTANDO`);
        missingCritical.push(dep);
    }
});

// Check all dependencies
console.log('\n📊 Verificando todas as dependências:');
let missingAll = [];
let installedCount = 0;

Object.keys(dependencies).forEach(dep => {
    const depPath = path.join('node_modules', dep);
    if (fs.existsSync(depPath)) {
        installedCount++;
    } else {
        missingAll.push(dep);
    }
});

console.log(`   ✅ Instaladas: ${installedCount}/${Object.keys(dependencies).length}`);
if (missingAll.length > 0) {
    console.log(`   ❌ Faltando: ${missingAll.length}`);
    console.log(`      ${missingAll.join(', ')}`);
}

// Final result
console.log('\n' + '='.repeat(50));
if (missingCritical.length === 0 && missingAll.length === 0) {
    console.log('🎉 SUCESSO: Todas as dependências estão instaladas!');
    process.exit(0);
} else if (missingCritical.length === 0) {
    console.log('⚠️ AVISO: Dependências críticas OK, mas algumas opcionais faltando');
    console.log(`💡 Execute: npm install ${missingAll.join(' ')}`);
    process.exit(0);
} else {
    console.log(`❌ ERRO: ${missingCritical.length} dependências críticas faltando!`);
    console.log(`💡 Execute: npm install ${missingCritical.join(' ')}`);
    process.exit(1);
}
