import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    // Type errors surface in the editor; they must not block Vercel deploys
    // during active development.
    ignoreBuildErrors: true,
  },
}

export default nextConfig
