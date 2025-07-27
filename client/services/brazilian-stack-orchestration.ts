import { apiClient } from "../lib/api-client";

// Tipos para Orquestração de Stacks
export interface StackConfig {
  id: string;
  nome: string;
  tipo: StackType;
  versao: string;
  status: StackStatus;
  saude: HealthStatus;
  metricas: StackMetrics;
  configuracao: any;
  dependencias: string[];
  recursos: ResourceUsage;
  endpoints: StackEndpoint[];
  logs: LogEntry[];
  ultimaVerificacao: Date;
  proximaManutencao: Date;
}

export type StackType =
  | "evolution-api"
  | "n8n"
  | "typebot"
  | "mautic"
  | "chatwoot"
  | "portainer"
  | "grafana"
  | "prometheus"
  | "redis"
  | "postgresql"
  | "minio"
  | "rabbitmq"
  | "elasticsearch"
  | "nginx"
  | "docker"
  | "certbot"
  | "backup-manager"
  | "monitoring"
  | "analytics"
  | "webhook-manager"
  | "ai-assistant"
  | "crm-integrator"
  | "payment-gateway"
  | "notification-center"
  | "security-scanner";

export type StackStatus =
  | "ativo"
  | "inativo"
  | "manutencao"
  | "erro"
  | "atualizando"
  | "inicializando";
export type HealthStatus =
  | "saudavel"
  | "atencao"
  | "critico"
  | "indisponivel"
  | "degradado";

export interface StackMetrics {
  cpu: number;
  memoria: number;
  disco: number;
  rede: NetworkMetrics;
  requests: number;
  latencia: number;
  erros: number;
  disponibilidade: number;
  throughput: number;
}

export interface NetworkMetrics {
  upload: number;
  download: number;
  latencia: number;
  pacotesPerdidos: number;
}

export interface ResourceUsage {
  cpuLimite: number;
  memoriaLimite: number;
  discoLimite: number;
  cpuUso: number;
  memoriaUso: number;
  discoUso: number;
}

export interface StackEndpoint {
  nome: string;
  url: string;
  metodo: string;
  status: number;
  tempo_resposta: number;
  ultimo_check: Date;
}

export interface LogEntry {
  timestamp: Date;
  nivel: "info" | "warning" | "error" | "debug";
  origem: string;
  mensagem: string;
  dados: any;
}

export interface AutomationRule {
  id: string;
  nome: string;
  stack: string;
  condicao: string;
  acao: AutomationAction;
  ativo: boolean;
  prioridade: number;
  criadoPor: string;
  ultimaExecucao?: Date;
}

export interface AutomationAction {
  tipo: "restart" | "scale" | "update" | "rollback" | "notify" | "optimize";
  parametros: any;
  timeout: number;
}

export interface DeploymentPlan {
  id: string;
  nome: string;
  stacks: string[];
  estrategia: "blue-green" | "rolling" | "canary";
  etapas: DeploymentStep[];
  rollbackPlan: RollbackPlan;
  aprovado: boolean;
  executadoPor?: string;
  dataExecucao?: Date;
}

export interface DeploymentStep {
  ordem: number;
  stack: string;
  acao: string;
  dependencias: string[];
  timeout: number;
  verificacoes: HealthCheck[];
}

export interface RollbackPlan {
  estrategia: "automatico" | "manual";
  condicoes: string[];
  etapas: DeploymentStep[];
}

export interface HealthCheck {
  nome: string;
  endpoint: string;
  esperado: any;
  timeout: number;
  tentativas: number;
}

export interface PerformanceOptimization {
  stack: string;
  tipo: "cache" | "database" | "network" | "resource";
  recomendacao: string;
  impacto: "baixo" | "medio" | "alto";
  economia: {
    cpu: number;
    memoria: number;
    custo: number;
  };
  implementado: boolean;
}

class BrazilianStackOrchestrationService {
  private stacks: Map<string, StackConfig> = new Map();
  private automationRules: AutomationRule[] = [];
  private deploymentQueue: DeploymentPlan[] = [];
  private optimizations: PerformanceOptimization[] = [];

