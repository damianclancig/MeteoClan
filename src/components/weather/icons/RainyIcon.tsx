import React from 'react';
import { RainEffect } from '../RainEffect';

interface RainyIconProps {
  pop: number;
  className?: string;
  isThunderstorm?: boolean;
}

/**
 * RainyIcon - v9.5 (Solución de Flash de Alta Visibilidad)
 * Flash ambiental rediseñado para máxima visibilidad en entornos React/Next.
 */
export const RainyIcon: React.FC<RainyIconProps> = ({ pop, className = "w-24 h-24 md:w-32 md:h-32", isThunderstorm = false }) => {
  const strikeCycle = "4s";

  return (
    <div className={`${className} relative flex items-center justify-center transition-all duration-700 overflow-visible`}>
      <style>{`
        @keyframes rainCloudLayer1 {
          0% { transform: translate(-8%, -5%) scale(1.1); }
          50% { transform: translate(8%, 5%) scale(1.1); }
          100% { transform: translate(-8%, -5%) scale(1.1); }
        }
        @keyframes rainCloudLayer2 {
          0% { transform: translate(5%, 8%) scale(1.1); }
          50% { transform: translate(-5%, -8%) scale(1.1); }
          100% { transform: translate(5%, 8%) scale(1.1); }
        }

        /* RAYOS */
        @keyframes boltRight {
          0%, 19%, 26%, 100% { opacity: 0; transform: scale(1.1); }
          20% { opacity: 1; transform: scale(1.2); }
          22% { opacity: 0.4; transform: scale(1.2); }
          24% { opacity: 0.9; transform: scale(1.2); }
        }
        @keyframes boltLeft {
          0%, 69%, 76%, 100% { opacity: 0; transform: scale(1.1) scaleX(-1); }
          70% { opacity: 1; transform: scale(1.3) scaleX(-1); }
          72% { opacity: 0.4; transform: scale(1.2) scaleX(-1); }
          74% { opacity: 0.85; transform: scale(1.3) scaleX(-1); }
        }

        /* LUMINOSIDAD NUBES */
        @keyframes cloudsBurn {
          0%, 19%, 28%, 69%, 78%, 100% { filter: brightness(0.35) contrast(1.4); }
          20%, 70% { filter: brightness(2.8) contrast(1.1); }
          22%, 72% { filter: brightness(1.2) contrast(1.3); }
          24%, 74% { filter: brightness(2.4) contrast(1.2); }
        }
      `}</style>

      {/* 1. Lluvia con Flash de Fondo Integrado */}
      <div className="absolute inset-0 z-[5] pointer-events-none flex justify-center items-center overflow-visible">
        <RainEffect pop={pop} isThunderstorm={isThunderstorm} className="w-full h-full" delay="0s" />
      </div>

      {/* 2. Rayos */}
      {isThunderstorm && (
        <>
          <img 
            src="/assets/weather/lightning01.webp" 
            alt="Rayo Normal" 
            className="absolute w-[240%] md:w-[280%] h-auto object-contain opacity-0 z-[8] pointer-events-none"
            style={{ 
              animation: `boltRight ${strikeCycle} linear infinite`,
              top: '25%', left: '70%', transform: 'translateX(-50%)',
              filter: 'drop-shadow(0 0 35px white)'
            }}
          />
          <img 
            src="/assets/weather/lightning01.webp" 
            alt="Rayo Invertido" 
            className="absolute w-[240%] md:w-[280%] h-auto object-contain opacity-0 z-[8] pointer-events-none"
            style={{ 
              animation: `boltLeft ${strikeCycle} linear infinite`,
              top: '25%', left: '55%', transform: 'translateX(-50%) scaleX(-1)',
              filter: 'drop-shadow(0 0 35px white)'
            }}
          />
        </>
      )}

      {/* 3. Capas de Nubes */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none drop-shadow-2xl z-10">
        <img 
          src="/assets/weather/cloudy_02.webp" 
          alt="Tormenta" 
          className="absolute h-auto object-contain opacity-85"
          style={{ 
            animation: `${isThunderstorm ? `cloudsBurn ${strikeCycle} linear infinite, ` : ''}rainCloudLayer1 20s ease-in-out infinite`,
            top: '-35%', left: '-10%', width: '250%', minWidth: '250%',
          }}
        />
        <img 
          src="/assets/weather/cloudy_02.webp" 
          alt="Nublado" 
          className="absolute h-auto object-contain opacity-80"
          style={{ 
            animation: 'rainCloudLayer2 12s ease-in-out infinite',
            filter: 'brightness(1.1) contrast(0.9)',
            top: '-28%', left: '-20%', width: '220%', minWidth: '220%'
          }}
        />
      </div>
    </div>
  );
};
