const withNextIntl = require('next-intl/plugin')('./lib/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    turbo: undefined
  },
  // Simplified webpack config to prevent build issues
  webpack: (config, { isServer }) => {
    // Externalize problematic browser-only libraries on server
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('jspdf', 'jspdf-autotable');
    }

    // Fix potential SWC/vendor chunk issues
    config.optimization = config.optimization || {};
    config.optimization.splitChunks = {
      ...config.optimization.splitChunks,
      cacheGroups: {
        default: false,
        vendor: false
      }
    };

    return config;
  },
}

module.exports = withNextIntl(nextConfig)
