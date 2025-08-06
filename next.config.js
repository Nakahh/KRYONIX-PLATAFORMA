const withNextIntl = require('next-intl/plugin')('./lib/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: false, // Disable for faster builds
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true, // Ignore for deployment
  },
  typescript: {
    ignoreBuildErrors: true, // Ignore for deployment
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizeCss: false,
    optimizePackageImports: [],
  },
  // Emergency build configuration for deployment
  webpack: (config, { isServer }) => {
    // Externalize problematic browser-only libraries on server
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('jspdf', 'jspdf-autotable');
    }

    // Disable optimization for faster builds
    config.optimization = {
      ...config.optimization,
      minimize: false,
      splitChunks: false,
    };

    // Disable source maps for faster builds
    config.devtool = false;

    return config;
  },
}

module.exports = withNextIntl(nextConfig)
