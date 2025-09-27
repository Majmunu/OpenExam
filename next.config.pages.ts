import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ['localhost'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // 禁用 API 路由
  async rewrites() {
    return []
  },
  // 静态导出配置
  generateStaticParams: true,
  // 禁用服务器端功能
  experimental: {
    esmExternals: false,
  },
};

export default nextConfig;
