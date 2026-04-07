'use client';

import React from 'react';

interface RainEffectProps {
  pop: number; 
  className?: string;
}

/**
 * RainEffect - v7.0 (Motor de Textura Sincronizado)
 * Motor optimizado para lluvia ligera (16%+).
 * Utiliza desplazamiento de fondo al 50% para coincidir exactamente con el mosaico.
 */
export const RainEffect: React.FC<RainEffectProps> = ({ pop, className = "" }) => {
  if (pop <= 15) return null;
  // Ajuste de velocidades: Ligera (1.2s), Moderada (0.6s), Fuerte (0.35s)
  const isHeavyRain = pop > 75;
  const duration = isHeavyRain ? '0.35s' : pop > 40 ? '0.6s' : '1.2s';

  // Aplicar rotación y escala para cubrir las esquinas si es lluvia fuerte
  const wrapperStyle: React.CSSProperties = {
    position: 'absolute', 
    inset: 0, 
    overflow: 'hidden',
    transform: isHeavyRain ? 'scale(1.3) rotate(20deg)' : 'none',
    transformOrigin: 'center center',
    transition: 'transform 0.8s ease'
  };

  return (
    <div className={className} style={wrapperStyle}>
      <style>{`
        @keyframes rainFallCascade {
          0% { transform: translateY(-75%); }
          100% { transform: translateY(-50%); } /* Movimiento del 3 al 2 en una cascada de 4 */
        }
      `}</style>
      <div 
        className="absolute left-0 top-0 w-full z-0 opacity-60"
        style={{ 
          height: '400%',
          backgroundImage: "url('/assets/weather/rain.webp')",
          backgroundRepeat: 'repeat',
          backgroundSize: '100% 25%', /* 4 imágenes exactas en el 400% de altura */
          filter: 'brightness(1.5) contrast(1.1)',
          animation: `rainFallCascade ${duration} linear infinite`
        }}
      />
    </div>
  );
};
