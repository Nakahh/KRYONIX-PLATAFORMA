import { useState, useEffect, useCallback } from "react";
import { StackConfig, KRYONIX_STACKS } from "@/services/stack-integration";

interface StackCredentials {
  domain: string;
  apiUrl?: string;
  username?: string;
  password?: string;
  email?: string;
  apiKey?: string;
  webhookUrl?: string;
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
  smtpPassword?: string;
  additionalConfig?: Record<string, string>;
}

interface UseStacksConfigReturn {
  stacks: StackConfig[];
  updateStackConfig: (stackId: string, credentials: StackCredentials) => void;
  getStackCredentials: (stackId: string) => StackCredentials | null;
  resetToDefaults: () => void;
  exportConfig: () => string;
  importConfig: (configJson: string) => boolean;
  isConfigured: (stackId: string) => boolean;
}

// Configurações padrão com os dados reais fornecidos
const DEFAULT_CREDENTIALS: Record<string, StackCredentials> = {
  evolution_api: {
    domain: "api.kryonix.com.br",
    apiUrl: "https://api.kryonix.com.br",
    apiKey: "6f78dbffc4acd9a32b926a38892a23f0",
    additionalConfig: {
      managerUrl: "https://api.kryonix.com.br/manager",
      globalApiKey: "6f78dbffc4acd9a32b926a38892a23f0",
    },
  },
  chatwoot: {
    domain: "chat.kryonix.com.br",
    apiUrl: "https://chat.kryonix.com.br/api/v1",
    username: "vitor.nakahh@gmail.com",
    password: "Vitor@123456",
    email: "chatwoot@kryonix.com.br",
    smtpHost: "smtp.sendgrid.net",
    smtpPort: "465",
    smtpUser: "apikey",
    smtpPassword:
      "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",
    additionalConfig: {
      empresa: "Kryonix-SERVIDOR",
    },
  },
  n8n: {
    domain: "n8n.kryonix.com.br",
    apiUrl: "https://n8n.kryonix.com.br/api/v1",
    username: "vitor.nakahh@gmail.com",
    password: "Vitor@123456",
    email: "n8n@kryonix.com.br",
    webhookUrl: "https://webhookn8n.kryonix.com.br",
    smtpHost: "smtp.sendgrid.net",
    smtpPort: "465",
    smtpUser: "apikey",
    smtpPassword:
      "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",
  },
  typebot: {
    domain: "typebot.kryonix.com.br",
    apiUrl: "https://typebot.kryonix.com.br/api",
    email: "typebot@kryonix.com.br",
    smtpHost: "smtp.sendgrid.net",
    smtpPort: "465",
    smtpUser: "apikey",
    smtpPassword:
      "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",
    additionalConfig: {
      viewerDomain: "bot.kryonix.com.br",
      version: "latest",
    },
  },
  mautic: {
    domain: "mautic.kryonix.com.br",
    apiUrl: "https://mautic.kryonix.com.br/api",
    username: "kryonix",
    password: "Vitor@123456",
    email: "vitor.nakahh@gmail.com",
    additionalConfig: {
      dbHost: "mysql",
      dbPort: "3306",
      dbName: "mautic",
      dbUser: "mautic-kryonix",
      dbPassword: "Vitor@123456",
    },
  },
  dify_ai: {
    domain: "dify.kryonix.com.br",
    apiUrl: "https://dify-ai.kryonix.com.br",
    email: "dify@kryonix.com.br",
    smtpHost: "smtp.sendgrid.net",
    smtpPort: "465",
    smtpUser: "apikey",
    smtpPassword:
      "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",
  },
  ollama: {
    domain: "ollama.kryonix.com.br",
    apiUrl: "https://apiollama.kryonix.com.br",
    additionalConfig: {
      webUI: "https://ollama.kryonix.com.br",
    },
  },
  postgresql: {
    domain: "pgadmin.kryonix.com.br",
    username: "vitor.nakahh@gmail.com",
    password: "Vitor@123456",
  },
  redis: {
    domain: "redis.kryonix.com.br",
    additionalConfig: {
      authType: "google",
    },
  },
  minio: {
    domain: "minio.kryonix.com.br",
    apiUrl: "https://storage.kryonix.com.br",
    username: "kryonix",
    password: "Vitor@123456",
  },
  grafana: {
    domain: "grafana.kryonix.com.br",
    apiUrl: "https://grafana.kryonix.com.br/api",
    username: "kryonix",
    password: "Vitor@123456",
  },
  prometheus: {
    domain: "prometheus.kryonix.com.br",
  },
  uptime_kuma: {
    domain: "up.kryonix.com.br",
    username: "kryonix",
    password: "Vitor@123456",
  },
  metabase: {
    domain: "metabase.kryonix.com.br",
    apiUrl: "https://metabase.kryonix.com.br/api",
    username: "kryonix",
    password: "Vitor@123456",
  },
  portainer: {
    domain: "painel.kryonix.com.br",
    username: "kryonix",
    password: "Vitor@123456",
    email: "portainer@kryonix.com.br",
    additionalConfig: {
      servidor: "Kryonix-SERVIDOR",
      rede: "Kryonix-NET",
    },
  },
  supabase: {
    domain: "supabase.kryonix.com.br",
    username: "kryonix",
    password: "Vitor@123456",
    additionalConfig: {
      jwtKey: "7dfe47ffb11b671cba62c80de0dbaeb43d795b05",
      anonKey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0.Pnqhifc7Z77QgbZcTpFFJ2htenzLDZv_DKOlAqAmV5E",
      serviceKey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vfcm9sZSIsCiAgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3MTUwNTA4MDAsCiAgImV4cCI6IDE4NzI4MTcyMDAKfQ.cKLt0xTePGZ0rLNhi-zDIUKhFGPzYThI6RxaX5LmYfc",
    },
  },
  strapi: {
    domain: "strapi.kryonix.com.br",
    username: "vitor.nakahh@gmail.com",
    password: "Vitor@123456",
  },
  keycloak: {
    domain: "keycloak.kryonix.com.br",
    username: "kryonix",
    password: "Vitor@123456",
  },
  directus: {
    domain: "directus.kryonix.com.br",
    username: "vitor.nakahh@gmail.com",
    password: "Vitor@123456",
    email: "directus@kryonix.com.br",
    smtpHost: "smtp.sendgrid.net",
    smtpPort: "465",
    smtpPassword:
      "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",
  },
  nextcloud: {
    domain: "cloud.kryonix.com.br",
    username: "kryonix",
    password: "Vitor@123456",
  },
  rabbitmq: {
    domain: "rabbitmq.kryonix.com.br",
    username: "kryonix",
    password: "f8b3b34365f881f0c65732162f2bb566",
    additionalConfig: {
      url: "amqp://kryonix:f8b3b34365f881f0c65732162f2bb566@rabbitmq:5672",
    },
  },
  stirling_pdf: {
    domain: "pdf.kryonix.com.br",
    additionalConfig: {
      appName: "Kryonix.com.br",
      description: "Visualizador e editor de PDF",
    },
  },
  wuzapi: {
    domain: "wuzapi.kryonix.com.br",
    apiKey: "ab81fab4a504e2e4fd39d6673e2607e5",
    additionalConfig: {
      dashboardUrl: "https://wuzapi.kryonix.com.br/dashboard",
      docsUrl: "https://wuzapi.kryonix.com.br/api",
    },
  },
  wppconnect: {
    domain: "wppconnect.kryonix.com.br",
    additionalConfig: {
      docsUrl: "https://wppconnect.kryonix.com.br/api-docs",
    },
  },
  docuseal: {
    domain: "docuseal.kryonix.com.br",
    email: "docuseal@kryonix.com.br",
    smtpHost: "smtp.sendgrid.net",
    smtpPort: "465",
    smtpUser: "apikey",
    smtpPassword:
      "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",
  },
  ntfy: {
    domain: "ntfy.kryonix.com.br",
    username: "kryonix",
    password: "Vitor@123456",
    additionalConfig: {
      authorization: "Basic a3J5b25peDpWaXRvckAxMjM0NTY=",
    },
  },
};

