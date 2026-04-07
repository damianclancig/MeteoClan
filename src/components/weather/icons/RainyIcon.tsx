import React from 'react';
import { RainEffect } from '../RainEffect';
import { Zap } from 'lucide-react';

interface RainyIconProps {
  pop: number;
  className?: string;
  isThunderstorm?: boolean;
}

/**
 * RainyIcon - v7.08 (Tormenta Eléctrica Completa)
 * Nubes superiores de tormenta, motor de lluvia en cascada
 * y efectos visuales de rayos (rayos dibujados + relámpagos de fondo luminosos).
 */
export const RainyIcon: React.FC<RainyIconProps> = ({ pop, className = "w-24 h-24 md:w-32 md:h-32", isThunderstorm = false }) => {
  return (
    <div className={`${className} relative overflow-hidden rounded-2xl bg-white/5`}>
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
        @keyframes lightningFlash {
          0%, 90%, 100% { opacity: 0; background-color: transparent; }
          92% { opacity: 1; background-color: rgba(255, 255, 255, 0.9); }
          94% { opacity: 0; background-color: transparent; }
          96% { opacity: 0.5; background-color: rgba(255, 255, 255, 0.5); }
          98% { opacity: 0; background-color: transparent; }
        }
        @keyframes boltStrike {
          0%, 85%, 100% { opacity: 0; transform: scale(1); filter: brightness(1); }
          87% { opacity: 1; transform: translateX(15%) scale(1.1); filter: brightness(1.6) contrast(1.3); }
          89% { opacity: 0; }
          91% { opacity: 1; transform: translateX(-15%) scale(1.05) scaleX(-1); filter: brightness(1.4) contrast(1.2); }
          93% { opacity: 0; }
          95% { opacity: 1; transform: translateX(10%) scale(1.3); filter: brightness(1.8) contrast(1.4); }
          98% { opacity: 0; }
        }
        @keyframes cloudThunder {
          0%, 85%, 100% { filter: brightness(0.4) contrast(1.3); }
          87% { filter: brightness(1.4) contrast(1.1); }
          89% { filter: brightness(0.4) contrast(1.3); }
          91% { filter: brightness(1.2) contrast(1.1); }
          93% { filter: brightness(0.4) contrast(1.3); }
          95% { filter: brightness(1.6) contrast(1.2); }
          98% { filter: brightness(0.4) contrast(1.3); }
        }
      `}</style>
      
      {/* 1. Relámpago de Fondo Independiente (z-2) - Ciclo 7s */}
      {isThunderstorm && (
        <div 
          className="absolute inset-0 z-[2] pointer-events-none mix-blend-overlay"
          style={{ animation: 'lightningFlash 7s infinite' }}
        />
      )}

      {/* 2. Efecto de Lluvia Ligera (Capa de Fondo - z-5) */}
      <RainEffect pop={pop} className="absolute inset-0 z-[5] top-0 left-0" />

      {/* 3. Rayo de Usuario (Delante de la lluvia pero Detrás de nubes - z-8) */}
      {isThunderstorm && (
        <div className="absolute inset-0 flex items-center justify-center z-[8] pointer-events-none">
          <img 
            src="/assets/weather/lightning01.webp?v=1"
            alt="Rayo"
            className="w-[240%] md:w-[280%] h-auto object-contain opacity-0"
            style={{ 
              animation: 'boltStrike 6s infinite',
              filter: 'drop-shadow(0 0 45px rgba(255, 255, 255, 0.9))'
            }}
          />
        </div>
      )}

      {/* 4. Nubes de Tormenta (Capa de Frente - z-10) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none drop-shadow-2xl z-10">
        {/* Nube Trasera (Negra, con Flash de Rayo) */}
        <img 
          src="/assets/weather/cloudy.webp" 
          alt="Tormenta" 
          className="absolute w-[180%] h-auto object-contain opacity-70"
          style={{ 
            animation: `${isThunderstorm ? 'cloudThunder 6s infinite, ' : ''}rainCloudLayer1 20s ease-in-out infinite`,
            top: '-15%' 
          }}
        />
        {/* Nube Frontal (Clara, Sin Flash - v7.21) */}
        <img 
          src="/assets/weather/cloudy.webp" 
          alt="Nublado" 
          className="absolute w-[150%] h-auto object-contain opacity-80"
          style={{ 
            animation: 'rainCloudLayer2 12s ease-in-out infinite',
            filter: 'brightness(1.1) contrast(0.9)',
            top: '-5%' 
          }}
        />
      </div>
    </div>
  );
};

