// Handle next-intl plugin gracefully for Builder.io compatibility
let withNextIntl;
try {
  withNextIntl = require('next-intl/plugin')('./lib/i18n.ts');
  console.log('✅ next-intl plugin loaded successfully');
} catch (error) {
  console.warn('⚠️ next-intl/plugin not found, proceeding without plugin (Builder.io compatibility mode)');
  withNextIntl = (config) => config;
}

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
  // Builder.io compatibility - keep output flexible
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  compress: true,
  poweredByHeader: false,
  // Simplified webpack config for Builder.io compatibility
  webpack: (config, { isServer, dev }) => {
    // Only in production builds
    if (isServer && !dev) {
      config.externals = config.externals || [];
      config.externals.push('jspdf', 'jspdf-autotable');
    }

    // Resolve module conflicts
    config.resolve.alias = {
      ...config.resolve.alias,
      'negotiator': require.resolve('negotiator')
    };

    return config;
  },
  // Allow Builder.io iframe embedding
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL'
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' *.builder.io *.vercel.app"
          }
        ],
      },
    ];
  },
}

module.exports = withNextIntl(nextConfig)
