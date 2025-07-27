import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

interface KryonixApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

class ApiClient {
  private instance: AxiosInstance;
  private token: string | null = null;

  constructor(config: KryonixApiConfig) {
    this.instance = axios.create(config);
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor para adicionar token e headers brasileiros
    this.instance.interceptors.request.use(
      (config) => {
        // Adicionar token de autorização se disponível
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }

        // Headers específicos para contexto brasileiro
        config.headers["Accept-Language"] = "pt-BR,pt;q=0.9";
        config.headers["X-Timezone"] = "America/Sao_Paulo";
        config.headers["X-Currency"] = "BRL";
        config.headers["X-Country"] = "BR";

        // Log para debug em desenvolvimento
        if (import.meta.env.DEV) {
          console.log(
            `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
          );
        }

        return config;
      },
      (error) => {
        console.error("❌ Erro na requisição:", error);
        return Promise.reject(error);
      },
    );

    // Response interceptor para tratamento de erros em português
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        if (import.meta.env.DEV) {
          console.log(
            `✅ API Response: ${response.status} ${response.config.url}`,
          );
        }
        return response;
      },
      (error) => {
        const errorMessage = this.getErrorMessage(error);
        console.error("❌ Erro na resposta da API:", errorMessage);

        // Tratamento específico para erros comuns
        if (error.response?.status === 401) {
          this.handleUnauthorized();
        }

        return Promise.reject({
          ...error,
          message: errorMessage,
        });
      },
    );
  }

  private getErrorMessage(error: any): string {
    // Mensagens de erro em português brasileiro
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

  private handleUnauthorized() {
    // Limpar token e redirecionar para login
    this.token = null;
    localStorage.removeItem("kryonix_token");

    // Em um contexto real, redirecionaria para login
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  // Métodos públicos da API
  setToken(token: string) {
    this.token = token;
    localStorage.setItem("kryonix_token", token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem("kryonix_token");
  }

  // Métodos HTTP com tipagem
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  // Método para upload de arquivos
  async upload<T = any>(
    url: string,
    file: File | FormData,
    onProgress?: (progress: number) => void,
  ): Promise<T> {
    const formData = file instanceof FormData ? file : new FormData();
    if (file instanceof File) {
      formData.append("file", file);
    }

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
  }
}

// Configuração específica para KRYONIX Brasil
const kryonixConfig: KryonixApiConfig = {
  baseURL: import.meta.env.VITE_API_URL || "https://api.kryonix.com.br",
  timeout: 30000, // 30 segundos
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Platform": "KRYONIX-Web",
    "X-Version": "2.0",
    "X-Language": "pt-BR",
  },
};

// Instância principal da API
export const apiClient = new ApiClient(kryonixConfig);

// Inicializar token se existir no localStorage
if (typeof window !== "undefined") {
  const savedToken = localStorage.getItem("kryonix_token");
  if (savedToken) {
    apiClient.setToken(savedToken);
  }
}

export default apiClient;
