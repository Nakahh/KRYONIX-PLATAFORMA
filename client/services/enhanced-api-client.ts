// Cliente de API aprimorado para KRYONIX
// Conectividade robusta entre frontend e backend com fallbacks inteligentes

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { toast } from "sonner";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
  timestamp?: string;
}

interface ConnectionStatus {
  isOnline: boolean;
  latency: number;
  lastCheck: Date;
  apiVersion: string;
  backendHealth: "healthy" | "degraded" | "offline";
}

class EnhancedApiClient {
  private instance: AxiosInstance;
  private connectionStatus: ConnectionStatus;
  private retryQueue: Array<() => Promise<any>> = [];
  private isRetrying = false;

  constructor() {
    const baseURL =
      import.meta.env.VITE_API_URL ||
      (import.meta.env.DEV
        ? "http://localhost:8080"
        : "https://api.kryonix.com.br");

    this.instance = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Platform": "KRYONIX-Web",
        "X-Version": "2.0",
        "X-Language": "pt-BR",
        "X-Timezone": "America/Sao_Paulo",
        "X-Currency": "BRL",
        "X-Country": "BR",
      },
    });

    this.connectionStatus = {
      isOnline: false,
      latency: 0,
      lastCheck: new Date(),
      apiVersion: "2.0",
      backendHealth: "offline",
    };

    this.setupInterceptors();
    this.startHealthCheck();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // Adicionar token de autenticação se disponível
        const token = localStorage.getItem("kryonix_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Adicionar timestamp para métricas de latência
        config.metadata = { startTime: Date.now() };

        if (import.meta.env.DEV) {
          console.log(
            `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
          );
        }

        return config;
      },
      (error) => {
        console.error("❌ Erro na configuração da requisição:", error);
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Calcular latência
        if (response.config.metadata?.startTime) {
          const latency = Date.now() - response.config.metadata.startTime;
          this.updateConnectionMetrics(latency);
        }

        if (import.meta.env.DEV) {
          console.log(
            `✅ API Response: ${response.status} ${response.config.url}`,
          );
        }

        // Estrutura padrão da resposta KRYONIX
        const apiResponse: ApiResponse = {
          success: response.status >= 200 && response.status < 300,
          data: response.data,
          timestamp: new Date().toISOString(),
        };

        return { ...response, data: apiResponse };
      },
      async (error) => {
        const errorMessage = this.getErrorMessage(error);

        // Atualizar status de conexão
        this.connectionStatus.isOnline = false;
        this.connectionStatus.backendHealth = "offline";

        // Tentar reconectar em caso de erro de rede
        if (this.isNetworkError(error) && !this.isRetrying) {
          console.log("🔄 Tentando reconectar com o servidor...");
          await this.attemptReconnection();
        }

        // Tratar erros específicos
        if (error.response?.status === 401) {
          this.handleUnauthorized();
        }

        // Mostrar toast apenas para erros relevantes ao usuário
        if (error.response?.status >= 400 && error.response?.status < 500) {
          toast.error(errorMessage);
        }

        const apiError: ApiResponse = {
          success: false,
          error: errorMessage,
          code: error.response?.status?.toString() || "NETWORK_ERROR",
          timestamp: new Date().toISOString(),
        };

        return Promise.reject({ ...error, data: apiError });
      },
    );
  }

  private updateConnectionMetrics(latency: number): void {
    this.connectionStatus = {
      ...this.connectionStatus,
      isOnline: true,
      latency,
      lastCheck: new Date(),
      backendHealth:
        latency < 1000 ? "healthy" : latency < 3000 ? "degraded" : "offline",
    };
  }

  private isNetworkError(error: any): boolean {
    return (
      !error.response &&
      (error.code === "NETWORK_ERROR" ||
        error.code === "ECONNREFUSED" ||
        error.code === "ENOTFOUND" ||
        error.message?.includes("Network Error"))
    );
  }

  private async attemptReconnection(): Promise<void> {
    if (this.isRetrying) return;

    this.isRetrying = true;
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries && !this.connectionStatus.isOnline) {
      attempt++;
      console.log(`🔄 Tentativa de reconexão ${attempt}/${maxRetries}...`);

      try {
        await this.healthCheck();
        if (this.connectionStatus.isOnline) {
          console.log("✅ Reconectado com sucesso!");
          toast.success("Conexão restaurada com o servidor");
          await this.processRetryQueue();
        }
      } catch (error) {
        console.log(`❌ Falha na tentativa ${attempt}`);
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
        }
      }
    }

    this.isRetrying = false;
  }

  private async processRetryQueue(): Promise<void> {
    const queue = [...this.retryQueue];
    this.retryQueue = [];

    for (const request of queue) {
      try {
        await request();
      } catch (error) {
        console.error("Erro ao reprocessar requisição:", error);
      }
    }
  }

  private getErrorMessage(error: any): string {
    if (error.response) {
      switch (error.response.status) {
        case 400:
          return "Dados inválidos enviados para o servidor";
        case 401:
          return "Acesso não autorizado. Faça login novamente";
        case 403:
          return "Você não tem permissão para esta ação";
        case 404:
          return "Recurso não encontrado";
        case 422:
          return "Dados não puderam ser processados";
        case 429:
          return "Muitas tentativas. Tente novamente em alguns minutos";
        case 500:
          return "Erro interno do servidor. Nossa equipe foi notificada";
        case 502:
          return "Serviço temporariamente indisponível";
        case 503:
          return "Serviço em manutenção. Tente novamente em breve";
        default:
          return (
            error.response.data?.message || "Erro desconhecido no servidor"
          );
      }
    } else if (error.request) {
      return "Não foi possível conectar ao servidor. Verifique sua internet";
    } else {
      return error.message || "Erro inesperado. Tente novamente";
    }
  }

  private handleUnauthorized(): void {
    localStorage.removeItem("kryonix_token");
    localStorage.removeItem("kryonix_user");

    // Redirecionar para login apenas se não estivermos já lá
    if (!window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
  }

  // Health check contínuo
  private startHealthCheck(): void {
    // Check inicial
    this.healthCheck();

    // Check a cada 30 segundos
    setInterval(() => {
      if (!this.isRetrying) {
        this.healthCheck();
      }
    }, 30000);
  }

  public async healthCheck(): Promise<boolean> {
    try {
      const startTime = Date.now();
      const response = await this.instance.get("/api/health", {
        timeout: 5000,
      });
      const latency = Date.now() - startTime;

      this.updateConnectionMetrics(latency);

      if (response.data?.status === "ok") {
        this.connectionStatus.apiVersion = response.data.version || "2.0";
        return true;
      }
      return false;
    } catch (error) {
      this.connectionStatus.isOnline = false;
      this.connectionStatus.backendHealth = "offline";
      return false;
    }
  }

  // Métodos HTTP com retry automático
  public async get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.requestWithRetry(() => this.instance.get<T>(url, config));
  }

  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.requestWithRetry(() =>
      this.instance.post<T>(url, data, config),
    );
  }

  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.requestWithRetry(() => this.instance.put<T>(url, data, config));
  }

  public async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.requestWithRetry(() =>
      this.instance.patch<T>(url, data, config),
    );
  }

  public async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.requestWithRetry(() => this.instance.delete<T>(url, config));
  }

  private async requestWithRetry<T>(
    request: () => Promise<AxiosResponse<T>>,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await request();
      return response.data;
    } catch (error) {
      // Se não estivermos online, adicionar à fila de retry
      if (!this.connectionStatus.isOnline && this.isNetworkError(error)) {
        const retryPromise = () => request().then((res) => res.data);
        this.retryQueue.push(retryPromise);

        throw new Error(
          "Sem conexão com o servidor. Tentativa será feita automaticamente quando a conexão for restaurada.",
        );
      }

      throw error.data || error;
    }
  }

  // Upload de arquivos com progresso
  public async upload<T = any>(
    url: string,
    file: File | FormData,
    onProgress?: (progress: number) => void,
  ): Promise<ApiResponse<T>> {
    const formData = file instanceof FormData ? file : new FormData();
    if (file instanceof File) {
      formData.append("file", file);
    }

    try {
      const response = await this.instance.post<T>(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error) {
      throw error.data || error;
    }
  }

  // WebSocket para dados em tempo real
  public createWebSocket(endpoint: string): WebSocket | null {
    try {
      const wsUrl =
        this.instance.defaults.baseURL?.replace("http", "ws") + endpoint;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("🔌 WebSocket conectado:", endpoint);
      };

      ws.onerror = (error) => {
        console.error("❌ Erro no WebSocket:", error);
      };

      return ws;
    } catch (error) {
      console.error("Erro ao criar WebSocket:", error);
      return null;
    }
  }

  // Getters para status
  public getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  public isOnline(): boolean {
    return this.connectionStatus.isOnline;
  }

  public getLatency(): number {
    return this.connectionStatus.latency;
  }

  public getHealth(): string {
    return this.connectionStatus.backendHealth;
  }

  // Autenticação
  public setToken(token: string): void {
    localStorage.setItem("kryonix_token", token);
  }

  public removeToken(): void {
    localStorage.removeItem("kryonix_token");
    localStorage.removeItem("kryonix_user");
  }

  public getToken(): string | null {
    return localStorage.getItem("kryonix_token");
  }
}

// Singleton instance
export const enhancedApiClient = new EnhancedApiClient();

export default enhancedApiClient;
export type { ApiResponse, ConnectionStatus };
