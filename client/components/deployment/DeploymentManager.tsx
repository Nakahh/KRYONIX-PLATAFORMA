import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Alert, AlertDescription } from "../ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import orchestrationService, {
  DeploymentPlan,
  DeploymentStep,
} from "../../services/brazilian-stack-orchestration";
import {
  Rocket,
  GitBranch,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Settings,
  Users,
  Calendar,
  Target,
  Shield,
  Zap,
  Activity,
  TrendingUp,
  Database,
  Server,
  Globe,
  RefreshCw,
  PlayCircle,
  StopCircle,
  FastForward,
} from "lucide-react";

interface DeploymentHistory {
  id: string;
  plano: string;
  estrategia: "blue-green" | "rolling" | "canary";
  status: "pendente" | "executando" | "sucesso" | "falha" | "rollback";
  iniciadoEm: Date;
  concluídoEm?: Date;
  executadoPor: string;
  stacksAfetadas: string[];
  tempoExecucao?: number;
  etapaAtual?: number;
  totalEtapas: number;
  detalhes?: string;
  erro?: string;
}

interface DeploymentEnvironment {
  nome: string;
  url: string;
  status: "ativo" | "inativo" | "preparando";
  versao: string;
  ultimaAtualizacao: Date;
  traffic: number;
}

interface RollbackOption {
  id: string;
  versao: string;
  timestamp: Date;
  descricao: string;
  estavel: boolean;
  riscoRollback: "baixo" | "medio" | "alto";
}

