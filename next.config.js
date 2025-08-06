const withNextIntl = require('next-intl/plugin')('./lib/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Simplified webpack config to prevent build issues
  webpack: (config, { isServer }) => {
    // Externalize problematic browser-only libraries on server
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('jspdf', 'jspdf-autotable');
    }

    return config;
  },
}

// Export directly without next-intl wrapper temporarily
module.exports = nextConfig
// module.exports = withNextIntl(nextConfig)
