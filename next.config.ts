/** @type {import('next').NextConfig} */
const nextConfig = {
  // Increase timeout for serverless functions
  experimental: {
    serverComponentsExternalPackages: ['canvas'], // Ensure canvas is treated as external package
    serverActions: {
      bodySizeLimit: '4mb', // Increase limit if needed
    },
  },
  // Set output to be serverless-friendly
  output: 'standalone',
  // Add any other config options needed
};

export default nextConfig;