/*
 * Copyright 2026 Clancig FullstackWeb
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use client';

import React from 'react';

interface SnowEffectProps {
  pop: number; 
  className?: string;
  delay?: string;
  isThunderstorm?: boolean;
  weatherId?: number;
}

const getSnowIntensity = (weatherId?: number, pop: number = 0): 'light' | 'moderate' | 'heavy' | 'none' => {
  if (weatherId) {
    if ([602, 622].includes(weatherId)) return 'heavy';
    if ([600, 611, 612, 615, 620].includes(weatherId)) return 'light';
    if ((weatherId >= 600 && weatherId < 700)) return 'moderate';
  }
  
  if (pop <= 15 && pop !== 0) return 'none'; // Permitir pop=0 si es seleccionado como clima o default
  if (pop > 75) return 'heavy';
  if (pop > 40) return 'moderate';
  return 'light';
};

/**
 * Shared ZigZag Component for FrontalSnow (snow_02.webp)
 * Opacidad estandarizada y personalización de keyframes
 */
const FrontalSnow: React.FC<{ delay: string; opacity: number; size: string; speed: string; animationName?: string }> = ({ delay, opacity, size, speed, animationName = "snowFallVertical" }) => {
  return (
    <div 
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 20,
        pointerEvents: 'none',
        animation: `snowSwayHorizontal 3.5s ease-in-out infinite alternate calc(${delay} - 2s)`
      }}
    >
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
          animation: `${animationName} ${speed} linear infinite calc(${delay} - 5s) both`,
          opacity: 0.7, 
        }}
      />
    </div>
  );
};

const LightSnow: React.FC<SnowEffectProps & { isSleet?: boolean }> = ({ className, delay = "0s", isSleet }) => {
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
          height: '400%', backgroundImage: "url('/assets/weather/snow_01.webp')", backgroundRepeat: 'repeat', 
          backgroundSize: '150% 25%', // Agrandado y ahora matemáticamente perfecto en el loop (25%)
          filter: 'brightness(1.3) contrast(1.1)', // Más brillante
          animation: `snowFallVertical ${isSleet ? '3s' : '12s'} linear infinite calc(${delay} - 2s) both`, 
          opacity: 0.8 
        }} />
        <div className="w-1/2 h-full scale-x-[-1]" style={{ 
          height: '400%', backgroundImage: "url('/assets/weather/snow_01.webp')", backgroundRepeat: 'repeat', 
          backgroundSize: '150% 25%', 
          filter: 'brightness(1.3) contrast(1.1)', 
          animation: `snowFallVertical ${isSleet ? '3s' : '12s'} linear infinite calc(${delay} - 8s) both`, 
          opacity: 0.6 
        }} />
        {/* Nieve ligera: Sólo usamos el fondo snow_01.webp, quitamos FrontalSnow para el efecto sutil */}
      </div>
    </div>
  );
};

const ModerateSnow: React.FC<SnowEffectProps & { isSleet?: boolean }> = ({ className, delay = "0s", isSleet }) => {
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
          animation: `snowFallVertical ${isSleet ? '2.5s' : '8s'} linear infinite calc(${delay} - 1s) both`, 
          opacity: 0.7 
        }} />
        <div className="w-1/2 h-full scale-x-[-1]" style={{ 
          height: '400%', backgroundImage: "url('/assets/weather/snow_01.webp')", backgroundRepeat: 'repeat', backgroundSize: '120% 25%', filter: 'brightness(1.2) contrast(1.1)',
          animation: `snowFallVertical ${isSleet ? '2.5s' : '8s'} linear infinite calc(${delay} - 4.5s) both`, 
          opacity: 0.5 
        }} />
        <FrontalSnow delay={delay} opacity={0.85} size="50% 12.5%" speed={isSleet ? "4s" : "14s"} />
      </div>
    </div>
  );
};

const HeavySnow: React.FC<SnowEffectProps & { isSleet?: boolean }> = ({ className, delay = "0s", isSleet }) => {
  const wrapperStyle: React.CSSProperties = {
    position: 'absolute', width: '200%', left: '-20%', height: '100%',
    overflow: 'hidden',
    maskImage: 'radial-gradient(ellipse at center, black 35%, transparent 80%)',
    WebkitMaskImage: 'radial-gradient(ellipse at center, black 35%, transparent 80%)'
  };

  return (
    <div className={className} style={wrapperStyle}>
      <div 
        className="w-full h-full relative" 
        style={{ transform: 'rotate(8deg) scale(1.3)', transformOrigin: 'center center' }}
      >
        {/* Capa fondo rápida */}
        <div style={{ 
          position: 'absolute', inset: 0, height: '400%', width: '100%',
          backgroundImage: "url('/assets/weather/snow_01.webp')", backgroundRepeat: 'repeat', 
          backgroundSize: '20% 25%',
          filter: 'brightness(1.5) contrast(1.2)', 
          animation: `snowHeavyDiagonalBg ${isSleet ? '1.5s' : '4s'} linear infinite calc(${delay} - 0.2s) both`, 
          opacity: 0.9 
        }} />
        {/* Capa fondo secundaria desfasada */}
        <div style={{ 
          position: 'absolute', inset: 0, height: '400%', width: '100%',
          backgroundImage: "url('/assets/weather/snow_01.webp')", backgroundRepeat: 'repeat', 
          backgroundSize: '20% 25%', 
          filter: 'brightness(1.3) contrast(1.2)', 
          animation: `snowHeavyDiagonalBg ${isSleet ? '1.8s' : '4.5s'} linear infinite calc(${delay} - 2.8s) both`, 
          opacity: 0.75 
        }} />
        
        {/* Nieve Frontal Veloz */}
        <FrontalSnow delay={delay} opacity={0.95} size="12.5% 12.5%" speed={isSleet ? "1s" : "2.5s"} animationName="snowHeavyDiagonalFront" />
      </div>
    </div>
  );
};

export const SnowEffect: React.FC<SnowEffectProps> = (props) => {
  const intensity = getSnowIntensity(props.weatherId, props.pop);

  // Determinamos explícitamente si se trata de "Aguanieve" (Sleet) para mayor peso en las partículas
  const isSleet = props.weatherId ? [611, 612, 613, 615, 616].includes(props.weatherId) : false;

  if (intensity === 'none') return null;

  return (
    <>
      <style>{`
        @keyframes snowFallVertical {
          0% { transform: translateY(-83.33%); }
          100% { transform: translateY(-58.33%); }
        }
        @keyframes snowSwayHorizontal {
          0% { transform: translateX(-10%); }
          100% { transform: translateX(10%); }
        }
        @keyframes snowHeavyDiagonalBg {
          0% { transform: translateY(-75%) translateX(10%); }
          100% { transform: translateY(-50%) translateX(-10%); } /* Total delta: -20%, keeps loop perfect */
        }
        @keyframes snowHeavyDiagonalFront {
          0% { transform: translateY(-75%) translateX(12.5%); }
          100% { transform: translateY(-50%) translateX(-12.5%); } /* Total delta: -25%, keeps loop perfect */
        }
      `}</style>
      {intensity === 'heavy' ? (
        <HeavySnow {...props} isSleet={isSleet} />
      ) : intensity === 'moderate' ? (
        <ModerateSnow {...props} isSleet={isSleet} />
      ) : (
        <LightSnow {...props} isSleet={isSleet} />
      )}
    </>
  );
};
