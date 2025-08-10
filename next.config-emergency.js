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
            value: "frame-ancestors 'self' *.builder.io *.vercel.app"
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          }
        ],
      },
    ];
  },
  // Simplified for emergency deployment
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Output for deployment
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  compress: true,
  poweredByHeader: false,
  trailingSlash: false,
  // Disable problematic features for emergency mode
  webpack: (config, { isServer }) => {
    // Simplified webpack config
    if (isServer) {
      config.externals = config.externals || [];
    }
    
    return config;
  },
};

module.exports = nextConfig;
