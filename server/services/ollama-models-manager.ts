import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

interface OllamaModel {
  name: string;
  description: string;
  size: string;
  parameters: string;
  family: string;
  capabilities: string[];
  language: string[];
  useCase: string[];
  installed: boolean;
  downloading: boolean;
  error?: string;
}

export class OllamaModelsManager {
  private ollamaUrl: string;
  private installedModels: Set<string> = new Set();

  constructor() {
    this.ollamaUrl =
      process.env.OLLAMA_API_URL || "https://apiollama.kryonix.com.br";
  }

  // Lista completa de modelos disponíveis no mercado
  private readonly availableModels: OllamaModel[] = [
    // Modelos LLaMA 2 (Meta)
    {
      name: "llama2:7b",
      description:
        "LLaMA 2 7B - Modelo base da Meta, excelente para tarefas gerais",
      size: "3.8GB",
      parameters: "7B",
      family: "LLaMA",
      capabilities: ["chat", "completion", "reasoning"],
      language: ["pt", "en", "es", "fr"],
      useCase: ["conversational", "general", "business"],
      installed: false,
      downloading: false,
    },
    {
      name: "llama2:13b",
      description: "LLaMA 2 13B - Modelo médio com melhor performance",
      size: "7.3GB",
      parameters: "13B",
      family: "LLaMA",
      capabilities: ["chat", "completion", "reasoning", "analysis"],
      language: ["pt", "en", "es", "fr", "de"],
      useCase: ["conversational", "analysis", "business", "research"],
      installed: false,
      downloading: false,
    },
    {
      name: "llama2:70b",
      description: "LLaMA 2 70B - Modelo grande para tarefas complexas",
      size: "39GB",
      parameters: "70B",
      family: "LLaMA",
      capabilities: [
        "chat",
        "completion",
        "reasoning",
        "analysis",
        "complex-tasks",
      ],
      language: ["pt", "en", "es", "fr", "de", "it"],
      useCase: ["enterprise", "research", "complex-analysis", "expert-tasks"],
      installed: false,
      downloading: false,
    },

    // Modelos Code Llama (Programação)
    {
      name: "codellama:7b",
      description: "Code Llama 7B - Especializado em programação",
      size: "3.8GB",
      parameters: "7B",
      family: "Code LLaMA",
      capabilities: ["code-generation", "code-completion", "debugging"],
      language: [
        "python",
        "javascript",
        "typescript",
        "java",
        "cpp",
        "csharp",
        "php",
      ],
      useCase: ["development", "automation", "debugging", "refactoring"],
      installed: false,
      downloading: false,
    },
    {
      name: "codellama:13b",
      description: "Code Llama 13B - Programação avançada",
      size: "7.3GB",
      parameters: "13B",
      family: "Code LLaMA",
      capabilities: [
        "code-generation",
        "code-completion",
        "debugging",
        "architecture",
      ],
      language: [
        "python",
        "javascript",
        "typescript",
        "java",
        "cpp",
        "csharp",
        "php",
        "go",
        "rust",
      ],
      useCase: [
        "enterprise-dev",
        "complex-systems",
        "architecture",
        "optimization",
      ],
      installed: false,
      downloading: false,
    },
    {
      name: "codellama:34b",
      description: "Code Llama 34B - Programação expert",
      size: "19GB",
      parameters: "34B",
      family: "Code LLaMA",
      capabilities: [
        "code-generation",
        "code-completion",
        "debugging",
        "architecture",
        "optimization",
      ],
      language: [
        "python",
        "javascript",
        "typescript",
        "java",
        "cpp",
        "csharp",
        "php",
        "go",
        "rust",
        "kotlin",
      ],
      useCase: [
        "enterprise-dev",
        "complex-systems",
        "architecture",
        "optimization",
        "code-review",
      ],
      installed: false,
      downloading: false,
    },

    // Modelos Mistral (Mistral AI)
    {
      name: "mistral:7b",
      description: "Mistral 7B - Modelo europeu de alta qualidade",
      size: "4.1GB",
      parameters: "7B",
      family: "Mistral",
      capabilities: ["chat", "completion", "reasoning", "multilingual"],
      language: ["pt", "en", "fr", "es", "de", "it"],
      useCase: ["conversational", "business", "multilingual"],
      installed: false,
      downloading: false,
    },
    {
      name: "mixtral:8x7b",
      description: "Mixtral 8x7B - Mixture of Experts, performance superior",
      size: "26GB",
      parameters: "46.7B (8x7B MoE)",
      family: "Mistral",
      capabilities: [
        "chat",
        "completion",
        "reasoning",
        "analysis",
        "expert-level",
      ],
      language: ["pt", "en", "fr", "es", "de", "it", "nl"],
      useCase: [
        "enterprise",
        "research",
        "expert-analysis",
        "multilingual-business",
      ],
      installed: false,
      downloading: false,
    },

    // Modelos Orca (Microsoft)
    {
      name: "orca-mini:3b",
      description: "Orca Mini 3B - Modelo leve e eficiente",
      size: "1.9GB",
      parameters: "3B",
      family: "Orca",
      capabilities: ["chat", "completion", "reasoning"],
      language: ["pt", "en", "es"],
      useCase: ["lightweight", "mobile", "edge-computing"],
      installed: false,
      downloading: false,
    },
    {
      name: "orca-mini:7b",
      description: "Orca Mini 7B - Equilibrio entre tamanho e performance",
      size: "3.8GB",
      parameters: "7B",
      family: "Orca",
      capabilities: ["chat", "completion", "reasoning", "analysis"],
      language: ["pt", "en", "es", "fr"],
      useCase: ["general", "business", "analysis"],
      installed: false,
      downloading: false,
    },

    // Modelos Vicuna (LMSYS)
    {
      name: "vicuna:7b",
      description: "Vicuna 7B - Modelo conversacional avançado",
      size: "3.8GB",
      parameters: "7B",
      family: "Vicuna",
      capabilities: ["chat", "conversation", "roleplay"],
      language: ["pt", "en", "es", "fr"],
      useCase: ["conversational", "customer-service", "support"],
      installed: false,
      downloading: false,
    },
    {
      name: "vicuna:13b",
      description: "Vicuna 13B - Conversação expert",
      size: "7.3GB",
      parameters: "13B",
      family: "Vicuna",
      capabilities: [
        "chat",
        "conversation",
        "roleplay",
        "emotional-intelligence",
      ],
      language: ["pt", "en", "es", "fr", "de"],
      useCase: ["advanced-chat", "therapy", "coaching", "customer-success"],
      installed: false,
      downloading: false,
    },

    // Modelos Alpaca (Stanford)
    {
      name: "alpaca:7b",
      description: "Alpaca 7B - Modelo instruído da Stanford",
      size: "3.8GB",
      parameters: "7B",
      family: "Alpaca",
      capabilities: ["instruction-following", "chat", "completion"],
      language: ["pt", "en", "es"],
      useCase: ["instruction-following", "educational", "training"],
      installed: false,
      downloading: false,
    },

    // Modelos Neural Chat (Intel)
    {
      name: "neural-chat:7b",
      description: "Neural Chat 7B - Otimizado para Intel",
      size: "4.1GB",
      parameters: "7B",
      family: "Neural Chat",
      capabilities: ["chat", "completion", "optimized-inference"],
      language: ["pt", "en", "es", "fr"],
      useCase: ["intel-hardware", "optimized-performance", "enterprise"],
      installed: false,
      downloading: false,
    },

    // Modelos Dolphin (Cognitive Computations)
    {
      name: "dolphin-mixtral:8x7b",
      description: "Dolphin Mixtral 8x7B - Uncensored e versátil",
      size: "26GB",
      parameters: "46.7B (8x7B MoE)",
      family: "Dolphin",
      capabilities: ["uncensored", "creative", "problem-solving", "coding"],
      language: ["pt", "en", "es", "fr", "de"],
      useCase: [
        "creative-writing",
        "research",
        "uncensored-analysis",
        "coding",
      ],
      installed: false,
      downloading: false,
    },

    // Modelos OpenHermes (Teknium)
    {
      name: "openhermes:7b",
      description: "OpenHermes 7B - Modelo seguidor de instruções",
      size: "3.8GB",
      parameters: "7B",
      family: "OpenHermes",
      capabilities: ["instruction-following", "chat", "reasoning"],
      language: ["pt", "en", "es", "fr"],
      useCase: ["assistant", "task-completion", "instruction-following"],
      installed: false,
      downloading: false,
    },

    // Modelos Phi (Microsoft)
    {
      name: "phi:2.7b",
      description: "Phi 2.7B - Modelo pequeno mas poderoso da Microsoft",
      size: "1.6GB",
      parameters: "2.7B",
      family: "Phi",
      capabilities: ["reasoning", "math", "coding", "efficiency"],
      language: ["en", "pt"],
      useCase: ["education", "math", "coding", "lightweight"],
      installed: false,
      downloading: false,
    },

    // Modelos Zephyr (Hugging Face)
    {
      name: "zephyr:7b",
      description: "Zephyr 7B - Modelo ajustado da Hugging Face",
      size: "4.1GB",
      parameters: "7B",
      family: "Zephyr",
      capabilities: ["chat", "helpful", "harmless", "honest"],
      language: ["pt", "en", "es", "fr"],
      useCase: ["helpful-assistant", "educational", "safe-interactions"],
      installed: false,
      downloading: false,
    },

    // Modelos Gemma (Google)
    {
      name: "gemma:2b",
      description: "Gemma 2B - Modelo leve do Google",
      size: "1.4GB",
      parameters: "2B",
      family: "Gemma",
      capabilities: ["chat", "completion", "efficiency"],
      language: ["pt", "en", "es"],
      useCase: ["lightweight", "mobile", "edge"],
      installed: false,
      downloading: false,
    },
    {
      name: "gemma:7b",
      description: "Gemma 7B - Modelo médio do Google",
      size: "4.8GB",
      parameters: "7B",
      family: "Gemma",
      capabilities: ["chat", "completion", "reasoning", "safety"],
      language: ["pt", "en", "es", "fr", "de"],
      useCase: ["general", "business", "safe-ai"],
      installed: false,
      downloading: false,
    },
  ];

