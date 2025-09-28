
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4.5mb',
    },
  },
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_DONATION_URL: process.env.NEXT_PUBLIC_DONATION_URL,
    NEXT_PUBLIC_PAYPAL_URL: process.env.NEXT_PUBLIC_PAYPAL_URL,
    NEXT_PUBLIC_PORTFOLIO_URL: process.env.NEXT_PUBLIC_PORTFOLIO_URL,
    NEXT_PUBLIC_GITHUB_URL: process.env.NEXT_PUBLIC_GITHUB_URL,
    NEXT_PUBLIC_GOOGLE_ADSENSE_PUB_ID: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_PUB_ID,
    NEXT_PUBLIC_GOOGLE_ADSENSE_AD_SLOT_ID: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_AD_SLOT_ID,
  }
};

export default nextConfig;
