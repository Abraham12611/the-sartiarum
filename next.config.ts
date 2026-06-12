import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Silence the middleware deprecation warning until Next.js 16 stabilises the proxy API
  experimental: {},
}

export default nextConfig
