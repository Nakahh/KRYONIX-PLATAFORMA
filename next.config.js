const withNextIntl = require('next-intl/plugin')('./lib/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable para build mais rápido
  swcMinify: true,
  // Remove standalone output for Vercel compatibility
  experimental: {
    outputFileTracingRoot: process.cwd(),
    optimizeCss: false, // Disable para build mais rápido
    esmExternals: 'loose', // Fix module resolution issues
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
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
  // Webpack optimizations - simplified for Vercel
  webpack: (config, { isServer }) => {
    // Fix for client-side only packages
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }

    // Disable source maps em produção para build mais rápido
    if (!isServer) {
      config.devtool = false;
    }

    return config;
  },
  // Add transpilation for problematic packages
  transpilePackages: ['lucide-react'],
}

// Export with next-intl wrapper
module.exports = withNextIntl(nextConfig)
