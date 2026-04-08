'use client';

import { useId, memo } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import type { OWMWeatherData } from '@/lib/types';
import { getMoonPhaseName, getMoonIllumination } from '@/lib/weather-utils';
import { MoonArc } from './moon-arc';

// ============================================================
// Constantes para cálculo de próximas fases mayores (local)
// ============================================================

/** Duración del mes sinódico en días */
const SYNODIC_MONTH = 29.530588853;
/** Número de día juliano de una Luna Nueva conocida (6 Ene 2000) */
const KNOWN_NEW_MOON_JD = 2451549.5;
const MAJOR_PHASES = ['new_moon', 'first_quarter', 'full_moon', 'third_quarter'];

// ============================================================
// Utilidades de fecha
// ============================================================

function toJulian(date: Date): number {
  if (!date || isNaN(date.getTime())) return 0;
  const time = date.getTime();
  const tzoffset = date.getTimezoneOffset() * 60000;
  return (time - tzoffset) / 86400000 + 2440587.5;
}

function fromJulian(jd: number): Date {
  if (jd === 0) return new Date();
  return new Date((jd - 2440587.5) * 86400000);
}

// ============================================================
// Cálculo de próximas fases mayores (se mantiene local)
// ============================================================

function getUpcomingMajorPhases(currentDate: Date): { name: string; date: Date }[] {
  if (!currentDate || isNaN(currentDate.getTime())) return [];

  const currentJD = toJulian(currentDate);
  const cycles = (currentJD - KNOWN_NEW_MOON_JD) / SYNODIC_MONTH;
  const currentCycle = Math.floor(cycles);
  const results: { name: string; date: Date }[] = [];

  for (let cycle = 0; cycle < 3 && results.length < 4; cycle++) {
    for (let i = 0; i < MAJOR_PHASES.length; i++) {
      const phaseOffset = i * 0.25;
      const phaseJD =
        KNOWN_NEW_MOON_JD + (currentCycle + cycle + phaseOffset) * SYNODIC_MONTH;

      if (phaseJD >= currentJD) {
        const phaseName = MAJOR_PHASES[i];
        if (!results.some(p => p.name === phaseName)) {
          results.push({ name: phaseName, date: fromJulian(phaseJD) });
        }
      }
    }
  }

  return results.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 4);
}

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
    // Mapeamos phase 0-1 a un valor de -1 a 1 para el ancho de la elipse del terminador
    // 0 -> 1 (sombra completa derecha), 0.25 -> 0 (media luna), 0.5 -> -1 (luna llena), etc.
    const sweep = normalizedPhase <= 0.5 ? 0 : 1;
    const x = Math.cos(normalizedPhase * 2 * Math.PI) * r;
    
    // El terminador es una elipse que une el polo norte (c, c-r) con el sur (c, c+r)
    // El parámetro 'x' define el radio horizontal de esa elipse.
    return `M ${c} ${c - r} 
            A ${Math.abs(x)} ${r} 0 0 ${sweep} ${c} ${c + r} 
            A ${r} ${r} 0 0 ${1 - sweep} ${c} ${c - r} Z`;
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

  // Usar moon_phase de OWM si está disponible (más preciso que el cálculo local)
  const owmToday = owmRawDaily?.[0];
  const currentPhaseValue = owmToday?.moon_phase ?? 0;
  const currentPhaseName = getMoonPhaseName(currentPhaseValue);
  const currentIllumination = getMoonIllumination(currentPhaseValue);

  // Moonrise / moonset del día actual desde OWM (en segundos UNIX)
  const moonriseISO = owmToday?.moonrise ? new Date(owmToday.moonrise * 1000).toISOString() : null;
  const moonsetISO = owmToday?.moonset ? new Date(owmToday.moonset * 1000).toISOString() : null;

  const formatMoonTime = (isoString: string | null): string | null => {
    if (!isoString) return null;
    return new Date(isoString).toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const moonriseTime = formatMoonTime(moonriseISO);
  const moonsetTime = formatMoonTime(moonsetISO);

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

        {/* Arco de salida y puesta con icono genérico */}
        {moonriseISO && moonsetISO && timezone && (
          <div className="w-full bg-white/5 p-3 rounded-lg">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2 text-left">
              {t('moonCycle')}
            </h4>
            <MoonArc
              moonrise={moonriseISO}
              moonset={moonsetISO}
              timezone={timezone}
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
