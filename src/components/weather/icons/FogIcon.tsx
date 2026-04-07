import React from 'react';
import { FogEffect } from '../FogEffect';

interface FogIconProps {
  className?: string;
}

/**
 * FogIcon - v15.1 (Refinamiento de Capas para Niebla)
 * Ajuste: Se habilita overflow-visible para permitir óvalos anchos.
 */
export const FogIcon: React.FC<FogIconProps> = ({ 
  className = "w-24 h-24 md:w-32 md:h-32" 
}) => {
  return (
    <div className={`${className} relative flex items-center justify-center transition-all duration-700 overflow-visible`}>
      <style>{`
        @keyframes fogCloudLayer1 {
          0% { transform: translate(-5%, -3%) scale(1.15) scaleX(-1); }
          50% { transform: translate(5%, 3%) scale(1.15) scaleX(-1); }
          100% { transform: translate(-5%, -3%) scale(1.15) scaleX(-1); }
        }
        @keyframes fogCloudLayer2 {
          0% { transform: translate(3%, 5%) scale(1.1); }
          50% { transform: translate(-3%, -5%) scale(1.1); }
          100% { transform: translate(3%, 5%) scale(1.1); }
        }
      `}</style>

      {/* 1. Bruma de Fondo (Visible para test aislada) */}
      <div className="absolute inset-0 z-[5] pointer-events-none flex justify-center items-center overflow-visible opacity-80">
        <FogEffect className="w-full h-full" delay="0s" />
      </div>

      {/* 2. Capas de Neblina / Nubes Bajas (OCULTAS PARA TEST) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none drop-shadow-xl z-10">
        {/* <img 
          src="/assets/weather/cloudy_02.webp" 
          alt="Bruma Superior" 
          className="absolute h-auto object-contain opacity-50"
          style={{ 
            animation: `fogCloudLayer1 25s ease-in-out infinite`,
            filter: 'brightness(1.5) blur(4px) contrast(0.6)',
            top: '-25%', left: '-10%', width: '250%', minWidth: '250%',
          }}
        />
        <img 
          src="/assets/weather/fog_02.webp" 
          alt="Niebla Base" 
          className="absolute h-auto object-contain opacity-60"
          style={{ 
            animation: 'fogCloudLayer2 18s ease-in-out infinite',
            filter: 'brightness(1.3) blur(2px) contrast(0.8)',
            top: '-15%', left: '-20%', width: '220%', minWidth: '220%'
          }}
        /> */}
      </div>

      {/* Resplandor ovalado (Blur) para coherencia visual */}
      <div 
        className="absolute inset-4 bg-white/20 blur-3xl rounded-full -z-10 pointer-events-none" 
        aria-hidden="true"
      />
    </div>
  );
};
