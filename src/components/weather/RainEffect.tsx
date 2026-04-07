'use client';

import React from 'react';

interface RainEffectProps {
  pop: number; 
  className?: string;
  delay?: string;
  isThunderstorm?: boolean;
}

/**
 * Motor de Lluvia Ligera (16% - 40% POP)
 */
const LightRain: React.FC<RainEffectProps> = ({ className, delay = "0s" }) => {
  const wrapperStyle: React.CSSProperties = {
    position: 'absolute', 
    width: '200%', 
    left: '-15%', 
    height: '100%',
    overflow: 'hidden',
    maskImage: 'radial-gradient(ellipse at center, black 25%, transparent 85%)',
    WebkitMaskImage: 'radial-gradient(ellipse at center, black 25%, transparent 85%)'
  };

  const sharedStyle: React.CSSProperties = {
    height: '400%',
    backgroundImage: "url('/assets/weather/rain.webp')",
    backgroundRepeat: 'repeat',
    backgroundSize: '150% 25%',
    filter: 'brightness(1.1) contrast(1.0)',
    animationName: 'rainFallCascade',
    animationDuration: '1.2s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    animationFillMode: 'both'
  };

  return (
    <div className={className} style={wrapperStyle}>
      <div className="flex w-full h-full">
        <div className="w-1/2 h-full" style={{ ...sharedStyle, animationDelay: `calc(${delay} - 0.2s)`, opacity: 0.7 }} />
        <div className="w-1/2 h-full scale-x-[-1]" style={{ ...sharedStyle, animationDelay: `calc(${delay} - 0.8s)`, opacity: 0.5 }} />
      </div>
    </div>
  );
};

/**
 * Motor de Lluvia Moderada (41% - 75% POP)
 */
const ModerateRain: React.FC<RainEffectProps> = ({ className, delay = "0s", isThunderstorm }) => {
  const wrapperStyle: React.CSSProperties = {
    position: 'absolute', 
    width: '200%', 
    left: '-20%', 
    height: '100%',
    overflow: 'hidden',
    maskImage: 'radial-gradient(ellipse at center, black 35%, transparent 80%)',
    WebkitMaskImage: 'radial-gradient(ellipse at center, black 35%, transparent 80%)'
  };

  const sharedStyle: React.CSSProperties = {
    height: '400%',
    backgroundImage: "url('/assets/weather/rain.webp')",
    backgroundRepeat: 'repeat',
    backgroundSize: '120% 25%',
    filter: 'brightness(1.2) contrast(1.1)',
    animationName: 'rainFallCascade',
    animationDuration: '0.7s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    animationFillMode: 'both'
  };

  return (
    <div className={className} style={wrapperStyle}>
      {isThunderstorm && (
        <div 
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ 
            background: 'radial-gradient(ellipse at center, white 35%, transparent 80%)',
            animation: 'rainFlashEffect 4s linear infinite',
            opacity: 0
          }}
        />
      )}
      <div className="flex w-full h-full relative z-[1]">
        <div className="w-1/2 h-full" style={{ ...sharedStyle, animationDelay: `calc(${delay} - 0.1s)`, opacity: 0.7 }} />
        <div className="w-1/2 h-full scale-x-[-1]" style={{ ...sharedStyle, animationDelay: `calc(${delay} - 0.45s)`, opacity: 0.5 }} />
      </div>
    </div>
  );
};

/**
 * Motor de Lluvia Fuerte (> 75% POP)
 */
const HeavyRain: React.FC<RainEffectProps> = ({ className, delay = "0s", isThunderstorm }) => {
  const wrapperStyle: React.CSSProperties = {
    position: 'absolute', 
    width: '200%', 
    left: '-20%', 
    height: '100%',
    overflow: 'hidden',
    maskImage: 'radial-gradient(ellipse at center, black 35%, transparent 80%)',
    WebkitMaskImage: 'radial-gradient(ellipse at center, black 35%, transparent 80%)'
  };

  const sharedStyle: React.CSSProperties = {
    height: '400%',
    backgroundImage: "url('/assets/weather/rain.webp')",
    backgroundRepeat: 'repeat',
    backgroundSize: '120% 25%',
    filter: 'brightness(1.2) contrast(1.1)',
    animationName: 'rainFallCascade',
    animationDuration: '0.4s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    animationFillMode: 'both'
  };

  return (
    <div className={className} style={wrapperStyle}>
      {isThunderstorm && (
        <div 
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ 
            background: 'radial-gradient(ellipse at center, white 35%, transparent 80%)',
            animation: 'rainFlashEffect 4s linear infinite',
            opacity: 0
          }}
        />
      )}
      <div 
        className="flex w-full h-full relative z-[1]" 
        style={{ transform: 'rotate(12deg) scale(1.3)', transformOrigin: 'center center' }}
      >
        <div className="w-1/2 h-full" style={{ ...sharedStyle, animationDelay: `calc(${delay} - 0.1s)`, opacity: 0.7 }} />
        <div className="w-1/2 h-full scale-x-[-1]" style={{ ...sharedStyle, animationDelay: `calc(${delay} - 0.45s)`, opacity: 0.5 }} />
      </div>
    </div>
  );
};

/**
 * RainEffect - v9.0
 */
export const RainEffect: React.FC<RainEffectProps> = (props) => {
  if (props.pop <= 15) return null;

  return (
    <>
      <style>{`
        @keyframes rainFallCascade {
          0% { transform: translateY(-75%); }
          100% { transform: translateY(-50%); } 
        }
        /* Flash de lluvia asincrónico (Ciclo de 6.7s para que parezca aleatorio respecto al rayo) */
        @keyframes rainFlashEffect {
          0%, 11%, 15%, 47%, 51%, 81%, 85%, 100% { opacity: 0; }
          12%, 48%, 82% { opacity: 0.8; }
          13%, 49%, 83% { opacity: 0.1; }
          14%, 50%, 84% { opacity: 0.7; }
        }
      `}</style>
      {props.pop > 75 ? (
        <HeavyRain {...props} isThunderstorm={props.isThunderstorm} />
      ) : props.pop > 40 ? (
        <ModerateRain {...props} isThunderstorm={props.isThunderstorm} />
      ) : (
        <LightRain {...props} isThunderstorm={props.isThunderstorm} />
      )}
    </>
  );
};
