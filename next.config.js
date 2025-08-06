const withNextIntl = require('next-intl/plugin')('./lib/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable para build mais rápido
  swcMinify: true,
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: process.cwd(),
    optimizeCss: false, // Disable para build mais rápido
    esmExternals: 'loose', // Fix module resolution issues
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: false,
  },
  // Otimizações para startup rápido
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Configuração para produção
  distDir: '.next',
  cleanDistDir: true,
  // Acelerar build desabilitando verificações
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Otimizações específicas para build rápido
  productionBrowserSourceMaps: false,
  optimizeFonts: false,
  images: {
    unoptimized: true, // Disable otimização de imagens para build mais rápido
  },
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Reduzir bundle analysis time
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    };

    // Disable source maps em produção para build mais rápido
    if (!isServer) {
      config.devtool = false;
    }

    return config;
  },
}

module.exports = withNextIntl(nextConfig)
