/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  
  // Image optimization configuration
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      'example.com',
      'localhost',
      '127.0.0.1'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    minimumCacheTTL: 60, // 1 minute
  },

  // Enable server actions with increased body size limit
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },

  // Security headers
  async headers() {
    const securityHeaders = [
      // Prevent clickjacking
      {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN',
      },
      // Enable XSS protection
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
      // Prevent MIME type sniffing
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      // Referrer policy
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      // Permissions policy
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
      },
      // Content security policy
      {
        key: 'Content-Security-Policy',
        value: `
          default-src 'self';
          script-src 'self' 'unsafe-inline' 'unsafe-eval';
          style-src 'self' 'unsafe-inline';
          img-src 'self' data: blob: https:;
          font-src 'self';
          connect-src 'self' ${process.env.NEXT_PUBLIC_API_BASE_URL || ''};
          frame-ancestors 'none';
          form-action 'self';
          base-uri 'self';
          object-src 'none';
        `.replace(/\s+/g, ' ').trim(),
      },
    ];

    return [
      // Apply to all routes
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // API routes CORS headers
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { 
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
          },
        ],
      },
    ];
  },

  // Environment variables configuration
  env: {
    APP_ENV: process.env.APP_ENV || 'development',
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Important: return the modified config
    if (!isServer) {
      // Don't include certain modules in the client build
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
      };
    }
    return config;
  },

  // Enable source maps in development
  productionBrowserSourceMaps: process.env.NODE_ENV !== 'production',
};

// For analyzing bundle size
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
