/** @type {import('next').NextConfig} */
const nextConfig = {
  // Common Next.js configurations
  reactStrictMode: true,
  swcMinify: true,
  
  // If you're using experimental features
  // experimental: {
  //   serverActions: true,
  // },
  
  // If you need to configure images from external sources
  // images: {
  //   domains: ['example.com'],
  // },
  
  // If you need to add environment variables
  env: {
    // your env variables here
  },
}

module.exports = nextConfig
