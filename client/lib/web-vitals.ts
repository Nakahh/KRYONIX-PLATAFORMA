// Web Vitals para KRYONIX - Performance monitoring
import { Metric } from "web-vitals";

// Tipos de métricas Web Vitals
export interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  navigationType: string;
  attribution?: any;
}

// Função para enviar métricas para analytics
function sendToAnalytics(metric: WebVitalsMetric) {
  // Enviar para serviço de analytics (Google Analytics, custom endpoint, etc.)
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", metric.name, {
      event_category: "Web Vitals",
      event_label: metric.id,
      value: Math.round(
        metric.name === "CLS" ? metric.value * 1000 : metric.value,
      ),
      custom_map: { metric_rating: metric.rating },
    });
  }

  // Enviar para endpoint customizado do KRYONIX
  if (process.env.NODE_ENV === "production") {
    fetch("/api/metrics/web-vitals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
    }).catch(() => {
      // Ignorar erros de envio
    });
  }

  // Log em development
  if (process.env.NODE_ENV === "development") {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    });
  }
}

// Cumulative Layout Shift (CLS)
export function getCLS(onPerfEntry?: (metric: WebVitalsMetric) => void) {
  import("web-vitals")
    .then(({ getCLS }) => {
      getCLS((metric: Metric) => {
        const formattedMetric: WebVitalsMetric = {
          id: metric.id,
          name: metric.name,
          value: metric.value,
          rating:
            metric.value <= 0.1
              ? "good"
              : metric.value <= 0.25
                ? "needs-improvement"
                : "poor",
          delta: metric.delta,
          navigationType: (metric as any).navigationType || "navigate",
          attribution: (metric as any).attribution,
        };

        sendToAnalytics(formattedMetric);
        onPerfEntry?.(formattedMetric);
      });
    })
    .catch(() => {
      // Web vitals library não disponível
    });
}

// First Input Delay (FID)
export function getFID(onPerfEntry?: (metric: WebVitalsMetric) => void) {
  import("web-vitals")
    .then(({ getFID }) => {
      getFID((metric: Metric) => {
        const formattedMetric: WebVitalsMetric = {
          id: metric.id,
          name: metric.name,
          value: metric.value,
          rating:
            metric.value <= 100
              ? "good"
              : metric.value <= 300
                ? "needs-improvement"
                : "poor",
          delta: metric.delta,
          navigationType: (metric as any).navigationType || "navigate",
          attribution: (metric as any).attribution,
        };

        sendToAnalytics(formattedMetric);
        onPerfEntry?.(formattedMetric);
      });
    })
    .catch(() => {
      // Web vitals library não disponível
    });
}

// First Contentful Paint (FCP)
export function getFCP(onPerfEntry?: (metric: WebVitalsMetric) => void) {
  import("web-vitals")
    .then(({ getFCP }) => {
      getFCP((metric: Metric) => {
        const formattedMetric: WebVitalsMetric = {
          id: metric.id,
          name: metric.name,
          value: metric.value,
          rating:
            metric.value <= 1800
              ? "good"
              : metric.value <= 3000
                ? "needs-improvement"
                : "poor",
          delta: metric.delta,
          navigationType: (metric as any).navigationType || "navigate",
          attribution: (metric as any).attribution,
        };

        sendToAnalytics(formattedMetric);
        onPerfEntry?.(formattedMetric);
      });
    })
    .catch(() => {
      // Web vitals library não disponível
    });
}

// Largest Contentful Paint (LCP)
export function getLCP(onPerfEntry?: (metric: WebVitalsMetric) => void) {
  import("web-vitals")
    .then(({ getLCP }) => {
      getLCP((metric: Metric) => {
        const formattedMetric: WebVitalsMetric = {
          id: metric.id,
          name: metric.name,
          value: metric.value,
          rating:
            metric.value <= 2500
              ? "good"
              : metric.value <= 4000
                ? "needs-improvement"
                : "poor",
          delta: metric.delta,
          navigationType: (metric as any).navigationType || "navigate",
          attribution: (metric as any).attribution,
        };

        sendToAnalytics(formattedMetric);
        onPerfEntry?.(formattedMetric);
      });
    })
    .catch(() => {
      // Web vitals library não disponível
    });
}

// Time to First Byte (TTFB)
export function getTTFB(onPerfEntry?: (metric: WebVitalsMetric) => void) {
  import("web-vitals")
    .then(({ getTTFB }) => {
      getTTFB((metric: Metric) => {
        const formattedMetric: WebVitalsMetric = {
          id: metric.id,
          name: metric.name,
          value: metric.value,
          rating:
            metric.value <= 800
              ? "good"
              : metric.value <= 1800
                ? "needs-improvement"
                : "poor",
          delta: metric.delta,
          navigationType: (metric as any).navigationType || "navigate",
          attribution: (metric as any).attribution,
        };

        sendToAnalytics(formattedMetric);
        onPerfEntry?.(formattedMetric);
      });
    })
    .catch(() => {
      // Web vitals library não disponível
    });
}

// Interaction to Next Paint (INP) - Nova métrica do Core Web Vitals
export function getINP(onPerfEntry?: (metric: WebVitalsMetric) => void) {
  import("web-vitals")
    .then(({ getINP }) => {
      getINP((metric: Metric) => {
        const formattedMetric: WebVitalsMetric = {
          id: metric.id,
          name: metric.name,
          value: metric.value,
          rating:
            metric.value <= 200
              ? "good"
              : metric.value <= 500
                ? "needs-improvement"
                : "poor",
          delta: metric.delta,
          navigationType: (metric as any).navigationType || "navigate",
          attribution: (metric as any).attribution,
        };

        sendToAnalytics(formattedMetric);
        onPerfEntry?.(formattedMetric);
      });
    })
    .catch(() => {
      // Web vitals library não disponível ou INP não suportado
    });
}

// Função helper para coletar todas as métricas
export function collectAllWebVitals(
  onPerfEntry?: (metric: WebVitalsMetric) => void,
) {
  getCLS(onPerfEntry);
  getFID(onPerfEntry);
  getFCP(onPerfEntry);
  getLCP(onPerfEntry);
  getTTFB(onPerfEntry);
  getINP(onPerfEntry);
}

// Helper para obter rating de performance geral
export function getPerformanceRating(
  metrics: WebVitalsMetric[],
): "good" | "needs-improvement" | "poor" {
  if (metrics.length === 0) return "needs-improvement";

  const goodCount = metrics.filter((m) => m.rating === "good").length;
  const poorCount = metrics.filter((m) => m.rating === "poor").length;

  if (poorCount > 0) return "poor";
  if (goodCount >= metrics.length * 0.75) return "good";

  return "needs-improvement";
}

// Metrics storage para análise posterior
export const metricsStore = {
  metrics: [] as WebVitalsMetric[],

  add(metric: WebVitalsMetric) {
    this.metrics.push(metric);
  },

  getAll() {
    return this.metrics;
  },

  getByName(name: string) {
    return this.metrics.filter((m) => m.name === name);
  },

  clear() {
    this.metrics = [];
  },

  getLatest() {
    if (this.metrics.length === 0) return null;
    return this.metrics[this.metrics.length - 1];
  },

  getAverageByName(name: string) {
    const metrics = this.getByName(name);
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
  },
};

// Export default para facilitar imports
export default {
  getCLS,
  getFID,
  getFCP,
  getLCP,
  getTTFB,
  getINP,
  collectAllWebVitals,
  getPerformanceRating,
  metricsStore,
};
