/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  typescript: { ignoreBuildErrors: process.env.SKIP_TYPECHECK === '1' },
  compress: true,
  experimental: { serverActions: { bodySizeLimit: '12mb' } },
  async rewrites() {
    return [
      { source: '/.well-known/security.txt', destination: '/api/security-txt' },
      { source: '/:key([a-f0-9]{32}).txt', destination: '/api/indexnow-key/:key' }
    ];
  },
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
      ]
    }];
  }
};
export default nextConfig;
