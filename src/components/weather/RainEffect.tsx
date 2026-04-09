'use client';

import React from 'react';

interface RainEffectProps {
  pop: number; 
  className?: string;
  delay?: string;
  isThunderstorm?: boolean;
  weatherId?: number;
  strikeCycle?: string;
}

const getRainIntensity = (weatherId?: number, pop: number = 0): 'light' | 'moderate' | 'heavy' | 'none' => {
  if (weatherId) {
    if ([202, 212, 232, 302, 312, 314, 502, 503, 504, 522].includes(weatherId)) return 'heavy';
    if ([200, 210, 230, 300, 310, 500, 520].includes(weatherId)) return 'light';
    if ((weatherId >= 200 && weatherId < 600)) return 'moderate';
  }
  
  if (pop <= 15) return 'none';
  if (pop > 75) return 'heavy';
  if (pop > 40) return 'moderate';
  return 'light';
};

/**
 * Motor de Lluvia Ligera
 */
/**
 * Motor de Lluvia Ligera
 */
const LightRain: React.FC<RainEffectProps & { isDrizzle?: boolean }> = ({ className, delay = "0s", isDrizzle, weatherId, isThunderstorm, strikeCycle = "4s" }) => {
  const wrapperStyle: React.CSSProperties = {
    position: 'absolute', 
    width: '200%', 
    left: '-15%', 
    height: '100%',
    overflow: 'hidden',
    maskImage: 'radial-gradient(ellipse at center, black 25%, transparent 85%)',
    WebkitMaskImage: 'radial-gradient(ellipse at center, black 25%, transparent 85%)'
  };

  const isDryStorm = weatherId ? [210, 211, 212].includes(weatherId) : false;

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

  const baseOpacityMain = isDrizzle ? 0.25 : 0.7;
  const baseOpacitySub = isDrizzle ? 0.15 : 0.5;

  return (
    <div className={className} style={wrapperStyle}>
      {isThunderstorm && (
        <div 
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ 
            background: 'radial-gradient(ellipse at center, white 35%, transparent 80%)',
            animation: `rainFlashEffect ${strikeCycle} linear infinite`,
            opacity: 0
          }}
        />
      )}
      {!isDryStorm && (
        <div className="flex w-full h-full relative z-[1]">
          <div className="w-1/2 h-full" style={{ ...sharedStyle, animationDelay: `calc(${delay} - 0.2s)`, opacity: baseOpacityMain }} />
          <div className="w-1/2 h-full scale-x-[-1]" style={{ ...sharedStyle, animationDelay: `calc(${delay} - 0.8s)`, opacity: baseOpacitySub }} />
        </div>
      )}
    </div>
  );
};

/**
 * Motor de Lluvia Moderada
 */
const ModerateRain: React.FC<RainEffectProps & { isDrizzle?: boolean }> = ({ className, delay = "0s", isThunderstorm, isDrizzle, weatherId, strikeCycle = "4s" }) => {
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

  const baseOpacityMain = isDrizzle ? 0.3 : 0.7;
  const baseOpacitySub = isDrizzle ? 0.2 : 0.5;

  const isDryStorm = weatherId ? [210, 211, 212].includes(weatherId) : false;

  return (
    <div className={className} style={wrapperStyle}>
      {isThunderstorm && (
        <div 
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ 
            background: 'radial-gradient(ellipse at center, white 35%, transparent 80%)',
            animation: `rainFlashEffect ${strikeCycle} linear infinite`,
            opacity: 0
          }}
        />
      )}
      {!isDryStorm && (
        <div className="flex w-full h-full relative z-[1]">
          <div className="w-1/2 h-full" style={{ ...sharedStyle, animationDelay: `calc(${delay} - 0.1s)`, opacity: baseOpacityMain }} />
          <div className="w-1/2 h-full scale-x-[-1]" style={{ ...sharedStyle, animationDelay: `calc(${delay} - 0.45s)`, opacity: baseOpacitySub }} />
        </div>
      )}
    </div>
  );
};

/**
 * Motor de Lluvia Fuerte
 */
const HeavyRain: React.FC<RainEffectProps & { isDrizzle?: boolean }> = ({ className, delay = "0s", isThunderstorm, isDrizzle, weatherId, strikeCycle = "4s" }) => {
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

  const baseOpacityMain = isDrizzle ? 0.35 : 0.7;
  const baseOpacitySub = isDrizzle ? 0.25 : 0.5;

  const isDryStorm = weatherId ? [210, 211, 212].includes(weatherId) : false;

  return (
    <div className={className} style={wrapperStyle}>
      {isThunderstorm && (
        <div 
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ 
            background: 'radial-gradient(ellipse at center, white 35%, transparent 80%)',
            animation: `rainFlashEffect ${strikeCycle} linear infinite`,
            opacity: 0
          }}
        />
      )}
      {!isDryStorm && (
        <div 
          className="flex w-full h-full relative z-[1]" 
          style={{ transform: 'rotate(12deg) scale(1.3)', transformOrigin: 'center center' }}
        >
          <div className="w-1/2 h-full" style={{ ...sharedStyle, animationDelay: `calc(${delay} - 0.1s)`, opacity: baseOpacityMain }} />
          <div className="w-1/2 h-full scale-x-[-1]" style={{ ...sharedStyle, animationDelay: `calc(${delay} - 0.45s)`, opacity: baseOpacitySub }} />
        </div>
      )}
    </div>
  );
};

/**
 * RainEffect - v9.5
 */
export const RainEffect: React.FC<RainEffectProps> = (props) => {
  const intensity = getRainIntensity(props.weatherId, props.pop);

  // Determinamos si es llovizna verificando códigos 3xx o tormentas con llovizna 23x
  const isDrizzle = props.weatherId ? (
    (props.weatherId >= 300 && props.weatherId < 400) || 
    (props.weatherId >= 230 && props.weatherId <= 232)
  ) : false;

  if (intensity === 'none') return null;

  return (
    <>
      <style>{`
        @keyframes rainFallCascade {
          0% { transform: translateY(-75%); }
          100% { transform: translateY(-50%); } 
        }
        /* Flash de lluvia asincrónico */
        @keyframes rainFlashEffect {
          0%, 11%, 15%, 47%, 51%, 81%, 85%, 100% { opacity: 0; }
          12%, 48%, 82% { opacity: 0.8; }
          13%, 49%, 83% { opacity: 0.1; }
          14%, 50%, 84% { opacity: 0.7; }
        }
      `}</style>
      {intensity === 'heavy' ? (
        <HeavyRain {...props} isDrizzle={isDrizzle} />
      ) : intensity === 'moderate' ? (
        <ModerateRain {...props} isDrizzle={isDrizzle} />
      ) : (
        <LightRain {...props} isDrizzle={isDrizzle} />
      )}
    </>
  );
};
