import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    // Type errors surface in the editor; they must not block Vercel deploys
    // during active development.
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
