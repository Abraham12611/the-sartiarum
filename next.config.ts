import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    // Type errors are surfaced in the editor and CI; they must not block
    // a Vercel deployment while the app is under active development.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Same rationale — lint warnings must not gate a deployment.
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