export function useStacksConfig(): UseStacksConfigReturn {
  const [stacks, setStacks] = useState<StackConfig[]>([]);
  const [credentials, setCredentials] = useState<
    Record<string, StackCredentials>
  >({});

  // Carregar configurações do localStorage na inicialização
  useEffect(() => {
    const savedStacks = localStorage.getItem("kryonix_stacks");
    const savedCredentials = localStorage.getItem("kryonix_credentials");

    if (savedStacks) {
      try {
        setStacks(JSON.parse(savedStacks));
      } catch {
        setStacks(KRYONIX_STACKS);
      }
    } else {
      setStacks(KRYONIX_STACKS);
    }

    if (savedCredentials) {
      try {
        setCredentials(JSON.parse(savedCredentials));
      } catch {
        setCredentials(DEFAULT_CREDENTIALS);
      }
    } else {
      setCredentials(DEFAULT_CREDENTIALS);
    }
  }, []);

  // Salvar automaticamente quando há mudanças
  useEffect(() => {
    if (stacks.length > 0) {
      localStorage.setItem("kryonix_stacks", JSON.stringify(stacks));
    }
  }, [stacks]);

  useEffect(() => {
    if (Object.keys(credentials).length > 0) {
      localStorage.setItem("kryonix_credentials", JSON.stringify(credentials));
    }
  }, [credentials]);

  const updateStackConfig = useCallback(
    (stackId: string, newCredentials: StackCredentials) => {
      // Atualizar credenciais
      setCredentials((prev) => ({
        ...prev,
        [stackId]: newCredentials,
      }));

      // Atualizar configuração da stack
      setStacks((prev) =>
        prev.map((stack) =>
          stack.id === stackId
            ? {
                ...stack,
                url: newCredentials.domain.startsWith("http")
                  ? newCredentials.domain
                  : `https://${newCredentials.domain}`,
                apiUrl: newCredentials.apiUrl,
                credentials: {
                  username: newCredentials.username,
                  password: newCredentials.password,
                  apiKey: newCredentials.apiKey,
                  token: newCredentials.apiKey,
                  webhookUrl: newCredentials.webhookUrl,
                  additionalConfig: newCredentials.additionalConfig,
                },
              }
            : stack,
        ),
      );
    },
    [],
  );

  const getStackCredentials = useCallback(
    (stackId: string): StackCredentials | null => {
      return credentials[stackId] || null;
    },
    [credentials],
  );

  const resetToDefaults = useCallback(() => {
    setStacks(KRYONIX_STACKS);
    setCredentials(DEFAULT_CREDENTIALS);
    localStorage.removeItem("kryonix_stacks");
    localStorage.removeItem("kryonix_credentials");
  }, []);

  const exportConfig = useCallback(() => {
    const config = {
      stacks,
      credentials,
      exportDate: new Date().toISOString(),
      version: "2.0",
    };
    return JSON.stringify(config, null, 2);
  }, [stacks, credentials]);

  const importConfig = useCallback((configJson: string): boolean => {
    try {
      const config = JSON.parse(configJson);
      if (config.stacks && config.credentials) {
        setStacks(config.stacks);
        setCredentials(config.credentials);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const isConfigured = useCallback(
    (stackId: string): boolean => {
      const creds = credentials[stackId];
      if (!creds) return false;

      // Verificar se tem pelo menos domínio configurado
      return Boolean(creds.domain);
    },
    [credentials],
  );

  return {
    stacks,
    updateStackConfig,
    getStackCredentials,
    resetToDefaults,
    exportConfig,
    importConfig,
    isConfigured,
  };
}
