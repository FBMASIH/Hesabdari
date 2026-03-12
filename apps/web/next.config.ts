import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@hesabdari/ui', '@hesabdari/design-tokens'],
  typedRoutes: true,
};

export default nextConfig;
