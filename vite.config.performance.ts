import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";

// Configuração Vite otimizada para performance brasileira
export default defineConfig({
  plugins: [
    react({
      // SWC optimizations
      jsxImportSource: "@emotion/react",
      plugins: [
        // Plugin para otimização de bundle
        ["@swc/plugin-emotion", {}],
      ],
    }),
  ],

  // Configurações de build otimizadas
  build: {
    // Target moderno para melhor performance
    target: "es2020",

    // Otimizações de minificação
    minify: "esbuild",

    // Configurações de chunk splitting otimizadas
    rollupOptions: {
      output: {
        // Estratégia de chunking para cache eficiente
        manualChunks: {
          // Vendor chunks por categoria
          "react-core": ["react", "react-dom", "react-router-dom"],
          "ui-components": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-tabs",
            "@radix-ui/react-tooltip",
          ],
          "data-management": ["@tanstack/react-query", "axios", "zod"],
          "charts-analytics": ["recharts", "d3-scale", "d3-shape"],
          utils: ["lodash-es", "date-fns", "clsx", "tailwind-merge"],
        },

        // Nomenclatura otimizada para cache
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name;

          // Diferentes estratégias por tipo de chunk
          if (name.includes("vendor") || name.includes("react-core")) {
            return "assets/vendor/[name]-[hash].js";
          }

          if (name.includes("ui-components")) {
            return "assets/ui/[name]-[hash].js";
          }

          if (name.includes("pages")) {
            return "assets/pages/[name]-[hash].js";
          }

          return "assets/chunks/[name]-[hash].js";
        },

        // Assets com hash para cache busting
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || "";

          // Diferentes diretórios por tipo de asset
          if (name.endsWith(".css")) {
            return "assets/styles/[name]-[hash][extname]";
          }

          if (/\.(png|jpg|jpeg|gif|svg|webp|avif)$/.test(name)) {
            return "assets/images/[name]-[hash][extname]";
          }

          if (/\.(woff|woff2|eot|ttf)$/.test(name)) {
            return "assets/fonts/[name]-[hash][extname]";
          }

          return "assets/[name]-[hash][extname]";
        },
      },

      // Otimizações de tree-shaking
      treeshake: {
        preset: "recommended",
        manualPureFunctions: ["console.log", "console.info"],
      },
    },

    // Compressão e otimização
    cssCodeSplit: true,
    cssMinify: "esbuild",

    // Configurações de chunk size
    chunkSizeWarningLimit: 1000,

    // Source maps para produção
    sourcemap: process.env.NODE_ENV === "production" ? false : true,

    // Otimização de assets
    assetsInlineLimit: 4096, // 4KB threshold
  },

  // Configurações de servidor de desenvolvimento
  server: {
    // Otimizações para desenvolvimento brasileiro
    host: "0.0.0.0",
    port: 3000,

    // HMR otimizado
    hmr: {
      overlay: true,
      clientPort: 3000,
    },

    // Headers de desenvolvimento
    headers: {
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
    },
  },

  // Preview server (staging)
  preview: {
    port: 4173,
    host: "0.0.0.0",

    // Headers de cache para preview
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
    },
  },

  // Otimizações de dependências
  optimizeDeps: {
    // Incluir dependências críticas
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "axios",
      "date-fns",
      "lucide-react",
    ],

    // Excluir dependências problemáticas
    exclude: ["fsevents"],

    // Force optimizations
    force: process.env.NODE_ENV === "development",

    // ESBuild options
    esbuildOptions: {
      target: "es2020",
      supported: {
        "top-level-await": true,
      },
    },
  },

  // Configurações de resolução
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
      "@assets": resolve(__dirname, "./client/assets"),
    },

    // Extensões preferidas para performance
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
  },

  // CSS otimizações
  css: {
    // PostCSS otimizado
    postcss: {
      plugins: [
        require("tailwindcss"),
        require("autoprefixer"),
        // Purge CSS em produção
        ...(process.env.NODE_ENV === "production"
          ? [
              require("@fullhuman/postcss-purgecss")({
                content: ["./client/**/*.{ts,tsx,js,jsx}"],
                defaultExtractor: (content) =>
                  content.match(/[\w-/:]+(?<!:)/g) || [],
              }),
            ]
          : []),
      ],
    },

    // Preprocessor options
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
      },
    },

    // CSS modules (se necessário)
    modules: {
      localsConvention: "camelCase",
      generateScopedName: "[name]__[local]___[hash:base64:5]",
    },
  },

  // Configurações de worker (para PWA)
  worker: {
    format: "es",
    plugins: [react()],
  },

  // Configurações experimentais
  experimental: {
    renderBuiltUrl: (filename, { hostType }) => {
      if (hostType === "js") {
        return { js: `https://cdn.kryonix.com.br/${filename}` };
      } else {
        return { relative: true };
      }
    },
  },

  // Variáveis de ambiente
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === "development"),
    __PROD__: JSON.stringify(process.env.NODE_ENV === "production"),
    __VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),

    // Feature flags para otimizações
    __ENABLE_ANALYTICS__: JSON.stringify(
      process.env.ENABLE_ANALYTICS !== "false",
    ),
    __ENABLE_PWA__: JSON.stringify(process.env.ENABLE_PWA !== "false"),
    __ENABLE_CACHE__: JSON.stringify(process.env.ENABLE_CACHE !== "false"),
  },

  // Log level para produção
  logLevel: process.env.NODE_ENV === "production" ? "warn" : "info",

  // Clear screen
  clearScreen: false,
});
