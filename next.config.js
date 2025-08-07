const withNextIntl = require('next-intl/plugin')('./lib/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Otimizado para planos gratuitos Vercel + Render
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  // Webpack config simplificado para evitar travamentos
  webpack: (config, { isServer, dev }) => {
    // Apenas em produção, evitar problemas em dev
    if (isServer && !dev) {
      config.externals = config.externals || [];
      config.externals.push('jspdf', 'jspdf-autotable');
    }

    // Resolver conflitos de módulos
    config.resolve.alias = {
      ...config.resolve.alias,
      'negotiator': require.resolve('negotiator')
    };

    return config;
  },
}

module.exports = withNextIntl(nextConfig)
