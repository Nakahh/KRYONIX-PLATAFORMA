#!/usr/bin/env node

/**
 * Script de Instalação Automática dos Modelos Ollama para KRYONIX
 *
 * Este script baixa e configura automaticamente todas as IAs do mercado
 * disponíveis no Ollama para uso no projeto KRYONIX.
 *
 * Uso:
 * node scripts/setup-ollama-models.js [categoria]
 *
 * Categorias disponíveis:
 * - essential: Modelos essenciais (padrão)
 * - lightweight: Modelos leves para produção
 * - coding: Modelos especializados em programação
 * - conversational: Modelos para conversação
 * - enterprise: Modelos enterprise (grandes)
 * - all: Todos os modelos disponíveis (CUIDADO!)
 */

const { exec } = require("child_process");
const { promisify } = require("util");
const fs = require("fs").promises;
const path = require("path");

const execAsync = promisify(exec);

// Configuração
const OLLAMA_URL =
  process.env.OLLAMA_API_URL || "https://apiollama.kryonix.com.br";
const LOG_FILE = path.join(process.cwd(), "ollama-setup.log");

// Modelos organizados por categoria
const MODEL_CATEGORIES = {
  essential: [
    "llama2:7b", // Conversação geral - 3.8GB
    "codellama:7b", // Programação - 3.8GB
    "mistral:7b", // Multilingual - 4.1GB
    "orca-mini:3b", // Leve para edge - 1.9GB
    "phi:2.7b", // Matemática/raciocínio - 1.6GB
    "gemma:2b", // Google lightweight - 1.4GB
  ],

  lightweight: [
    "orca-mini:3b", // 1.9GB
    "phi:2.7b", // 1.6GB
    "gemma:2b", // 1.4GB
    "alpaca:7b", // 3.8GB
  ],

  coding: [
    "codellama:7b", // 3.8GB
    "codellama:13b", // 7.3GB
    "codellama:34b", // 19GB
    "dolphin-mixtral:8x7b", // 26GB (uncensored coding)
  ],

  conversational: [
    "llama2:7b", // 3.8GB
    "llama2:13b", // 7.3GB
    "vicuna:7b", // 3.8GB
    "vicuna:13b", // 7.3GB
    "zephyr:7b", // 4.1GB
  ],

  multilingual: [
    "mistral:7b", // 4.1GB
    "mixtral:8x7b", // 26GB
    "neural-chat:7b", // 4.1GB
  ],

  enterprise: [
    "llama2:70b", // 39GB
    "mixtral:8x7b", // 26GB
    "codellama:34b", // 19GB
    "dolphin-mixtral:8x7b", // 26GB
  ],

  all: [
    // Todos os modelos listados acima
    "llama2:7b",
    "llama2:13b",
    "llama2:70b",
    "codellama:7b",
    "codellama:13b",
    "codellama:34b",
    "mistral:7b",
    "mixtral:8x7b",
    "orca-mini:3b",
    "orca-mini:7b",
    "vicuna:7b",
    "vicuna:13b",
    "alpaca:7b",
    "neural-chat:7b",
    "dolphin-mixtral:8x7b",
    "openhermes:7b",
    "phi:2.7b",
    "zephyr:7b",
    "gemma:2b",
    "gemma:7b",
  ],
};

