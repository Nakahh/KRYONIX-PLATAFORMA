import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enhancedApiClient } from "@/services/enhanced-api-client";

interface EnterpriseConfig {
  id: string;
  name: string;
  domain: string;
  ssoEnabled: boolean;
  samlConfig?: {
    entityId: string;
    ssoUrl: string;
    certificate: string;
    signatureAlgorithm: string;
  };
  activeDirectoryConfig?: {
    server: string;
    port: number;
    domain: string;
    baseDN: string;
    username: string;
    useSSL: boolean;
  };
  complianceSettings: {
    lgpdEnabled: boolean;
    dataRetentionDays: number;
    auditLogging: boolean;
    encryptionLevel: string;
    accessControls: string[];
  };
  whiteLabel: {
    customDomain: string;
    logoUrl: string;
    primaryColor: string;
    companyName: string;
  };
}

interface EnterpriseAnalytics {
  users: {
    total: number;
    active: number;
    enterprise: number;
    ssoLogins: number;
    adSynced: number;
  };
  security: {
    failedLogins: number;
    suspiciousActivity: number;
    complianceScore: number;
    dataBreaches: number;
  };
  infrastructure: {
    uptime: number;
    responseTime: number;
    throughput: number;
    errorRate: number;
  };
  compliance: {
    lgpdCompliance: number;
    auditEvents: number;
    dataRetentionCompliance: number;
    encryptionCoverage: number;
  };
}

