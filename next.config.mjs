import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['mongoose'],
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    cpus: 1,
    turbopackPluginRuntimeStrategy: 'workerThreads',
  },
  /* config options here */
  allowedDevOrigins: ['afbeef761be7be.lhr.life', '*.lhr.life', '*.loca.lt', '*.pinggy.link', '*.pinggy.io', '*.localhost.run'],
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
