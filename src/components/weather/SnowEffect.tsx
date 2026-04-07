'use client';

import React from 'react';

interface SnowEffectProps {
  pop: number; 
  className?: string;
  delay?: string;
  isThunderstorm?: boolean;
}

/**
 * Shared ZigZag Component for Frontal Snow (snow_02.webp)
 * Opacidad estandarizada al 80% (0.8) según solicitud del usuario.
 */
const FrontalSnow: React.FC<{ delay: string; opacity: number; size: string; speed: string }> = ({ delay, opacity, size, speed }) => {
  const finalAnimation = `snowZigZag ${speed} linear infinite calc(${delay} - 5s) both`;
  
  return (
    <div 
      style={{
        position: 'absolute',
        inset: 0,
        height: '600%',
        width: '100%',
        backgroundImage: "url('/assets/weather/snow_02.webp')",
        backgroundRepeat: 'repeat',
        backgroundSize: size,
        filter: 'brightness(1.4)', 
        animation: finalAnimation,
        opacity: 0.7, // Ajustado a 70% según solicitud
        zIndex: 20,
        pointerEvents: 'none'
      }}
    />
  );
};

const LightSnow: React.FC<SnowEffectProps> = ({ className, delay = "0s" }) => {
  const wrapperStyle: React.CSSProperties = {
    position: 'absolute', width: '200%', left: '-15%', height: '100%',
    overflow: 'visible',
    maskImage: 'radial-gradient(ellipse at center, black 35%, transparent 90%)',
    WebkitMaskImage: 'radial-gradient(ellipse at center, black 35%, transparent 90%)'
  };

  return (
    <div className={className} style={wrapperStyle}>
      <div className="flex w-full h-full relative">
        <div className="w-1/2 h-full" style={{ 
          height: '400%', backgroundImage: "url('/assets/weather/snow_01.webp')", backgroundRepeat: 'repeat', backgroundSize: '135% 22.5%', filter: 'brightness(1.1) contrast(1.0)',
          animation: `snowFallCascade 12s linear infinite calc(${delay} - 2s) both`, 
          opacity: 0.6 
        }} />
        <div className="w-1/2 h-full scale-x-[-1]" style={{ 
          height: '400%', backgroundImage: "url('/assets/weather/snow_01.webp')", backgroundRepeat: 'repeat', backgroundSize: '135% 22.5%', filter: 'brightness(1.1) contrast(1.0)',
          animation: `snowFallCascade 12s linear infinite calc(${delay} - 8s) both`, 
          opacity: 0.4 
        }} />
        <FrontalSnow delay={delay} opacity={0.8} size="40% 10%" speed="25s" />
      </div>
    </div>
  );
};

const ModerateSnow: React.FC<SnowEffectProps> = ({ className, delay = "0s" }) => {
  const wrapperStyle: React.CSSProperties = {
    position: 'absolute', width: '200%', left: '-20%', height: '100%',
    overflow: 'visible',
    maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 85%)',
    WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 85%)'
  };

  return (
    <div className={className} style={wrapperStyle}>
      <div className="flex w-full h-full relative">
        <div className="w-1/2 h-full" style={{ 
          height: '400%', backgroundImage: "url('/assets/weather/snow_01.webp')", backgroundRepeat: 'repeat', backgroundSize: '120% 25%', filter: 'brightness(1.2) contrast(1.1)',
          animation: `snowFallCascade 8s linear infinite calc(${delay} - 1s) both`, 
          opacity: 0.7 
        }} />
        <div className="w-1/2 h-full scale-x-[-1]" style={{ 
          height: '400%', backgroundImage: "url('/assets/weather/snow_01.webp')", backgroundRepeat: 'repeat', backgroundSize: '120% 25%', filter: 'brightness(1.2) contrast(1.1)',
          animation: `snowFallCascade 8s linear infinite calc(${delay} - 4.5s) both`, 
          opacity: 0.5 
        }} />
        <FrontalSnow delay={delay} opacity={0.8} size="50% 12%" speed="20s" />
      </div>
    </div>
  );
};

const HeavySnow: React.FC<SnowEffectProps> = ({ className, delay = "0s" }) => {
  const wrapperStyle: React.CSSProperties = {
    position: 'absolute', width: '200%', left: '-20%', height: '100%',
    transform: 'rotate(5deg) scale(1.1)',
    overflow: 'visible',
    maskImage: 'radial-gradient(ellipse at center, black 50%, transparent 95%)',
    WebkitMaskImage: 'radial-gradient(ellipse at center, black 50%, transparent 95%)'
  };

  return (
    <div className={className} style={wrapperStyle}>
      <div className="flex w-full h-full relative">
        <div className="w-1/2 h-full" style={{ 
          height: '400%', backgroundImage: "url('/assets/weather/snow_01.webp')", backgroundRepeat: 'repeat', backgroundSize: '165% 27.5%', filter: 'brightness(1.2) contrast(1.1)',
          animation: `snowFallCascade 5s linear infinite calc(${delay} - 0.2s) both`, 
          opacity: 0.8 
        }} />
        <div className="w-1/2 h-full scale-x-[-1]" style={{ 
          height: '400%', backgroundImage: "url('/assets/weather/snow_01.webp')", backgroundRepeat: 'repeat', backgroundSize: '165% 27.5%', filter: 'brightness(1.2) contrast(1.1)',
          animation: `snowFallCascade 5s linear infinite calc(${delay} - 0.8s) both`, 
          opacity: 0.6 
        }} />
        <FrontalSnow delay={delay} opacity={0.8} size="70% 15%" speed="15s" />
      </div>
    </div>
  );
};

export const SnowEffect: React.FC<SnowEffectProps> = (props) => {
  if (props.pop <= 15 && props.pop !== 0) return null;

  return (
    <>
      <style>{`
        @keyframes snowFallCascade {
          0% { transform: translateY(-75%); }
          100% { transform: translateY(-50%); } 
        }
        @keyframes snowZigZag {
          0% { transform: translateY(-83.33%) translateX(-5%); }
          25% { transform: translateY(-79%) translateX(5%); }
          50% { transform: translateY(-75%) translateX(-5%); }
          75% { transform: translateY(-71%) translateX(5%); }
          100% { transform: translateY(-66.66%) translateX(-5%); }
        }
      `}</style>
      {props.pop > 75 ? (
        <HeavySnow {...props} />
      ) : props.pop > 40 ? (
        <ModerateSnow {...props} />
      ) : (
        <LightSnow {...props} />
      )}
    </>
  );
};
