'use client';

import { useEffect, useState } from 'react';
import { Moon, Sunrise, Sunset, Clock } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface MoonArcProps {
  moonrise: string; // ISO 8601 string
  moonset: string; // ISO 8601 string
  timezone: string; // IANA timezone string
}

const formatTime = (date: Date, timezone: string) => {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
    hour12: false,
  });
};

const formatDuration = (durationMs: number) => {
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

export function MoonArc({ moonrise: moonriseStr, moonset: moonsetStr, timezone }: MoonArcProps) {
  const { t } = useTranslation();
  const [moonPosition, setMoonPosition] = useState(0);
  const [isUp, setIsUp] = useState(false);

  // Convert ISO strings to Date objects
  const moonriseDate = new Date(moonriseStr);
  const moonsetDate = new Date(moonsetStr);

  // Get timestamps
  const moonrise = moonriseDate.getTime();
  const moonset = moonsetDate.getTime();

  useEffect(() => {
    const calculateMoonPosition = () => {
      const now = Date.now();

      // Caso 1: Salida antes que la puesta (Luna sale y se pone el mismo día)
      if (moonrise < moonset) {
        if (now >= moonrise && now <= moonset) {
          setIsUp(true);
          const totalMoonlight = moonset - moonrise;
          const timeSinceRise = now - moonrise;
          setMoonPosition((timeSinceRise / totalMoonlight) * 100);
        } else {
          setIsUp(false);
        }
      } 
      // Caso 2: Puesta antes que la salida (Luna salió ayer y se pone hoy, o sale hoy y se pone mañana)
      else {
        // Estamos en el intervalo entre la salida de hoy y la puesta de mañana (estimada)
        // O entre la salida de ayer y la puesta de hoy
        if (now >= moonrise || now <= moonset) {
          setIsUp(true);
          // Para simplificar el progreso en este caso de cruce de día, 
          // calculamos el progreso relativo al intervalo más cercano
          const dayMs = 24 * 60 * 60 * 1000;
          const totalInterval = moonrise > moonset ? (moonset + dayMs) - moonrise : moonset - moonrise;
          const elapsed = now < moonrise ? (now + dayMs) - moonrise : now - moonrise;
          setMoonPosition(Math.min((elapsed / totalInterval) * 100, 100));
        } else {
          setIsUp(false);
        }
      }
    };

    calculateMoonPosition();
    const interval = setInterval(calculateMoonPosition, 60000);

    return () => clearInterval(interval);
  }, [moonrise, moonset]);

  // Duración visible aproximada
  const duration = moonrise < moonset ? moonset - moonrise : (moonset + 24 * 60 * 60 * 1000) - moonrise;

  return (
    <div className="flex flex-col items-center w-full px-0 pt-1 pb-2">
      <div className="relative w-full h-8">
        {/* The dotted path */}
        <div className="absolute top-1/2 left-0 w-full border-t-2 border-dotted border-blue-300/30" />

        {/* Moon icon - Generic */}
        {isUp && (
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-linear"
            style={{ left: `calc(${moonPosition}% - 12px)` }}
          >
            <Moon className="h-6 w-6 text-blue-100 fill-blue-100/20" />
          </div>
        )}
      </div>

      {/* Moonrise and Moonset Times */}
      <div className="w-full flex justify-between items-center mt-2">
        <div className="flex items-center gap-1 text-sm text-foreground/80">
          <span className="text-lg">🌕</span>
          <span>{formatTime(moonriseDate, timezone)}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-foreground/80">
          <Clock className="h-4 w-4" />
          <span>{formatDuration(duration)}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-foreground/80">
          <span className="text-lg">🌑</span>
          <span>{formatTime(moonsetDate, timezone)}</span>
        </div>
      </div>
    </div>
  );
}