  // Inicialização do sistema de orquestração
  async inicializar(): Promise<void> {
    try {
      await this.carregarConfiguracoesStacks();
      await this.inicializarMonitoramento();
      await this.carregarRegrasAutomacao();
      await this.verificarSaudeGeral();

      console.log(
        "✅ Sistema de Orquestração KRYONIX inicializado com sucesso",
      );
    } catch (error) {
      console.error("❌ Erro ao inicializar orquestração:", error);
      throw error;
    }
  }

  // Carregamento de configurações das stacks
  private async carregarConfiguracoesStacks(): Promise<void> {
    const stacksConfiguradas = await apiClient.get("/stacks/configuracoes");

    for (const config of stacksConfiguradas.data) {
      this.stacks.set(config.id, {
        ...config,
        ultimaVerificacao: new Date(),
        proximaManutencao: this.calcularProximaManutencao(config.tipo),
      });
    }
  }

  // Sistema de monitoramento em tempo real
  async inicializarMonitoramento(): Promise<void> {
    // WebSocket para monitoramento em tempo real
    if (typeof window !== "undefined") {
      const ws = new WebSocket(
        `${import.meta.env.VITE_WS_URL || "ws://localhost:8080"}/orchestration`,
      );

      ws.onmessage = (event) => {
        const dados = JSON.parse(event.data);
        this.processarEventoMonitoramento(dados);
      };
    }

    // Verificação periódica de saúde
    setInterval(() => {
      this.verificarSaudeTodasStacks();
    }, 30000); // A cada 30 segundos

    // Otimização automática
    setInterval(() => {
      this.executarOtimizacaoAutomatica();
    }, 300000); // A cada 5 minutos
  }

  // Verificação de saúde de todas as stacks
  async verificarSaudeTodasStacks(): Promise<void> {
    const verificacoes = Array.from(this.stacks.keys()).map((stackId) =>
      this.verificarSaudeStack(stackId),
    );

    await Promise.allSettled(verificacoes);
  }

  // Verificação de saúde individual
  async verificarSaudeStack(stackId: string): Promise<HealthStatus> {
    try {
      const stack = this.stacks.get(stackId);
      if (!stack) return "indisponivel";

      const metricas = await this.coletarMetricas(stackId);
      const statusEndpoints = await this.verificarEndpoints(stackId);

      const saude = this.calcularSaude(metricas, statusEndpoints);

      // Atualizar stack com nova informação
      stack.metricas = metricas;
      stack.saude = saude;
      stack.ultimaVerificacao = new Date();

      // Verificar se precisa de ação automática
      await this.verificarRegrasAutomacao(stackId, saude);

      return saude;
    } catch (error) {
      console.error(`❌ Erro ao verificar saúde da stack ${stackId}:`, error);
      return "critico";
    }
  }

  // Coleta de métricas em tempo real
  private async coletarMetricas(stackId: string): Promise<StackMetrics> {
    try {
      const response = await apiClient.get(`/stacks/${stackId}/metricas`);
      return response.data;
    } catch (error) {
      return {
        cpu: 0,
        memoria: 0,
        disco: 0,
        rede: { upload: 0, download: 0, latencia: 0, pacotesPerdidos: 0 },
        requests: 0,
        latencia: 0,
        erros: 0,
        disponibilidade: 0,
        throughput: 0,
      };
    }
  }

  // Verificação de endpoints
  private async verificarEndpoints(stackId: string): Promise<boolean> {
    const stack = this.stacks.get(stackId);
    if (!stack?.endpoints) return false;

    const verificacoes = stack.endpoints.map(async (endpoint) => {
      try {
        const inicio = Date.now();
        const response = await fetch(endpoint.url, {
          method: endpoint.metodo,
          timeout: 5000,
        });

        endpoint.status = response.status;
        endpoint.tempo_resposta = Date.now() - inicio;
        endpoint.ultimo_check = new Date();

        return response.ok;
      } catch (error) {
        endpoint.status = 0;
        endpoint.tempo_resposta = 5000;
        endpoint.ultimo_check = new Date();
        return false;
      }
    });

    const resultados = await Promise.all(verificacoes);
    return resultados.every((resultado) => resultado);
  }