// Informações detalhadas dos modelos
const MODEL_INFO = {
  "llama2:7b": { size: "3.8GB", desc: "LLaMA 2 7B - Modelo base da Meta" },
  "llama2:13b": { size: "7.3GB", desc: "LLaMA 2 13B - Modelo médio" },
  "llama2:70b": { size: "39GB", desc: "LLaMA 2 70B - Modelo grande" },
  "codellama:7b": { size: "3.8GB", desc: "Code Llama 7B - Programação" },
  "codellama:13b": {
    size: "7.3GB",
    desc: "Code Llama 13B - Programação avançada",
  },
  "codellama:34b": {
    size: "19GB",
    desc: "Code Llama 34B - Programação expert",
  },
  "mistral:7b": { size: "4.1GB", desc: "Mistral 7B - Modelo europeu" },
  "mixtral:8x7b": { size: "26GB", desc: "Mixtral 8x7B - Mixture of Experts" },
  "orca-mini:3b": { size: "1.9GB", desc: "Orca Mini 3B - Leve e eficiente" },
  "orca-mini:7b": { size: "3.8GB", desc: "Orca Mini 7B - Balanced" },
  "vicuna:7b": { size: "3.8GB", desc: "Vicuna 7B - Conversacional" },
  "vicuna:13b": { size: "7.3GB", desc: "Vicuna 13B - Conversação expert" },
  "alpaca:7b": { size: "3.8GB", desc: "Alpaca 7B - Stanford instruído" },
  "neural-chat:7b": { size: "4.1GB", desc: "Neural Chat 7B - Intel optimized" },
  "dolphin-mixtral:8x7b": {
    size: "26GB",
    desc: "Dolphin Mixtral - Uncensored",
  },
  "openhermes:7b": {
    size: "3.8GB",
    desc: "OpenHermes 7B - Instruction following",
  },
  "phi:2.7b": {
    size: "1.6GB",
    desc: "Phi 2.7B - Microsoft small but powerful",
  },
  "zephyr:7b": { size: "4.1GB", desc: "Zephyr 7B - Hugging Face tuned" },
  "gemma:2b": { size: "1.4GB", desc: "Gemma 2B - Google lightweight" },
  "gemma:7b": { size: "4.8GB", desc: "Gemma 7B - Google medium" },
};

// Utilitários
async function log(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;

  console.log(message);
  await fs.appendFile(LOG_FILE, logEntry).catch(() => {});
}

async function checkOllamaRunning() {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function getInstalledModels() {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    const data = await response.json();
    return data.models ? data.models.map((m) => m.name) : [];
  } catch (error) {
    return [];
  }
}

