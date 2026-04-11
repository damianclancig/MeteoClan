'use client';

import { useId, memo } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import type { OWMWeatherData } from '@/lib/types';
import { 
  getMoonPhaseName, 
  getMoonIllumination, 
  calculateMoonPhase,
  getUpcomingMajorPhases 
} from '@/lib/weather-utils';
import { MoonArc } from './moon-arc';


// ============================================================
// Componentes de iconos lunares
// ============================================================

const PhaseIcon = ({ phaseName, latitude }: { phaseName: string; latitude: number }) => {
  const isSouthernHemisphere = latitude < 0;
  let path;

  switch (phaseName) {
    case 'new_moon':
      path = <circle cx="12" cy="12" r="10" fill="black" stroke="currentColor" strokeWidth="0.5" />;
      break;
    case 'first_quarter':
      path = (
        <path
          d={isSouthernHemisphere ? 'M12 2 a 10 10 0 0 0 0 20 V2z' : 'M12 2 a 10 10 0 0 1 0 20 V2z'}
          fill="currentColor"
        />
      );
      break;
    case 'full_moon':
      path = <circle cx="12" cy="12" r="10" fill="currentColor" />;
      break;
    case 'third_quarter':
      path = (
        <path
          d={isSouthernHemisphere ? 'M12 2 a 10 10 0 0 1 0 20 V2z' : 'M12 2 a 10 10 0 0 0 0 20 V2z'}
          fill="currentColor"
        />
      );
      break;
    default:
      path = <circle cx="12" cy="12" r="10" fill="black" stroke="currentColor" strokeWidth="0.5" />;
  }

  return (
    <svg viewBox="0 0 24 24" className="w-8 h-8 text-foreground/80">
      {path}
    </svg>
  );
};

/**
 * Icono fotorrealista de la Luna que utiliza moon.webp y una máscara dinámica
 * para representar las fases con precisión.
 * @param phase - Valor de moon_phase de OWM (0 a 1).
 * @param latitude - Latitud para determinar la orientación (Norte vs Sur).
 * @param shadowOpacity - Opacidad de la sombra (0.9 por defecto para que se vea un poco el relieve).
 */
const CurrentMoonIcon = ({
  phase,
  latitude,
  shadowOpacity = 0.8
}: {
  phase: number;
  latitude: number;
  shadowOpacity?: number
}) => {
  const maskId = useId();
  const filterId = useId();
  const isSouthernHemisphere = latitude < 0;

  // Ajustar la fase para el hemisferio sur (la visualización es inversa)
  // En el norte, la luna crece de derecha a izquierda. 
  // En el sur, de izquierda a derecha.
  const normalizedPhase = phase;

  // Determinar el radio y centro del SVG (usamos 50 para un viewBox de 100)
  const r = 50;
  const c = 50;

  /**
   * Genera el path del terminador lunar.
   * La fase 0.5 es llena, 0 y 1 son nuevas.
   * Utilizamos una técnica de dos arcos para crear la elipse del terminador.
   */
  const getTerminatorPath = () => {
    const x = Math.cos(normalizedPhase * 2 * Math.PI) * r;
    const isWaxing = normalizedPhase <= 0.5;

    /**
     * La lógica de sweep para el terminador (Arc 1):
     * - Waxing (0-0.5): Si x > 0 (Crescent), abultar a la derecha (sweep 1).
     *                  Si x < 0 (Gibbous), abultar a la izquierda (sweep 0).
     * - Waning (0.5-1): Si x < 0 (Gibbous), abultar a la derecha (sweep 1).
     *                  Si x > 0 (Crescent), abultar a la izquierda (sweep 0).
     */
    const terminatorSweep = (x > 0) === isWaxing ? 1 : 0;

    /**
     * El segundo arco define el borde exterior de la Luna que permanece en sombra base.
     * - Para fases crecientes (Waxing), el lado izquierdo siempre es la referencia base de la sombra.
     * - Para fases decrecientes (Waning), el lado derecho es la referencia base.
     * Un sweep 1 de (50,100) a (50,0) va por la izquierda.
     * Un sweep 0 de (50,100) a (50,0) va por la derecha.
     */
    const baseSweep = isWaxing ? 1 : 0;

    return `M ${c} ${c - r} 
            A ${Math.abs(x)} ${r} 0 0 ${terminatorSweep} ${c} ${c + r} 
            A ${r} ${r} 0 0 ${baseSweep} ${c} ${c - r} Z`;
  };

  // En el hemisferio sur la luna se ve "invertida" respecto al norte
  const rotation = isSouthernHemisphere ? 'rotate(180deg)' : 'none';

  return (
    <div className="relative w-36 h-36 md:w-52 md:h-52 rounded-full overflow-hidden shadow-2xl ring-1 ring-white/10">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ transform: rotation }}
      >
        <defs>
          {/* Filtro para suavizar el terminador (blur) */}
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
          </filter>

          {/* Máscara que define la parte OSCURA (la sombra) */}
          <mask id={maskId}>
            <rect x="0" y="0" width="100" height="100" fill="black" />
            <path
              d={getTerminatorPath()}
              fill="white"
              filter={`url(#${filterId})`}
            />
          </mask>
        </defs>

        {/* 1. Imagen de la Luna Llena de fondo */}
        <image
          href="/assets/weather/moon.webp"
          x="0"
          y="0"
          width="100"
          height="100"
          preserveAspectRatio="xMidYMid slice"
        />

        {/* 2. Capa de sombra (Overlay negro) con máscara dinámica */}
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="black"
          fillOpacity={shadowOpacity}
          mask={`url(#${maskId})`}
        />
      </svg>
    </div>
  );
};

