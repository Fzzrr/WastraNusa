import type { NextConfig } from 'next';

// ponytail: no script-src CSP yet; Next's inline scripts need a per-request
// nonce (set in proxy.ts) before scripts can be locked down.
const securityHeaders = [
  // Nobody may frame the site (clickjacking).
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // No remotePatterns: remote images bypass the optimizer (see
  // components/ui/image.tsx), so `/_next/image` serves /public files only.
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
