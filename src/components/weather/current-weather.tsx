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
import { SunnyIcon } from './icons/SunnyIcon';
import { PartlyCloudyIcon } from './icons/PartlyCloudyIcon';
import { OvercastIcon } from './icons/OvercastIcon';
import { RainyIcon } from './icons/RainyIcon';
import { WeatherIconResolver } from '@/components/weather-icons/WeatherIconResolver';

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
  const [forceNight, setForceNight] = useState<boolean>(false);

  const TEST_OPTIONS = [
    { value: 'real', label: '--- Datos Reales ---', code: data.weatherCode, desc: data.description, pop: data.pop },
    
    // Grupo 2xx: Tormentas
    { value: '200', label: '200: Tormenta c/ lluvia ligera', code: 200, desc: 'thunderstorm_light_rain', pop: 80 },
    { value: '201', label: '201: Tormenta c/ lluvia', code: 201, desc: 'thunderstorm_rain', pop: 90 },
    { value: '202', label: '202: Tormenta c/ lluvia pesada', code: 202, desc: 'thunderstorm_heavy_rain', pop: 100 },
    { value: '210', label: '210: Tormenta ligera', code: 210, desc: 'light_thunderstorm', pop: 80 },
    { value: '211', label: '211: Tormenta', code: 211, desc: 'thunderstorm', pop: 90 },
    { value: '212', label: '212: Tormenta fuerte', code: 212, desc: 'heavy_thunderstorm', pop: 100 },
    { value: '221', label: '221: Tormenta irregular', code: 221, desc: 'ragged_thunderstorm', pop: 80 },
    { value: '230', label: '230: Tormenta c/ llovizna lig.', code: 230, desc: 'thunderstorm_light_drizzle', pop: 80 },
    { value: '231', label: '231: Tormenta c/ llovizna', code: 231, desc: 'thunderstorm_drizzle', pop: 90 },
    { value: '232', label: '232: Tormenta c/ llovizna fuerte', code: 232, desc: 'thunderstorm_heavy_drizzle', pop: 100 },

    // Grupo 3xx: Llovizna
    { value: '300', label: '300: Llovizna baja int.', code: 300, desc: 'drizzle_light_intensity', pop: 25 },
    { value: '301', label: '301: Llovizna', code: 301, desc: 'drizzle', pop: 40 },
    { value: '302', label: '302: Llovizna intensa', code: 302, desc: 'drizzle_heavy_intensity', pop: 60 },
    { value: '310', label: '310: Lluvia/llovizna lig.', code: 310, desc: 'drizzle_light_rain', pop: 35 },
    { value: '311', label: '311: Lluvia/llovizna', code: 311, desc: 'drizzle_rain', pop: 50 },
    { value: '312', label: '312: Lluvia/llovizna int.', code: 312, desc: 'drizzle_heavy_rain', pop: 70 },
    { value: '313', label: '313: Chubascos y llovizna', code: 313, desc: 'drizzle_shower_rain', pop: 60 },
    { value: '314', label: '314: Chubascos/llovizna fuertes', code: 314, desc: 'drizzle_heavy_shower_rain', pop: 80 },
    { value: '321', label: '321: Chubasco de llovizna', code: 321, desc: 'drizzle_shower', pop: 50 },

    // Grupo 5xx: Lluvia
    { value: '500', label: '500: Lluvia ligera', code: 500, desc: 'rain_light_intensity', pop: 30 },
    { value: '501', label: '501: Lluvia moderada', code: 501, desc: 'rain_moderate_intensity', pop: 60 },
    { value: '502', label: '502: Lluvia intensa', code: 502, desc: 'rain_heavy_intensity', pop: 80 },
    { value: '503', label: '503: Lluvia muy fuerte', code: 503, desc: 'rain_very_heavy_intensity', pop: 95 },
    { value: '504', label: '504: Lluvia extrema', code: 504, desc: 'rain_extreme_intensity', pop: 100 },
    { value: '511', label: '511: Lluvia gélida', code: 511, desc: 'rain_freezing', pop: 50 },
    { value: '520', label: '520: Chubasco ligero', code: 520, desc: 'rain_shower_light_intensity', pop: 40 },
    { value: '521', label: '521: Chubasco', code: 521, desc: 'rain_shower_moderate_intensity', pop: 70 },
    { value: '522', label: '522: Chubasco intenso', code: 522, desc: 'rain_shower_heavy_intensity', pop: 90 },
    { value: '531', label: '531: Chubasco irregular', code: 531, desc: 'rain_shower_ragged', pop: 75 },

    // Grupo 6xx: Nieve
    { value: '600', label: '600: Nieve ligera', code: 600, desc: 'snow_light', pop: 30 },
    { value: '601', label: '601: Nieve', code: 601, desc: 'snow', pop: 60 },
    { value: '602', label: '602: Nieve intensa', code: 602, desc: 'snow_heavy', pop: 90 },
    { value: '611', label: '611: Aguanieve', code: 611, desc: 'snow_sleet', pop: 50 },
    { value: '612', label: '612: Chubasco aguanieve lig.', code: 612, desc: 'snow_shower_sleet_light', pop: 40 },
    { value: '613', label: '613: Chubasco aguanieve', code: 613, desc: 'snow_shower_sleet', pop: 70 },
    { value: '615', label: '615: Lluvia y nieve lig.', code: 615, desc: 'snow_light_rain_and', pop: 45 },
    { value: '616', label: '616: Lluvia y nieve', code: 616, desc: 'snow_rain_and', pop: 75 },
    { value: '620', label: '620: Chubasco nieve lig.', code: 620, desc: 'snow_shower_light', pop: 35 },
    { value: '621', label: '621: Chubasco nieve', code: 621, desc: 'snow_shower', pop: 65 },
    { value: '622', label: '622: Chubasco nieve int.', code: 622, desc: 'snow_shower_heavy', pop: 95 },

    // Grupo 7xx: Atmósfera
    { value: '701', label: '701: Neblina', code: 701, desc: 'mist', pop: 0 },
    { value: '711', label: '711: Humo', code: 711, desc: 'smoke', pop: 0 },
    { value: '721', label: '721: Bruma', code: 721, desc: 'haze', pop: 0 },
    { value: '731', label: '731: Remolinos arena/polvo', code: 731, desc: 'sand_dust_whirls', pop: 0 },
    { value: '741', label: '741: Niebla', code: 741, desc: 'fog', pop: 0 },
    { value: '751', label: '751: Arena', code: 751, desc: 'sand', pop: 0 },
    { value: '761', label: '761: Polvo', code: 761, desc: 'dust', pop: 0 },
    { value: '762', label: '762: Ceniza volcánica', code: 762, desc: 'volcanic_ash', pop: 0 },
    { value: '771', label: '771: Turbonadas', code: 771, desc: 'squalls', pop: 80 },
    { value: '781', label: '781: Tornado', code: 781, desc: 'tornado', pop: 100 },

    // Grupo 800: Cielo despejado
    { value: '800', label: '800: Cielo despejado', code: 800, desc: 'clear_sky', pop: 0 },

    // Grupo 80x: Nubes
    { value: '801', label: '801: Algo de nubes', code: 801, desc: 'clouds_few', pop: 0 },
    { value: '802', label: '802: Nubes dispersas', code: 802, desc: 'clouds_scattered', pop: 0 },
    { value: '803', label: '803: Nublado parcial', code: 803, desc: 'clouds_broken', pop: 0 },
    { value: '804', label: '804: Mayormente nublado', code: 804, desc: 'clouds_overcast', pop: 0 },
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

  const showTestSelector = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';

  return (
    <>
      {showTestSelector && (
        <div className="absolute top-2 right-2 z-[100] flex items-center gap-2">
          {/* Switch Día/Noche para Pruebas */}
          <button
            onClick={() => setForceNight(!forceNight)}
            className="bg-background border border-border text-lg rounded px-2 py-0.5 opacity-40 hover:opacity-100 transition-all active:scale-90"
            title="Alternar Día/Noche (Modo Test)"
          >
            {forceNight ? '🌙' : '☀️'}
          </button>
          <select
            value={testWeather}
            onChange={(e) => setTestWeather(e.target.value)}
            className="bg-background text-foreground border border-border text-xs rounded px-1 py-1 opacity-30 hover:opacity-100 transition-opacity cursor-pointer outline-none"
          >
            {TEST_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

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
        </div>
        <div className="flex items-center justify-center gap-4">
          <div className='flex flex-col items-center'>
            <div className="text-5xl md:text-7xl font-bold">{Math.round(temp)}°C</div>
            <div className="text-base text-foreground/80 mt-1">
              {t('max')}: {Math.round(data.temp_max)}° / {t('min')}: {Math.round(data.temp_min)}°
            </div>
          </div>
          {((currentCode >= 200 && currentCode < 700) || (currentCode >= 700 && currentCode < 800)) ? (
            <WeatherIconResolver
              weatherId={currentCode}
              pop={currentPop}
              className="w-24 h-24 md:w-32 md:h-32 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              iconCode={testWeather !== 'real' ? (forceNight ? '01n' : '01d') : data.weatherIcon}
            />
          ) : currentCode === 800 ? (
            <SunnyIcon 
              className="w-24 h-24 md:w-32 md:h-32" 
              iconCode={testWeather !== 'real' ? (forceNight ? '01n' : '01d') : data.weatherIcon}
            />
          ) : [801, 802, 803].includes(currentCode) ? (
            <PartlyCloudyIcon 
              weatherId={currentCode} 
              className="w-24 h-24 md:w-32 md:h-32" 
              iconCode={testWeather !== 'real' ? (forceNight ? '01n' : '01d') : data.weatherIcon}
            />
          ) : currentCode === 804 ? (
            <OvercastIcon className="w-24 h-24 md:w-32 md:h-32" />
          ) : (
            <AnimatedWeatherIcon
              code={currentCode}
              className="w-24 h-24 md:w-32 md:h-32"
              isNight={testWeather !== 'real' ? forceNight : isNight}
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
