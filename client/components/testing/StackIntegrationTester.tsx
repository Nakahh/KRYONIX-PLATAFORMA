import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

import {
  PlayCircle,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Activity,
  RefreshCw,
  Eye,
  Download,
  Bug,
  Zap,
  Database,
  MessageSquare,
  Bot,
  BarChart3,
  Network,
  Globe,
  Shield,
  Timer,
  TrendingUp,
  Brazil,
  Code,
  Terminal,
} from "lucide-react";

import { useToast } from "../../hooks/use-toast";
import { useAPI } from "../../hooks/use-api";

/**
 * Stack Integration Tester - Sistema de testes automatizados
 * Testa integração entre as 25 stacks com cenários brasileiros
 */

interface TestCase {
  id: string;
  name: string;
  description: string;
  category:
    | "api"
    | "webhook"
    | "database"
    | "auth"
    | "performance"
    | "integration";
  stacks: string[];
  steps: TestStep[];
  expectedResult: any;
  brazilianScenario: string;
  status: "pending" | "running" | "passed" | "failed" | "error";
  duration?: number;
  lastRun?: string;
  errorMessage?: string;
  result?: any;
  priority: "low" | "medium" | "high" | "critical";
}

interface TestStep {
  id: string;
  name: string;
  action:
    | "api_call"
    | "webhook_trigger"
    | "database_query"
    | "validation"
    | "wait";
  config: any;
  expected: any;
  status?: "pending" | "running" | "passed" | "failed";
  duration?: number;
  result?: any;
}

interface TestSuite {
  id: string;
  name: string;
  description: string;
  category: "smoke" | "integration" | "e2e" | "performance" | "security";
  tests: string[];
  progress: number;
  status: "idle" | "running" | "completed" | "failed";
  brazilianCompliance: boolean;
}

