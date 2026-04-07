import React from 'react';

interface OvercastIconProps {
  className?: string;
}

/**
 * OvercastIcon - v1.00
 * Efecto de Paralaje Elíptico de doble capa para cielos totalmente cubiertos.
 */
export const OvercastIcon: React.FC<OvercastIconProps> = ({ className = "w-24 h-24 md:w-32 md:h-32" }) => {
  return (
    <div className={`${className} relative flex items-center justify-center transition-all duration-1000`}>
      <style>{`
        @keyframes overcastBg {
          0% { transform: translate(-12%, 0%) scaleX(-1.1) scaleY(1.1); }
          25% { transform: translate(0%, -8%) scaleX(-1.1) scaleY(1.1); }
          50% { transform: translate(12%, 0%) scaleX(-1.1) scaleY(1.1); }
          75% { transform: translate(0%, 8%) scaleX(-1.1) scaleY(1.1); }
          100% { transform: translate(-12%, 0%) scaleX(-1.1) scaleY(1.1); }
        }
        @keyframes overcastFg {
          0% { transform: translateX(10%) scale(1.1); }
          100% { transform: translateX(-10%) scale(1.1); }
        }
      `}</style>
      
      {/* Aura gris atmosférica */}
      <div className="absolute inset-0 bg-slate-500/20 blur-3xl rounded-full" />
      
      {/* Capa Trasera: Movimiento Elíptico Orbicular */}
      <img 
        src="/assets/weather/cloudy.webp" 
        alt="Nubes fondo" 
        className="absolute w-[160%] h-auto object-contain drop-shadow-lg z-0 opacity-70"
        style={{ 
          animation: 'overcastBg 20s linear infinite',
          filter: 'brightness(0.5) contrast(1.2)'
        }}
      />

      {/* Capa Frontal: Más rápida y clara */}
      <img 
        src="/assets/weather/cloudy.webp" 
        alt="Totalmente Nublado" 
        className="absolute w-[130%] h-auto object-contain drop-shadow-2xl z-10 opacity-80"
        style={{ 
          animation: 'overcastFg 8s ease-in-out infinite alternate',
          filter: 'brightness(0.85)'
        }}
      />
    </div>
  );
};
