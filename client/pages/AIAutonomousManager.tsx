import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Zap,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Settings,
  Bot,
  Lightbulb,
  Target,
  Sparkles,
  Cpu,
  Globe,
  Shield,
  Activity,
} from "lucide-react";
import { aiAutonomousConfig } from "@/services/ai-autonomous-config";
import { stackIntegration, KRYONIX_STACKS } from "@/services/stack-integration";
import { predictiveAnalyticsService } from "@/services/predictive-analytics";
import { enhancedApiClient } from "@/services/enhanced-api-client";

export default function AIAutonomousManager() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [automationLevel, setAutomationLevel] = useState<
    "conservative" | "balanced" | "aggressive"
  >("balanced");
  const [systemRecommendations, setSystemRecommendations] = useState<string[]>(
    [],
  );
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [autonomousStats, setAutonomousStats] = useState<any>(null);
  const [healingHistory, setHealingHistory] = useState<any[]>([]);
  const [predictiveInsights, setPredictiveInsights] = useState<any[]>([]);
  const [consensusDecisions, setConsensusDecisions] = useState<any[]>([]);

  useEffect(() => {
    loadSystemAnalysis();
    loadAutonomousData();
    loadPredictiveInsights();
  }, []);

  const loadSystemAnalysis = async () => {
    try {
      const healthData = await stackIntegration.performHealthChecks();
      const metricsData = await stackIntegration.getAllMetrics();

      const insights = {
        totalStacks: KRYONIX_STACKS.length,
        healthyStacks: Array.from(healthData.values()).filter(
          (h) => h.status === "online",
        ).length,
        avgResponseTime:
          Array.from(metricsData.values()).reduce(
            (sum, m) => sum + m.responseTime,
            0,
          ) / metricsData.size,
        totalRequests: Array.from(metricsData.values()).reduce(
          (sum, m) => sum + m.requests,
          0,
        ),
        optimizationOpportunities: [],
      };

      setAiInsights(insights);

      // Gerar recomendações automáticas
      const recommendations = await generateSmartRecommendations(
        healthData,
        metricsData,
      );
      setSystemRecommendations(recommendations);
    } catch (error) {
      console.error("Erro ao carregar análise do sistema:", error);
    }
  };

  const loadAutonomousData = async () => {
    try {
      // Carregar estatísticas do sistema autônomo
      const statsResponse = await enhancedApiClient.get(
        "/api/v1/autonomous/stats",
      );
      if (statsResponse.success) {
        setAutonomousStats(statsResponse.data);
      }

      // Carregar histórico de curas
      const historyResponse = await enhancedApiClient.get(
        "/api/v1/autonomous/healing-history",
      );
      if (historyResponse.success) {
        setHealingHistory(historyResponse.data);
      }

      // Carregar decisões de consenso recentes
      const consensusResponse = await enhancedApiClient.get(
        "/api/v1/autonomous/consensus-decisions",
      );
      if (consensusResponse.success) {
        setConsensusDecisions(consensusResponse.data);
      }
    } catch (error) {
      console.error("Erro ao carregar dados autônomos:", error);
      // Dados simulados para fallback
      setAutonomousStats({
        activeIssues: 2,
        resolvedIssues: 47,
        totalIssues: 49,
        resolutionRate: 95.9,
        averageResolutionTime: 180,
        aiProvidersStatus: [
          {
            name: "Ollama-Local",
            available: true,
            responseTime: 850,
            confidence: 0.85,
          },
          {
            name: "Evolution-AI",
            available: true,
            responseTime: 320,
            confidence: 0.92,
          },
          {
            name: "Dify-AI",
            available: true,
            responseTime: 450,
            confidence: 0.88,
          },
        ],
        consensusThreshold: 75,
      });
    }
  };

  const loadPredictiveInsights = async () => {
    try {
      // Carregar insights preditivos
      const insights =
        await predictiveAnalyticsService.generateBusinessInsights();
      setPredictiveInsights(insights);
    } catch (error) {
      console.error("Erro ao carregar insights preditivos:", error);
      // Insights simulados para fallback
      setPredictiveInsights([
        {
          type: "optimization",
          title: "Oportunidade de Cache Redis",
          description:
            "Implementação de cache pode reduzir tempo de resposta em 40%",
          impact: 8,
          effort: 5,
          roi: 160,
          actionItems: [
            "Configurar Redis cluster",
            "Implementar cache strategies",
          ],
          timeline: "1-2 semanas",
        },
      ]);
    }
  };

  const generateSmartRecommendations = async (
    healthData: Map<string, any>,
    metricsData: Map<string, any>,
  ) => {
    const recommendations: string[] = [];

    // Análise inteligente baseada em dados reais
    for (const [stackId, health] of healthData) {
      const metrics = metricsData.get(stackId);
      if (!metrics) continue;

      const aiRecommendations =
        await aiAutonomousConfig.getPerformanceBasedRecommendations(
          stackId,
          metrics,
          health,
        );
      recommendations.push(...aiRecommendations);
    }

    return recommendations;
  };

  const runAutonomousOptimization = async () => {
    setIsProcessing(true);
    const results: any[] = [];

    try {
      for (const stack of KRYONIX_STACKS) {
        const healthData = await stackIntegration.getStackHealth(stack.id);
        const metricsData = await stackIntegration.getStackMetrics(stack.id);

        if (healthData && metricsData) {
          const configResult = await aiAutonomousConfig.autoConfigureStack({
            stackId: stack.id,
            context: "optimization",
            performanceData: metricsData,
            healthData: healthData,
            businessRequirements:
              "Otimização para empresa brasileira de alto volume",
          });

          results.push({
            stackId: stack.id,
            stackName: stack.displayName,
            result: configResult,
            applied: configResult.automationLevel === "full-automatic",
          });
        }
      }

      setAnalysisResults(results);
    } catch (error) {
      console.error("Erro na otimização autônoma:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const applyRecommendation = async (stackId: string, configuration: any) => {
    try {
      const success = await aiAutonomousConfig.applyAutomaticConfiguration(
        stackId,
        configuration,
      );
      if (success) {
        // Atualizar resultados
        setAnalysisResults((prev) =>
          prev.map((result) =>
            result.stackId === stackId ? { ...result, applied: true } : result,
          ),
        );
      }
    } catch (error) {
      console.error("Erro ao aplicar recomendação:", error);
    }
  };

  const getAutomationLevelColor = (level: string) => {
    switch (level) {
      case "full-automatic":
        return "text-green-600 bg-green-100";
      case "semi-automatic":
        return "text-yellow-600 bg-yellow-100";
      case "manual":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-blue-600 bg-blue-100";
    }
  };

  const getImpactColor = (value: number) => {
    if (value >= 80) return "text-green-600";
    if (value >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Brain className="h-8 w-8 text-purple-600" />
            <span>IA Autônoma KRYONIX</span>
          </h1>
          <p className="text-muted-foreground">
            Sistema inteligente de configuração e otimização automática das
            stacks
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Sparkles className="h-3 w-3" />
            <span>GPT-4o Brasileiro</span>
          </Badge>
          <Button onClick={runAutonomousOptimization} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Cpu className="mr-2 h-4 w-4 animate-spin" />
                Processando IA...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Otimizar Automaticamente
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Insights Gerais */}
      {aiInsights && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {aiInsights.healthyStacks}/{aiInsights.totalStacks}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Stacks Saudáveis
                  </p>
                  <p className="text-xs text-purple-600">
                    {(
                      (aiInsights.healthyStacks / aiInsights.totalStacks) *
                      100
                    ).toFixed(1)}
                    % uptime
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {aiInsights.avgResponseTime.toFixed(0)}ms
                  </p>
                  <p className="text-xs text-muted-foreground">Tempo Médio</p>
                  <p className="text-xs text-blue-600">
                    {aiInsights.avgResponseTime < 200
                      ? "Excelente"
                      : "Otimizável"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {(aiInsights.totalRequests / 1000).toFixed(1)}K
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Requests Totais
                  </p>
                  <p className="text-xs text-green-600">Alto volume</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {systemRecommendations.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Oportunidades</p>
                  <p className="text-xs text-orange-600">IA detectou</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Configurações de Automação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Nível de Automação</span>
          </CardTitle>
          <CardDescription>
            Configure o quanto a IA pode modificar automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              className={`cursor-pointer transition-all ${
                automationLevel === "conservative" ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setAutomationLevel("conservative")}
            >
              <CardContent className="p-4 text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold">Conservativo</h3>
                <p className="text-sm text-muted-foreground">
                  Apenas sugestões, sem alterações automáticas
                </p>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all ${
                automationLevel === "balanced" ? "ring-2 ring-green-500" : ""
              }`}
              onClick={() => setAutomationLevel("balanced")}
            >
              <CardContent className="p-4 text-center">
                <Bot className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold">Balanceado</h3>
                <p className="text-sm text-muted-foreground">
                  Otimizações seguras aplicadas automaticamente
                </p>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all ${
                automationLevel === "aggressive" ? "ring-2 ring-purple-500" : ""
              }`}
              onClick={() => setAutomationLevel("aggressive")}
            >
              <CardContent className="p-4 text-center">
                <Zap className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold">Agressivo</h3>
                <p className="text-sm text-muted-foreground">
                  Máxima automação e otimização contínua
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recommendations">Recomendações IA</TabsTrigger>
          <TabsTrigger value="analysis">Análise Detalhada</TabsTrigger>
          <TabsTrigger value="consensus">Consenso 3 IAs</TabsTrigger>
          <TabsTrigger value="healing">Auto-Healing</TabsTrigger>
          <TabsTrigger value="predictive">Preditiva</TabsTrigger>
          <TabsTrigger value="templates">Templates Brasileiros</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5" />
                <span>Recomendações Inteligentes</span>
              </CardTitle>
              <CardDescription>
                Sugestões da IA baseadas em análise em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemRecommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
                  >
                    <Sparkles className="h-4 w-4 text-blue-500 mt-0.5" />
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
                {systemRecommendations.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    Execute a análise automática para ver recomendações
                    personalizadas
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid gap-4">
            {analysisResults.map((result, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {result.stackName}
                      </CardTitle>
                      <CardDescription>ID: {result.stackId}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        className={getAutomationLevelColor(
                          result.result?.automationLevel,
                        )}
                      >
                        {result.result?.automationLevel}
                      </Badge>
                      {result.applied && (
                        <Badge variant="default">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Aplicado
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {result.result && (
                    <div className="space-y-4">
                      {/* Impacto Estimado */}
                      <div>
                        <h4 className="font-semibold mb-2">Impacto Estimado</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <label className="text-xs text-muted-foreground">
                              Performance
                            </label>
                            <div className="flex items-center space-x-2">
                              <Progress
                                value={
                                  result.result.estimatedImpact.performance
                                }
                                className="flex-1"
                              />
                              <span
                                className={`text-sm font-medium ${getImpactColor(result.result.estimatedImpact.performance)}`}
                              >
                                {result.result.estimatedImpact.performance}%
                              </span>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">
                              Segurança
                            </label>
                            <div className="flex items-center space-x-2">
                              <Progress
                                value={result.result.estimatedImpact.security}
                                className="flex-1"
                              />
                              <span
                                className={`text-sm font-medium ${getImpactColor(result.result.estimatedImpact.security)}`}
                              >
                                {result.result.estimatedImpact.security}%
                              </span>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">
                              Confiabilidade
                            </label>
                            <div className="flex items-center space-x-2">
                              <Progress
                                value={
                                  result.result.estimatedImpact.reliability
                                }
                                className="flex-1"
                              />
                              <span
                                className={`text-sm font-medium ${getImpactColor(result.result.estimatedImpact.reliability)}`}
                              >
                                {result.result.estimatedImpact.reliability}%
                              </span>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">
                              Custo
                            </label>
                            <div className="flex items-center space-x-2">
                              <Progress
                                value={result.result.estimatedImpact.cost}
                                className="flex-1"
                              />
                              <span className="text-sm font-medium text-blue-600">
                                +{result.result.estimatedImpact.cost}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Recomendações */}
                      {result.result.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Recomendações</h4>
                          <ul className="space-y-1">
                            {result.result.recommendations.map(
                              (rec: string, idx: number) => (
                                <li
                                  key={idx}
                                  className="text-sm flex items-start space-x-2"
                                >
                                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{rec}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Riscos */}
                      {result.result.risks.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">
                            Riscos Identificados
                          </h4>
                          <ul className="space-y-1">
                            {result.result.risks.map(
                              (risk: string, idx: number) => (
                                <li
                                  key={idx}
                                  className="text-sm flex items-start space-x-2"
                                >
                                  <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                                  <span>{risk}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Ações */}
                      {!result.applied &&
                        result.result.automationLevel !== "manual" && (
                          <div className="pt-4 border-t">
                            <Button
                              onClick={() =>
                                applyRecommendation(
                                  result.stackId,
                                  result.result.configuration,
                                )
                              }
                              className="w-full"
                            >
                              <Zap className="mr-2 h-4 w-4" />
                              Aplicar Configuração Automática
                            </Button>
                          </div>
                        )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="consensus" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Consenso das 3 IAs</span>
              </CardTitle>
              <CardDescription>
                Decisões baseadas em consenso entre Ollama, Evolution AI e Dify
                AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              {autonomousStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {autonomousStats.aiProvidersStatus.map(
                    (provider: any, index: number) => (
                      <Card
                        key={index}
                        className={`${provider.available ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{provider.name}</h3>
                            {provider.available ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Tempo de resposta:</span>
                              <span>{provider.responseTime}ms</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Confiança:</span>
                              <span>
                                {(provider.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ),
                  )}
                </div>
              )}

              <div className="space-y-4">
                <h4 className="font-semibold">Decisões de Consenso Recentes</h4>
                {consensusDecisions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma decisão de consenso registrada ainda
                  </p>
                ) : (
                  consensusDecisions.map((decision, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium">{decision.title}</h5>
                          <Badge
                            className={`${decision.agreement >= 0.75 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                          >
                            {(decision.agreement * 100).toFixed(0)}% consenso
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {decision.description}
                        </p>
                        <div className="text-xs text-gray-500">
                          Confiança: {(decision.confidence * 100).toFixed(1)}% |
                          Ação: {decision.action}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="healing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Sistema de Auto-Healing</span>
              </CardTitle>
              <CardDescription>
                Curação autônoma de problemas detectados pelas IAs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {autonomousStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {autonomousStats.activeIssues}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Problemas Ativos
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {autonomousStats.resolvedIssues}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Resolvidos
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {autonomousStats.resolutionRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Taxa de Sucesso
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.round(autonomousStats.averageResolutionTime / 60)}
                        min
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Tempo Médio
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="font-semibold">Histórico de Auto-Cura</h4>
                {healingHistory.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma ação de auto-cura executada ainda
                  </p>
                ) : (
                  healingHistory.slice(0, 5).map((healing, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h5 className="font-medium">{healing.stackId}</h5>
                            <p className="text-sm text-muted-foreground">
                              {healing.description}
                            </p>
                          </div>
                          <Badge
                            className={
                              healing.resolved
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {healing.resolved ? "Resolvido" : "Falhou"}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(healing.timestamp).toLocaleString("pt-BR")}{" "}
                          | Severidade: {healing.severity}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Analytics Preditiva</span>
              </CardTitle>
              <CardDescription>
                Insights e predições baseadas em machine learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictiveInsights.map((insight, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="font-semibold">{insight.title}</h5>
                          <p className="text-sm text-muted-foreground mb-2">
                            {insight.description}
                          </p>
                        </div>
                        <Badge>ROI: {insight.roi}%</Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Impacto
                          </div>
                          <Progress
                            value={insight.impact * 10}
                            className="h-2"
                          />
                          <div className="text-xs text-center">
                            {insight.impact}/10
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Esforço
                          </div>
                          <Progress
                            value={insight.effort * 10}
                            className="h-2"
                          />
                          <div className="text-xs text-center">
                            {insight.effort}/10
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Timeline
                          </div>
                          <div className="text-sm font-medium">
                            {insight.timeline}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          Ações Recomendadas:
                        </div>
                        {insight.actionItems.map(
                          (action: string, actionIndex: number) => (
                            <div
                              key={actionIndex}
                              className="text-sm flex items-center space-x-2"
                            >
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span>{action}</span>
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Templates IA Brasileiros</span>
              </CardTitle>
              <CardDescription>
                Configurações pré-definidas para empresas brasileiras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiAutonomousConfig
                  .generateN8NTemplates()
                  .map((template, index) => (
                    <Card
                      key={index}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{template.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {template.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {template.tags.map(
                            (tag: string, tagIndex: number) => (
                              <Badge
                                key={tagIndex}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ),
                          )}
                        </div>
                        <Button size="sm" className="w-full">
                          <Settings className="mr-2 h-3 w-3" />
                          Instalar Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
