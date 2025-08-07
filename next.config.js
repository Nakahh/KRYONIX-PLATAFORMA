const withNextIntl = require('next-intl/plugin')('./lib/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  compress: true,

  // Vercel-compatible image optimization
  images: {
    domains: ['www.kryonix.com.br', 'kryonix.com.br'],
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
  },

  // Build optimization for Vercel
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },

  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react'],
    webpackBuildWorker: true,
    optimizeCss: true,
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects for SEO and UX
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/pt-br',
        permanent: true,
      },
      {
        source: '/en/home',
        destination: '/en',
        permanent: true,
      },
      {
        source: '/es/home',
        destination: '/es',
        permanent: true,
      },
      {
        source: '/de/home',
        destination: '/de',
        permanent: true,
      },
      {
        source: '/fr/home',
        destination: '/fr',
        permanent: true,
      },
      // Legacy route redirects
      {
        source: '/fila-de-espera',
        destination: '/pt-br/waitlist',
        permanent: true,
      },
      {
        source: '/progresso',
        destination: '/pt-br/progress',
        permanent: true,
      },
      {
        source: '/parcerias-empresariais-contato',
        destination: '/pt-br/partnerships-contact',
        permanent: true,
      },
    ];
  },

  // Webpack optimization for Vercel
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // Font optimization
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/fonts/[name].[hash][ext]',
      },
    });

    // Externalize problematic browser-only libraries on server
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('jspdf', 'jspdf-autotable');
    }

    // Performance optimizations
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          // Common chunk
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
          },
        },
      };
    }

    return config;
  },

  // Environment variables for Vercel
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000',
    NEXT_PUBLIC_ENVIRONMENT: process.env.NODE_ENV || 'development',
  },
};

module.exports = withNextIntl(nextConfig);
