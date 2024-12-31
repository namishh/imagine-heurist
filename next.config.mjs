import './src/env.mjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'miro.medium.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3proxydc.akave.ai',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.us-east-1.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'd1dagtixswu0qn.cloudfront.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'imaginaries.heurist.ai',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'files.heurist.xyz',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'app.giz.ai',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.giz.ai',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'twitter.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.civitai.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'civitai.com',
        pathname: '/**',
      },
    ],
  },
  output: 'standalone',
  reactStrictMode: false,
  poweredByHeader: false,
  generateEtags: true,
  compress: true,
  productionBrowserSourceMaps: false,
}

export default nextConfig
