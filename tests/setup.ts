// Setup global para testes KRYONIX
import "@testing-library/jest-dom";
import { vi, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./mocks/server";

// === CONFIGURAÇÕES GLOBAIS ===

// Aumentar timeout para testes que podem demorar mais
vi.setConfig({ testTimeout: 10000 });

// Configurar timezone para testes consistentes
process.env.TZ = "America/Sao_Paulo";

// === MOCKS GLOBAIS ===

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Mock do sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, "sessionStorage", {
  value: sessionStorageMock,
  writable: true,
});

// Mock do matchMedia para testes responsivos
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock do ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock do IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: "",
  thresholds: [],
}));

// Mock do navigator.clipboard
Object.defineProperty(navigator, "clipboard", {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(""),
  },
  writable: true,
});

// Mock do navigator.geolocation
Object.defineProperty(navigator, "geolocation", {
  value: {
    getCurrentPosition: vi.fn().mockImplementation((success) =>
      success({
        coords: {
          latitude: -23.5505, // São Paulo
          longitude: -46.6333,
          accuracy: 100,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      }),
    ),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  },
  writable: true,
});

// Mock do navigator.serviceWorker
Object.defineProperty(navigator, "serviceWorker", {
  value: {
    register: vi.fn().mockResolvedValue({
      scope: "/",
      active: { postMessage: vi.fn() },
      installing: null,
      waiting: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
    ready: Promise.resolve({
      scope: "/",
      active: { postMessage: vi.fn() },
      showNotification: vi.fn().mockResolvedValue(undefined),
    }),
    controller: { postMessage: vi.fn() },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
  writable: true,
});

// Mock do Notification API
global.Notification = vi.fn().mockImplementation(() => ({
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}));

Object.defineProperty(global.Notification, "permission", {
  value: "granted",
  writable: true,
});

Object.defineProperty(global.Notification, "requestPermission", {
  value: vi.fn().mockResolvedValue("granted"),
  writable: true,
});

// Mock do fetch global
global.fetch = vi.fn();

// Mock do WebSocket
global.WebSocket = vi.fn().mockImplementation(() => ({
  close: vi.fn(),
  send: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  readyState: 1, // OPEN
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
}));

// Mock do crypto para testes
Object.defineProperty(global, "crypto", {
  value: {
    randomUUID: vi.fn(() => "test-uuid-1234"),
    getRandomValues: vi.fn((array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    }),
    subtle: {
      digest: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
      encrypt: vi.fn().mockResolvedValue(new ArrayBuffer(64)),
      decrypt: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
    },
  },
  writable: true,
});

// Mock do URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => "mock-object-url");
global.URL.revokeObjectURL = vi.fn();

// Mock do Canvas para testes de QR Code e imagens
HTMLCanvasElement.prototype.getContext = vi.fn();
HTMLCanvasElement.prototype.toDataURL = vi.fn(
  () => "data:image/png;base64,mock",
);

// === CONFIGURAÇÕES DE VARIÁVEIS DE AMBIENTE ===
process.env.NODE_ENV = "test";
process.env.VITE_API_URL = "http://localhost:3000/api";
process.env.VITE_APP_NAME = "KRYONIX Test";
process.env.VITE_APP_VERSION = "1.0.0-test";

// === MOCK SERVER (MSW) ===
beforeAll(() => {
  // Iniciar mock server
  server.listen({
    onUnhandledRequest: "warn",
  });
});

beforeEach(() => {
  // Limpar mocks antes de cada teste
  vi.clearAllMocks();

  // Reset localStorage e sessionStorage
  localStorageMock.clear();
  sessionStorageMock.clear();

  // Reset fetch mock
  vi.mocked(fetch).mockClear();
});

afterEach(() => {
  // Limpar DOM após cada teste
  cleanup();

  // Reset handlers do MSW
  server.resetHandlers();
});

afterAll(() => {
  // Fechar mock server
  server.close();
});

// === UTILITIES GLOBAIS PARA TESTES ===

// Função para aguardar próximo tick
export const waitForNextTick = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

// Função para aguardar tempo específico
export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Função para simular delay de rede
export const networkDelay = (min = 100, max = 500) =>
  wait(Math.floor(Math.random() * (max - min + 1)) + min);

// Mock de dados brasileiros para testes
export const mockBrazilianData = {
  user: {
    id: "user-123",
    name: "João Silva",
    email: "joao@kryonix.com.br",
    cpf: "123.456.789-00",
    phone: "+55 11 99999-9999",
    timezone: "America/Sao_Paulo",
    locale: "pt-BR",
    currency: "BRL",
  },
  address: {
    cep: "01310-100",
    street: "Avenida Paulista",
    number: "1000",
    city: "São Paulo",
    state: "SP",
    country: "BR",
  },
  payment: {
    pixKey: "joao@kryonix.com.br",
    pixKeyType: "email",
    bankAccount: {
      bank: "341", // Itaú
      agency: "1234",
      account: "56789-0",
    },
  },
  whatsapp: {
    number: "+5511999999999",
    instance: "instance-123",
    status: "connected",
  },
};

// Utilitários para simulação de comportamentos brasileiros
export const simulateBrazilianNetworkConditions = () => {
  // Simular conexão 3G/4G típica do Brasil
  return networkDelay(200, 1000);
};

export const simulateMobileDevice = () => {
  Object.defineProperty(window, "innerWidth", { value: 375 });
  Object.defineProperty(window, "innerHeight", { value: 667 });

  // Simular touch events
  const mockTouch = {
    identifier: 1,
    target: document.body,
    clientX: 100,
    clientY: 100,
    pageX: 100,
    pageY: 100,
    screenX: 100,
    screenY: 100,
  };

  global.TouchEvent = vi.fn().mockImplementation(() => ({
    touches: [mockTouch],
    targetTouches: [mockTouch],
    changedTouches: [mockTouch],
  }));
};

// Helper para testes de tempo/timezone brasileiro
export const mockBrazilianTime = (dateString: string) => {
  const mockDate = new Date(dateString);
  vi.setSystemTime(mockDate);
  return mockDate;
};

// Helper para testes de formatação brasileira
export const expectBrazilianFormat = {
  currency: (value: string) => {
    expect(value).toMatch(/^R\$\s?\d{1,3}(\.\d{3})*,\d{2}$/);
  },
  phone: (value: string) => {
    expect(value).toMatch(/^\+55\s?\d{2}\s?\d{4,5}-?\d{4}$/);
  },
  cpf: (value: string) => {
    expect(value).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
  },
  cep: (value: string) => {
    expect(value).toMatch(/^\d{5}-?\d{3}$/);
  },
  date: (value: string) => {
    expect(value).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  },
};

// Console personalizado para testes
const originalConsole = global.console;

global.console = {
  ...originalConsole,
  // Silenciar warnings específicos em testes
  warn: (message: string, ...args: any[]) => {
    if (
      message.includes("React Router") ||
      message.includes("deprecated") ||
      message.includes("Warning:")
    ) {
      return; // Silenciar warnings conhecidos
    }
    originalConsole.warn(message, ...args);
  },
  // Manter log de erros importantes
  error: originalConsole.error,
  log: process.env.DEBUG_TESTS ? originalConsole.log : vi.fn(),
  info: process.env.DEBUG_TESTS ? originalConsole.info : vi.fn(),
};

// Configurações específicas para diferentes ambientes de teste
if (process.env.CI) {
  // Configurações para CI/CD
  vi.setConfig({
    testTimeout: 30000, // Timeout maior em CI
    hookTimeout: 15000,
  });
}

// === CONFIGURAÇÃO FINAL ===
console.log("🧪 Setup de testes KRYONIX carregado");
console.log(`📊 Ambiente: ${process.env.NODE_ENV}`);
console.log(`🇧🇷 Timezone: ${process.env.TZ}`);
console.log(
  `🔧 Modo Debug: ${process.env.DEBUG_TESTS ? "Ativado" : "Desativado"}`,
);
