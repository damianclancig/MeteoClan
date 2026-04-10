'use client';

import { memo, useState, useEffect } from 'react';
import { 
  MapPin, 
  History, 
  Droplets, 
  Wind, 
  Eye, 
  Gauge, 
  Thermometer,
  Cloud,
  Umbrella,
  Sun
} from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { 
  CurrentWeather as CurrentWeatherType, 
  HourlyForecast as HourlyForecastType 
} from '@/lib/types';
import { Locale } from '@/lib/i18n';
import { SunriseSunset } from '@/components/weather/sunrise-sunset';
import { HourlyForecast } from '@/components/weather/hourly-forecast';
import { DetailItem } from '@/components/weather/detail-item';
import { WeatherIconResolver } from '@/components/weather-icons/WeatherIconResolver';
import { SunnyIcon } from '@/components/weather/icons/SunnyIcon';
import { PartlyCloudyIcon } from '@/components/weather/icons/PartlyCloudyIcon';
import { OvercastIcon } from '@/components/weather/icons/OvercastIcon';
import { AnimatedWeatherIcon } from '@/components/icons/animated-weather-icon';
import { getWeatherKeyFromOwmId } from '@/lib/weather-codes';

interface CurrentWeatherProps {
  data: CurrentWeatherType;
  hourlyData: HourlyForecastType[];
  locale: Locale;
  lastUpdated: string;
  testMode?: {
    weather: string;
    astro: 'auto' | 'day' | 'night';
  };
}

const parseDateString = (dt: string | number) => {
  const dtStr = String(dt);
  if (!dtStr.includes('T')) {
    return new Date(`${dtStr}T12:00:00Z`);
  }
  return new Date(dtStr);
}

const DetailsGrid = ({ data, t }: { data: CurrentWeatherType; t: any }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
    <DetailItem 
      icon={Droplets} 
      label={t('humidity')} 
      value={`${data.humidity}%`} 
    />
    <DetailItem 
      icon={Wind} 
      label={t('wind')} 
      value={`${data.wind_speed} km/h`} 
    />
    <DetailItem 
      icon={Eye} 
      label={t('visibility')} 
      value={`${data.visibility / 1000} km`} 
    />
    <DetailItem 
      icon={Gauge} 
      label={t('pressure')} 
      value={`${data.pressure} hPa`} 
    />
    <DetailItem 
      icon={Thermometer} 
      label={t('feelsLike')} 
      value={`${Math.round(data.feels_like)}°C`} 
    />
    <DetailItem 
      icon={Cloud} 
      label={t('clouds')} 
      value={`${data.clouds}%`} 
    />
    <DetailItem 
      icon={Umbrella} 
      label={t('precipitation')} 
      value={`${Math.round(data.pop)}%`} 
    />
    <DetailItem 
      icon={Sun} 
      label={t('uvi')} 
      value={data.uvi.toFixed(1)} 
    />
  </div>
);

