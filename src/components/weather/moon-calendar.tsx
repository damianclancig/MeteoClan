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

const PhaseIcon = ({ phaseName }: { phaseName: string; latitude: number }) => {
  switch (phaseName) {
    case 'new_moon':
      return <span className="text-2xl leading-none">🌑</span>;
    case 'first_quarter':
      return <span className="text-2xl leading-none">🌓</span>;
    case 'full_moon':
      return <span className="text-2xl leading-none font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">🌕</span>;
    case 'third_quarter':
      return <span className="text-2xl leading-none">🌗</span>;
    default:
      return <span className="text-2xl leading-none">🌑</span>;
  }
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

  // Encontrar la entrada diaria de OWM que corresponde al día REAL de hoy (sistema)
  const systemNow = new Date();
  const todayDateStr = systemNow.toISOString().split('T')[0];
  
  // Buscar en owmRawDaily la entrada que coincida con hoy (basado en su dt convertido a YYYY-MM-DD)
  const todayOwmEntry = owmRawDaily?.find(day => {
    const dayDate = new Date(day.dt * 1000);
    return dayDate.toISOString().split('T')[0] === todayDateStr;
  }) || owmRawDaily?.[0];

  const currentPhaseValue = todayOwmEntry?.moon_phase ?? 0;
  const currentPhaseName = getMoonPhaseName(currentPhaseValue);
  const currentIllumination = getMoonIllumination(currentPhaseValue);


  // Lógica refinada para encontrar el arco de salida/puesta más relevante
  const getRelevantAstro = (): { 
    riseISO: string | null; 
    setISO: string | null; 
    riseSuffix: 'yesterday' | 'tomorrow' | 'other' | null; 
    setSuffix: 'yesterday' | 'tomorrow' | 'other' | null; 
  } => {
    if (!owmRawDaily || owmRawDaily.length < 1) return { riseISO: null, setISO: null, riseSuffix: null, setSuffix: null };

    const now = date.getTime();
    
    // Recolectamos todos los eventos de la semana para tener un pool completo y resistente a data vieja
    const events: { type: 'rise' | 'set', ts: number, day: number }[] = [];
    owmRawDaily.forEach((day, i) => {
      if (day.moonrise) events.push({ type: 'rise', ts: day.moonrise * 1000, day: i });
      if (day.moonset) events.push({ type: 'set', ts: day.moonset * 1000, day: i });
    });


    // Ordenamos por tiempo cronológico real
    events.sort((a, b) => a.ts - b.ts);

    // Buscamos el arco actual o el próximo
    // Un arco es un par (rise, set) consecutivo donde rise < set
    for (let i = 0; i < events.length - 1; i++) {
      const current = events[i];
      const next = events[i + 1];

      if (current.type === 'rise' && next.type === 'set') {
        const isCurrent = now >= current.ts && now <= next.ts;
        const isUpcoming = now < current.ts;

        if (isCurrent || isUpcoming) {
          // Determinar sufijos basados en la diferencia de días calendario reales con 'now'
          const getDaySuffix = (ts: number): 'yesterday' | 'tomorrow' | 'other' | null => {
            const eventDate = new Date(ts);
            const nowDate = new Date(now);
            
            // Reset hours to compare only days
            const d1 = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
            const d2 = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
            
            const diffDays = Math.round((d1.getTime() - d2.getTime()) / (24 * 3600 * 1000));
            
            if (diffDays === 0) return null;
            if (diffDays === 1) return 'tomorrow';
            if (diffDays === -1) return 'yesterday';
            return 'other';
          };

          return {
            riseISO: new Date(current.ts).toISOString(),
            setISO: new Date(next.ts).toISOString(),
            riseSuffix: getDaySuffix(current.ts),
            setSuffix: getDaySuffix(next.ts)
          };
        }
      }
    }

    // Fallback: Si no estamos en ningún arco, mostrar el primero disponible (futuro)
    const firstRise = events.find(e => e.type === 'rise' && e.ts > now);
    const firstSetAfterRise = firstRise ? events.find(e => e.type === 'set' && e.ts > firstRise.ts) : null;

    if (firstRise && firstSetAfterRise) {
      const eventDate = new Date(firstRise.ts);
      const nowDate = new Date(now);
      const diffDays = Math.round((new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate()).getTime() - 
                                  new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate()).getTime()) / (24 * 3600 * 1000));

      return {
        riseISO: new Date(firstRise.ts).toISOString(),
        setISO: new Date(firstSetAfterRise.ts).toISOString(),
        riseSuffix: diffDays === 1 ? 'tomorrow' : (diffDays === 0 ? null : 'other'),
        setSuffix: 'other' // Probablemente sea el día siguiente o más
      };
    }


    return { riseISO: null, setISO: null, riseSuffix: null, setSuffix: null };
  };

  const { riseISO: moonriseISO, setISO: moonsetISO, riseSuffix, setSuffix } = getRelevantAstro();

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
              riseSuffix={riseSuffix}
              setSuffix={setSuffix}
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
