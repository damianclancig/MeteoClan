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

interface AdBannerProps {
  slotId?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  style?: React.CSSProperties;
  className?: string;
}

export const AdBanner = ({ slotId, format = 'auto', style = { display: 'block' }, className = 'min-h-[280px] sm:min-h-[100px]' }: AdBannerProps) => {
  const currentSlotId = slotId || AD_SLOT_ID;
  const pathname = usePathname();

  useEffect(() => {
    // Si no hay IDs, no hacemos nada
    if (!PUB_ID || !currentSlotId) return;

    try {
      // Verificamos que el script de AdSense esté cargado y enviamos el push
      if (typeof window !== 'undefined') {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, [pathname, currentSlotId]); 

  if (!currentSlotId || !PUB_ID) {
    // Don't render anything if the IDs are not configured
    // You can also render a placeholder in development
    return null;
  }

  return (
    <div key={pathname} className={`flex justify-center my-4 w-full transition-all ${className}`}>
      {/* Banner MeteoClan */}
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={PUB_ID}
        data-ad-slot={currentSlotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};
