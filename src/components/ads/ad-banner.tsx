'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const AD_SLOT_ID = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_AD_SLOT_ID;
const PUB_ID = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_PUB_ID;

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export const AdBanner = () => {
  const pathname = usePathname();

  useEffect(() => {
    // Pequeño retardo para asegurar que el DOM esté listo y evitar colisiones en Next.js
    const timer = setTimeout(() => {
      try {
        // Verificamos si hay algún elemento 'ins' que aún no tenga el atributo de estado de AdSense
        const adsContainer = document.querySelectorAll('.adsbygoogle:not([data-adsbygoogle-status])');

        if (adsContainer.length > 0) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!AD_SLOT_ID || !PUB_ID) {
    // Don't render anything if the IDs are not configured
    // You can also render a placeholder in development
    return null;
  }

  return (
    <div key={pathname} className="flex justify-center my-4 w-full min-h-[100px]">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={PUB_ID}
        data-ad-slot={AD_SLOT_ID}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};
