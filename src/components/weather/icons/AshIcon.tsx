import React from 'react';
import { SnowEffect } from '../SnowEffect';

interface AshIconProps {
  className?: string;
}

/**
 * AshIcon - v1.0 (Ceniza Volcánica - OWM 762)
 * Reutiliza el motor de partículas de SnowEffect aplicando un filtro CSS
 * para convertir los copos blancos en partículas negras de ceniza volcanic.
 * Arquitectura DRY: no duplica la animación, sólo recontextualiza los assets.
 */
export const AshIcon: React.FC<AshIconProps> = ({ 
  className = "w-24 h-24 md:w-32 md:h-32" 
}) => {
  return (
    <div className={`${className} relative flex items-center justify-center transition-all duration-700 overflow-visible`}>
      <style>{`
        @keyframes ashCloudLayer1 {
          0% { transform: translate(-8%, -5%) scale(1.1) scaleX(-1); }
          50% { transform: translate(8%, 5%) scale(1.1) scaleX(-1); }
          100% { transform: translate(-8%, -5%) scale(1.1) scaleX(-1); }
        }
        @keyframes ashCloudLayer2 {
          0% { transform: translate(5%, 8%) scale(1.1); }
          50% { transform: translate(-5%, -8%) scale(1.1); }
          100% { transform: translate(5%, 8%) scale(1.1); }
        }
      `}</style>

      {/* 1. Nube de Fondo Densa (teñida de oscuro/rojo volcánico) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none drop-shadow-xl z-5">
        <img 
          src="/assets/weather/cloudy_02.webp" 
          alt="Nube Ceniza Base" 
          className="absolute h-auto object-contain opacity-85"
          style={{ 
            animation: 'ashCloudLayer2 12s ease-in-out infinite',
            // Nubes oscuras/naranjas que recuerdan a la columna volcánica
            filter: 'brightness(0.4) contrast(1.2) sepia(0.5) hue-rotate(-20deg)',
            top: '-32%', left: '-20%', width: '165%', minWidth: '165%'
          }}
        />
      </div>

      {/* 2. Motor de Partículas de SnowEffect con color negro/ceniza */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none flex justify-center items-center overflow-visible"
        style={{
          // Invertir los copos blancos a negro y añadir tono sepia ceniciento
          filter: 'invert(1) brightness(0.6) sepia(0.3)',
        }}
      >
        <SnowEffect 
          pop={100} 
          weatherId={622} 
          className="w-full h-full" 
          delay="0s" 
        />
      </div>

      {/* 3. Nube Frontal Oscura */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none drop-shadow-2xl z-20">
        <img 
          src="/assets/weather/cloudy_02.webp" 
          alt="Nube Ceniza Superior" 
          className="absolute h-auto object-contain opacity-90"
          style={{ 
            animation: 'ashCloudLayer1 20s ease-in-out infinite',
            filter: 'brightness(0.3) contrast(1.3) sepia(0.4) hue-rotate(-30deg)',
            top: '-35%', left: '-10%', width: '187%', minWidth: '187%',
          }}
        />
      </div>

      {/* Resplandor ovalado: naranja volcánico para dar esa sensación de calor subterráneo */}
      <div 
        className="absolute inset-4 bg-orange-900/40 blur-3xl rounded-full -z-10 pointer-events-none" 
        aria-hidden="true"
      />
    </div>
  );
};
