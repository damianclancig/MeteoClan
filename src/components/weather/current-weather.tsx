'use client';

import { memo } from 'react';
import type { CurrentWeather as CurrentWeatherType, DailyForecast, HourlyForecast as HourlyForecastType } from '@/lib/types';
import type { Locale } from '@/lib/i18n';
import { useTranslation } from '@/hooks/use-translation';
import { isNightTime } from '@/lib/weather-utils';
import { AnimatedWeatherIcon } from '@/components/icons/animated-weather-icon';
import { HourlyForecast } from '@/components/weather/hourly-forecast';
import { Thermometer, Droplets, Wind, MapPin, Umbrella, History } from 'lucide-react';
import { SunriseSunset } from './sunrise-sunset';
import { DetailItem } from './detail-item';
import { WindArrow } from './wind-arrow';
import { RainEffect } from './RainEffect';

// This new type will hold the data for the main display card.
// It must include all properties needed by child components.
// We combine properties from CurrentWeather and DailyForecast.
type DisplayWeather = (CurrentWeatherType | DailyForecast) & { location: string; timezone: string, latitude: number };

interface CurrentWeatherProps {
  data: DisplayWeather;
  hourlyData: HourlyForecastType[];
  locale: Locale;
  lastUpdated: string;
}

const parseDateString = (dt: string | number) => {
  const dtStr = String(dt);
  // If it's just a date 'YYYY-MM-DD' (forecast days), force to noon UTC
  // to avoid timezone shifting issues when rendering the date.
  if (!dtStr.includes('T')) {
    return new Date(`${dtStr}T12:00:00Z`);
  }
  // For full ISO strings (current weather), parse as is.
  return new Date(dtStr);
}

export const CurrentWeather = memo(function CurrentWeather({ data, hourlyData, locale, lastUpdated }: CurrentWeatherProps) {
  const { t } = useTranslation();

  // MODO TEST (v3.01): Forzar soleado para probar sunny.webp
  const isSunnyTest = true;
  const currentCode = isSunnyTest ? 800 : data.weatherCode;
  const currentDesc = isSunnyTest ? 'clear_sky' : data.description;
  const currentPop = isSunnyTest ? 0 : data.pop;

  const weatherDescriptionKey = `weather.${currentDesc}`;
  const date = parseDateString(data.dt);
  const updatedDate = new Date(lastUpdated);

  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };

  const isForecastDay = typeof data.dt === 'string' && !data.dt.includes('T');

  if ('timezone' in data && data.timezone) {
    // For forecast days, we use the forced noon UTC approach to keep the day consistent
    dateOptions.timeZone = isForecastDay ? 'UTC' : data.timezone;
    timeOptions.timeZone = data.timezone;
  }

  // Get temp from CurrentWeather or DailyForecast
  const temp = 'temp' in data ? data.temp : 0;

  const hasSunData = 'sunrise' in data && data.sunrise && 'sunset' in data && data.sunset && 'timezone' in data;

  // This is the crucial check: Only determine night for *current* weather, not for future forecast days.
  // We identify current weather because its `dt` is a full ISO string (containing 'T').
  const isNight = typeof data.dt === 'string' && data.dt.includes('T') ? isNightTime(data.sunrise, data.sunset) : false;

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center md:items-start p-1 w-full">
        {/* Location (Left on Desktop) */}
        <div className="flex items-center gap-2 group">
          <MapPin className="w-5 h-5 text-foreground/80 group-hover:text-primary transition-colors" />
          <h2 className="text-xl md:text-2xl font-bold">{data.location}</h2>
        </div>

        {/* Updated Time (Right on Desktop) */}
        <div className="flex items-center gap-1.5 text-xs text-foreground/50 mt-1 md:mt-1.5 order-last md:order-none">
          <History className="w-3 h-3" />
          <span>{t('lastUpdated', { time: new Intl.DateTimeFormat(locale, timeOptions).format(updatedDate) })}</span>
        </div>
      </div>

      {/* Featured Centered Date */}
      <div className="w-full text-center mt-0 mb-2">
        <p className="text-xl md:text-xl text-foreground capitalize tracking-wide drop-shadow-sm">
          {new Intl.DateTimeFormat(locale, dateOptions).format(date)}
        </p>
      </div>

      {/* Temperature and Icon/Description */}
      <div className="flex flex-col items-center justify-center text-center">
        <p className="text-2xl capitalize">{t(weatherDescriptionKey)}</p>
        <div className="flex items-center justify-center gap-4">
          <div className='flex flex-col items-center'>
            <div className="text-5xl md:text-7xl font-bold">{Math.round(temp)}°C</div>
            <div className="text-base text-foreground/80 mt-1">
              {t('max')}: {Math.round(data.temp_max)}° / {t('min')}: {Math.round(data.temp_min)}°
            </div>
          </div>
          {((currentCode >= 500 && currentCode < 600) || 
            (currentCode >= 300 && currentCode < 400) || 
            [200, 201, 202, 230, 231, 232].includes(currentCode)) && 
            currentPop > 15 ? (
            <div className="w-24 h-24 md:w-32 md:h-32 relative overflow-hidden flex items-center justify-center rounded-2xl bg-white/5">
               <RainEffect pop={currentPop} className="w-full h-full" />
            </div>
          ) : currentCode === 800 ? (
            <div className="w-24 h-24 md:w-32 md:h-32 relative flex items-center justify-center">
              {/* Brillo ambiental suave para el sol v3.01 */}
              <div className="absolute inset-0 bg-yellow-400/20 blur-3xl animate-pulse rounded-full" />
              <img 
                src="/assets/weather/sunny.webp" 
                alt="Soleado" 
                className="w-full h-full object-contain drop-shadow-xl z-10"
                style={{ 
                  animation: 'spin 10s linear infinite',
                  transformOrigin: 'center'
                }}
              />
            </div>
          ) : (
            <AnimatedWeatherIcon
              code={currentCode}
              className="w-24 h-24 md:w-32 md:h-32"
              isNight={isNight}
              aria-label={t(weatherDescriptionKey)}
            />
          )}
        </div>
      </div>

      {/* Sunrise and Sunset */}
      {hasSunData && (
        <div className="my-2">
          <SunriseSunset
            sunrise={data.sunrise}
            sunset={data.sunset}
            timezone={data.timezone}
          />
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
        <DetailItem
          icon={Thermometer}
          label={t('feelsLike')}
          value={`${Math.round(data.feels_like)}°C`}
        />
        <DetailItem
          icon={Droplets}
          label={t('humidity')}
          value={`${data.humidity}%`}
        />
        <DetailItem
          icon={Wind}
          label={t('wind')}
          value={
            <div className="flex items-center gap-2">
              <span>{`${Math.round(data.wind_speed)} km/h`}</span>
              {data.wind_speed > 0 && <WindArrow degrees={data.wind_direction} locale={locale} />}
            </div>
          }
        />
        <DetailItem
          icon={Umbrella}
          label={t('precipitation')}
          value={`${Math.round(data.pop)}%`}
        />
      </div>

      {/* Hourly Forecast */}
      <div className="pb-4 pt-2">
        <HourlyForecast
          data={hourlyData}
          sunrise={hasSunData ? data.sunrise : undefined}
          sunset={hasSunData ? data.sunset : undefined}
          timezone={hasSunData ? data.timezone : undefined}
        />
      </div>
    </>
  );
});
