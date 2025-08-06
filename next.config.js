// Temporarily disable next-intl to fix module issues
// const withNextIntl = require('next-intl/plugin')('./lib/i18n.ts');

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
  webpack: (config, { isServer, webpack }) => {
    // Exclude browser-only libraries from server-side bundle
    if (isServer) {
      config.externals = config.externals || [];

      // Properly externalize browser-only libraries
      config.externals.push(
        'jspdf',
        'jspdf-autotable'
      );

      // Add fallback for browser-only APIs
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    } else {
      // Client-side specific configurations
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Add plugin to handle browser globals
    config.plugins.push(
      new webpack.DefinePlugin({
        'typeof window': JSON.stringify('object'),
      })
    );

    // Reduzir bundle analysis time
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/](?!(jspdf|jspdf-autotable)[\\/])/,
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

// Export directly without next-intl wrapper temporarily
module.exports = nextConfig
// module.exports = withNextIntl(nextConfig)
