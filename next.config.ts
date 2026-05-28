import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  compress: true,


  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'propartners.com.gh' },
      { protocol: 'https', hostname: 'thebftonline.com' },
    ],
  },

  async headers() {
    return [
      {
        // Never cache API responses
        source: '/api/(.*)',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
      {
        // Security headers on all routes
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          { key: 'X-Frame-Options',          value: 'DENY' },
          { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection',         value: '1; mode=block' },
        ],
      },
    ]
  },
}

export default nextConfig