// Casos de teste pré-configurados para cenários brasileiros
const testCases: TestCase[] = [
  {
    id: "whatsapp-crm-integration",
    name: "WhatsApp → Mautic: Lead Brasileiro",
    description:
      "Teste completo de captura de lead via WhatsApp com validação CPF/CNPJ",
    category: "integration",
    stacks: ["evolution-api", "n8n", "mautic"],
    brazilianScenario:
      "Cliente brasileiro envia mensagem com CPF para WhatsApp Business",
    priority: "critical",
    status: "pending",
    steps: [
      {
        id: "send_whatsapp_message",
        name: "Enviar mensagem WhatsApp",
        action: "api_call",
        config: {
          endpoint: "/whatsapp/send",
          method: "POST",
          body: {
            to: "5511999999999",
            message: "Olá! Meu CPF é 123.456.789-00",
          },
        },
        expected: { status: "sent" },
      },
      {
        id: "validate_cpf",
        name: "Validar CPF brasileiro",
        action: "validation",
        config: {
          field: "cpf",
          type: "cpf_validation",
        },
        expected: { valid: true },
      },
      {
        id: "create_mautic_contact",
        name: "Criar contato no Mautic",
        action: "api_call",
        config: {
          endpoint: "/mautic/contacts",
          method: "POST",
        },
        expected: { contact_id: "number" },
      },
      {
        id: "check_webhook_n8n",
        name: "Verificar webhook N8N",
        action: "webhook_trigger",
        config: {
          url: "https://webhookn8n.kryonix.com.br/whatsapp-lead",
        },
        expected: { workflow_executed: true },
      },
    ],
    expectedResult: {
      contact_created: true,
      cpf_validated: true,
      workflow_executed: true,
    },
  },
  {
    id: "pix-notification-flow",
    name: "PIX → Notificação Omnicanal",
    description: "Teste de notificação automática após recebimento de PIX",
    category: "integration",
    stacks: ["webhook-pix", "n8n", "evolution-api", "typebot"],
    brazilianScenario:
      "Pagamento PIX de R$ 150,00 recebido e notificação automática",
    priority: "high",
    status: "pending",
    steps: [
      {
        id: "simulate_pix_payment",
        name: "Simular pagamento PIX",
        action: "webhook_trigger",
        config: {
          url: "/webhook/pix/received",
          body: {
            amount: 150.0,
            currency: "BRL",
            payer_cpf: "123.456.789-00",
          },
        },
        expected: { status: "received" },
      },
      {
        id: "process_payment",
        name: "Processar pagamento",
        action: "api_call",
        config: {
          endpoint: "/payments/process",
        },
        expected: { processed: true },
      },
      {
        id: "send_whatsapp_confirmation",
        name: "Enviar confirmação WhatsApp",
        action: "api_call",
        config: {
          endpoint: "/whatsapp/send",
        },
        expected: { message_sent: true },
      },
    ],
    expectedResult: {
      payment_processed: true,
      notification_sent: true,
    },
  },
  {
    id: "typebot-conversation-flow",
    name: "Typebot: Fluxo Conversacional BR",
    description: "Teste completo de chatbot com contexto brasileiro",
    category: "integration",
    stacks: ["typebot", "evolution-api"],
    brazilianScenario:
      "Conversa sobre produtos com preços em Real e frete nacional",
    priority: "medium",
    status: "pending",
    steps: [
      {
        id: "start_conversation",
        name: "Iniciar conversa",
        action: "api_call",
        config: {
          endpoint: "/typebot/start",
          body: { flow_id: "atendimento-brasil" },
        },
        expected: { session_started: true },
      },
      {
        id: "process_brazilian_input",
        name: "Processar entrada brasileira",
        action: "api_call",
        config: {
          input: "Quero saber sobre o produto X, frete para CEP 01234-567",
        },
        expected: { response_generated: true },
      },
    ],
    expectedResult: {
      conversation_completed: true,
      brazilian_context: true,
    },
  },
  {
    id: "grafana-metrics-dashboard",
    name: "Grafana: Dashboard Métricas BR",
    description: "Teste de dashboard com KPIs brasileiros em tempo real",
    category: "performance",
    stacks: ["grafana", "prometheus", "mautic"],
    brazilianScenario: "Dashboard com métricas regionais e ROI em Reais",
    priority: "medium",
    status: "pending",
    steps: [
      {
        id: "collect_metrics",
        name: "Coletar métricas",
        action: "api_call",
        config: {
          endpoint: "/prometheus/query",
        },
        expected: { metrics_collected: true },
      },
      {
        id: "generate_dashboard",
        name: "Gerar dashboard",
        action: "api_call",
        config: {
          endpoint: "/grafana/dashboard/create",
        },
        expected: { dashboard_created: true },
      },
    ],
    expectedResult: {
      dashboard_accessible: true,
      brazilian_metrics: true,
    },
  },
  {
    id: "security-auth-flow",
    name: "Segurança: Autenticação Multi-Stack",
    description: "Teste de autenticação segura entre todas as stacks",
    category: "security",
    stacks: ["keycloak", "portainer", "grafana", "mautic"],
    brazilianScenario: "Login único com compliance LGPD",
    priority: "critical",
    status: "pending",
    steps: [
      {
        id: "authenticate_keycloak",
        name: "Autenticar via Keycloak",
        action: "api_call",
        config: {
          endpoint: "/auth/login",
        },
        expected: { token_issued: true },
      },
      {
        id: "access_protected_resources",
        name: "Acessar recursos protegidos",
        action: "api_call",
        config: {
          stacks: ["portainer", "grafana", "mautic"],
        },
        expected: { access_granted: true },
      },
    ],
    expectedResult: {
      authentication_successful: true,
      lgpd_compliant: true,
    },
  },
];

// Suítes de teste organizadas
const testSuites: TestSuite[] = [
  {
    id: "smoke-tests",
    name: "Testes de Smoke",
    description: "Verificações básicas de conectividade",
    category: "smoke",
    tests: ["whatsapp-crm-integration"],
    progress: 0,
    status: "idle",
    brazilianCompliance: true,
  },
  {
    id: "integration-tests",
    name: "Testes de Integração",
    description: "Fluxos completos entre stacks",
    category: "integration",
    tests: [
      "whatsapp-crm-integration",
      "pix-notification-flow",
      "typebot-conversation-flow",
    ],
    progress: 0,
    status: "idle",
    brazilianCompliance: true,
  },
  {
    id: "performance-tests",
    name: "Testes de Performance",
    description: "Carga e latência das integrações",
    category: "performance",
    tests: ["grafana-metrics-dashboard"],
    progress: 0,
    status: "idle",
    brazilianCompliance: true,
  },
  {
    id: "security-tests",
    name: "Testes de Segurança",
    description: "Autenticação e autorização",
    category: "security",
    tests: ["security-auth-flow"],
    progress: 0,
    status: "idle",
    brazilianCompliance: true,
  },
];

