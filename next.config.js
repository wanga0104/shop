/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000']
    }
  },
  images: {
    unoptimized: true,
  },
  output: 'export',
}

module.exports = nextConfig