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

import React from 'react';

interface PartlyCloudyIconProps {
  className?: string;
  weatherId?: number;
  iconCode?: string;
}

import { AstroHero } from './AstroHero';
import { isDayTime } from '@/utils/weather-utils';

/**
 * PartlyCloudyIcon - v2.00
 * Composición dinámica para 801 (Sol predominante, nube atrás) 
 * y 802/803 (Nubes intercaladas y frontales).
 */
export const PartlyCloudyIcon: React.FC<PartlyCloudyIconProps> = ({ 
  className = "w-24 h-24 md:w-32 md:h-32",
  weatherId = 803,
  iconCode
}) => {
  const isFewClouds = weatherId === 801;
  const isScattered = weatherId === 802;
  const isBroken = !isFewClouds && !isScattered; // Default (803)

  // El sol va por detrás solo cuando es muy nublado (803)
  const sunZIndex = isBroken ? 'z-0' : 'z-10';

  // Solo hay nube frontal en 802 y 803
  const showFrontCloud = isScattered || isBroken;

  return (
    <div className={`${className} relative flex items-center justify-center transition-all duration-700 ease-in-out`}>
      <style>{`
        @keyframes cloudPan {
          0% { transform: translateX(-12%) translateY(0%); }
          100% { transform: translateX(12%) translateY(2%); }
        }
        @keyframes cloudPanAlt {
          0% { transform: scaleX(-1) translateX(8%) translateY(0%); }
          100% { transform: scaleX(-1) translateX(-8%) translateY(-3%); }
        }
      `}</style>

      {/* Nube Posterior - Z-5 */}
      <img
        src="/assets/weather/cloudy_02.webp"
        alt="Nube posterior"
        className={`absolute h-auto object-contain drop-shadow-xl z-[5] ${isBroken ? 'opacity-50' : 'opacity-90'}`}
        style={{
          animation: 'cloudPanAlt 10s ease-in-out infinite alternate',
          bottom: isBroken ? '-10%' : '-15%',
          left: isBroken ? '-40%' : '-20%',
          width: isBroken ? '200%' : '160%',
          minWidth: isBroken ? '200%' : '160%',
          filter: isBroken ? 'brightness(0.9) blur(1px)' : 'brightness(0.95)'
        }}
      />

      {/* Astro Dinámico (Sol/Luna) */}
      <div 
        className={`absolute h-full w-full flex items-center justify-center transition-all duration-700 ${sunZIndex}`}
        style={{
          transform: isFewClouds 
            ? 'scale(1.1)' 
            : 'scale(1.1) translate(15%, -15%)',
        }}
      >
        <AstroHero isDay={isDayTime(iconCode)} className="w-[85%] h-[85%]" />
      </div>

      {/* Nube Frontal - z-20. 802: Pequeña inferior | 803: Enorme tapando todo */}
      {showFrontCloud && (
        <img
          src="/assets/weather/cloudy_02.webp"
          alt="Nube principal"
          className="absolute h-auto object-contain drop-shadow-2xl z-20 opacity-80"
          style={{
            animation: 'cloudPan 7s ease-in-out infinite alternate',
            bottom: isScattered ? '-35%' : '-30%',
            left: isScattered ? '-10%' : '-30%',
            width: isScattered ? '160%' : '250%',
            minWidth: isScattered ? '160%' : '250%'
          }}
        />
      )}
    </div>
  );
};
