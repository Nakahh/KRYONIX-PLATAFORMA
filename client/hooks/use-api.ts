import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from './use-toast';
import { 
  apiClient, 
  DashboardData, 
  User, 
  StackConfiguration, 
  Plan, 
  Subscription,
  NotificationTemplate,
  Notification,
  AIModelConfig,
  ApiError
} from '../lib/api-client';

// =============================================================================
// QUERY KEYS
// =============================================================================

export const queryKeys = {
  dashboard: ['dashboard'] as const,
  user: ['user'] as const,
  stackConfigs: ['stackConfigs'] as const,
  stackConfig: (id: string) => ['stackConfig', id] as const,
  plans: ['plans'] as const,
  subscription: ['subscription'] as const,
  notifications: (params?: any) => ['notifications', params] as const,
  notificationTemplates: ['notificationTemplates'] as const,
  aiModels: ['aiModels'] as const,
  aiUsage: (params?: any) => ['aiUsage', params] as const,
};

// =============================================================================
// DASHBOARD
// =============================================================================

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => apiClient.get<DashboardData>('/dashboard'),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: true,
  });
}

// =============================================================================
// USER & AUTH
// =============================================================================

export function useUser() {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: () => apiClient.get<User>('/auth/me'),
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      apiClient.post<{ user: User; token: string }>('/auth/login', credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.user, data.user);
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${data.user.name}!`,
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.post('/auth/logout'),
    onSuccess: () => {
      queryClient.clear();
      window.location.href = '/login';
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<User>) =>
      apiClient.put<User>('/auth/profile', data),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.user, data);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso!",
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// =============================================================================
// STACK CONFIGURATIONS
// =============================================================================

export function useStackConfigurations() {
  return useQuery({
    queryKey: queryKeys.stackConfigs,
    queryFn: () => apiClient.get<StackConfiguration[]>('/stack-config'),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

export function useStackConfiguration(stackType: string) {
  return useQuery({
    queryKey: queryKeys.stackConfig(stackType),
    queryFn: () => apiClient.get<StackConfiguration>(`/stack-config/${stackType}`),
    enabled: !!stackType,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateStackConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      stackType: string;
      name: string;
      description?: string;
      configuration: Record<string, any>;
    }) => apiClient.post<StackConfiguration>('/stack-config', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stackConfigs });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast({
        title: "Stack configurada!",
        description: "A configuração foi salva com sucesso.",
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: "Erro ao configurar stack",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateStackConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      stackType, 
      data 
    }: { 
      stackType: string;
      data: Partial<StackConfiguration>;
    }) => apiClient.put<StackConfiguration>(`/stack-config/${stackType}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stackConfig(variables.stackType) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stackConfigs });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast({
        title: "Stack atualizada!",
        description: "As alterações foram salvas com sucesso.",
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: "Erro ao atualizar stack",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useTestStackConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stackType: string) => 
      apiClient.post<{ success: boolean; message: string; details?: any }>(
        `/stack-config/${stackType}/test`
      ),
    onSuccess: (data, stackType) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stackConfig(stackType) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stackConfigs });
      
      if (data.success) {
        toast({
          title: "Teste bem-sucedido!",
          description: data.message,
        });
      } else {
        toast({
          title: "Teste falhou",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: ApiError) => {
      toast({
        title: "Erro no teste",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteStackConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stackType: string) => 
      apiClient.delete(`/stack-config/${stackType}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stackConfigs });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast({
        title: "Stack removida!",
        description: "A configuração foi removida com sucesso.",
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: "Erro ao remover stack",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// =============================================================================
// BILLING & PLANS
// =============================================================================

export function usePlans() {
  return useQuery({
    queryKey: queryKeys.plans,
    queryFn: () => apiClient.get<Plan[]>('/billing/plans'),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

export function useSubscription() {
  return useQuery({
    queryKey: queryKeys.subscription,
    queryFn: () => apiClient.get<Subscription>('/billing/subscription'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: (data: { planId: string; successUrl: string; cancelUrl: string }) =>
      apiClient.post<{ url: string }>('/billing/create-checkout-session', data),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error: ApiError) => {
      toast({
        title: "Erro ao iniciar checkout",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useCreatePortalSession() {
  return useMutation({
    mutationFn: (returnUrl: string) =>
      apiClient.post<{ url: string }>('/billing/create-portal-session', { returnUrl }),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error: ApiError) => {
      toast({
        title: "Erro ao acessar portal",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// =============================================================================
// NOTIFICATIONS
// =============================================================================

export function useNotifications(params?: { 
  page?: number; 
  limit?: number; 
  status?: string; 
  type?: string 
}) {
  return useQuery({
    queryKey: queryKeys.notifications(params),
    queryFn: () => apiClient.get<{
      notifications: Notification[];
      total: number;
      page: number;
      limit: number;
    }>('/notifications', params),
    staleTime: 30 * 1000, // 30 segundos
  });
}

export function useNotificationTemplates() {
  return useQuery({
    queryKey: queryKeys.notificationTemplates,
    queryFn: () => apiClient.get<NotificationTemplate[]>('/notifications/templates'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSendNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      type: 'email' | 'whatsapp' | 'push' | 'sms' | 'in_app';
      title: string;
      content: string;
      userId?: string;
      scheduledFor?: string;
      metadata?: Record<string, any>;
    }) => apiClient.post<Notification>('/notifications/send', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
      toast({
        title: "Notificação enviada!",
        description: "A notificação foi enviada com sucesso.",
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: "Erro ao enviar notificação",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      apiClient.patch(`/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
    },
  });
}

// =============================================================================
// AI SERVICES
// =============================================================================

export function useAIModels() {
  return useQuery({
    queryKey: queryKeys.aiModels,
    queryFn: () => apiClient.get<AIModelConfig[]>('/ai/models'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAIUsage(params?: { 
  startDate?: string; 
  endDate?: string; 
  modelId?: string 
}) {
  return useQuery({
    queryKey: queryKeys.aiUsage(params),
    queryFn: () => apiClient.get<{
      usage: any[];
      summary: {
        totalTokens: number;
        totalCost: number;
        requestCount: number;
      };
    }>('/ai/usage', params),
    enabled: !!params,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateAIModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<AIModelConfig, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>) =>
      apiClient.post<AIModelConfig>('/ai/models', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.aiModels });
      toast({
        title: "Modelo de IA criado!",
        description: "O modelo foi configurado com sucesso.",
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: "Erro ao criar modelo",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useTestAIModel() {
  return useMutation({
    mutationFn: (data: { modelId: string; prompt: string }) =>
      apiClient.post<{ success: boolean; response?: string; error?: string }>(
        '/ai/test', 
        data
      ),
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Teste bem-sucedido!",
          description: "O modelo de IA respondeu corretamente.",
        });
      } else {
        toast({
          title: "Teste falhou",
          description: data.error || "Erro desconhecido",
          variant: "destructive",
        });
      }
    },
    onError: (error: ApiError) => {
      toast({
        title: "Erro no teste",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
