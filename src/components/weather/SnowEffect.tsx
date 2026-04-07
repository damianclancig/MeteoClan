'use client';

import React from 'react';

interface SnowEffectProps {
  pop: number; 
  className?: string;
  delay?: string;
}

/**
 * Motor de Nieve Ligera (16% - 40% POP)
 */
const LightSnow: React.FC<SnowEffectProps> = ({ className, delay = "0s" }) => {
  const wrapperStyle: React.CSSProperties = {
    position: 'absolute', 
    width: '250%', 
    left: '-25%', 
    height: '100%',
    overflow: 'hidden',
    maskImage: 'radial-gradient(ellipse at center, black 25%, transparent 90%)',
    WebkitMaskImage: 'radial-gradient(ellipse at center, black 25%, transparent 90%)'
  };

  const sharedStyle: React.CSSProperties = {
    height: '400%',
    backgroundImage: "url('/assets/weather/snow.png')",
    backgroundRepeat: 'repeat',
    backgroundSize: '100% 25%',
    mixBlendMode: 'screen',
    filter: 'brightness(1.2)',
    animationName: 'snowFallCascade, snowDrift',
    animationDuration: '12s, 6s',
    animationTimingFunction: 'linear, ease-in-out',
    animationIterationCount: 'infinite',
    animationFillMode: 'both'
  };

  return (
    <div className={className} style={wrapperStyle}>
      <div className="flex w-full h-full">
        <div className="w-1/2 h-full" style={{ ...sharedStyle, animationDelay: `calc(${delay} - 2s), 0s`, opacity: 0.7 }} />
        <div className="w-1/2 h-full scale-x-[-1]" style={{ ...sharedStyle, animationDelay: `calc(${delay} - 8s), 3s`, opacity: 0.5 }} />
      </div>
    </div>
  );
};

/**
 * Motor de Nieve Moderada (41% - 75% POP)
 */
const ModerateSnow: React.FC<SnowEffectProps> = ({ className, delay = "0s" }) => {
  const wrapperStyle: React.CSSProperties = {
    position: 'absolute', 
    width: '300%', 
    left: '-50%', 
    height: '100%',
    overflow: 'hidden',
    maskImage: 'radial-gradient(ellipse at center, black 35%, transparent 85%)',
    WebkitMaskImage: 'radial-gradient(ellipse at center, black 35%, transparent 85%)'
  };

  const sharedStyle: React.CSSProperties = {
    height: '400%',
    backgroundImage: "url('/assets/weather/snow.png')",
    backgroundRepeat: 'repeat',
    backgroundSize: '80% 25%',
    mixBlendMode: 'screen',
    filter: 'brightness(1.3)',
    animationName: 'snowFallCascade, snowDrift',
    animationDuration: '8s, 4s',
    animationTimingFunction: 'linear, ease-in-out',
    animationIterationCount: 'infinite',
    animationFillMode: 'both'
  };

  return (
    <div className={className} style={wrapperStyle}>
      <div className="flex w-full h-full relative z-[1]">
        <div className="w-1/3 h-full" style={{ ...sharedStyle, animationDelay: `calc(${delay} - 1s), 0s`, opacity: 0.8 }} />
        <div className="w-1/3 h-full scale-x-[-1]" style={{ ...sharedStyle, animationDelay: `calc(${delay} - 4s), 2s`, opacity: 0.6 }} />
        <div className="w-1/3 h-full" style={{ ...sharedStyle, animationDelay: `calc(${delay} - 6s), 1s`, opacity: 0.4 }} />
      </div>
    </div>
  );
};

/**
 * Motor de Nieve Fuerte (> 75% POP)
 */
const HeavySnow: React.FC<SnowEffectProps> = ({ className, delay = "0s" }) => {
  const wrapperStyle: React.CSSProperties = {
    position: 'absolute', 
    width: '300%', 
    left: '-50%', 
    height: '100%',
    overflow: 'hidden',
    maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
    WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
  };

  const sharedStyle: React.CSSProperties = {
    height: '400%',
    backgroundImage: "url('/assets/weather/snow.png')",
    backgroundRepeat: 'repeat',
    backgroundSize: '60% 25%',
    mixBlendMode: 'screen',
    filter: 'brightness(1.4) contrast(1.1)',
    animationName: 'snowFallCascade, snowDrift',
    animationDuration: '5s, 3s',
    animationTimingFunction: 'linear, ease-in-out',
    animationIterationCount: 'infinite',
    animationFillMode: 'both'
  };

  return (
    <div className={className} style={wrapperStyle}>
      <div className="flex w-full h-full relative z-[1]">
        <div className="w-1/4 h-full" style={{ ...sharedStyle, animationDelay: `calc(${delay} - 0.5s), 0s`, opacity: 0.9 }} />
        <div className="w-1/4 h-full scale-x-[-1]" style={{ ...sharedStyle, animationDelay: `calc(${delay} - 2s), 1.5s`, opacity: 0.7 }} />
        <div className="w-1/4 h-full" style={{ ...sharedStyle, animationDelay: `calc(${delay} - 3.5s), 0.75s`, opacity: 0.5 }} />
        <div className="w-1/4 h-full scale-x-[-1]" style={{ ...sharedStyle, animationDelay: `calc(${delay} - 4.5s), 2.25s`, opacity: 0.4 }} />
      </div>
    </div>
  );
};

/**
 * SnowEffect - v1.0
 * Efecto de nieve con balanceo (drift) y diferentes intensidades según POP.
 */
export const SnowEffect: React.FC<SnowEffectProps> = (props) => {
  if (props.pop <= 15) return null;

  return (
    <>
      <style>{`
        @keyframes snowFallCascade {
          0% { transform: translateY(-75%); }
          100% { transform: translateY(-50%); } 
        }
        @keyframes snowDrift {
          0%, 100% { transform: translateX(-5%); }
          50% { transform: translateX(5%); }
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
