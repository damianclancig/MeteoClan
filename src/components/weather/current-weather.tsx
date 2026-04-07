'use client';

import { memo, useState } from 'react';
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
import { SunnyIcon } from './icons/SunnyIcon';
import { PartlyCloudyIcon } from './icons/PartlyCloudyIcon';
import { OvercastIcon } from './icons/OvercastIcon';
import { RainyIcon } from './icons/RainyIcon';

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

  // MODO TEST (v4.05): Selector manual de climas para probar iconos
  const [testWeather, setTestWeather] = useState<string>('real');

  const TEST_OPTIONS = [
    { value: 'real', label: '--- Datos Reales ---', code: data.weatherCode, desc: data.description, pop: data.pop },
    { value: '800', label: 'Soleado (Sunny)', code: 800, desc: 'clear_sky', pop: 0 },
    { value: '802', label: 'Parcialmente Nublado', code: 802, desc: 'clouds_scattered', pop: 0 },
    { value: '804', label: 'Totalmente Nublado', code: 804, desc: 'clouds_overcast', pop: 0 },
    { value: '500', label: 'Lluvia Ligera (16%)', code: 500, desc: 'rain_light', pop: 16 },
    { value: '501', label: 'Lluvia Moderada (50%)', code: 501, desc: 'rain_moderate', pop: 50 },
    { value: '502', label: 'Lluvia Fuerte (80%)', code: 502, desc: 'rain_heavy', pop: 80 },
    { value: '200', label: 'Tormenta Eléctrica', code: 200, desc: 'thunderstorm', pop: 95 },
    { value: '600', label: 'Nieve', code: 600, desc: 'snow', pop: 0 },
    { value: '741', label: 'Niebla', code: 741, desc: 'fog', pop: 0 },
  ];

  const currentOption = TEST_OPTIONS.find(o => o.value === testWeather) || TEST_OPTIONS[0];
  const currentCode = currentOption.code;
  const currentDesc = currentOption.desc;
  const currentPop = currentOption.pop;

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
        <div className="flex items-center gap-3">
          <p className="text-2xl capitalize font-bold">
            <span className={testWeather !== 'real' ? 'text-yellow-400 drop-shadow-sm' : ''}>
              {t(weatherDescriptionKey)}
            </span>
          </p>
          <select 
            value={testWeather}
            onChange={(e) => setTestWeather(e.target.value)}
            className="bg-black/40 border border-white/30 rounded-lg px-2 py-1 text-xs font-bold outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all cursor-pointer backdrop-blur-xl text-white shadow-xl hover:bg-black/60"
          >
            {TEST_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
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
            <RainyIcon 
              pop={currentPop} 
              className="w-24 h-24 md:w-32 md:h-32" 
              isThunderstorm={currentCode >= 200 && currentCode < 300} 
            />
          ) : currentCode === 800 ? (
            <SunnyIcon className="w-24 h-24 md:w-32 md:h-32" />
          ) : [801, 802, 803].includes(currentCode) ? (
            <PartlyCloudyIcon className="w-24 h-24 md:w-32 md:h-32" />
          ) : currentCode === 804 ? (
            <OvercastIcon className="w-24 h-24 md:w-32 md:h-32" />
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
