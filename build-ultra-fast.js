#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 KRYONIX - Build Ultra-Rápido Iniciado');

// Otimizações de ambiente para build mais rápido
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NODE_ENV = 'production';
process.env.NODE_OPTIONS = '--max-old-space-size=4096';

// Configurações para build mais rápido
const buildConfig = {
  // Disable verificações demoradas
  skipTypeCheck: true,
  skipLint: true,
  skipSourceMaps: true,
  // Otimizações de webpack
  minify: false, // Disable minificação para build mais rápido
  compress: false,
};

console.log('⚡ Configurações de build otimizadas aplicadas');

try {
  // 1. Limpar cache anterior se existe
  if (fs.existsSync('.next')) {
    console.log('🧹 Limpando cache anterior...');
    execSync('rm -rf .next', { stdio: 'inherit' });
  }

  // 2. Build Next.js com otimizações máximas
  console.log('🔨 Executando build Next.js ultra-rápido...');
  
  const buildCommand = [
    'npx next build',
    '--no-lint',
    '--experimental-build-mode=compile',
  ].join(' ');

  const startTime = Date.now();
  execSync(buildCommand, { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: '1',
      NODE_ENV: 'production',
      // Desabilitar análises demoradas
      ANALYZE: 'false',
      // Webpack optimizations
      WEBPACK_DISABLE_SOURCE_MAPS: 'true',
    }
  });
  
  const buildTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✅ Build concluído em ${buildTime}s`);

  // 3. Verificar se build foi bem-sucedido
  if (fs.existsSync('.next/standalone')) {
    console.log('✅ Build standalone criado com sucesso');
  }

  console.log('🎉 Build ultra-rápido concluído com sucesso!');
  
} catch (error) {
  console.error('❌ Erro no build ultra-rápido:', error.message);
  process.exit(1);
}
