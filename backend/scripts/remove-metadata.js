#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Padrões de metadados para remover
const metadataPatterns = [
  /\*Parte \d+ de \d+.*?\*/g,
  /\*Próxima Parte:.*?\*/g,
  /\*Próxima Atualização:.*?\*/g,
  /\*🏢 Arquitetura:.*?\*/g,
  /\*🔔 KRYONIX.*?\*/g,
  /\*📅 Parte.*?\*/g,
  /\*🔧 Agentes:.*?\*/g,
  /\*⏱️ Tempo Estimado:.*?\*/g,
  /\*🎯 Status:.*?\*/g,
  /\*Documentação criada por:.*?\*/g,
  /\*Data:.*?\*/g,
  /\*Versão:.*?\*/g,
  /\*Status: ✅.*?\*/g,
  /\*.*?de \d+.*?Platform.*?\*/g,
  /\*.*?KRYONIX.*?Atualizada.*?\*/g
];

// Padrão para encontrar seções de informações da parte
const infoSectionPattern = /Informações da Parte Número:\s*\d+\s*de\s*\d+\s*Fase:[^\n]*\n[^\n]*Tecnologias:[^\n]*\n[^\n]*Funcionalidades:[^\n]*/g;

function removeMetadata(content) {
  let cleanContent = content;
  
  // Remover padrões de metadados
  metadataPatterns.forEach(pattern => {
    cleanContent = cleanContent.replace(pattern, '');
  });
  
  // Remover seções de informações da parte
  cleanContent = cleanContent.replace(infoSectionPattern, '');
  
  // Limpar linhas vazias duplas no final
  cleanContent = cleanContent.replace(/\n\n+$/, '\n');
  
  return cleanContent;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const cleanContent = removeMetadata(content);
    
    if (content !== cleanContent) {
      fs.writeFileSync(filePath, cleanContent);
      console.log(`✅ Processado: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dir) {
  let processedCount = 0;
  
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        processedCount += processDirectory(filePath);
      } else if (file.endsWith('.md')) {
        if (processFile(filePath)) {
          processedCount++;
        }
      }
    });
  } catch (error) {
    console.error(`❌ Erro ao processar diretório ${dir}:`, error.message);
  }
  
  return processedCount;
}

// Executar script
console.log('🚀 Iniciando remoção de metadados...');

const dirs = [
  './Documentação',
  './Prompts-Externos-IA',
  './Archive'
];

let totalProcessed = 0;

dirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`\n📁 Processando diretório: ${dir}`);
    const count = processDirectory(dir);
    totalProcessed += count;
    console.log(`   Arquivos modificados: ${count}`);
  } else {
    console.log(`⚠️ Diretório não encontrado: ${dir}`);
  }
});

console.log(`\n✅ Concluído! Total de arquivos modificados: ${totalProcessed}`);
