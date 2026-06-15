/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['googleapis'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('googleapis');
    }
    return config;
  },
};

module.exports = nextConfig;
