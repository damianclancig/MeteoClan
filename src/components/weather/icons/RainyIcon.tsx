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

import React, { useState, useEffect, useRef } from 'react';
import { RainEffect } from '../RainEffect';
import { LightStorm, ModerateStorm, HeavyStorm, ExtremeStorm } from './ThunderstormEffects';
import { AstroHero } from './AstroHero';
import { hasAstroPresence, isDayTime } from '@/utils/weather-utils';

interface RainyIconProps {
  pop: number;
  className?: string;
  isThunderstorm?: boolean;
  weatherId?: number;
  iconCode?: string;
}

/**
 * RainyIcon - v13 (Componentes separados por intensidad)
 * Cada nivel de tormenta es un componente React independiente.
 * Al cambiar de intensidad, React hace unmount/remount completo → timers limpios garantizados.
 */
export const RainyIcon: React.FC<RainyIconProps> = ({
  pop,
  className = 'w-24 h-24 md:w-32 md:h-32',
  isThunderstorm = false,
  weatherId,
  iconCode,
}) => {
  const [cloudFlash, setCloudFlash] = useState(false);
  const [atmosFlash, setAtmosFlash] = useState(false);
  const atmosRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Intensidad: los códigos OWM tienen PRIORIDAD ABSOLUTA sobre el POP
  let intensity: 'light' | 'moderate' | 'heavy' | 'extreme' = 'moderate';
  if (weatherId) {
    // Tormenta Extrema (Ragged)
    if (weatherId === 221) intensity = 'extreme';
    // Tormentas fuertes
    else if ([202, 212, 232].includes(weatherId)) intensity = 'heavy';
    // Tormentas ligeras
    else if ([200, 210, 230].includes(weatherId)) intensity = 'light';
    // Tormentas moderadas (201, 211, 221, 231 y cualquier otro 2xx)
    else if (weatherId >= 200 && weatherId < 300) intensity = 'moderate';
    // Para otros códigos no-tormenta, usar POP como fallback
    else if (pop > 75) intensity = 'heavy';
    else if (pop > 0 && pop <= 40) intensity = 'light';
  } else {
    // Sin weatherId, usar POP
    if (pop > 75) intensity = 'heavy';
    else if (pop > 0 && pop <= 40) intensity = 'light';
  }

  // Flash atmosférico — loop independiente sin callback a los hijos
  useEffect(() => {
    if (!isThunderstorm || intensity === 'light') return;

    const minMs = intensity === 'moderate' ? 7000 : 3000;
    const maxMs = intensity === 'moderate' ? 14000 : 6000;

    const schedule = () => {
      const delay = minMs + Math.random() * (maxMs - minMs);
      atmosRef.current = setTimeout(() => {
        // Flash ON instantáneo
        setAtmosFlash(true);
        // Flash OFF a los 60ms
        setTimeout(() => setAtmosFlash(false), 60);
        // Programar el siguiente
        schedule();
      }, delay);
    };

    // Primer disparo con delay aleatorio
    atmosRef.current = setTimeout(schedule, (minMs / 2) * Math.random() + 1000);

    return () => { if (atmosRef.current) clearTimeout(atmosRef.current); };
  }, [isThunderstorm, intensity]);

  return (
    <div className={`${className} relative flex items-center justify-center overflow-visible`}>
      <style>{`
        @keyframes rainCloudLayer1 {
          0%   { transform: translate(-8%, -5%) scale(1.1) scaleX(-1); }
          50%  { transform: translate(8%, 5%) scale(1.1) scaleX(-1); }
          100% { transform: translate(-8%, -5%) scale(1.1) scaleX(-1); }
        }
        @keyframes rainCloudLayer2 {
          0%   { transform: translate(5%, 8%) scale(1.1); }
          50%  { transform: translate(-5%, -8%) scale(1.1); }
          100% { transform: translate(5%, 8%) scale(1.1); }
        }
      `}</style>

      {/* FLASH ATMOSFÉRICO — Óvalo chato de luz */}
      {isThunderstorm && intensity !== 'light' && (
        <div
          className="absolute pointer-events-none z-[40]"
          style={{
            width: '230%',
            height: '100%',
            top: '50%',
            left: '50%',
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 30%, rgba(255,255,255,0.4) 60%, transparent 80%)',
            filter: 'blur(20px)',
            transform: 'translate(calc(-50% + 30px), -50%)',
            opacity: atmosFlash ? 1 : 0,
            mixBlendMode: 'screen',
            transition: atmosFlash ? 'none' : 'opacity 0.05s ease-out',
          }}
        />
      )}

      {/* LLUVIA — Sándwich intermedio a z-10 */}
      <div className="absolute inset-0 z-[10] pointer-events-none flex justify-center items-center overflow-visible">
        <RainEffect
          pop={pop}
          isThunderstorm={false}
          className="w-full h-full"
          delay="0s"
          weatherId={weatherId}
        />
      </div>

      {/*
       * EFECTO DE TORMENTA — componente separado según intensidad.
       * La key={intensity} fuerza unmount+remount cuando cambia la intensidad,
       * garantizando que todos los timers se limpian correctamente.
       */}
      {isThunderstorm && intensity === 'light' && (
        <LightStorm key="light" onCloudFlash={setCloudFlash} />
      )}
      {isThunderstorm && intensity === 'moderate' && (
        <ModerateStorm key="moderate" onCloudFlash={setCloudFlash} />
      )}
      {isThunderstorm && intensity === 'heavy' && (
        <HeavyStorm key="heavy" onCloudFlash={setCloudFlash} />
      )}
      {isThunderstorm && intensity === 'extreme' && (
        <ExtremeStorm key="extreme" onCloudFlash={setCloudFlash} />
      )}

      {/* ASTRO (Sol/Luna) — Aparece en lluvias intermitentes (IDs 500, 520, 521, 522) */}
      {weatherId && hasAstroPresence(weatherId) && (
        <div className="absolute top-[-5%] right-[25%] z-0">
          <AstroHero isDay={isDayTime(iconCode)} className="w-16 h-16 md:w-20 md:h-20" />
        </div>
      )}

      {/* NUBE BASE — Z-5 (Detrás de la lluvia) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none drop-shadow-xl z-[5]">
        <img
          src="/assets/weather/cloudy_02.webp"
          alt="Tormenta"
          className="absolute h-auto object-contain opacity-80"
          style={{
            animation: 'rainCloudLayer1 20s ease-in-out infinite',
            top: '-35%', left: '-56%', width: '212%', minWidth: '212%',
            filter: isThunderstorm && cloudFlash
              ? 'brightness(1.9) contrast(1.1) blur(2px)'
              : 'brightness(0.85) blur(2px)',
            transition: cloudFlash ? 'none' : 'filter 0.1s ease-out',
            marginLeft: '30px',
          }}
        />
      </div>

      {/* NUBE FRONTAL — Z-20 (Delante de la lluvia) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none drop-shadow-2xl z-[20]">
        <img
          src="/assets/weather/cloudy_02.webp"
          alt="Nublado"
          className="absolute h-auto object-contain opacity-85"
          style={{
            animation: 'rainCloudLayer2 12s ease-in-out infinite',
            filter: isThunderstorm
              ? cloudFlash
                ? 'brightness(2.4) contrast(1.1) blur(1px)'
                : 'brightness(0.45) contrast(1.3) blur(1px)'
              : pop > 75
                ? 'brightness(0.75) contrast(1.1) blur(1px)'
                : 'brightness(1.1) contrast(0.9)',
            transition: cloudFlash ? 'none' : 'filter 0.1s ease-out',
            top: '-28%', left: '-43.5%', width: '187%', minWidth: '187%',
            marginLeft: '30px',
          }}
        />
      </div>
    </div>
  );
};
