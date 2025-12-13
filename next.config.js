/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID || '7001', // ZetaChain
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': require.resolve('./lib/empty-module.js'),
      'pino-pretty': require.resolve('./lib/empty-module.js'),
    };
    
    // 忽略构建警告 - 这些警告不会影响功能
    config.ignoreWarnings = [
      /Module not found: Can't resolve '@react-native-async-storage\/async-storage'/,
      /Module not found: Can't resolve 'pino-pretty'/,
      /Critical dependency: the request of a dependency is an expression/,
    ];
    
    return config;
  },
  // 忽略构建警告
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
