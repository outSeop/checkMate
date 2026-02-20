import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'http', hostname: 'img1.kakaocdn.net' },
      { protocol: 'http', hostname: 't1.kakaocdn.net' },
      { protocol: 'https', hostname: 'img1.kakaocdn.net' },
      { protocol: 'https', hostname: 't1.kakaocdn.net' },
    ],
  },
  devIndicators: {
    position: 'bottom-right',
  },
};

export default nextConfig;
