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

interface SmokeEffectProps {
  className?: string;
  weatherId?: number;
}

export const SmokeEffect: React.FC<SmokeEffectProps> = ({ className, weatherId }) => {
  let extraFilter = '';
  if (weatherId === 731 || weatherId === 751) {
    // 731, 751: Sand / Arena -> Tono arena cálida, brillante y amarillenta
    extraFilter = 'sepia(0.8) hue-rotate(-15deg) saturate(2.5) brightness(1.2)';
  } else if (weatherId === 761 || weatherId === 762) {
    // 761 (Dust/Polvo), 762 (Ash/Ceniza) -> Tono tierra/marrón muy denso y oscuro
    extraFilter = 'sepia(0.9) hue-rotate(-30deg) saturate(2.0) brightness(0.65) contrast(1.3)';
  } else {
    // 711 Humo normal -> Gris perla neutro/oscuro
    extraFilter = 'sepia(0.1) hue-rotate(200deg) saturate(0) brightness(0.9)';
  }

  return (
    <div className={className} style={{ 
      position: 'absolute', width: '200%', left: '-20%', height: '100%', overflow: 'hidden',
      maskImage: 'radial-gradient(ellipse at center, black 35%, transparent 80%)',
      WebkitMaskImage: 'radial-gradient(ellipse at center, black 35%, transparent 80%)',
      filter: extraFilter,
      transition: 'filter 1s ease'
    }}>
      <style>{`
        @keyframes smokeSlideHorizontal {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.333%); }
        }
        @keyframes smokeCloudEllipticalRight {
          0% { transform: translate(15%, 5%) scale(1.0); opacity: 0.3; }
          25% { transform: translate(0%, -10%) scale(1.1); opacity: 0.5; }
          50% { transform: translate(-15%, 5%) scale(1.0); opacity: 0.3; }
          75% { transform: translate(0%, 20%) scale(0.9); opacity: 0.1; }
          100% { transform: translate(15%, 5%) scale(1.0); opacity: 0.3; }
        }
        @keyframes smokeCloudEllipticalLeft {
          0% { transform: translate(-15%, 15%) scale(1.0); opacity: 0.3; }
          25% { transform: translate(0%, 30%) scale(0.9); opacity: 0.1; }
          50% { transform: translate(15%, 15%) scale(1.0); opacity: 0.3; }
          75% { transform: translate(0%, 0%) scale(1.1); opacity: 0.5; }
          100% { transform: translate(-15%, 15%) scale(1.0); opacity: 0.3; }
        }
      `}</style>
      
      {/* Contenedor Externo para el fondo horizontal */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div style={{
          position: 'absolute', width: '150%', left: '-25%', height: '100%',
          backgroundImage: "url('/assets/weather/smoke_01.webp')",
          backgroundRepeat: 'repeat-x',
          backgroundSize: '33.333% 100%',
          filter: 'brightness(1.2) contrast(1.1)',
          animation: 'smokeSlideHorizontal 25s linear infinite',
          opacity: 0.8
        }} />
        <div style={{
          position: 'absolute', width: '150%', left: '-25%', height: '100%',
          backgroundImage: "url('/assets/weather/smoke_01.webp')",
          backgroundRepeat: 'repeat-x',
          backgroundSize: '33.333% 100%',
          filter: 'brightness(1.0) contrast(1.2)',
          animation: 'smokeSlideHorizontal 35s linear infinite reverse',
          opacity: 0.5,
          mixBlendMode: 'screen'
        }} />
      </div>

      {/* Nube 02 - Empieza derecha y cruza izquierda */}
      <div className="absolute inset-0 z-[1] pointer-events-none flex justify-center items-center">
        <img 
          src="/assets/weather/smoke_02.webp" 
          alt="Smoke Cloud 02" 
          className="absolute object-contain"
          style={{
            width: '90%', minWidth: '90%',
            animation: 'smokeCloudEllipticalRight 20s linear infinite',
            filter: 'brightness(1.1) contrast(1.1) blur(1px)',
            mixBlendMode: 'screen'
          }}
        />
      </div>

      {/* Nube 03 - Empieza izquierda y cruza derecha */}
      <div className="absolute inset-0 z-[2] pointer-events-none flex justify-center items-center">
        <img 
          src="/assets/weather/smoke_03.webp" 
          alt="Smoke Cloud 03" 
          className="absolute object-contain"
          style={{
            width: '90%', minWidth: '90%',
            animation: 'smokeCloudEllipticalLeft 25s linear infinite',
            filter: 'brightness(0.9) contrast(1.2)',
            mixBlendMode: 'screen'
          }}
        />
      </div>
    </div>
  );
};
