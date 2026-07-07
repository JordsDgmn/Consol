/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for better server deployment
  // This bundles all necessary files for production deployment
  output: 'standalone',

  // Image optimization settings
  images: {
    unoptimized: process.env.NODE_ENV === 'production',
  },

  // Security headers
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
      ],
    },
  ],

  // Redirects (example)
  redirects: async () => [
    // Add your redirects here
  ],

  // Rewrites for API
  rewrites: async () => ({
    beforeFiles: [
      // Add any URL rewrites here
    ],
  }),
};

export default nextConfig;
