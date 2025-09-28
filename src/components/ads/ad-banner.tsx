
'use client';

import { useEffect } from 'react';

const AD_SLOT_ID = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_AD_SLOT_ID;
const PUB_ID = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_PUB_ID;

declare global {
  interface Window {
    adsbygoogle: {
      push: (params: {}) => void;
    }[];
  }
}

export const AdBanner = () => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  if (!AD_SLOT_ID || !PUB_ID) {
    // Don't render anything if the IDs are not configured
    // You can also render a placeholder in development
    return null;
  }

  return (
    <div className="flex justify-center my-4">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={PUB_ID}
        data-ad-slot={AD_SLOT_ID}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};
