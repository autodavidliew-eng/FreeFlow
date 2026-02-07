/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@freeflow/ui', '@freeflow/types'],
  env: {
    API_URL: process.env.API_URL || 'http://localhost:4000',
  },
};

module.exports = nextConfig;