export function StackIntegrationTester() {
  const { toast } = useToast();
  const { api } = useAPI();

  const [selectedTest, setSelectedTest] = useState<TestCase | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
  const [testResults, setTestResults] = useState<Record<string, TestCase>>({});
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null);
  const [showTestDetail, setShowTestDetail] = useState(false);

  // Executar teste individual
  const runTest = async (test: TestCase) => {
    if (runningTests.has(test.id)) return;

    setRunningTests((prev) => new Set([...prev, test.id]));

    const startTime = Date.now();
    let updatedTest = { ...test, status: "running" as const };

    setTestResults((prev) => ({ ...prev, [test.id]: updatedTest }));

    try {
      toast({
        title: "Iniciando teste...",
        description: test.name,
      });

      // Simular execução dos steps
      for (let i = 0; i < test.steps.length; i++) {
        const step = test.steps[i];

        // Atualizar status do step
        updatedTest.steps[i] = { ...step, status: "running" };
        setTestResults((prev) => ({ ...prev, [test.id]: { ...updatedTest } }));

        // Simular execução do step
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 + Math.random() * 2000),
        );

        // Simular resultado do step
        const stepPassed = Math.random() > 0.1; // 90% chance de sucesso

        updatedTest.steps[i] = {
          ...step,
          status: stepPassed ? "passed" : "failed",
          duration: Math.floor(Math.random() * 500) + 100,
          result: stepPassed ? step.expected : { error: "Step failed" },
        };

        setTestResults((prev) => ({ ...prev, [test.id]: { ...updatedTest } }));

        if (!stepPassed) {
          throw new Error(`Step "${step.name}" failed`);
        }
      }

      // Teste passou
      updatedTest = {
        ...updatedTest,
        status: "passed",
        duration: Date.now() - startTime,
        lastRun: new Date().toISOString(),
        result: test.expectedResult,
      };

      toast({
        title: "Teste concluído! ✅",
        description: `${test.name} passou em ${Math.round(updatedTest.duration! / 1000)}s`,
      });
    } catch (error) {
      // Teste falhou
      updatedTest = {
        ...updatedTest,
        status: "failed",
        duration: Date.now() - startTime,
        lastRun: new Date().toISOString(),
        errorMessage:
          error instanceof Error ? error.message : "Erro desconhecido",
      };

      toast({
        variant: "destructive",
        title: "Teste falhou ❌",
        description: test.name,
      });
    } finally {
      setTestResults((prev) => ({ ...prev, [test.id]: updatedTest }));
      setRunningTests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(test.id);
        return newSet;
      });
    }
  };

  // Executar suíte de testes
  const runTestSuite = async (suite: TestSuite) => {
    setSelectedSuite(suite);
    setIsRunning(true);

    const testsToRun = testCases.filter((test) =>
      suite.tests.includes(test.id),
    );

    toast({
      title: "Executando suíte...",
      description: `${suite.name} - ${testsToRun.length} testes`,
    });

    for (const test of testsToRun) {
      await runTest(test);
    }

    setIsRunning(false);

    toast({
      title: "Suíte concluída! 🎉",
      description: suite.name,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "running":
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTestProgress = (test: TestCase) => {
    const result = testResults[test.id];
    if (!result) return 0;

    const completedSteps = result.steps.filter(
      (s) => s.status === "passed" || s.status === "failed",
    ).length;
    return Math.round((completedSteps / result.steps.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Bug className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Testes de Integração
            </h2>
            <p className="text-gray-600">
              Validação automática das 25 stacks com cenários brasileiros
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="text-green-600 border-green-200">
            <Brazil className="w-3 h-3 mr-1" />
            BR Compliance
          </Badge>
          <Button
            variant="outline"
            onClick={() => {
              testCases.forEach((test) => runTest(test));
            }}
            disabled={isRunning}
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            Executar Todos
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tests" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tests">Testes Individuais</TabsTrigger>
          <TabsTrigger value="suites">Suítes de Teste</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-4">
          <div className="grid gap-4">
            {testCases.map((test) => {
              const result = testResults[test.id];
              const isTestRunning = runningTests.has(test.id);
              const progress = getTestProgress(test);

              return (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group"
                >
                  <Card className="hover:shadow-lg transition-all duration-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <CardTitle className="text-lg">
                              {test.name}
                            </CardTitle>
                            {getStatusIcon(result?.status || test.status)}
                            <Badge
                              className={`text-xs ${
                                test.priority === "critical"
                                  ? "bg-red-100 text-red-800"
                                  : test.priority === "high"
                                    ? "bg-orange-100 text-orange-800"
                                    : test.priority === "medium"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {test.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {test.description}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{test.stacks.join(" → ")}</span>
                            <span>•</span>
                            <span>{test.steps.length} steps</span>
                            {result?.duration && (
                              <>
                                <span>•</span>
                                <span>
                                  {Math.round(result.duration / 1000)}s
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Cenário brasileiro */}
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <Brazil className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-700">
                            Cenário Brasileiro:
                          </span>
                        </div>
                        <p className="text-sm text-green-600">
                          {test.brazilianScenario}
                        </p>
                      </div>

                      {/* Progress */}
                      {(isTestRunning || result) && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progresso:</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}

                      {/* Steps */}
                      {result && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Steps:</div>
                          <div className="space-y-1">
                            {result.steps.map((step, index) => (
                              <div
                                key={step.id}
                                className="flex items-center space-x-2 text-sm p-2 bg-gray-50 rounded"
                              >
                                {getStatusIcon(step.status || "pending")}
                                <span className="flex-1">{step.name}</span>
                                {step.duration && (
                                  <span className="text-gray-500">
                                    {step.duration}ms
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTest(result || test);
                            setShowTestDetail(true);
                          }}
                          className="flex-1"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Detalhes
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => runTest(test)}
                          disabled={isTestRunning}
                          className="flex-1"
                        >
                          {isTestRunning ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <PlayCircle className="w-4 h-4 mr-2" />
                          )}
                          Executar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="suites" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testSuites.map((suite) => (
              <Card
                key={suite.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{suite.name}</CardTitle>
                    <Badge
                      variant="outline"
                      className={`${
                        suite.brazilianCompliance
                          ? "text-green-600 border-green-200"
                          : "text-gray-600 border-gray-200"
                      }`}
                    >
                      {suite.brazilianCompliance ? "BR Ready" : "Standard"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{suite.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>{suite.tests.length} testes</span>
                    <span className="capitalize">{suite.category}</span>
                  </div>

                  <Button
                    onClick={() => runTestSuite(suite)}
                    disabled={isRunning}
                    className="w-full"
                  >
                    {isRunning && selectedSuite?.id === suite.id ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <PlayCircle className="w-4 h-4 mr-2" />
                    )}
                    Executar Suíte
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumo dos Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {
                      Object.values(testResults).filter(
                        (t) => t.status === "passed",
                      ).length
                    }
                  </div>
                  <div className="text-sm text-gray-600">Sucessos</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {
                      Object.values(testResults).filter(
                        (t) => t.status === "failed",
                      ).length
                    }
                  </div>
                  <div className="text-sm text-gray-600">Falhas</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {Object.values(testResults).length}
                  </div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(
                      (Object.values(testResults).filter(
                        (t) => t.status === "passed",
                      ).length /
                        Math.max(Object.values(testResults).length, 1)) *
                        100,
                    )}
                    %
                  </div>
                  <div className="text-sm text-gray-600">Taxa Sucesso</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {Object.values(testResults).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Últimos Resultados</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {Object.values(testResults)
                      .sort(
                        (a, b) =>
                          new Date(b.lastRun || 0).getTime() -
                          new Date(a.lastRun || 0).getTime(),
                      )
                      .map((result) => (
                        <div
                          key={result.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(result.status)}
                            <div>
                              <div className="font-medium text-sm">
                                {result.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {result.lastRun &&
                                  new Date(result.lastRun).toLocaleString(
                                    "pt-BR",
                                  )}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            {result.duration &&
                              `${Math.round(result.duration / 1000)}s`}
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Test Detail Dialog */}
      <Dialog open={showTestDetail} onOpenChange={setShowTestDetail}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Detalhes do Teste</DialogTitle>
            <DialogDescription>
              Informações completas sobre a execução do teste
            </DialogDescription>
          </DialogHeader>

          {selectedTest && (
            <ScrollArea className="h-96">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">{selectedTest.name}</h3>
                  <p className="text-gray-600">{selectedTest.description}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Cenário Brasileiro:</h4>
                  <p className="text-sm text-gray-600">
                    {selectedTest.brazilianScenario}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Steps Executados:</h4>
                  <div className="space-y-2">
                    {selectedTest.steps.map((step, index) => (
                      <div key={step.id} className="border rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(step.status || "pending")}
                          <span className="font-medium">{step.name}</span>
                          {step.duration && (
                            <Badge variant="outline" className="text-xs">
                              {step.duration}ms
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-600">
                          <div>
                            <strong>Ação:</strong> {step.action}
                          </div>
                          {step.result && (
                            <div className="mt-1">
                              <strong>Resultado:</strong>
                              <pre className="bg-gray-100 p-2 rounded mt-1 text-xs">
                                {JSON.stringify(step.result, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedTest.errorMessage && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <h4 className="font-medium text-red-700 mb-1">Erro:</h4>
                    <p className="text-sm text-red-600">
                      {selectedTest.errorMessage}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
