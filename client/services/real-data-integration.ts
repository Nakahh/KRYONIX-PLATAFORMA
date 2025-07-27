/**
 * Integração de dados reais - eliminando completamente dados mock
 * Conecta com APIs reais de todas as stacks para KPIs precisos
 */

import { apiClient } from "../lib/api-client";

export interface RealWhatsAppData {
  instances: number;
  messages_sent: number;
  messages_received: number;
  active_conversations: number;
  conversion_rate: number;
  response_time_avg: number;
  uptime_percentage: number;
}

export interface RealRevenueData {
  monthly_revenue: number;
  pix_transactions: number;
  subscription_revenue: number;
  growth_rate: number;
  churn_rate: number;
  mrr: number;
  arr: number;
}

export interface RealAutomationData {
  workflows_active: number;
  executions_today: number;
  success_rate: number;
  time_saved_hours: number;
  errors_count: number;
  most_used_workflow: string;
}

export interface RealAIData {
  consensus_decisions: number;
  accuracy_rate: number;
  healing_actions: number;
  learning_points: number;
  models_used: string[];
  response_time_ms: number;
}

export interface RealConversionsData {
  leads_generated: number;
  conversion_rate: number;
  cost_per_lead: number;
  roi_percentage: number;
  campaigns_active: number;
  best_performing_channel: string;
}

export interface RealPaymentsData {
  pix_volume: number;
  pix_success_rate: number;
  average_transaction: number;
  daily_transactions: number;
  failed_payments: number;
  fraud_detected: number;
}

export interface RealBusinessData {
  active_users: number;
  new_signups: number;
  retention_rate: number;
  support_tickets: number;
  satisfaction_score: number;
  feature_adoption: number;
}

export class RealDataIntegration {
  private cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >();
  private readonly CACHE_TTL = 30000; // 30 segundos

