import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useMobileAdvanced } from "../hooks/use-mobile-advanced";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  CreditCard,
  Settings,
  TrendingUp,
  Users,
  MessageSquare,
  Zap,
  Bot,
  Cloud,
  Shield,
  AlertTriangle,
  QrCode,
  Receipt,
  Smartphone,
  DollarSign,
} from "lucide-react";
import {
  Plan,
  Subscription,
  UsageResponse,
  SubscriptionResponse,
  PlanListResponse,
  BillingCycle,
} from "../../shared/billing";

const BillingPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isMobile, screenSize } = useMobileAdvanced();

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load plans
      const plansResponse = await fetch("/api/billing/plans");
      if (!plansResponse.ok) throw new Error("Failed to load plans");
      const plansData: PlanListResponse = await plansResponse.json();
      setPlans(plansData.plans);

      // Load subscription (with user authentication header)
      const subscriptionResponse = await fetch("/api/billing/subscription", {
        headers: { "x-user-id": "demo-user-123" }, // Demo user ID
      });

      if (subscriptionResponse.ok) {
        const subscriptionData: SubscriptionResponse =
          await subscriptionResponse.json();
        setSubscription(subscriptionData.subscription);
        setCurrentPlan(subscriptionData.plan);

        // Load usage
        const usageResponse = await fetch("/api/billing/usage", {
          headers: { "x-user-id": "demo-user-123" },
        });
        if (usageResponse.ok) {
          const usageData: UsageResponse = await usageResponse.json();
          setUsage(usageData);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load billing data",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      const response = await fetch("/api/billing/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "demo-user-123",
        },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create subscription");
      }

      const result = await response.json();

      if (result.requiresAction && result.clientSecret) {
        // In a real app, redirect to Stripe payment confirmation
        alert("Payment confirmation required. Redirecting to Stripe...");
      } else {
        alert("Subscription created successfully!");
        loadBillingData();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to subscribe");
    }
  };

  const openBillingPortal = async () => {
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "demo-user-123",
        },
        body: JSON.stringify({ returnUrl: window.location.href }),
      });

      if (!response.ok)
        throw new Error("Failed to create billing portal session");

      const { url } = await response.json();
      window.open(url, "_blank");
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to open billing portal",
      );
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const getFeatureIcon = (feature: string) => {
    const icons: Record<string, React.ReactNode> = {
      whatsappInstances: <MessageSquare className="h-4 w-4" />,
      messagesPerMonth: <MessageSquare className="h-4 w-4" />,
      automationRules: <Zap className="h-4 w-4" />,
      teamMembers: <Users className="h-4 w-4" />,
      chatbotFlows: <Bot className="h-4 w-4" />,
      apiCalls: <Settings className="h-4 w-4" />,
      storageGB: <Cloud className="h-4 w-4" />,
      prioritySupport: <Shield className="h-4 w-4" />,
    };
    return icons[feature] || <CheckCircle className="h-4 w-4" />;
  };

  const formatFeatureValue = (key: string, value: any) => {
    if (value === -1) return "Ilimitado";
    if (value === true) return "Incluído";
    if (value === false) return "Não incluído";

    const units: Record<string, string> = {
      messagesPerMonth: "/mês",
      apiCalls: "/mês",
      storageGB: "GB",
      teamMembers: "usuários",
      whatsappInstances: "instâncias",
    };

    return `${value.toLocaleString()}${units[key] || ""}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Carregando informações de cobrança...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Billing & Plans
        </h1>
        <p className="text-gray-600">
          Gerencie sua assinatura e acompanhe o uso da plataforma KRYONIX
        </p>
      </div>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList
          className={`grid w-full ${isMobile ? "grid-cols-2" : "grid-cols-4"}`}
        >
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="subscription">Assinatura</TabsTrigger>
          <TabsTrigger value="usage">Uso</TabsTrigger>
          <TabsTrigger value="pix">PIX</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${plan.isPopular ? "border-blue-500 shadow-lg" : ""}`}
              >
                {plan.isPopular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                    Mais Popular
                  </Badge>
                )}

                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      {formatCurrency(plan.price, plan.currency)}
                    </span>
                    <span className="text-gray-600">
                      /
                      {plan.billingCycle === BillingCycle.MONTHLY
                        ? "mês"
                        : "ano"}
                    </span>
                  </div>
                  {plan.trialDays > 0 && (
                    <Badge variant="outline" className="mt-2">
                      {plan.trialDays} dias grátis
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {Object.entries(plan.features).map(([key, value]) => {
                      if (typeof value === "boolean" && !value) return null;

                      return (
                        <div key={key} className="flex items-center gap-2">
                          {getFeatureIcon(key)}
                          <span className="text-sm">
                            {key === "whatsappInstances" && "WhatsApp: "}
                            {key === "messagesPerMonth" && "Mensagens: "}
                            {key === "automationRules" && "Automações: "}
                            {key === "teamMembers" && "Equipe: "}
                            {key === "chatbotFlows" && "Chatbots: "}
                            {key === "apiCalls" && "API Calls: "}
                            {key === "storageGB" && "Armazenamento: "}
                            {key === "prioritySupport" &&
                              value &&
                              "Suporte Prioritário"}
                            {key === "whiteLabel" && value && "White Label"}
                            {key === "customDomain" &&
                              value &&
                              "Domínio Personalizado"}
                            {![
                              "prioritySupport",
                              "whiteLabel",
                              "customDomain",
                            ].includes(key) && formatFeatureValue(key, value)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.isPopular ? "default" : "outline"}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={subscription?.planId === plan.id}
                  >
                    {subscription?.planId === plan.id
                      ? "Plano Atual"
                      : "Assinar Agora"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          {subscription && currentPlan ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Assinatura Atual
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold">{currentPlan.name}</p>
                    <p className="text-gray-600">{currentPlan.description}</p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Status</p>
                      <Badge
                        variant={
                          subscription.status === "ACTIVE"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {subscription.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium">Próxima Cobrança</p>
                      <p>
                        {new Date(
                          subscription.currentPeriodEnd,
                        ).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Valor</p>
                      <p>
                        {formatCurrency(
                          currentPlan.price,
                          currentPlan.currency,
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Período</p>
                      <p>
                        {currentPlan.billingCycle === BillingCycle.MONTHLY
                          ? "Mensal"
                          : "Anual"}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={openBillingPortal}
                    className="w-full"
                    variant="outline"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Gerenciar Assinatura
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recursos Incluídos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(currentPlan.features).map(
                      ([key, value]) => {
                        if (typeof value === "boolean" && !value) return null;

                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              {getFeatureIcon(key)}
                              <span className="text-sm">
                                {key === "whatsappInstances" &&
                                  "WhatsApp Instâncias"}
                                {key === "messagesPerMonth" && "Mensagens/mês"}
                                {key === "automationRules" &&
                                  "Regras de Automação"}
                                {key === "teamMembers" && "Membros da Equipe"}
                                {key === "chatbotFlows" && "Fluxos de Chatbot"}
                                {key === "apiCalls" && "Chamadas API/mês"}
                                {key === "storageGB" && "Armazenamento (GB)"}
                                {key === "prioritySupport" &&
                                  value &&
                                  "Suporte Prioritário"}
                                {key === "whiteLabel" && value && "White Label"}
                                {key === "customDomain" &&
                                  value &&
                                  "Domínio Personalizado"}
                              </span>
                            </div>
                            <span className="text-sm font-medium">
                              {formatFeatureValue(key, value)}
                            </span>
                          </div>
                        );
                      },
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Nenhuma Assinatura Ativa
                </h3>
                <p className="text-gray-600 mb-4">
                  Escolha um plano para começar a usar a plataforma KRYONIX
                </p>
                <Button
                  onClick={() =>
                    document.querySelector('[value="plans"]')?.click()
                  }
                >
                  Ver Planos Disponíveis
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          {usage && currentPlan ? (
            <div className="space-y-6">
              {usage.warnings.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside">
                      {usage.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(usage.current).map(([key, value]) => {
                  if (
                    ![
                      "whatsappInstancesUsed",
                      "messagesSent",
                      "automationRulesUsed",
                      "teamMembersActive",
                      "chatbotFlowsUsed",
                      "apiCallsMade",
                      "storageUsedGB",
                    ].includes(key)
                  )
                    return null;

                  const limit = (usage.limits as any)[
                    key
                      .replace("Used", "")
                      .replace("Sent", "PerMonth")
                      .replace("Made", "")
                      .replace("Active", "")
                  ];
                  const percentage = usage.percentage[key] || 0;

                  return (
                    <Card key={key}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          {getFeatureIcon(key)}
                          {key === "whatsappInstancesUsed" &&
                            "WhatsApp Instâncias"}
                          {key === "messagesSent" && "Mensagens Enviadas"}
                          {key === "automationRulesUsed" && "Automações Ativas"}
                          {key === "teamMembersActive" && "Membros Ativos"}
                          {key === "chatbotFlowsUsed" && "Chatbots Ativos"}
                          {key === "apiCallsMade" && "Chamadas API"}
                          {key === "storageUsedGB" && "Armazenamento"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{value.toLocaleString()}</span>
                            <span>
                              {limit === -1
                                ? "Ilimitado"
                                : limit.toLocaleString()}
                            </span>
                          </div>
                          {limit !== -1 && (
                            <Progress
                              value={percentage}
                              className={`h-2 ${percentage >= 90 ? "text-red-500" : percentage >= 75 ? "text-yellow-500" : "text-green-500"}`}
                            />
                          )}
                          <p className="text-xs text-gray-600">
                            {limit === -1
                              ? "Uso ilimitado"
                              : `${percentage}% do limite`}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Dados de Uso Não Disponíveis
                </h3>
                <p className="text-gray-600">
                  {!subscription
                    ? "Assine um plano para ver seus dados de uso"
                    : "Carregando dados de uso..."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pix" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pagamento PIX */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-green-600" />
                  Pagamento PIX
                </CardTitle>
                <CardDescription>
                  Pague suas faturas instantaneamente com PIX
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PixPayment
                  defaultAmount={currentPlan?.price || 0}
                  description={`Assinatura ${currentPlan?.name || "KRYONIX"} - ${new Date().toLocaleDateString("pt-BR")}`}
                  onPaymentComplete={(data) => {
                    alert(`Pagamento PIX confirmado! TXID: ${data.txid}`);
                    loadBillingData();
                  }}
                />
              </CardContent>
            </Card>

            {/* Histórico PIX */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Histórico PIX
                </CardTitle>
                <CardDescription>Suas últimas transações PIX</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mock histórico PIX */}
                  {[
                    {
                      id: "1",
                      date: "2024-01-15",
                      amount: currentPlan?.price || 97,
                      status: "CONCLUIDA",
                      description: `Assinatura ${currentPlan?.name || "KRYONIX"}`,
                      txid: "E12345678901234567890123456789012",
                    },
                    {
                      id: "2",
                      date: "2024-01-01",
                      amount: currentPlan?.price || 97,
                      status: "CONCLUIDA",
                      description: `Assinatura ${currentPlan?.name || "KRYONIX"}`,
                      txid: "E98765432109876543210987654321098",
                    },
                  ].map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-gray-600">
                            {new Date(transaction.date).toLocaleDateString(
                              "pt-BR",
                            )}{" "}
                            • TXID: {transaction.txid.slice(-8)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          {formatCurrency(transaction.amount, "BRL")}
                        </p>
                        <Badge
                          variant="outline"
                          className="text-xs bg-green-50 text-green-700"
                        >
                          Pago
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {/* Se não houver histórico */}
                  {!currentPlan && (
                    <div className="text-center py-8">
                      <QrCode className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        Nenhuma Transação PIX
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Suas transações PIX aparecerão aqui após o primeiro
                        pagamento
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vantagens PIX */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-blue-600" />
                Vantagens do PIX
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Instantâneo</h4>
                  <p className="text-sm text-gray-600">
                    Transferência imediata, 24h por dia, 7 dias por semana
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Seguro</h4>
                  <p className="text-sm text-gray-600">
                    Transações criptografadas e monitoradas pelo Banco Central
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-3">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Sem Taxa</h4>
                  <p className="text-sm text-gray-600">
                    Transfers gratuitas para pessoas físicas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillingPage;