async function installModel(modelName) {
  const info = MODEL_INFO[modelName];
  await log(
    `📦 Instalando ${modelName} (${info?.size || "Tamanho desconhecido"})...`,
  );
  await log(`    ${info?.desc || "Modelo de IA"}`);

  try {
    const startTime = Date.now();

    // Pull do modelo via API
    const response = await fetch(`${OLLAMA_URL}/api/pull`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: modelName,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    const duration = Math.round((Date.now() - startTime) / 1000);

    await log(`✅ ${modelName} instalado com sucesso! (${duration}s)`);
    return true;
  } catch (error) {
    await log(`❌ Erro ao instalar ${modelName}: ${error.message}`);
    return false;
  }
}

async function testModel(modelName) {
  try {
    await log(`🧪 Testando ${modelName}...`);

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelName,
        prompt: "Responda em português: Como você está funcionando?",
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    await log(`✅ ${modelName} funcionando corretamente!`);
    await log(`    Resposta: ${result.response?.substring(0, 100)}...`);
    return true;
  } catch (error) {
    await log(`❌ Erro ao testar ${modelName}: ${error.message}`);
    return false;
  }
}

async function calculateTotalSize(models) {
  let totalGB = 0;
  models.forEach((model) => {
    const info = MODEL_INFO[model];
    if (info && info.size) {
      const sizeNum = parseFloat(info.size.replace("GB", ""));
      totalGB += sizeNum;
    }
  });
  return totalGB;
}

async function main() {
  const category = process.argv[2] || "essential";

  await log("🚀 KRYONIX Ollama Models Setup");
  await log("=".repeat(50));

  // Verificar se Ollama está rodando
  await log("🔍 Verificando conexão com Ollama...");
  if (!(await checkOllamaRunning())) {
    await log("❌ Ollama não está rodando ou não está acessível!");
    await log(`   URL configurada: ${OLLAMA_URL}`);
    await log("   Verifique se o Ollama está instalado e rodando.");
    process.exit(1);
  }
  await log("✅ Ollama está funcionando!");

  // Verificar categoria
  if (!MODEL_CATEGORIES[category]) {
    await log(`❌ Categoria "${category}" não existe!`);
    await log("Categorias disponíveis:");
    for (const cat of Object.keys(MODEL_CATEGORIES)) {
      const models = MODEL_CATEGORIES[cat];
      const totalSize = models.reduce((sum, model) => {
        const info = MODEL_INFO[model];
        return sum + (info ? parseFloat(info.size.replace("GB", "")) : 0);
      }, 0);
      await log(
        `   ${cat}: ${models.length} modelos (~${totalSize.toFixed(1)}GB)`,
      );
    }
    process.exit(1);
  }

  const modelsToInstall = MODEL_CATEGORIES[category];
  const totalSize = await calculateTotalSize(modelsToInstall);

  await log(`📋 Categoria selecionada: ${category}`);
  await log(`📦 Modelos para instalar: ${modelsToInstall.length}`);
  await log(`💾 Espaço total estimado: ~${totalSize.toFixed(1)}GB`);

  // Verificar modelos já instalados
  const installedModels = await getInstalledModels();
  const toInstall = modelsToInstall.filter(
    (model) => !installedModels.includes(model),
  );
  const alreadyInstalled = modelsToInstall.filter((model) =>
    installedModels.includes(model),
  );

  if (alreadyInstalled.length > 0) {
    await log(`✅ Já instalados: ${alreadyInstalled.join(", ")}`);
  }

  if (toInstall.length === 0) {
    await log("🎉 Todos os modelos da categoria já estão instalados!");

    // Testar modelos
    await log("\n🧪 Testando modelos instalados...");
    for (const model of modelsToInstall) {
      await testModel(model);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Pausa entre testes
    }

    process.exit(0);
  }

  await log(`\n🔄 Modelos para instalar: ${toInstall.join(", ")}`);

  // Confirmação para categorias grandes
  if (category === "all" || category === "enterprise") {
    await log("⚠️  ATENÇÃO: Esta categoria usa muito espaço em disco!");
    await log("   Você tem certeza? (Ctrl+C para cancelar)");
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  // Instalar modelos
  await log("\n📥 Iniciando instalação dos modelos...");
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < toInstall.length; i++) {
    const model = toInstall[i];

    await log(`\n[${i + 1}/${toInstall.length}] Processando ${model}...`);

    const success = await installModel(model);
    if (success) {
      successCount++;

      // Testar modelo após instalação
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await testModel(model);
    } else {
      failCount++;
    }

    // Pausa entre instalações para não sobrecarregar
    if (i < toInstall.length - 1) {
      await log("⏳ Aguardando antes do próximo download...");
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  // Resumo final
  await log("\n" + "=".repeat(50));
  await log("📊 RESUMO DA INSTALAÇÃO");
  await log(`✅ Sucessos: ${successCount}`);
  await log(`❌ Falhas: ${failCount}`);
  await log(`📦 Total instalado: ${successCount}/${toInstall.length}`);

  if (successCount > 0) {
    await log("\n🎉 Modelos instalados com sucesso!");
    await log("💡 Para usar os modelos, acesse:");
    await log(`   - Interface Web: ${OLLAMA_URL}`);
    await log("   - API: POST /api/generate");
    await log("   - Painel KRYONIX: /ai/autonomous");
  }

  if (failCount > 0) {
    await log("\n⚠️  Alguns modelos falharam na instalação.");
    await log("   Verifique o log para mais detalhes.");
    await log("   Você pode tentar reinstalar individualmente.");
  }

  // Salvar configuração final
  try {
    const finalInstalledModels = await getInstalledModels();
    const config = {
      timestamp: new Date().toISOString(),
      category: category,
      requested: modelsToInstall,
      installed: finalInstalledModels,
      success: successCount,
      failed: failCount,
      totalSize: totalSize,
    };

    await fs.writeFile(
      path.join(process.cwd(), "ollama-installation-report.json"),
      JSON.stringify(config, null, 2),
    );

    await log("\n💾 Relatório salvo em: ollama-installation-report.json");
  } catch (error) {
    await log(`❌ Erro ao salvar relatório: ${error.message}`);
  }

  await log("\n🏁 Setup concluído!");
}

// Executar script
if (require.main === module) {
  main().catch(async (error) => {
    await log(`💥 Erro fatal: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  MODEL_CATEGORIES,
  MODEL_INFO,
  installModel,
  testModel,
  getInstalledModels,
};
