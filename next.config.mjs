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
    const csp = [
      "default-src 'self'",
      // Next.js and JSON-LD need inline scripts; GA4 only loads after cookie consent and when an ID is set
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com",
      "font-src 'self' data:",
      "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com",
      "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'", "upgrade-insecure-requests"
    ].join('; ');
    return [{
      source: '/:path*',
      headers: [
        { key: 'Content-Security-Policy', value: csp },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()' },
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' }
      ]
    }];
  }
};
export default nextConfig;