const DeploymentManager: React.FC = () => {
  const [deployments, setDeployments] = useState<DeploymentHistory[]>([]);
  const [planosDisponiveis, setPlanosDisponiveis] = useState<DeploymentPlan[]>(
    [],
  );
  const [environments, setEnvironments] = useState<DeploymentEnvironment[]>([]);
  const [rollbackOptions, setRollbackOptions] = useState<RollbackOption[]>([]);
  const [deploymentAtivo, setDeploymentAtivo] =
    useState<DeploymentHistory | null>(null);
  const [modoManutencao, setModoManutencao] = useState(false);
  const [autoApproval, setAutoApproval] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();

    const interval = setInterval(() => {
      if (deploymentAtivo) {
        atualizarDeploymentAtivo();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [deploymentAtivo]);

  const carregarDados = async () => {
    try {
      const deploymentsData = await gerarDeploymentsExemplo();
      const planosData = await gerarPlanosExemplo();
      const environmentsData = await gerarEnvironmentsExemplo();
      const rollbackData = await gerarRollbackOptionsExemplo();

      setDeployments(deploymentsData);
      setPlanosDisponiveis(planosData);
      setEnvironments(environmentsData);
      setRollbackOptions(rollbackData);

      // Verificar se há deployment em execução
      const ativo = deploymentsData.find((d) => d.status === "executando");
      if (ativo) {
        setDeploymentAtivo(ativo);
      }

      setLoading(false);
    } catch (error) {
      console.error("❌ Erro ao carregar dados de deployment:", error);
      setLoading(false);
    }
  };

  const gerarDeploymentsExemplo = (): DeploymentHistory[] => {
    const agora = new Date();
    return [
      {
        id: "deploy-001",
        plano: "Atualização WhatsApp API v2.1",
        estrategia: "blue-green",
        status: "executando",
        iniciadoEm: new Date(agora.getTime() - 10 * 60 * 1000),
        executadoPor: "Sistema IA",
        stacksAfetadas: ["evolution-api", "nginx"],
        etapaAtual: 3,
        totalEtapas: 5,
        detalhes: "Executando testes de health check",
      },
      {
        id: "deploy-002",
        plano: "Deploy N8N Workflows v3.2",
        estrategia: "rolling",
        status: "sucesso",
        iniciadoEm: new Date(agora.getTime() - 2 * 60 * 60 * 1000),
        concluídoEm: new Date(agora.getTime() - 1.8 * 60 * 60 * 1000),
        executadoPor: "admin@kryonix.com.br",
        stacksAfetadas: ["n8n", "webhook-manager"],
        totalEtapas: 4,
        tempoExecucao: 12 * 60 * 1000,
        detalhes: "Deploy concluído com sucesso. 15 workflows atualizados.",
      },
      {
        id: "deploy-003",
        plano: "Atualização Database PostgreSQL",
        estrategia: "canary",
        status: "rollback",
        iniciadoEm: new Date(agora.getTime() - 6 * 60 * 60 * 1000),
        concluídoEm: new Date(agora.getTime() - 5.7 * 60 * 60 * 1000),
        executadoPor: "Sistema IA",
        stacksAfetadas: ["postgresql", "backup-manager"],
        totalEtapas: 6,
        tempoExecucao: 18 * 60 * 1000,
        erro: "Performance degradada detectada. Rollback automático executado.",
      },
      {
        id: "deploy-004",
        plano: "Deploy Typebot v4.0",
        estrategia: "blue-green",
        status: "sucesso",
        iniciadoEm: new Date(agora.getTime() - 24 * 60 * 60 * 1000),
        concluídoEm: new Date(agora.getTime() - 23.5 * 60 * 60 * 1000),
        executadoPor: "tech@kryonix.com.br",
        stacksAfetadas: ["typebot", "nginx"],
        totalEtapas: 4,
        tempoExecucao: 30 * 60 * 1000,
        detalhes: "Nova versão com melhorias de performance",
      },
    ];
  };

  const gerarPlanosExemplo = (): DeploymentPlan[] => {
    return [
      {
        id: "plano-001",
        nome: "Atualização Security Patches",
        stacks: ["nginx", "certbot", "security-scanner"],
        estrategia: "rolling",
        etapas: [
          {
            ordem: 1,
            stack: "security-scanner",
            acao: "update",
            dependencias: [],
            timeout: 300000,
            verificacoes: [],
          },
          {
            ordem: 2,
            stack: "nginx",
            acao: "update",
            dependencias: ["security-scanner"],
            timeout: 180000,
            verificacoes: [],
          },
        ],
        rollbackPlan: {
          estrategia: "automatico",
          condicoes: ["error_rate > 5%", "response_time > 2000ms"],
          etapas: [],
        },
        aprovado: false,
      },
      {
        id: "plano-002",
        nome: "Deploy Mautic Marketing v5.0",
        stacks: ["mautic", "mysql", "redis"],
        estrategia: "blue-green",
        etapas: [
          {
            ordem: 1,
            stack: "mysql",
            acao: "backup",
            dependencias: [],
            timeout: 600000,
            verificacoes: [],
          },
          {
            ordem: 2,
            stack: "mautic",
            acao: "deploy",
            dependencias: ["mysql"],
            timeout: 900000,
            verificacoes: [],
          },
        ],
        rollbackPlan: {
          estrategia: "automatico",
          condicoes: ["error_rate > 3%"],
          etapas: [],
        },
        aprovado: true,
      },
    ];
  };

  const gerarEnvironmentsExemplo = (): DeploymentEnvironment[] => {
    return [
      {
        nome: "Produção",
        url: "https://app.kryonix.com.br",
        status: "ativo",
        versao: "v2.1.4",
        ultimaAtualizacao: new Date(Date.now() - 2 * 60 * 60 * 1000),
        traffic: 85,
      },
      {
        nome: "Blue (Standby)",
        url: "https://blue.kryonix.com.br",
        status: "preparando",
        versao: "v2.1.5",
        ultimaAtualizacao: new Date(Date.now() - 10 * 60 * 1000),
        traffic: 15,
      },
      {
        nome: "Staging",
        url: "https://staging.kryonix.com.br",
        status: "ativo",
        versao: "v2.2.0-beta",
        ultimaAtualizacao: new Date(Date.now() - 30 * 60 * 1000),
        traffic: 0,
      },
    ];
  };

  const gerarRollbackOptionsExemplo = (): RollbackOption[] => {
    const agora = new Date();
    return [
      {
        id: "rollback-001",
        versao: "v2.1.4",
        timestamp: new Date(agora.getTime() - 2 * 60 * 60 * 1000),
        descricao: "Versão estável - última produção",
        estavel: true,
        riscoRollback: "baixo",
      },
      {
        id: "rollback-002",
        versao: "v2.1.3",
        timestamp: new Date(agora.getTime() - 24 * 60 * 60 * 1000),
        descricao: "Versão anterior com correções críticas",
        estavel: true,
        riscoRollback: "baixo",
      },
      {
        id: "rollback-003",
        versao: "v2.1.2",
        timestamp: new Date(agora.getTime() - 72 * 60 * 60 * 1000),
        descricao: "Versão com funcionalidades completas",
        estavel: false,
        riscoRollback: "medio",
      },
    ];
  };

  const atualizarDeploymentAtivo = () => {
    if (!deploymentAtivo) return;

    // Simular progresso do deployment
    setDeploymentAtivo((prev) => {
      if (!prev) return null;

      const novaEtapa = Math.min(prev.etapaAtual! + 1, prev.totalEtapas);
      const concluido = novaEtapa >= prev.totalEtapas;

      return {
        ...prev,
        etapaAtual: novaEtapa,
        status: concluido ? "sucesso" : "executando",
        concluídoEm: concluido ? new Date() : undefined,
        tempoExecucao: concluido
          ? Date.now() - prev.iniciadoEm.getTime()
          : undefined,
        detalhes: concluido
          ? "Deploy concluído com sucesso"
          : `Executando etapa ${novaEtapa}/${prev.totalEtapas}`,
      };
    });
  };

  const executarDeployment = async (planoId: string) => {
    const plano = planosDisponiveis.find((p) => p.id === planoId);
    if (!plano) return;

    const novoDeployment: DeploymentHistory = {
      id: `deploy-${Date.now()}`,
      plano: plano.nome,
      estrategia: plano.estrategia,
      status: "executando",
      iniciadoEm: new Date(),
      executadoPor: "Sistema IA",
      stacksAfetadas: plano.stacks,
      etapaAtual: 1,
      totalEtapas: plano.etapas.length,
      detalhes: "Iniciando deployment...",
    };

    setDeployments((prev) => [novoDeployment, ...prev]);
    setDeploymentAtivo(novoDeployment);
  };

  const executarRollback = async (rollbackId: string) => {
    const rollback = rollbackOptions.find((r) => r.id === rollbackId);
    if (!rollback) return;

    const novoDeployment: DeploymentHistory = {
      id: `rollback-${Date.now()}`,
      plano: `Rollback para ${rollback.versao}`,
      estrategia: "blue-green",
      status: "executando",
      iniciadoEm: new Date(),
      executadoPor: "Sistema IA",
      stacksAfetadas: ["evolution-api", "n8n", "typebot"],
      etapaAtual: 1,
      totalEtapas: 3,
      detalhes: `Executando rollback para versão ${rollback.versao}...`,
    };

    setDeployments((prev) => [novoDeployment, ...prev]);
    setDeploymentAtivo(novoDeployment);
  };

  const pausarDeployment = () => {
    if (deploymentAtivo) {
      setDeploymentAtivo((prev) =>
        prev ? { ...prev, status: "pausado" as any } : null,
      );
    }
  };

  const retomarDeployment = () => {
    if (deploymentAtivo) {
      setDeploymentAtivo((prev) =>
        prev ? { ...prev, status: "executando" } : null,
      );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pendente":
        return <Clock className="h-4 w-4 text-gray-500" />;
      case "executando":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case "sucesso":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "falha":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "rollback":
        return <RotateCcw className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "sucesso":
        return "border-green-200 bg-green-50";
      case "falha":
        return "border-red-200 bg-red-50";
      case "executando":
        return "border-blue-200 bg-blue-50";
      case "rollback":
        return "border-yellow-200 bg-yellow-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getEstrategiaIcon = (estrategia: string) => {
    switch (estrategia) {
      case "blue-green":
        return <GitBranch className="h-4 w-4" />;
      case "rolling":
        return <RefreshCw className="h-4 w-4" />;
      case "canary":
        return <Target className="h-4 w-4" />;
      default:
        return <Rocket className="h-4 w-4" />;
    }
  };

  const getRiscoColor = (risco: string): string => {
    switch (risco) {
      case "baixo":
        return "text-green-600 bg-green-100";
      case "medio":
        return "text-yellow-600 bg-yellow-100";
      case "alto":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-8 h-8 mx-auto mb-4"
          >
            <Rocket className="w-full h-full text-blue-500" />
          </motion.div>
          <p className="text-gray-600">Carregando sistema de deployment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-6 w-6 text-blue-600" />
                Sistema de Deployment Inteligente
              </CardTitle>
              <CardDescription>
                Deployment automático com rollback inteligente e zero downtime
              </CardDescription>
            </div>

            <div className="flex items-center gap-4">
              {modoManutencao && (
                <Badge variant="destructive" className="gap-1">
                  <Settings className="h-3 w-3" />
                  Modo Manutenção
                </Badge>
              )}

              {deploymentAtivo && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={
                      deploymentAtivo.status === "executando"
                        ? pausarDeployment
                        : retomarDeployment
                    }
                    className="gap-2"
                  >
                    {deploymentAtivo.status === "executando" ? (
                      <>
                        <Pause className="h-4 w-4" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Retomar
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {deployments.length}
              </div>
              <div className="text-xs text-gray-600">Total Deployments</div>
            </div>

            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {deployments.filter((d) => d.status === "sucesso").length}
              </div>
              <div className="text-xs text-gray-600">Sucessos</div>
            </div>

            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {deployments.filter((d) => d.status === "falha").length}
              </div>
              <div className="text-xs text-gray-600">Falhas</div>
            </div>

            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {deployments.filter((d) => d.status === "rollback").length}
              </div>
              <div className="text-xs text-gray-600">Rollbacks</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Deployment Ativo</TabsTrigger>
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="environments">Ambientes</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        {/* Deployment Ativo */}
        <TabsContent value="active" className="space-y-6">
          {deploymentAtivo ? (
            <Card className={getStatusColor(deploymentAtivo.status)}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(deploymentAtivo.status)}
                    {deploymentAtivo.plano}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {getEstrategiaIcon(deploymentAtivo.estrategia)}
                    <Badge variant="outline">
                      {deploymentAtivo.estrategia}
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  Executado por {deploymentAtivo.executadoPor} •{" "}
                  {deploymentAtivo.stacksAfetadas.length} stacks afetadas
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Progresso</span>
                      <span className="text-sm text-gray-600">
                        Etapa {deploymentAtivo.etapaAtual}/
                        {deploymentAtivo.totalEtapas}
                      </span>
                    </div>
                    <Progress
                      value={
                        (deploymentAtivo.etapaAtual! /
                          deploymentAtivo.totalEtapas) *
                        100
                      }
                      className="h-3"
                    />
                  </div>

                  {/* Detalhes */}
                  <div className="p-3 bg-white rounded-lg border">
                    <h4 className="font-medium mb-2">Status Atual</h4>
                    <p className="text-sm text-gray-600">
                      {deploymentAtivo.detalhes}
                    </p>

                    <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Iniciado:</span>
                        <div className="font-medium">
                          {deploymentAtivo.iniciadoEm.toLocaleString("pt-BR")}
                        </div>
                      </div>

                      <div>
                        <span className="text-gray-500">Tempo Decorrido:</span>
                        <div className="font-medium">
                          {Math.floor(
                            (Date.now() -
                              deploymentAtivo.iniciadoEm.getTime()) /
                              60000,
                          )}
                          min
                        </div>
                      </div>

                      <div>
                        <span className="text-gray-500">Stacks:</span>
                        <div className="font-medium">
                          {deploymentAtivo.stacksAfetadas.join(", ")}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={
                        deploymentAtivo.status === "executando"
                          ? pausarDeployment
                          : retomarDeployment
                      }
                      className="gap-2"
                    >
                      {deploymentAtivo.status === "executando" ? (
                        <>
                          <Pause className="h-4 w-4" />
                          Pausar Deploy
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Retomar Deploy
                        </>
                      )}
                    </Button>

                    <Button variant="outline" className="gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Rollback Manual
                    </Button>

                    <Button variant="ghost" className="gap-2">
                      <Eye className="h-4 w-4" />
                      Ver Logs
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Rocket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum Deployment Ativo
                </h3>
                <p className="text-gray-600 mb-4">
                  Todos os deployments foram concluídos. Sistema pronto para
                  nova atualização.
                </p>
                <Button className="gap-2">
                  <Play className="h-4 w-4" />
                  Iniciar Novo Deployment
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Planos de Deployment */}
        <TabsContent value="plans" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {planosDisponiveis.map((plano) => (
              <Card key={plano.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{plano.nome}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getEstrategiaIcon(plano.estrategia)}
                      <Badge variant="outline">{plano.estrategia}</Badge>
                    </div>
                  </div>
                  <CardDescription>
                    {plano.stacks.length} stacks • {plano.etapas.length} etapas
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Stacks Afetadas
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {plano.stacks.map((stack) => (
                          <Badge
                            key={stack}
                            variant="secondary"
                            className="text-xs"
                          >
                            {stack}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Status</h4>
                      <Badge variant={plano.aprovado ? "default" : "secondary"}>
                        {plano.aprovado ? "Aprovado" : "Aguardando Aprovação"}
                      </Badge>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        onClick={() => executarDeployment(plano.id)}
                        disabled={!plano.aprovado || !!deploymentAtivo}
                        className="gap-2"
                      >
                        <PlayCircle className="h-4 w-4" />
                        Executar
                      </Button>

                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        Detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Ambientes */}
        <TabsContent value="environments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {environments.map((env) => (
              <Card key={env.nome}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {env.nome}
                    </CardTitle>
                    <Badge
                      variant={
                        env.status === "ativo"
                          ? "default"
                          : env.status === "preparando"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {env.status}
                    </Badge>
                  </div>
                  <CardDescription>{env.url}</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-600">Versão</div>
                      <div className="font-medium">{env.versao}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600">Traffic</div>
                      <div className="flex items-center gap-2">
                        <Progress value={env.traffic} className="flex-1 h-2" />
                        <span className="text-sm font-medium">
                          {env.traffic}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600">
                        Última Atualização
                      </div>
                      <div className="text-sm">
                        {env.ultimaAtualizacao.toLocaleString("pt-BR")}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Histórico */}
        <TabsContent value="history" className="space-y-6">
          <div className="space-y-3">
            {deployments.map((deployment) => (
              <Card
                key={deployment.id}
                className={getStatusColor(deployment.status)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(deployment.status)}
                      <div>
                        <h4 className="font-medium">{deployment.plano}</h4>
                        <p className="text-sm text-gray-600">
                          {deployment.executadoPor} • {deployment.estrategia} •
                          {deployment.stacksAfetadas.length} stacks
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {deployment.iniciadoEm.toLocaleString("pt-BR")}
                      </div>
                      {deployment.tempoExecucao && (
                        <div className="text-xs text-gray-500">
                          {Math.floor(deployment.tempoExecucao / 60000)}min{" "}
                          {Math.floor(
                            (deployment.tempoExecucao % 60000) / 1000,
                          )}
                          s
                        </div>
                      )}
                    </div>
                  </div>

                  {(deployment.detalhes || deployment.erro) && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-600">
                        {deployment.detalhes || deployment.erro}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Painel de Rollback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Opções de Rollback
          </CardTitle>
          <CardDescription>
            Versões estáveis disponíveis para rollback em caso de problemas
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {rollbackOptions.map((option) => (
              <div
                key={option.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <h4 className="font-medium">{option.versao}</h4>
                  <p className="text-sm text-gray-600">{option.descricao}</p>
                  <p className="text-xs text-gray-500">
                    {option.timestamp.toLocaleString("pt-BR")}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={getRiscoColor(option.riscoRollback)}>
                    Risco {option.riscoRollback}
                  </Badge>

                  {option.estavel && (
                    <Badge variant="outline" className="text-green-600">
                      Estável
                    </Badge>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => executarRollback(option.id)}
                    disabled={!!deploymentAtivo}
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Rollback
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeploymentManager;
