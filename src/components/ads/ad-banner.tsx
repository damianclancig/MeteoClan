'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { GlassCard } from '@/components/ui/glass-card';

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

export const AdBanner = ({ slotId, format = 'auto', style = { display: 'block', width: '100%' }, className = 'min-h-[280px] sm:min-h-[100px]' }: AdBannerProps) => {
  const currentSlotId = slotId || AD_SLOT_ID;
  const pathname = usePathname();

  useEffect(() => {
    // Si no hay IDs, no hacemos nada
    if (!PUB_ID || !currentSlotId) return;

    // Pequeño delay para asegurar que el DOM calculó los anchos (evita availableWidth=0)
    const timer = setTimeout(() => {
      try {
        if (typeof window !== 'undefined') {
          (window as any).adsbygoogle = (window as any).adsbygoogle || [];
          (window as any).adsbygoogle.push({});
        }
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [pathname, currentSlotId]); 

  if (!currentSlotId || !PUB_ID) {
    // Don't render anything if the IDs are not configured
    // You can also render a placeholder in development
    return null;
  }

  return (
    <div key={pathname} className={`flex justify-center my-4 w-full transition-all ${className}`}>
      <GlassCard className="p-0 overflow-hidden flex items-center justify-center w-full">
        {/* Banner MeteoClan */}
        <ins
          className="adsbygoogle"
          style={style}
          data-ad-client={PUB_ID}
          data-ad-slot={currentSlotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        ></ins>
      </GlassCard>
    </div>
  );
};