  // Cálculo de saúde baseado em métricas
  private calcularSaude(
    metricas: StackMetrics,
    endpointsOk: boolean,
  ): HealthStatus {
    let pontuacao = 100;

    // Penalizar por alta utilização de recursos
    if (metricas.cpu > 90) pontuacao -= 30;
    else if (metricas.cpu > 70) pontuacao -= 15;

    if (metricas.memoria > 90) pontuacao -= 30;
    else if (metricas.memoria > 70) pontuacao -= 15;

    if (metricas.disco > 95) pontuacao -= 40;
    else if (metricas.disco > 80) pontuacao -= 20;

    // Penalizar por latência alta
    if (metricas.latencia > 2000) pontuacao -= 25;
    else if (metricas.latencia > 1000) pontuacao -= 10;

    // Penalizar por erros
    if (metricas.erros > 100) pontuacao -= 35;
    else if (metricas.erros > 10) pontuacao -= 15;

    // Penalizar por baixa disponibilidade
    if (metricas.disponibilidade < 95) pontuacao -= 30;
    else if (metricas.disponibilidade < 98) pontuacao -= 15;

    // Penalizar se endpoints não estão funcionando
    if (!endpointsOk) pontuacao -= 40;

    // Determinar status baseado na pontuação
    if (pontuacao >= 90) return "saudavel";
    if (pontuacao >= 70) return "atencao";
    if (pontuacao >= 40) return "degradado";
    if (pontuacao >= 20) return "critico";
    return "indisponivel";
  }

  // Sistema de automação inteligente
  async carregarRegrasAutomacao(): Promise<void> {
    try {
      const response = await apiClient.get("/automacao/regras");
      this.automationRules = response.data;
    } catch (error) {
      // Regras padrão para empresas brasileiras
      this.automationRules = this.criarRegrasAutomacaoPadrao();
    }
  }

  // Criação de regras de automação padrão
  private criarRegrasAutomacaoPadrao(): AutomationRule[] {
    return [
      {
        id: "cpu-alto",
        nome: "CPU Crítico - Reiniciar Serviço",
        stack: "*",
        condicao: "cpu > 95 AND duracao > 300",
        acao: { tipo: "restart", parametros: {}, timeout: 60000 },
        ativo: true,
        prioridade: 1,
        criadoPor: "sistema",
      },
      {
        id: "memoria-alta",
        nome: "Memória Crítica - Limpeza Cache",
        stack: "*",
        condicao: "memoria > 90 AND duracao > 180",
        acao: {
          tipo: "optimize",
          parametros: { tipo: "cache" },
          timeout: 30000,
        },
        ativo: true,
        prioridade: 2,
        criadoPor: "sistema",
      },
      {
        id: "disco-cheio",
        nome: "Disco Crítico - Limpeza Logs",
        stack: "*",
        condicao: "disco > 95",
        acao: {
          tipo: "optimize",
          parametros: { tipo: "disk" },
          timeout: 60000,
        },
        ativo: true,
        prioridade: 1,
        criadoPor: "sistema",
      },
      {
        id: "webhook-falha",
        nome: "WhatsApp API Indisponível - Failover",
        stack: "evolution-api",
        condicao: "disponibilidade < 90",
        acao: { tipo: "scale", parametros: { instancias: 2 }, timeout: 120000 },
        ativo: true,
        prioridade: 1,
        criadoPor: "sistema",
      },
    ];
  }

  // Verificação e execução de regras de automação
  async verificarRegrasAutomacao(
    stackId: string,
    saude: HealthStatus,
  ): Promise<void> {
    const stack = this.stacks.get(stackId);
    if (!stack) return;

    for (const regra of this.automationRules) {
      if (!regra.ativo) continue;
      if (regra.stack !== "*" && regra.stack !== stackId) continue;

      const condicaoAtendida = this.avaliarCondicao(
        regra.condicao,
        stack.metricas,
        saude,
      );

      if (condicaoAtendida) {
        await this.executarAcaoAutomacao(stackId, regra);
      }
    }
  }