export function useEnterpriseData(configId: string = "default") {
  const queryClient = useQueryClient();

  // Buscar configuração enterprise
  const {
    data: config,
    isLoading: configLoading,
    error: configError,
  } = useQuery({
    queryKey: ["enterprise-config", configId],
    queryFn: async () => {
      const response = await enhancedApiClient.get(
        `/api/v1/enterprise/config/${configId}`,
      );
      return response.data.config as EnterpriseConfig;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Buscar analytics enterprise
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["enterprise-analytics", configId],
    queryFn: async () => {
      const response = await enhancedApiClient.get(
        `/api/v1/enterprise/analytics/${configId}`,
      );
      return response.data.analytics as EnterpriseAnalytics;
    },
    refetchInterval: 30 * 1000, // Atualizar a cada 30 segundos
    staleTime: 30 * 1000,
  });

  // Buscar status de saúde enterprise
  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ["enterprise-health"],
    queryFn: async () => {
      const response = await enhancedApiClient.get("/api/v1/enterprise/health");
      return response.data;
    },
    refetchInterval: 10 * 1000, // Atualizar a cada 10 segundos
    staleTime: 10 * 1000,
  });

  // Mutação para salvar configuração
  const saveConfigMutation = useMutation({
    mutationFn: async (newConfig: Partial<EnterpriseConfig>) => {
      const response = await enhancedApiClient.post(
        "/api/v1/enterprise/config",
        {
          configId,
          ...newConfig,
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["enterprise-config", configId],
      });
    },
  });

  // Mutação para testar SSO
  const testSSOmutation = useMutation({
    mutationFn: async (samlConfig: any) => {
      const response = await enhancedApiClient.post(
        "/api/v1/enterprise/test-sso",
        {
          samlConfig,
        },
      );
      return response.data;
    },
  });

  // Mutação para testar Active Directory
  const testADMutation = useMutation({
    mutationFn: async (adConfig: any) => {
      const response = await enhancedApiClient.post(
        "/api/v1/enterprise/test-ad",
        {
          adConfig,
        },
      );
      return response.data;
    },
  });

  // Mutação para sincronizar usuários AD
  const syncADUsersMutation = useMutation({
    mutationFn: async () => {
      const response = await enhancedApiClient.post(
        "/api/v1/enterprise/sync-ad-users",
        {
          configId,
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["enterprise-analytics", configId],
      });
    },
  });

  // Mutação para gerar relatório de compliance
  const generateComplianceReportMutation = useMutation({
    mutationFn: async () => {
      const response = await enhancedApiClient.get(
        `/api/v1/enterprise/compliance-report/${configId}`,
      );
      return response.data;
    },
  });

  // Mutação para limpeza de dados
  const cleanupDataMutation = useMutation({
    mutationFn: async () => {
      const response = await enhancedApiClient.post(
        "/api/v1/enterprise/cleanup-expired-data",
        {
          configId,
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["enterprise-analytics", configId],
      });
    },
  });

  // Mutação para exportar dados do usuário
  const exportUserDataMutation = useMutation({
    mutationFn: async ({
      userId,
      format = "json",
    }: {
      userId: string;
      format?: "json" | "csv";
    }) => {
      const response = await enhancedApiClient.get(
        `/api/v1/enterprise/export-user-data/${userId}`,
        {
          params: { format },
          responseType: "blob", // Para download de arquivo
        },
      );
      return response.data;
    },
  });

  // Mutação para deletar dados do usuário
  const deleteUserDataMutation = useMutation({
    mutationFn: async ({
      userId,
      keepAuditLogs = true,
    }: {
      userId: string;
      keepAuditLogs?: boolean;
    }) => {
      const response = await enhancedApiClient.delete(
        `/api/v1/enterprise/delete-user-data/${userId}`,
        {
          data: { keepAuditLogs },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["enterprise-analytics", configId],
      });
    },
  });

  // Funções auxiliares
  const saveConfig = (newConfig: Partial<EnterpriseConfig>) => {
    return saveConfigMutation.mutateAsync(newConfig);
  };

  const testSSO = (samlConfig: any) => {
    return testSSOmutation.mutateAsync(samlConfig);
  };

  const testAD = (adConfig: any) => {
    return testADMutation.mutateAsync(adConfig);
  };

  const syncADUsers = () => {
    return syncADUsersMutation.mutateAsync();
  };

  const generateComplianceReport = () => {
    return generateComplianceReportMutation.mutateAsync();
  };

  const cleanupExpiredData = () => {
    return cleanupDataMutation.mutateAsync();
  };

  const exportUserData = (userId: string, format: "json" | "csv" = "json") => {
    return exportUserDataMutation.mutateAsync({ userId, format });
  };

  const deleteUserData = (userId: string, keepAuditLogs: boolean = true) => {
    return deleteUserDataMutation.mutateAsync({ userId, keepAuditLogs });
  };

  // Funções de utilitário
  const isEnterpriseEnabled = () => {
    return (
      config?.ssoEnabled ||
      config?.activeDirectoryConfig ||
      config?.complianceSettings?.lgpdEnabled
    );
  };

  const getComplianceScore = () => {
    return analytics?.compliance?.lgpdCompliance || 0;
  };

  const getSecurityScore = () => {
    return analytics?.security?.complianceScore || 0;
  };

  const getUptime = () => {
    return analytics?.infrastructure?.uptime || 0;
  };

  // Dados derivados para dashboards
  const securityMetrics = {
    score: getSecurityScore(),
    uptime: getUptime(),
    failedLogins: analytics?.security?.failedLogins || 0,
    complianceScore: getComplianceScore(),
  };

  const userMetrics = {
    total: analytics?.users?.total || 0,
    active: analytics?.users?.active || 0,
    enterprise: analytics?.users?.enterprise || 0,
    ssoLogins: analytics?.users?.ssoLogins || 0,
  };

  const complianceMetrics = {
    lgpdCompliance: analytics?.compliance?.lgpdCompliance || 0,
    auditEvents: analytics?.compliance?.auditEvents || 0,
    dataRetentionCompliance:
      analytics?.compliance?.dataRetentionCompliance || 0,
    encryptionCoverage: analytics?.compliance?.encryptionCoverage || 0,
  };

  return {
    // Dados
    config,
    analytics,
    health,
    securityMetrics,
    userMetrics,
    complianceMetrics,

    // Estados de loading
    isLoading: configLoading || analyticsLoading || healthLoading,
    configLoading,
    analyticsLoading,
    healthLoading,

    // Erros
    configError,

    // Ações
    saveConfig,
    testSSO,
    testAD,
    syncADUsers,
    generateComplianceReport,
    cleanupExpiredData,
    exportUserData,
    deleteUserData,

    // Estados das mutações
    isSaving: saveConfigMutation.isPending,
    isTestingSSO: testSSOmutation.isPending,
    isTestingAD: testADMutation.isPending,
    isSyncingAD: syncADUsersMutation.isPending,
    isGeneratingReport: generateComplianceReportMutation.isPending,
    isCleaningData: cleanupDataMutation.isPending,
    isExportingData: exportUserDataMutation.isPending,
    isDeletingData: deleteUserDataMutation.isPending,

    // Funções utilitárias
    isEnterpriseEnabled,
    getComplianceScore,
    getSecurityScore,
    getUptime,

    // Atualizar dados manualmente
    refetch: () => {
      queryClient.invalidateQueries({
        queryKey: ["enterprise-config", configId],
      });
      queryClient.invalidateQueries({
        queryKey: ["enterprise-analytics", configId],
      });
      queryClient.invalidateQueries({ queryKey: ["enterprise-health"] });
    },
  };
}

// Hook especializado para métricas enterprise em tempo real
export function useEnterpriseMetrics(configId: string = "default") {
  const [realtimeMetrics, setRealtimeMetrics] = useState<any>(null);

  const { analytics, health } = useEnterpriseData(configId);

  useEffect(() => {
    if (analytics && health) {
      setRealtimeMetrics({
        timestamp: new Date().toISOString(),
        security: {
          score: analytics.security.complianceScore,
          threats: analytics.security.suspiciousActivity,
          uptime: analytics.infrastructure.uptime,
        },
        performance: {
          responseTime: analytics.infrastructure.responseTime,
          throughput: analytics.infrastructure.throughput,
          errorRate: analytics.infrastructure.errorRate,
        },
        compliance: {
          lgpd: analytics.compliance.lgpdCompliance,
          retention: analytics.compliance.dataRetentionCompliance,
          encryption: analytics.compliance.encryptionCoverage,
        },
        users: {
          active: analytics.users.active,
          enterprise: analytics.users.enterprise,
          ssoLogins: analytics.users.ssoLogins,
        },
      });
    }
  }, [analytics, health]);

  return {
    metrics: realtimeMetrics,
    isHealthy: health?.status === "healthy",
    lastUpdate: realtimeMetrics?.timestamp,
  };
}

export default useEnterpriseData;
