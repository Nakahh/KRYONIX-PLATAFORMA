const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  // Builder.io compatibility
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
            value: "frame-ancestors 'self' *.builder.io *.vercel.app builder.io"
          },
          {
            key: 'X-Builder-Discoverable',
            value: 'true'
          }
        ],
      },
      {
        source: '/.well-known/builder-pages.json',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600'
          }
        ],
      },
    ];
  },
  // Generate static params for all locale pages
  generateStaticParams: true,
  // Optimize for Builder.io
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react']
  }
}

module.exports = withNextIntl(nextConfig)
