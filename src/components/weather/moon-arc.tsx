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

import { useEffect, useState } from 'react';
import { Moon, Sunrise, Sunset, Clock } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface MoonArcProps {
  moonrise: string; // ISO 8601 string
  moonset: string; // ISO 8601 string
  timezone: string; // IANA timezone string
  riseSuffix?: 'yesterday' | 'tomorrow' | 'other' | null;
  setSuffix?: 'yesterday' | 'tomorrow' | 'other' | null;
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
  if (!durationMs || isNaN(durationMs) || durationMs < 0) return '--h --m';
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};


export function MoonArc({ 
  moonrise: moonriseStr, 
  moonset: moonsetStr, 
  timezone,
  riseSuffix,
  setSuffix
}: MoonArcProps) {
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

      // Como el componente superior ahora empareja correctamente la salida con
      // su respectiva puesta (incluso si es al día siguiente), moonset SIEMPRE será > moonrise
      if (moonrise && moonset && moonset > moonrise) {
        if (now >= moonrise && now <= moonset) {
          setIsUp(true);
          const totalMoonlight = moonset - moonrise;
          const timeSinceRise = now - moonrise;
          setMoonPosition((timeSinceRise / totalMoonlight) * 100);
        } else {
          setIsUp(false);
          if (now > moonset) setMoonPosition(100);
          if (now < moonrise) setMoonPosition(0);
        }
      } else {
        setIsUp(false);
      }
    };

    calculateMoonPosition();
    const interval = setInterval(calculateMoonPosition, 60000);

    return () => clearInterval(interval);
  }, [moonrise, moonset]);

  // Duración visible real basada en los timestamps
  const duration = moonrise && moonset && moonset > moonrise ? moonset - moonrise : 0;


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
      <div className="w-full flex justify-between items-start mt-2 px-1">
        <div className="flex flex-col items-start gap-0.5">
          <div className="flex items-center gap-1 text-sm text-foreground/80">
            <span className="text-lg">🌕</span>
            <span className="font-medium">{formatTime(moonriseDate, timezone)}</span>
          </div>
          {riseSuffix && (
            <span className="text-[10px] uppercase tracking-wider text-foreground/50 ml-6">
              {t(riseSuffix)}
            </span>
          )}
        </div>

        <div className="flex flex-col items-center gap-1 text-sm text-foreground/60 pt-1">
          <Clock className="h-3.5 w-3.5" />
          <span className="text-[11px] font-medium">{formatDuration(duration)}</span>
        </div>

        <div className="flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-1 text-sm text-foreground/80">
            <span className="font-medium">{formatTime(moonsetDate, timezone)}</span>
            <span className="text-lg">🌑</span>
          </div>
          {setSuffix && (
            <span className="text-[10px] uppercase tracking-wider text-foreground/50 mr-6">
              {t(setSuffix)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