  // Verificar modelos instalados
  async checkInstalledModels(): Promise<void> {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/tags`);
      const data = await response.json();

      this.installedModels.clear();
      if (data.models) {
        data.models.forEach((model: any) => {
          this.installedModels.add(model.name);
        });
      }

      // Atualizar status dos modelos
      this.availableModels.forEach((model) => {
        model.installed = this.installedModels.has(model.name);
      });
    } catch (error) {
      console.error("Erro ao verificar modelos instalados:", error);
    }
  }

  // Instalar modelo específico
  async installModel(modelName: string): Promise<void> {
    const model = this.availableModels.find((m) => m.name === modelName);
    if (!model) {
      throw new Error(`Modelo ${modelName} não encontrado`);
    }

    try {
      model.downloading = true;
      model.error = undefined;

      console.log(`🤖 Iniciando download do modelo ${modelName}...`);

      // Pull do modelo via API
      const response = await fetch(`${this.ollamaUrl}/api/pull`, {
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
        throw new Error(`Falha ao baixar modelo: ${response.statusText}`);
      }

      model.installed = true;
      model.downloading = false;
      this.installedModels.add(modelName);

      console.log(`✅ Modelo ${modelName} instalado com sucesso!`);
    } catch (error) {
      model.downloading = false;
      model.error =
        error instanceof Error ? error.message : "Erro desconhecido";
      console.error(`❌ Erro ao instalar modelo ${modelName}:`, error);
      throw error;
    }
  }

  // Instalar modelos essenciais para o KRYONIX
  async installEssentialModels(): Promise<void> {
    const essentialModels = [
      "llama2:7b", // Conversação geral
      "codellama:7b", // Programação
      "mistral:7b", // Multilingual
      "orca-mini:3b", // Leve para edge
      "phi:2.7b", // Matemática e raciocínio
      "gemma:2b", // Google lightweight
    ];

    console.log("🚀 Instalando modelos essenciais para KRYONIX...");

    for (const modelName of essentialModels) {
      try {
        await this.installModel(modelName);
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Pausa entre downloads
      } catch (error) {
        console.error(
          `Falha ao instalar modelo essencial ${modelName}:`,
          error,
        );
        // Continua com próximo modelo mesmo se um falhar
      }
    }

    console.log("✅ Instalação de modelos essenciais concluída!");
  }

  // Instalar todos os modelos disponíveis (cuidado com espaço em disco!)
  async installAllModels(): Promise<void> {
    console.log("🌟 Instalando TODOS os modelos disponíveis...");
    console.log("⚠️  ATENÇÃO: Isso pode usar mais de 200GB de espaço!");

    for (const model of this.availableModels) {
      if (!model.installed) {
        try {
          console.log(`📦 Instalando ${model.name} (${model.size})...`);
          await this.installModel(model.name);
          await new Promise((resolve) => setTimeout(resolve, 5000)); // Pausa maior entre downloads
        } catch (error) {
          console.error(`Falha ao instalar ${model.name}:`, error);
          // Continua mesmo se falhar
        }
      }
    }

    console.log("🎉 Instalação completa de todos os modelos!");
  }

  // Remover modelo
  async removeModel(modelName: string): Promise<void> {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: modelName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Falha ao remover modelo: ${response.statusText}`);
      }

      this.installedModels.delete(modelName);

      const model = this.availableModels.find((m) => m.name === modelName);
      if (model) {
        model.installed = false;
      }

      console.log(`🗑️ Modelo ${modelName} removido com sucesso!`);
    } catch (error) {
      console.error(`Erro ao remover modelo ${modelName}:`, error);
      throw error;
    }
  }

  // Obter lista de modelos com status
  getModelsWithStatus(): OllamaModel[] {
    return this.availableModels.map((model) => ({ ...model }));
  }

  // Obter modelos por categoria
  getModelsByCategory(category: string): OllamaModel[] {
    const categoryMap: { [key: string]: string[] } = {
      lightweight: ["orca-mini:3b", "phi:2.7b", "gemma:2b"],
      coding: ["codellama:7b", "codellama:13b", "codellama:34b"],
      conversational: ["llama2:7b", "vicuna:7b", "vicuna:13b"],
      multilingual: ["mistral:7b", "mixtral:8x7b"],
      enterprise: ["llama2:70b", "mixtral:8x7b", "codellama:34b"],
      creative: ["dolphin-mixtral:8x7b"],
      educational: ["alpaca:7b", "zephyr:7b"],
      all: this.availableModels.map((m) => m.name),
    };

    const modelNames = categoryMap[category] || [];
    return this.availableModels.filter((model) =>
      modelNames.includes(model.name),
    );
  }

  // Testar modelo instalado
  async testModel(modelName: string): Promise<any> {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelName,
          prompt:
            "Olá! Como está funcionando? Responda em português brasileiro.",
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Falha ao testar modelo: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`✅ Modelo ${modelName} testado com sucesso!`);
      return result;
    } catch (error) {
      console.error(`Erro ao testar modelo ${modelName}:`, error);
      throw error;
    }
  }

  // Obter estatísticas dos modelos
  async getModelStats(): Promise<any> {
    await this.checkInstalledModels();

    const stats = {
      total: this.availableModels.length,
      installed: this.installedModels.size,
      downloading: this.availableModels.filter((m) => m.downloading).length,
      families: [...new Set(this.availableModels.map((m) => m.family))],
      totalSize: this.availableModels
        .filter((m) => m.installed)
        .reduce((total, m) => {
          const size = parseFloat(m.size.replace("GB", ""));
          return total + size;
        }, 0),
      byFamily: this.availableModels.reduce((acc, model) => {
        if (!acc[model.family]) {
          acc[model.family] = { total: 0, installed: 0 };
        }
        acc[model.family].total++;
        if (model.installed) {
          acc[model.family].installed++;
        }
        return acc;
      }, {} as any),
    };

    return stats;
  }

  // Salvar configuração de modelos
  async saveModelConfig(): Promise<void> {
    const config = {
      timestamp: new Date().toISOString(),
      models: this.getModelsWithStatus(),
      stats: await this.getModelStats(),
    };

    const configPath = path.join(process.cwd(), "ollama-models-config.json");
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    console.log("💾 Configuração de modelos salva!");
  }

  // Carregar configuração de modelos
  async loadModelConfig(): Promise<void> {
    try {
      const configPath = path.join(process.cwd(), "ollama-models-config.json");
      const configData = await fs.readFile(configPath, "utf-8");
      const config = JSON.parse(configData);

      console.log("📂 Configuração de modelos carregada!");
      console.log(`Última atualização: ${config.timestamp}`);
    } catch (error) {
      console.log(
        "📂 Nenhuma configuração anterior encontrada, criando nova...",
      );
    }
  }
}

// Instância singleton
export const ollamaModelsManager = new OllamaModelsManager();

// Inicializar automaticamente
ollamaModelsManager.loadModelConfig().then(() => {
  ollamaModelsManager.checkInstalledModels();
});
