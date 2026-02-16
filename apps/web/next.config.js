const path = require('path');
const webpack = require('webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@freeflow/ui',
    '@freeflow/types',
    '@freeflow/rbac-config',
  ],
  env: {
    API_URL: process.env.API_URL || 'http://localhost:4000',
  },
  webpack: (config) => {
    const formioCoreRoot = path.dirname(
      require.resolve('@formio/core/package.json')
    );

    config.resolve.alias = {
      ...config.resolve.alias,
      '@formio/base': path.join(formioCoreRoot, 'lib', 'base'),
      '@formio/components': path.join(formioCoreRoot, 'lib', 'components'),
      '@formio/model': path.join(formioCoreRoot, 'lib', 'model'),
      '@formio/modules': path.join(formioCoreRoot, 'lib', 'modules'),
      '@formio/sdk': path.join(formioCoreRoot, 'lib', 'sdk'),
      '@formio/utils': path.join(formioCoreRoot, 'lib', 'utils'),
      '@formio/validator': path.join(formioCoreRoot, 'lib', 'validator'),
    };

    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /html\.ejs\.js$/,
        path.join(__dirname, 'src', 'shims', 'formio', 'html.ejs.js')
      )
    );

    return config;
  },
};

module.exports = nextConfig;