  // Avaliação de condições de automação
  private avaliarCondicao(
    condicao: string,
    metricas: StackMetrics,
    saude: HealthStatus,
  ): boolean {
    try {
      // Parser simples de condições (em produção usaria um parser mais robusto)
      const condicaoProcessada = condicao
        .replace(/cpu/g, metricas.cpu.toString())
        .replace(/memoria/g, metricas.memoria.toString())
        .replace(/disco/g, metricas.disco.toString())
        .replace(/latencia/g, metricas.latencia.toString())
        .replace(/erros/g, metricas.erros.toString())
        .replace(/disponibilidade/g, metricas.disponibilidade.toString())
        .replace(/saude/g, `"${saude}"`)
        .replace(/AND/g, "&&")
        .replace(/OR/g, "||");

      return eval(condicaoProcessada);
    } catch (error) {
      console.error("❌ Erro ao avaliar condição:", condicao, error);
      return false;
    }
  }

  // Execução de ações de automação
  async executarAcaoAutomacao(
    stackId: string,
    regra: AutomationRule,
  ): Promise<void> {
    try {
      console.log(
        `🤖 Executando automação: ${regra.nome} para stack ${stackId}`,
      );

      const stack = this.stacks.get(stackId);
      if (!stack) return;

      switch (regra.acao.tipo) {
        case "restart":
          await this.reiniciarStack(stackId);
          break;
        case "scale":
          await this.escalarStack(stackId, regra.acao.parametros);
          break;
        case "optimize":
          await this.otimizarStack(stackId, regra.acao.parametros);
          break;
        case "rollback":
          await this.rollbackStack(stackId);
          break;
        case "notify":
          await this.notificarProblema(stackId, regra.nome);
          break;
      }

      regra.ultimaExecucao = new Date();

      // Log da ação executada
      this.adicionarLog(
        stackId,
        "info",
        "automacao",
        `Ação automática executada: ${regra.nome}`,
      );
    } catch (error) {
      console.error(`❌ Erro ao executar automação ${regra.nome}:`, error);
      this.adicionarLog(
        stackId,
        "error",
        "automacao",
        `Falha na automação: ${regra.nome} - ${error.message}`,
      );
    }
  }

  // Deploy automático inteligente
  async executarDeployment(plano: DeploymentPlan): Promise<boolean> {
    try {
      console.log(`🚀 Iniciando deployment: ${plano.nome}`);

      // Validar pré-condições
      const preCondicoesOk = await this.validarPreCondicoes(plano);
      if (!preCondicoesOk) {
        throw new Error("Pré-condições não atendidas para deployment");
      }

      // Executar etapas do deployment
      for (const etapa of plano.etapas.sort((a, b) => a.ordem - b.ordem)) {
        await this.executarEtapaDeployment(etapa);

        // Verificar saúde após cada etapa
        const saudePos = await this.verificarSaudeStack(etapa.stack);
        if (saudePos === "critico" || saudePos === "indisponivel") {
          console.log(
            `❌ Deployment falhou na etapa ${etapa.ordem}. Iniciando rollback...`,
          );
          await this.executarRollback(plano.rollbackPlan);
          return false;
        }
      }

      console.log(`✅ Deployment ${plano.nome} concluído com sucesso`);
      return true;
    } catch (error) {
      console.error(`❌ Erro no deployment ${plano.nome}:`, error);
      await this.executarRollback(plano.rollbackPlan);
      return false;
    }
  }

  // Otimização automática de performance
  async executarOtimizacaoAutomatica(): Promise<void> {
    try {
      const analises = await this.analisarPerformanceStacks();

      for (const analise of analises) {
        if (analise.impacto === "alto" && this.isOtimizacaoSegura(analise)) {
          await this.implementarOtimizacao(analise);
        }
      }
    } catch (error) {
      console.error("❌ Erro na otimização automática:", error);
    }
  }

  // Métodos de ação específicos
  private async reiniciarStack(stackId: string): Promise<void> {
    await apiClient.post(`/stacks/${stackId}/restart`);
    this.adicionarLog(
      stackId,
      "info",
      "sistema",
      "Stack reiniciada automaticamente",
    );
  }

