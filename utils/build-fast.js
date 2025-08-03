#!/usr/bin/env node

/**
 * KRYONIX - Build Rápido para Docker
 * Script otimizado que acelera o processo de build para deploy
 */

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 KRYONIX - Build Rápido Iniciado...')

// Configurar environment para build mais rápido
process.env.NODE_ENV = 'production'
process.env.NEXT_TELEMETRY_DISABLED = '1'
process.env.CI = '1'

// Verificar se os arquivos essenciais existem
const essentialFiles = [
  'package.json',
  'next.config.js', 
  'app/page.tsx',
  'app/layout.tsx'
]

console.log('🔍 Verificando arquivos essenciais...')
for (const file of essentialFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Arquivo essencial faltando: ${file}`)
    process.exit(1)
  }
}
console.log('✅ Todos os arquivos essenciais encontrados')

// Executar build do Next.js com otimizações
console.log('🏗️ Iniciando build otimizado do Next.js...')

const buildProcess = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: '--max-old-space-size=4096',
    NEXT_TELEMETRY_DISABLED: '1'
  }
})

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Build concluído com sucesso!')
    
    // Verificar se o build foi gerado corretamente
    const buildDir = path.join(process.cwd(), '.next')
    if (fs.existsSync(buildDir)) {
      console.log('✅ Diretório .next criado com sucesso')
      
      // Verificar se standalone foi gerado (necessário para Docker)
      const standalonePath = path.join(buildDir, 'standalone')
      if (fs.existsSync(standalonePath)) {
        console.log('✅ Build standalone gerado com sucesso')
      } else {
        console.log('⚠️ Build standalone não encontrado, mas o build principal está OK')
      }
      
      process.exit(0)
    } else {
      console.error('❌ Diretório .next não foi criado')
      process.exit(1)
    }
  } else {
    console.error(`❌ Build falhou com código: ${code}`)
    process.exit(code)
  }
})

buildProcess.on('error', (error) => {
  console.error('❌ Erro durante o build:', error)
  process.exit(1)
})