// ============================================================
// Props y componente principal
// ============================================================

interface MoonCalendarProps {
  date: Date;
  latitude: number;
  /** Array daily crudo de OWM para datos astronómicos precisos del día actual. */
  owmRawDaily?: OWMWeatherData['daily'];
  timezone?: string;
}

export const MoonCalendar = memo(function MoonCalendar({
  date,
  latitude,
  owmRawDaily,
  timezone,
}: MoonCalendarProps) {
  const { t, locale } = useTranslation();

  if (!date || isNaN(date.getTime())) return null;

  const upcomingPhases = getUpcomingMajorPhases(date);

  // Obtener datos astronómicos del día actual (índice 0 en daily de OWM)
  const owmToday = owmRawDaily?.[0];
  
  // Usar moon_phase de OWM (dato diario exacto de la API)
  const currentPhaseValue = owmToday?.moon_phase ?? calculateMoonPhase(date);
  const currentPhaseName = getMoonPhaseName(currentPhaseValue);
  const currentIllumination = getMoonIllumination(currentPhaseValue);

  // Timestamps de salida y puesta con detección de tipo (número vs string ISO)
  const parseOWMTime = (val: any) => {
    if (!val) return null;
    if (typeof val === 'number') return new Date(val * 1000).toISOString();
    return val; // Asumir que ya es ISO
  };

  const moonriseISO = parseOWMTime(owmToday?.moonrise);
  const moonsetISO = parseOWMTime(owmToday?.moonset);

  return (
    <div className="p-1">
      <h3 className="text-xl font-bold mb-4">{t('moonCalendarTitle')}</h3>

      {/* Fase lunar actual y Arco */}
      <div className="flex flex-col items-center gap-2 mb-4">
        <div className="flex flex-col items-center text-center gap-2">
          <CurrentMoonIcon phase={currentPhaseValue} latitude={latitude} />
          <p className="text-lg font-semibold capitalize">{t(`moon.${currentPhaseName}`)}</p>
          <p className="text-sm text-foreground/80">
            {t('illumination', { percent: currentIllumination })}
          </p>
        </div>

        {/* Arco de salida y puesta (Ciclo Lunar) */}
        {moonriseISO && moonsetISO && (
          <div className="w-full bg-white/5 p-3 rounded-lg mt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2 text-left">
              {t('moonCycle')}
            </h4>
            <MoonArc
              moonrise={moonriseISO}
              moonset={moonsetISO}
              timezone={timezone || 'UTC'}
            />
          </div>
        )}
      </div>

      {/* Próximas fases mayores (cálculo local, OWM no las provee) */}
      <div className="grid grid-cols-4 gap-2 text-center">
        {upcomingPhases.map(phase => (
          <div
            key={phase.name}
            className="flex flex-col items-center p-2 rounded-lg bg-white/5 gap-1"
          >
            <PhaseIcon phaseName={phase.name} latitude={latitude} />
            <p className="font-semibold capitalize text-xs">{t(`moon.${phase.name}`)}</p>
            <p className="text-xs text-foreground/80">
              {phase.date.toLocaleDateString(locale, {
                month: 'short',
                day: 'numeric',
                timeZone: 'UTC',
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
});