  private async escalarStack(stackId: string, parametros: any): Promise<void> {
    await apiClient.post(`/stacks/${stackId}/scale`, parametros);
    this.adicionarLog(
      stackId,
      "info",
      "sistema",
      `Stack escalada: ${JSON.stringify(parametros)}`,
    );
  }

  private async otimizarStack(stackId: string, parametros: any): Promise<void> {
    await apiClient.post(`/stacks/${stackId}/optimize`, parametros);
    this.adicionarLog(
      stackId,
      "info",
      "sistema",
      `Otimização aplicada: ${parametros.tipo}`,
    );
  }

  private async rollbackStack(stackId: string): Promise<void> {
    await apiClient.post(`/stacks/${stackId}/rollback`);
    this.adicionarLog(stackId, "warning", "sistema", "Rollback executado");
  }

  private async notificarProblema(
    stackId: string,
    descricao: string,
  ): Promise<void> {
    const stack = this.stacks.get(stackId);
    if (!stack) return;

    await apiClient.post("/notificacoes/problema", {
      stack: stackId,
      nome: stack.nome,
      descricao,
      prioridade: "alta",
      canais: ["email", "whatsapp", "slack"],
    });
  }

  // Métodos auxiliares
  private calcularProximaManutencao(tipo: StackType): Date {
    const agora = new Date();
    const intervaloManutencao = {
      postgresql: 7, // 7 dias
      redis: 3, // 3 dias
      nginx: 14, // 14 dias
      "evolution-api": 1, // 1 dia (crítico para WhatsApp)
      n8n: 7,
      typebot: 7,
    };

    const dias = intervaloManutencao[tipo] || 7;
    agora.setDate(agora.getDate() + dias);
    return agora;
  }

  private adicionarLog(
    stackId: string,
    nivel: "info" | "warning" | "error" | "debug",
    origem: string,
    mensagem: string,
    dados?: any,
  ): void {
    const stack = this.stacks.get(stackId);
    if (!stack) return;

    const log: LogEntry = {
      timestamp: new Date(),
      nivel,
      origem,
      mensagem,
      dados,
    };

    stack.logs.unshift(log);

    // Manter apenas os últimos 1000 logs
    if (stack.logs.length > 1000) {
      stack.logs = stack.logs.slice(0, 1000);
    }
  }

  private processarEventoMonitoramento(dados: any): void {
    const { stackId, tipo, payload } = dados;

    switch (tipo) {
      case "metricas":
        this.atualizarMetricas(stackId, payload);
        break;
      case "alerta":
        this.processarAlerta(stackId, payload);
        break;
      case "log":
        this.adicionarLog(
          stackId,
          payload.nivel,
          payload.origem,
          payload.mensagem,
          payload.dados,
        );
        break;
    }
  }

  private atualizarMetricas(stackId: string, metricas: StackMetrics): void {
    const stack = this.stacks.get(stackId);
    if (stack) {
      stack.metricas = metricas;
      stack.ultimaVerificacao = new Date();
    }
  }

  private async processarAlerta(stackId: string, alerta: any): Promise<void> {
    this.adicionarLog(
      stackId,
      "warning",
      "monitor",
      `Alerta: ${alerta.mensagem}`,
      alerta,
    );

    // Verificar se precisa executar ação automática
    await this.verificarRegrasAutomacao(stackId, "atencao");
  }

  // Métodos públicos para interface
  public getTodasStacks(): StackConfig[] {
    return Array.from(this.stacks.values());
  }

  public getStack(stackId: string): StackConfig | undefined {
    return this.stacks.get(stackId);
  }

  public getStacksPorStatus(status: StackStatus): StackConfig[] {
    return this.getTodasStacks().filter((stack) => stack.status === status);
  }

  public getStacksPorSaude(saude: HealthStatus): StackConfig[] {
    return this.getTodasStacks().filter((stack) => stack.saude === saude);
  }

