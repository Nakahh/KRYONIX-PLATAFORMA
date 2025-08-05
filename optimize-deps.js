#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 KRYONIX - Otimizando dependências para build mais rápido');

try {
  // 1. Ler package.json atual
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // 2. Separar dependências críticas das opcionais
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

  // 3. Verificar se dependências críticas estão instaladas
  const missingCritical = criticalDeps.filter(dep => {
    try {
      require.resolve(dep);
      return false;
    } catch {
      return true;
    }
  });

  if (missingCritical.length > 0) {
    console.log('📦 Instalando dependências críticas:', missingCritical.join(', '));
    execSync(`npm install ${missingCritical.join(' ')} --save`, { stdio: 'inherit' });
  }

  // 4. Limpar cache npm para otimizar
  console.log('🧹 Limpando cache npm...');
  execSync('npm cache clean --force', { stdio: 'inherit' });

  // 5. Verificar node_modules
  if (fs.existsSync('node_modules')) {
    console.log('✅ node_modules verificado');
  } else {
    console.log('📦 Instalando todas as dependências...');
    execSync('npm ci --prefer-offline || npm install --prefer-offline', { stdio: 'inherit' });
  }

  console.log('✅ Otimização de dependências concluída!');

} catch (error) {
  console.error('❌ Erro na otimização:', error.message);
  // Fallback: instalação simples
  try {
    console.log('🔄 Tentando instalação de fallback...');
    execSync('npm install', { stdio: 'inherit' });
  } catch (fallbackError) {
    console.error('❌ Erro no fallback:', fallbackError.message);
    process.exit(1);
  }
}
