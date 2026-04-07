import React from 'react';
import { SnowEffect } from '../SnowEffect';

interface SnowyIconProps {
  pop: number;
  className?: string;
}

/**
 * SnowyIcon - v1.0
 * Representación visual para climas de nieve.
 * Utiliza capas de nubes ultra brillantes y el nuevo motor de SnowEffect.
 */
export const SnowyIcon: React.FC<SnowyIconProps> = ({ pop, className = "w-24 h-24 md:w-32 md:h-32" }) => {
  return (
    <div className={`${className} relative flex items-center justify-center transition-all duration-700 overflow-visible`}>
      <style>{`
        @keyframes snowCloudLayer1 {
          0% { transform: translate(-5%, -5%) scale(1.05); }
          50% { transform: translate(5%, 5%) scale(1.05); }
          100% { transform: translate(-5%, -5%) scale(1.05); }
        }
        @keyframes snowCloudLayer2 {
          0% { transform: translate(3%, 4%) scale(1.05); }
          50% { transform: translate(-3%, -4%) scale(1.05); }
          100% { transform: translate(3%, 4%) scale(1.05); }
        }
      `}</style>

      {/* 1. Capa de Nieve */}
      <div className="absolute inset-0 z-[5] pointer-events-none flex justify-center items-center overflow-visible">
        <SnowEffect pop={pop} className="w-full h-full" delay="0s" />
      </div>

      {/* 2. Capas de Nubes de Tormenta Invernal (Nubes más brillantes y suaves) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] z-10">
        <img 
          src="/assets/weather/cloudy_01.webp" 
          alt="Nube Invernal 1" 
          className="absolute h-auto object-contain opacity-95"
          style={{ 
            animation: `snowCloudLayer1 25s ease-in-out infinite`,
            filter: 'brightness(1.6) contrast(0.7) blur(1px)',
            top: '-35%', left: '-15%', width: '260%', minWidth: '260%',
          }}
        />
        <img 
          src="/assets/weather/cloudy_02.webp" 
          alt="Nube Invernal 2" 
          className="absolute h-auto object-contain opacity-90"
          style={{ 
            animation: 'snowCloudLayer2 18s ease-in-out infinite',
            filter: 'brightness(1.8) contrast(0.6)',
            top: '-30%', left: '-20%', width: '230%', minWidth: '230%'
          }}
        />
      </div>
    </div>
  );
};