  public async adicionarRegraAutomacao(
    regra: Omit<AutomationRule, "id">,
  ): Promise<string> {
    const novaRegra: AutomationRule = {
      ...regra,
      id: `regra-${Date.now()}`,
    };

    this.automationRules.push(novaRegra);
    await apiClient.post("/automacao/regras", novaRegra);

    return novaRegra.id;
  }

  public async removerRegraAutomacao(regrId: string): Promise<void> {
    this.automationRules = this.automationRules.filter((r) => r.id !== regrId);
    await apiClient.delete(`/automacao/regras/${regrId}`);
  }

  // Métodos privados para deployment
  private async validarPreCondicoes(plano: DeploymentPlan): Promise<boolean> {
    for (const stackId of plano.stacks) {
      const saude = await this.verificarSaudeStack(stackId);
      if (saude === "critico" || saude === "indisponivel") {
        console.log(`❌ Stack ${stackId} não está saudável para deployment`);
        return false;
      }
    }
    return true;
  }

  private async executarEtapaDeployment(etapa: DeploymentStep): Promise<void> {
    await apiClient.post(`/stacks/${etapa.stack}/deploy`, {
      acao: etapa.acao,
      timeout: etapa.timeout,
    });

    // Aguardar e verificar health checks
    for (const check of etapa.verificacoes) {
      await this.executarHealthCheck(check);
    }
  }

  private async executarHealthCheck(check: HealthCheck): Promise<boolean> {
    for (let tentativa = 1; tentativa <= check.tentativas; tentativa++) {
      try {
        const response = await fetch(check.endpoint, {
          timeout: check.timeout,
        });
        const resultado = await response.json();

        if (JSON.stringify(resultado) === JSON.stringify(check.esperado)) {
          return true;
        }
      } catch (error) {
        if (tentativa === check.tentativas) {
          throw new Error(`Health check falhou: ${check.nome}`);
        }
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
    return false;
  }

  private async executarRollback(plano: RollbackPlan): Promise<void> {
    console.log("🔄 Executando rollback...");

    for (const etapa of plano.etapas.sort((a, b) => b.ordem - a.ordem)) {
      await this.executarEtapaDeployment(etapa);
    }
  }

  private async analisarPerformanceStacks(): Promise<
    PerformanceOptimization[]
  > {
    const analises: PerformanceOptimization[] = [];

    for (const [stackId, stack] of this.stacks) {
      // Análise de cache
      if (stack.metricas.latencia > 1000) {
        analises.push({
          stack: stackId,
          tipo: "cache",
          recomendacao: "Implementar cache Redis para reduzir latência",
          impacto: "alto",
          economia: { cpu: 20, memoria: 10, custo: 150 },
          implementado: false,
        });
      }

      // Análise de banco de dados
      if (stack.tipo === "postgresql" && stack.metricas.cpu > 70) {
        analises.push({
          stack: stackId,
          tipo: "database",
          recomendacao: "Otimizar queries e criar índices",
          impacto: "medio",
          economia: { cpu: 30, memoria: 15, custo: 200 },
          implementado: false,
        });
      }
    }

    return analises;
  }

  private isOtimizacaoSegura(otimizacao: PerformanceOptimization): boolean {
    // Verificar se a otimização é segura para aplicar automaticamente
    const otimizacoesSeguras = ["cache", "network"];
    return otimizacoesSeguras.includes(otimizacao.tipo);
  }

  private async implementarOtimizacao(
    otimizacao: PerformanceOptimization,
  ): Promise<void> {
    await apiClient.post(`/stacks/${otimizacao.stack}/optimize`, {
      tipo: otimizacao.tipo,
      parametros: otimizacao,
    });

    otimizacao.implementado = true;
    this.adicionarLog(
      otimizacao.stack,
      "info",
      "otimizacao",
      `Otimização implementada: ${otimizacao.recomendacao}`,
    );
  }
}

// Instância singleton do serviço
export const orchestrationService = new BrazilianStackOrchestrationService();

// Inicializar automaticamente quando importado
if (typeof window !== "undefined") {
  orchestrationService.inicializar().catch((error) => {
    console.error("❌ Erro crítico na inicialização da orquestração:", error);
  });
}

export default orchestrationService;
