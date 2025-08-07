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
  // Simplified webpack config to prevent self issues
  webpack: (config, { isServer }) => {
    // Externalize problematic browser-only libraries on server
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('jspdf', 'jspdf-autotable');
    }

    return config;
  },
}

// Try to load next-intl plugin, fallback to base config if not available
let finalConfig = nextConfig;

try {
  const withNextIntl = require('next-intl/plugin')('./lib/i18n.ts');
  finalConfig = withNextIntl(nextConfig);
} catch (error) {
  console.log('⚠️ next-intl plugin not available yet, using base config');
  // Add i18n config manually if next-intl is not available
  finalConfig.i18n = {
    locales: ['pt-br', 'en', 'es', 'fr', 'de'],
    defaultLocale: 'pt-br',
  };
}

module.exports = finalConfig
