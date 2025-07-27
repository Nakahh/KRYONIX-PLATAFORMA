import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],

  test: {
    // Ambiente de teste
    environment: "jsdom",

    // Configurações globais
    globals: true,

    // Setup files
    setupFiles: ["./tests/setup.ts"],

    // Cobertura de código
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "./coverage",
      exclude: [
        "node_modules/",
        "tests/",
        "dist/",
        "**/*.d.ts",
        "**/*.config.{js,ts}",
        "**/vite.config.{js,ts}",
        "**/vitest.config.{js,ts}",
        "client/main.tsx", // Entry point
        "server/node-build.ts", // Build specific
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        // Thresholds específicos para arquivos críticos
        "./client/lib/": {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        "./server/middleware/": {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        "./server/services/": {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
      },
    },

    // Configurações de execução
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,

    // Padrões de arquivos de teste
    include: [
      "**/*.{test,spec}.{js,ts,jsx,tsx}",
      "tests/**/*.{test,spec}.{js,ts,jsx,tsx}",
    ],

    exclude: [
      "node_modules/",
      "dist/",
      "coverage/",
      "tests/e2e/",
      "**/*.e2e.{test,spec}.{js,ts}",
    ],

    // Configurações de watch
    watchExclude: ["node_modules/**", "dist/**", "coverage/**"],

    // Configuraç��es de reporter
    reporter: ["verbose", "json", "html"],
    outputFile: {
      json: "./test-results/unit-tests.json",
      html: "./test-results/unit-tests.html",
    },

    // Pool de workers para performance
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1,
      },
    },

    // Configurações específicas para diferentes tipos de teste
    workspace: [
      {
        test: {
          name: "unit",
          include: ["client/**/*.{test,spec}.{js,ts,jsx,tsx}"],
          environment: "jsdom",
        },
      },
      {
        test: {
          name: "integration",
          include: ["tests/integration/**/*.{test,spec}.{js,ts}"],
          environment: "node",
          testTimeout: 30000,
        },
      },
      {
        test: {
          name: "api",
          include: ["server/**/*.{test,spec}.{js,ts}"],
          environment: "node",
          testTimeout: 15000,
        },
      },
    ],
  },

  // Resolver alias (mesmo do vite.config.ts)
  resolve: {
    alias: {
      "@": resolve(__dirname, "./client"),
      "@shared": resolve(__dirname, "./shared"),
      "@server": resolve(__dirname, "./server"),
      "@components": resolve(__dirname, "./client/components"),
      "@pages": resolve(__dirname, "./client/pages"),
      "@hooks": resolve(__dirname, "./client/hooks"),
      "@services": resolve(__dirname, "./client/services"),
      "@lib": resolve(__dirname, "./client/lib"),
      "@tests": resolve(__dirname, "./tests"),
    },
  },

  // Definir variáveis globais para testes
  define: {
    __TEST__: true,
    __DEV__: false,
    __PROD__: false,
  },

  // Configurações específicas para testes
  esbuild: {
    target: "node18",
  },
});
