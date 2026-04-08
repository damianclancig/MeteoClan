'use client';

import React from 'react';

interface FogEffectProps {
  className?: string;
  delay?: string;
  weatherId?: number;
}

/**
 * FogEffect - v16.6 (Aumento de Tamaño General +25%)
 * Triple Capa: Mirrored + Orbit + Mirrored
 */
export const FogEffect: React.FC<FogEffectProps> = ({ className, delay = "0s", weatherId }) => {
  // Ajuste de filtros de color a nivel principal para teñir las texturas.
  // Es más efectivo forzar el color de renderizado de WebP que usar capas de blend-mode con máscaras.
  let extraFilter = '';
  if (weatherId === 721) {
    // 721: Haze (Bruma Seca). Tono ámbar sucio/esmog. 
    extraFilter = ' sepia(0.8) hue-rotate(-20deg) saturate(2.5) brightness(0.8)';
  } else if (weatherId === 701) {
    // 701: Mist (Neblina marina). Tono azul oscuro/frío.
    extraFilter = ' sepia(0.6) hue-rotate(180deg) saturate(3) brightness(1.2)';
  }

  const containerStyle: React.CSSProperties = {
    position: 'absolute', 
    width: '250%', // Aumentado de 200% (+25%)
    left: '-45%',  // Recentrado para el nuevo ancho
    height: '125%', // Aumentado de 100% (+25%)
    top: '-12.5%', // Centrado vertical para el nuevo alto
    overflow: 'visible',
    // Máscara compuesta adaptada al nuevo tamaño
    maskImage: 'radial-gradient(ellipse 100% 85% at center, black 30%, transparent 95%), linear-gradient(to right, transparent, black 25%, black 75%, transparent), linear-gradient(to bottom, transparent, black 15%)',
    WebkitMaskImage: 'radial-gradient(ellipse 100% 85% at center, black 30%, transparent 95%), linear-gradient(to right, transparent, black 25%, black 75%, transparent), linear-gradient(to bottom, transparent, black 15%)',
    // @ts-ignore
    WebkitMaskComposite: 'source-in',
    // @ts-ignore
    maskComposite: 'intersect',
    filter: `blur(0.5px)${extraFilter}`
  };

  const MirroredFog: React.FC<{ url: string; duration: string; opacity: number; delay: string; anim: string; blur?: string; zIndex: number }> = ({ 
    url, duration, opacity, delay, anim, blur = "2px", zIndex 
  }) => {
    const sheetStyle: React.CSSProperties = {
      display: 'flex',
      width: '200%',
      height: '100%',
      position: 'absolute',
      animation: `${anim} ${duration} ease-in-out infinite`,
      animationDelay: delay,
      zIndex
    };
    const halfStyle: React.CSSProperties = {
      width: '50%',
      height: '100%',
      backgroundImage: `url(${url})`,
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat',
      filter: `brightness(1.1) contrast(0.8) opacity(${opacity}) blur(${blur})`,
    };

    return (
      <div style={sheetStyle}>
        <div style={halfStyle} />
        <div style={{ ...halfStyle, transform: 'scaleX(-1)' }} />
      </div>
    );
  };

  return (
    <div className={className} style={containerStyle}>
      <style>{`
        @keyframes fogDriftSlow {
          0% { transform: translateX(-50%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(-50%); } 
        }
        @keyframes fogDriftFast {
          0% { transform: translateX(0%); }
          50% { transform: translateX(-50%); }
          100% { transform: translateX(0%); } 
        }
        @keyframes fogOrbit {
          0% { transform: translate(-10%, -15%) rotate(0deg); }
          25% { transform: translate(15%, -5%) rotate(1deg); }
          50% { transform: translate(10%, 15%) rotate(0deg); }
          75% { transform: translate(-15%, 5%) rotate(-1deg); }
          100% { transform: translate(-10%, -15%) rotate(0deg); }
        }
      `}</style>
      
      {/* 1. Capa Base (fog_01) - Suave, Fondo */}
      <MirroredFog 
        url="/assets/weather/fog_01.webp" 
        duration="65s" 
        opacity={1.0} 
        delay={`calc(${delay} - 10s)`}
        anim="fogDriftSlow"
        zIndex={1}
      />

      {/* 2. Capa Intermedia (fog_03) - Orbital, Suave (Aumentada un 25%) */}
      <div 
        style={{
          position: 'absolute',
          width: '100%', // Aumentado de 80%
          height: '100%', // Aumentado de 80%
          left: '0%',    // Recentrado
          top: '0%',
          backgroundImage: "url('/assets/weather/fog_03.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(1.4) opacity(0.6)',
          animation: 'fogOrbit 35s ease-in-out infinite',
          animationDelay: delay,
          zIndex: 2
        }}
      />

      {/* 3. Capa Superior (fog_02) - Bruma Detalle */}
      <MirroredFog 
        url="/assets/weather/fog_02.webp" 
        duration="35s" 
        opacity={0.8} 
        delay={`calc(${delay} - 2s)`}
        anim="fogDriftFast"
        blur="1px"
        zIndex={3}
      />
    </div>
  );
};
