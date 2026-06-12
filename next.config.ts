import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // Allow unoptimized local public/ images if needed
    unoptimized: false,
  },
}

export default nextConfig