  /**
   * Obter dados reais do WhatsApp via Evolution API
   */
  async getWhatsAppRealData(): Promise<RealWhatsAppData> {
    const cacheKey = "whatsapp_data";
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Buscar instâncias ativas
      const instancesResponse = await apiClient.get("/whatsapp/instances");
      const instances = instancesResponse.data;

      // Buscar estatísticas de mensagens
      const statsResponse = await apiClient.get("/whatsapp/stats/today");
      const stats = statsResponse.data;

      // Buscar conversas ativas
      const conversationsResponse = await apiClient.get(
        "/whatsapp/conversations/active",
      );
      const conversations = conversationsResponse.data;

      // Buscar métricas de performance
      const metricsResponse = await apiClient.get("/whatsapp/metrics");
      const metrics = metricsResponse.data;

      const realData: RealWhatsAppData = {
        instances: instances.length || 0,
        messages_sent: stats.messages_sent || 0,
        messages_received: stats.messages_received || 0,
        active_conversations: conversations.count || 0,
        conversion_rate: this.calculateConversionRate(stats),
        response_time_avg: metrics.avg_response_time || 0,
        uptime_percentage: metrics.uptime_percentage || 0,
      };

      this.setCache(cacheKey, realData);
      return realData;
    } catch (error) {
      console.error("❌ Erro ao buscar dados reais do WhatsApp:", error);
      throw new Error("Não foi possível obter dados reais do WhatsApp");
    }
  }

  /**
   * Obter dados reais de receita via sistema de billing
   */
  async getRevenueRealData(): Promise<RealRevenueData> {
    const cacheKey = "revenue_data";
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const today = new Date();
      const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

      // Buscar receita mensal
      const revenueResponse = await apiClient.get(
        `/billing/revenue/${currentMonth}`,
      );
      const revenue = revenueResponse.data;

      // Buscar transações PIX
      const pixResponse = await apiClient.get("/billing/pix/stats");
      const pixData = pixResponse.data;

      // Buscar assinaturas
      const subscriptionsResponse = await apiClient.get(
        "/billing/subscriptions/stats",
      );
      const subscriptions = subscriptionsResponse.data;

      // Buscar métricas de crescimento
      const growthResponse = await apiClient.get("/analytics/growth");
      const growth = growthResponse.data;

      const realData: RealRevenueData = {
        monthly_revenue: revenue.total || 0,
        pix_transactions: pixData.total_transactions || 0,
        subscription_revenue: subscriptions.recurring_revenue || 0,
        growth_rate: growth.monthly_growth_rate || 0,
        churn_rate: growth.churn_rate || 0,
        mrr: subscriptions.mrr || 0,
        arr: subscriptions.arr || 0,
      };

      this.setCache(cacheKey, realData);
      return realData;
    } catch (error) {
      console.error("❌ Erro ao buscar dados reais de receita:", error);
      throw new Error("Não foi possível obter dados reais de receita");
    }
  }

  /**
   * Obter dados reais de automação via N8N
   */
  async getAutomationRealData(): Promise<RealAutomationData> {
    const cacheKey = "automation_data";
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Buscar workflows ativos
      const workflowsResponse = await apiClient.get("/n8n/workflows/active");
      const workflows = workflowsResponse.data;

      // Buscar execuções de hoje
      const executionsResponse = await apiClient.get("/n8n/executions/today");
      const executions = executionsResponse.data;

      // Buscar estatísticas de sucesso
      const statsResponse = await apiClient.get("/n8n/stats");
      const stats = statsResponse.data;

      // Buscar métricas de tempo economizado
      const timeResponse = await apiClient.get("/n8n/time-saved");
      const timeSaved = timeResponse.data;

      const realData: RealAutomationData = {
        workflows_active: workflows.length || 0,
        executions_today: executions.total || 0,
        success_rate: stats.success_rate || 0,
        time_saved_hours: timeSaved.hours_saved || 0,
        errors_count: stats.errors_count || 0,
        most_used_workflow: stats.most_used_workflow || "N/A",
      };

      this.setCache(cacheKey, realData);
      return realData;
    } catch (error) {
      console.error("❌ Erro ao buscar dados reais de automação:", error);
      throw new Error("Não foi possível obter dados reais de automação");
    }
  }

  /**
   * Obter dados reais da IA via sistema de consenso
   */
  async getAIRealData(): Promise<RealAIData> {
    const cacheKey = "ai_data";
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Buscar decisões do sistema de consenso
      const consensusResponse = await apiClient.get("/ai/consensus/stats");
      const consensus = consensusResponse.data;

      // Buscar ações de healing
      const healingResponse = await apiClient.get("/ai/healing/stats");
      const healing = healingResponse.data;

      // Buscar métricas de aprendizado
      const learningResponse = await apiClient.get("/ai/learning/stats");
      const learning = learningResponse.data;

      // Buscar performance das IAs
      const performanceResponse = await apiClient.get("/ai/performance");
      const performance = performanceResponse.data;

      const realData: RealAIData = {
        consensus_decisions: consensus.total_decisions || 0,
        accuracy_rate: consensus.accuracy_rate || 0,
        healing_actions: healing.actions_taken || 0,
        learning_points: learning.points_acquired || 0,
        models_used: performance.active_models || [],
        response_time_ms: performance.avg_response_time || 0,
      };

      this.setCache(cacheKey, realData);
      return realData;
    } catch (error) {
      console.error("❌ Erro ao buscar dados reais da IA:", error);
      throw new Error("Não foi possível obter dados reais da IA");
    }
  }

  /**
   * Obter dados reais de conversões via Mautic
   */
  async getConversionsRealData(): Promise<RealConversionsData> {
    const cacheKey = "conversions_data";
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Buscar leads gerados
      const leadsResponse = await apiClient.get("/mautic/leads/today");
      const leads = leadsResponse.data;

      // Buscar campanhas ativas
      const campaignsResponse = await apiClient.get("/mautic/campaigns/active");
      const campaigns = campaignsResponse.data;

      // Buscar métricas de conversão
      const conversionResponse = await apiClient.get("/mautic/conversions");
      const conversions = conversionResponse.data;

      // Buscar ROI das campanhas
      const roiResponse = await apiClient.get("/mautic/roi");
      const roi = roiResponse.data;

      const realData: RealConversionsData = {
        leads_generated: leads.total || 0,
        conversion_rate: conversions.rate || 0,
        cost_per_lead: conversions.cost_per_lead || 0,
        roi_percentage: roi.percentage || 0,
        campaigns_active: campaigns.length || 0,
        best_performing_channel: conversions.best_channel || "N/A",
      };

      this.setCache(cacheKey, realData);
      return realData;
    } catch (error) {
      console.error("❌ Erro ao buscar dados reais de conversões:", error);
      throw new Error("Não foi possível obter dados reais de conversões");
    }
  }

  /**
   * Obter dados reais de pagamentos PIX
   */
  async getPaymentsRealData(): Promise<RealPaymentsData> {
    const cacheKey = "payments_data";
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Buscar volume PIX
      const pixVolumeResponse = await apiClient.get("/pix/volume/today");
      const pixVolume = pixVolumeResponse.data;

      // Buscar taxa de sucesso
      const successResponse = await apiClient.get("/pix/success-rate");
      const success = successResponse.data;

      // Buscar transações
      const transactionsResponse = await apiClient.get(
        "/pix/transactions/today",
      );
      const transactions = transactionsResponse.data;

      // Buscar fraud detection
      const fraudResponse = await apiClient.get("/pix/fraud/stats");
      const fraud = fraudResponse.data;

      const realData: RealPaymentsData = {
        pix_volume: pixVolume.total_value || 0,
        pix_success_rate: success.rate || 0,
        average_transaction: transactions.average_value || 0,
        daily_transactions: transactions.count || 0,
        failed_payments: transactions.failed_count || 0,
        fraud_detected: fraud.detected_count || 0,
      };

      this.setCache(cacheKey, realData);
      return realData;
    } catch (error) {
      console.error("❌ Erro ao buscar dados reais de pagamentos:", error);
      throw new Error("Não foi possível obter dados reais de pagamentos");
    }
  }

  /**
   * Obter dados reais do negócio
   */
  async getBusinessRealData(): Promise<RealBusinessData> {
    const cacheKey = "business_data";
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Buscar usuários ativos
      const usersResponse = await apiClient.get("/users/active");
      const users = usersResponse.data;

      // Buscar novos cadastros
      const signupsResponse = await apiClient.get("/users/signups/today");
      const signups = signupsResponse.data;

      // Buscar retenção
      const retentionResponse = await apiClient.get("/analytics/retention");
      const retention = retentionResponse.data;

      // Buscar suporte
      const supportResponse = await apiClient.get("/support/tickets/open");
      const support = supportResponse.data;

      // Buscar satisfação
      const satisfactionResponse = await apiClient.get(
        "/analytics/satisfaction",
      );
      const satisfaction = satisfactionResponse.data;

      // Buscar adoção de features
      const adoptionResponse = await apiClient.get(
        "/analytics/feature-adoption",
      );
      const adoption = adoptionResponse.data;

      const realData: RealBusinessData = {
        active_users: users.active_count || 0,
        new_signups: signups.count || 0,
        retention_rate: retention.rate || 0,
        support_tickets: support.open_count || 0,
        satisfaction_score: satisfaction.average_score || 0,
        feature_adoption: adoption.adoption_rate || 0,
      };

      this.setCache(cacheKey, realData);
      return realData;
    } catch (error) {
      console.error("❌ Erro ao buscar dados reais do negócio:", error);
      throw new Error("Não foi possível obter dados reais do negócio");
    }
  }

  /**
   * Obter todos os KPIs reais de uma vez
   */
  async getAllRealKPIs(): Promise<{
    whatsapp: RealWhatsAppData;
    revenue: RealRevenueData;
    automation: RealAutomationData;
    ai: RealAIData;
    conversions: RealConversionsData;
    payments: RealPaymentsData;
    business: RealBusinessData;
  }> {
    try {
      console.log("📊 Coletando todos os KPIs reais...");

      const [
        whatsapp,
        revenue,
        automation,
        ai,
        conversions,
        payments,
        business,
      ] = await Promise.all([
        this.getWhatsAppRealData(),
        this.getRevenueRealData(),
        this.getAutomationRealData(),
        this.getAIRealData(),
        this.getConversionsRealData(),
        this.getPaymentsRealData(),
        this.getBusinessRealData(),
      ]);

      console.log("✅ Todos os KPIs reais coletados com sucesso");

      return {
        whatsapp,
        revenue,
        automation,
        ai,
        conversions,
        payments,
        business,
      };
    } catch (error) {
      console.error("❌ Erro ao coletar KPIs reais:", error);
      throw new Error("Não foi possível obter todos os KPIs reais");
    }
  }

  /**
   * Utilitários de cache
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any, ttl: number = this.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Utilitários de cálculo
   */
  private calculateConversionRate(stats: any): number {
    if (!stats.messages_sent || stats.messages_sent === 0) return 0;
    return ((stats.responses_received || 0) / stats.messages_sent) * 100;
  }

  /**
   * Limpar cache manualmente
   */
  clearCache(): void {
    this.cache.clear();
    console.log("🗑️ Cache de dados reais limpo");
  }

  /**
   * Status do sistema de coleta de dados reais
   */
  async getSystemStatus(): Promise<{
    status: "healthy" | "degraded" | "critical";
    apis_connected: number;
    apis_total: number;
    last_update: Date;
    errors: string[];
  }> {
    const apis = [
      "whatsapp",
      "revenue",
      "automation",
      "ai",
      "conversions",
      "payments",
      "business",
    ];

    let connected = 0;
    const errors: string[] = [];

    for (const api of apis) {
      try {
        const cached = this.getFromCache(`${api}_data`);
        if (cached) connected++;
      } catch (error) {
        errors.push(`${api}: ${error.message}`);
      }
    }

    const percentage = (connected / apis.length) * 100;
    let status: "healthy" | "degraded" | "critical" = "healthy";

    if (percentage < 50) status = "critical";
    else if (percentage < 80) status = "degraded";

    return {
      status,
      apis_connected: connected,
      apis_total: apis.length,
      last_update: new Date(),
      errors,
    };
  }
}

export default RealDataIntegration;
