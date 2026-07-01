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

import { memo } from 'react';
import type { DailyForecast } from '@/lib/types';
import { useTranslation } from '@/hooks/use-translation';
import { AnimatedWeatherIcon } from '@/components/icons/animated-weather-icon';
import { Umbrella } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ForecastProps {
  data: DailyForecast[];
  onDaySelect: (day: DailyForecast) => void;
  onShowToday: () => void;
  selectedDayId: string | null;
}

const getDayInfo = (dateString: string, locale: string) => {
  // 'T12:00:00Z' fuerza UTC y evita que el cambio de zona horaria altere el día
  const date = new Date(`${dateString}T12:00:00Z`);
  const dayName = date.toLocaleDateString(locale, { weekday: 'long', timeZone: 'UTC' });
  const dayNumber = date.getUTCDate();
  return { dayName, dayNumber };
};

export const Forecast = memo(function Forecast({
  data,
  onDaySelect,
  onShowToday,
  selectedDayId,
}: ForecastProps) {
  const { t, locale } = useTranslation();

  if (!data || data.length === 0) {
    return (
      <>
        <h3 className="text-xl font-bold mb-4">{t('forecastTitle')}</h3>
        <p>{t('loading')}</p>
      </>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">{t('forecastTitle')}</h3>
        <Button
          variant="ghost"
          onClick={onShowToday}
          className={cn(selectedDayId === 'today' && 'bg-white/10')}
        >
          {t('today')}
        </Button>
      </div>
      {/* grid-cols-4 en móvil, grid-cols-8 en desktop para mostrar los 8 días */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 w-full">
        {data.map((day, index) => {
          const { dayName, dayNumber } = getDayInfo(day.dt, locale);
          const isSelected = selectedDayId === day.dt;
          return (
            <button
              key={index}
              onClick={() => onDaySelect(day)}
              className={cn(
                'flex flex-col items-center w-full p-2 sm:p-3 rounded-lg bg-white/5 gap-2 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-ring',
                isSelected && 'bg-white/20'
              )}
            >
              {/* Layout: Siempre Vertical a nivel de Card (Día arriba), pero el contenido interno varía */}
              <div className="flex flex-col items-center w-full">
                {/* Día: Arriba y centrado */}
                <p className="font-semibold text-foreground/80 capitalize text-xs w-full text-center tracking-tight mb-2">
                  {dayName} {dayNumber}
                </p>

                {/* Contenedor Final: Horizontal en movil/tablet (grid-cols-2), Vertical en escritorio (grid-cols-1) */}
                <div className="grid grid-cols-2 lg:grid-cols-1 w-full gap-1 mt-2 items-center justify-items-center">
                  {/* Fila 1 (Desktop) / Col 1 (Mobile): Icono */}
                  <div className="flex justify-center items-center w-full">
                    <AnimatedWeatherIcon code={day.weatherCode} className="w-10 h-10 sm:w-11 lg:w-10 lg:h-10" />
                  </div>

                  {/* Fila 2 (Desktop) / Col 2 (Mobile): Datos */}
                  <div className="flex flex-col items-center justify-center w-full lg:mt-1">
                    {/* Temperaturas: SIEMPRE horizontales (lado a lado) */}
                    <div className="flex flex-row items-center gap-1.5 sm:gap-2">
                      <p className="font-bold text-sm sm:text-base lg:text-base leading-tight">
                        {Math.round(day.temp_max)}°
                      </p>
                      <p className="text-foreground/70 text-xs sm:text-sm lg:text-sm leading-tight">
                        {Math.round(day.temp_min)}°
                      </p>
                    </div>
                    
                    {/* Precipitación (Siempre abajo) */}
                    <div className="flex items-center gap-1 text-foreground/60 mt-1 lg:mt-0.5">
                      <Umbrella className="w-2.5 h-2.5 sm:w-3 lg:w-2.5 lg:h-2.5" />
                      <span className="text-[10px] sm:text-xs lg:text-[11px] font-medium leading-none">
                        {Math.round(day.pop)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
});
