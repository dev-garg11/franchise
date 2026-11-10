import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['mongoose'],
  poweredByHeader: false,
  compress: true,
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    cpus: 1,
    turbopackPluginRuntimeStrategy: 'workerThreads',
  },
  /* config options here */
  allowedDevOrigins: ['afbeef761be7be.lhr.life', '*.lhr.life', '*.loca.lt', '*.pinggy.link', '*.pinggy.io', '*.localhost.run'],
  async headers() {
    return [
      {
        source: '/:path*',
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
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/api/brands',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/admin/dashboard',
        destination: '/admin',
        permanent: false,
      },
      {
        source: '/brand-owner/dashboard',
        destination: '/brand-panel',
        permanent: false,
      },
      {
        source: '/investor/dashboard',
        destination: '/investor-panel',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
