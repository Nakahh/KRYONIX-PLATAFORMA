// Ponto de entrada principal da aplicação KRYONIX
// Inicializa React 18 com StrictMode e providers necessários

import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import App from "./App";
import "./global.css";

// Configuração do React Query para cache otimizado
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minuto
      gcTime: 5 * 60 * 1000, // 5 minutos (antes cacheTime)
      retry: (failureCount, error: any) => {
        // Não fazer retry em erros 4xx
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Configuração de desenvolvimento
const isDevelopment = import.meta.env.DEV;

// Componente raiz da aplicação
function Root() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            closeButton
            richColors
            expand={false}
            duration={4000}
            toastOptions={{
              style: {
                fontFamily: "Inter, system-ui, sans-serif",
              },
            }}
          />

          {/* React Query DevTools - apenas em desenvolvimento */}
          {isDevelopment && (
            <ReactQueryDevtools
              initialIsOpen={false}
              position="bottom-right"
              buttonPosition="bottom-right"
            />
          )}
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

// Inicializar aplicação no DOM
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    "Root element not found! Make sure you have a #root div in your HTML.",
  );
}

const root = ReactDOM.createRoot(rootElement);
root.render(<Root />);

// Hot Module Replacement para desenvolvimento
if (isDevelopment && import.meta.hot) {
  import.meta.hot.accept();
}

// Service Worker avançado para PWA
if ("serviceWorker" in navigator && !isDevelopment) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw-advanced.js").then(
      (registration) => {
        console.log("🚀 Service Worker avançado registrado com sucesso");

        // Verificar por atualizações
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // Nova versão disponível
                if (
                  confirm(
                    "Nova versão do KRYONIX disponível! Deseja atualizar?",
                  )
                ) {
                  newWorker.postMessage({ type: "SKIP_WAITING" });
                  window.location.reload();
                }
              }
            });
          }
        });

        // Escutar mensagens do Service Worker
        navigator.serviceWorker.addEventListener("message", (event) => {
          const { type, data } = event.data || {};

          switch (type) {
            case "NOTIFICATION_CLICK":
              // Navegar para URL da notificação
              if (data.url && window.location.pathname !== data.url) {
                window.location.href = data.url;
              }
              break;
          }
        });
      },
      (error) => {
        console.warn("⚠️ Falha ao registrar Service Worker:", error);
      },
    );
  });
}

// Performance monitoring
if (!isDevelopment) {
  // Monitorar Core Web Vitals
  import("./lib/web-vitals")
    .then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log);
      getFID(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);
    })
    .catch(() => {
      // Web vitals não disponível, ignorar
    });
}

// Error handling global
window.addEventListener("error", (event) => {
  console.error("Erro global capturado:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Promise rejeitada:", event.reason);
});
