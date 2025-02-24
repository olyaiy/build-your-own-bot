import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
      {
        protocol: 'https',
        hostname: 'build-your-own-bot.d619751979aaf828d617a645de8d8b1c.r2.cloudflarestorage.com',
      },
    ],
  },
};

export default nextConfig;