export const CurrentWeather = memo(function CurrentWeather({ 
  data, 
  hourlyData, 
  locale, 
  lastUpdated,
  testMode = { weather: 'real', astro: 'auto' }
}: CurrentWeatherProps) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  
  // Determinar si estamos mostrando un día de pronóstico seleccionado o el clima actual real
  // Si data.dt es un string sin 'T', es un día de pronóstico (YYYY-MM-DD)
  const displayDataIsForecast = typeof data.dt === 'string' && !data.dt.includes('T');


  useEffect(() => {
    setMounted(true);
  }, []);

  const currentCode = testMode.weather === 'real' ? data.weatherCode : parseInt(testMode.weather);
  const currentPop = testMode.weather === 'real' ? data.pop : 0;
  
  const isNight = testMode.astro === 'auto' 
    ? data.weatherIcon?.endsWith('n') 
    : testMode.astro === 'night';

  const weatherDescriptionKey = testMode.weather === 'real' ? data.description : getWeatherKeyFromOwmId(currentCode);

  const currentIconCode = testMode.weather === 'real' 
    ? data.weatherIcon 
    : `${currentCode >= 800 ? '01' : '09'}${isNight ? 'n' : 'd'}`;

  const isForecastDay = (typeof data.dt === 'string' && !data.dt.includes('T')) || displayDataIsForecast;
  const date = isForecastDay ? parseDateString(data.dt) : new Date();
  const updatedDate = new Date(lastUpdated);

  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };

  if ('timezone' in data && data.timezone) {
    dateOptions.timeZone = isForecastDay ? 'UTC' : data.timezone;
    timeOptions.timeZone = data.timezone;
  }


  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-start w-full">
        <div className="flex items-center gap-2 group">
          <MapPin className="w-5 h-5 text-foreground/80 group-hover:text-primary transition-colors" />
          <h2 className="text-xl md:text-2xl font-bold">{data.location}</h2>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-foreground/50 mt-1 md:mt-1.5 order-last md:order-none h-4">
          {mounted && (
            <>
              <History className="w-3 h-3" />
              <span>{t('lastUpdated', { time: new Intl.DateTimeFormat(locale, timeOptions).format(updatedDate) })}</span>
            </>
          )}
        </div>
      </div>

      <div className="w-full text-center mt-0 mb-1">
        <p className="text-xl md:text-xl text-foreground/80 capitalize tracking-wide drop-shadow-sm">
          {new Intl.DateTimeFormat(locale, dateOptions).format(date)}
        </p>
      </div>

      <div className="w-full text-center mb-1">
        <p className="text-2xl md:text-3xl font-black text-white drop-shadow-md capitalize tracking-tight leading-none">
          {t(`weather.${weatherDescriptionKey}`)}
        </p>
      </div>

      <div className="grid grid-cols-2 w-full items-center py-4 relative isolate">
        <div className="flex flex-col items-end pr-4 md:pr-8 z-10 min-w-0">
          <div className="text-6xl md:text-8xl font-bold tracking-tighter drop-shadow-md leading-none">
            {Math.round(data.temp)}°C
          </div>
          <div className="text-xs md:text-sm text-foreground/70 font-medium mt-2 text-right">
            {t('max')}: {Math.round(data.temp_max)}° / {t('min')}: {Math.round(data.temp_min)}°
          </div>
        </div>

        <div className="flex flex-col items-start pl-4 md:pl-8 relative min-w-0">
          <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center z-20 pointer-events-none">
            {((currentCode >= 200 && currentCode < 700) || (currentCode >= 700 && currentCode < 800)) ? (
              <WeatherIconResolver
                weatherId={currentCode}
                pop={currentPop}
                className="w-full h-full drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                iconCode={currentIconCode}
              />
            ) : currentCode === 800 ? (
              <SunnyIcon 
                className="w-full h-full" 
                iconCode={currentIconCode}
              />
            ) : [801, 802, 803].includes(currentCode) ? (
              <PartlyCloudyIcon 
                weatherId={currentCode} 
                className="w-full h-full" 
                iconCode={currentIconCode}
              />
            ) : currentCode === 804 ? (
              <OvercastIcon className="w-full h-full" />
            ) : (
              <AnimatedWeatherIcon
                code={currentCode}
                className="w-full h-full"
                isNight={isNight}
                aria-label={t(`weather.${weatherDescriptionKey}`)}
              />
            )}
          </div>
          
        </div>
      </div>

      {'sunrise' in data && 'sunset' in data && (
        <SunriseSunset 
          sunrise={data.sunrise as any} 
          sunset={data.sunset as any} 
          timezone={data.timezone as any} 
        />
      )}
      
      {hourlyData && hourlyData.length > 0 && (
        <div className="w-full mt-4">
          <HourlyForecast 
            data={hourlyData} 
            sunrise={data.sunrise} 
            sunset={data.sunset} 
            timezone={data.timezone} 
          />
        </div>
      )}

      <DetailsGrid data={data} t={t} />
    </div>
  );
});
