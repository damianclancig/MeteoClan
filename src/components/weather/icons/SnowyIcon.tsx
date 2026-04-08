import React from 'react';
import { SnowEffect } from '../SnowEffect';
import { AstroHero } from './AstroHero';
import { hasAstroPresence, isDayTime } from '@/utils/weather-utils';

interface SnowyIconProps {
  pop: number;
  className?: string;
  weatherId?: number;
  iconCode?: string;
}

/**
 * SnowyIcon - v14.0 (Réplica exacta de RainyIcon)
 * Se replica la herencia de capas, animaciones de nubes y volumen del icono de lluvia.
 */
export const SnowyIcon: React.FC<SnowyIconProps> = ({ 
  pop, 
  className = "w-24 h-24 md:w-32 md:h-32",
  weatherId,
  iconCode
}) => {
  return (
    <div className={`${className} relative flex items-center justify-center transition-all duration-700 overflow-visible`}>
      <style>{`
        @keyframes snowCloudLayer1 {
          0% { transform: translate(-8%, -5%) scale(1.1) scaleX(-1); }
          50% { transform: translate(8%, 5%) scale(1.1) scaleX(-1); }
          100% { transform: translate(-8%, -5%) scale(1.1) scaleX(-1); }
        }
        @keyframes snowCloudLayer2 {
          0% { transform: translate(5%, 8%) scale(1.1); }
          50% { transform: translate(-5%, -8%) scale(1.1); }
          100% { transform: translate(5%, 8%) scale(1.1); }
        }
      `}</style>
      
      {/* 0. ASTRO (Sol/Luna) — Aparece en nieve intermitente (IDs 600, 620, 621, 622) */}
      {weatherId && hasAstroPresence(weatherId) && (
        <div className="absolute top-[-5%] right-[25%] z-[25]">
          <AstroHero isDay={isDayTime(iconCode)} className="w-16 h-16 md:w-20 md:h-20" />
        </div>
      )}

      {/* 1. Nube de Fondo (Capa Base) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none drop-shadow-xl z-5">
        <img 
          src="/assets/weather/cloudy_02.webp" 
          alt="Nube Base" 
          className="absolute h-auto object-contain opacity-85"
          style={{ 
            animation: 'snowCloudLayer2 12s ease-in-out infinite',
            filter: 'brightness(1.8) contrast(0.7)',
            top: '-32%', left: '-20%', width: '165%', minWidth: '165%'
          }}
        />
      </div>

      {/* 2. Capa de Nieve Integral (Sándwich Intermedio) */}
      <div className="absolute inset-0 z-10 pointer-events-none flex justify-center items-center overflow-visible">
        <SnowEffect pop={pop} weatherId={weatherId} className="w-full h-full" delay="0s" />
      </div>

      {/* 3. Nube Frontal (Capa Superior) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none drop-shadow-2xl z-20">
        <img 
          src="/assets/weather/cloudy_02.webp" 
          alt="Nube Superior" 
          className="absolute h-auto object-contain opacity-90"
          style={{ 
            animation: `snowCloudLayer1 20s ease-in-out infinite`,
            filter: 'brightness(1.2) contrast(0.8)',
            top: '-35%', left: '-10%', width: '187%', minWidth: '187%',
          }}
        />
      </div>

      {/* Resplandor ovalado (Blur) para coherencia visual */}
      <div 
        className="absolute inset-4 bg-white/10 blur-3xl rounded-full -z-10 pointer-events-none" 
        aria-hidden="true"
      />
    </div>
  );
};
