

import type {
  WeatherData,
  DailyForecast,
  HourlyForecast,
  OWMWeatherData,
  CurrentWeather,
} from '@/lib/types';
import { getWeatherKeyFromOwmId, getMainCategoryFromOwmId } from '@/lib/weather-codes';

// ============================================================
// Helpers de conversión de timestamps UNIX
// ============================================================

/**
 * Convierte un timestamp UNIX (segundos) a un string ISO 8601.
 * OWM devuelve todos los timestamps en segundos; se multiplica por 1000 para Date.
 */
const unixToISO = (unixSeconds: number): string =>
  new Date(unixSeconds * 1000).toISOString();

/**
 * Convierte un timestamp UNIX (segundos) a una fecha 'YYYY-MM-DD' en la zona horaria local
 * del lugar consultado, usando el desplazamiento provisto por OWM.
 * Usado para agrupar las horas correctamente bajo su día local.
 */
const unixToDateString = (unixSeconds: number, timezoneOffset: number = 0): string => {
  // Aplicamos el offset al timestamp para que toISOString devuelva la fecha local 'UTC'
  const localTime = (unixSeconds + timezoneOffset) * 1000;
  return new Date(localTime).toISOString().split('T')[0];
};

// ============================================================
// Helpers de fase lunar
// ============================================================

/** Duración del mes sinódico en días */
export const SYNODIC_MONTH = 29.530588853;
/** Número de día juliano de una Luna Nueva conocida (6 Ene 2000) */
export const KNOWN_NEW_MOON_JD = 2451549.5;
export const MAJOR_PHASES = ['new_moon', 'first_quarter', 'full_moon', 'third_quarter'];

export function toJulian(date: Date): number {
  if (!date || isNaN(date.getTime())) return 0;
  const time = date.getTime();
  const tzoffset = date.getTimezoneOffset() * 60000;
  return (time - tzoffset) / 86400000 + 2440587.5;
}

export function fromJulian(jd: number): Date {
  if (jd === 0) return new Date();
  return new Date((jd - 2440587.5) * 86400000);
}

/**
 * Calcula la fase lunar (0-1) para una fecha específica.
 */
export function calculateMoonPhase(date: Date): number {
  const jd = toJulian(date);
  const cycles = (jd - KNOWN_NEW_MOON_JD) / SYNODIC_MONTH;
  return ((cycles % 1) + 1) % 1;
}

/**
 * Calcula las próximas 4 fases lunares mayores a partir de una fecha.
 */
export function getUpcomingMajorPhases(currentDate: Date): { name: string; date: Date }[] {
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

/**
 * Devuelve el nombre de la fase lunar a partir del valor de OWM (0-1).
 * Implementa la lógica completa de 8 fases según el TRD.
 * @param phase - Valor de moon_phase de OWM (0 a 1).
 * @returns Clave de traducción de la fase (ej: 'new_moon').
 */
export const getMoonPhaseName = (phase: number): string => {
  if (phase === 0 || phase === 1) return 'new_moon';
  if (phase > 0 && phase < 0.25) return 'waxing_crescent';
  if (phase === 0.25) return 'first_quarter';
  if (phase > 0.25 && phase < 0.5) return 'waxing_gibbous';
  if (phase === 0.5) return 'full_moon';
  if (phase > 0.5 && phase < 0.75) return 'waning_gibbous';
  if (phase === 0.75) return 'third_quarter';
  return 'waning_crescent';
};

/**
 * Calcula el porcentaje de iluminación lunar según el TRD.
 * @param phase - Valor de moon_phase de OWM (0 a 1).
 * @returns Porcentaje de iluminación redondeado (0-100).
 */
export const getMoonIllumination = (phase: number): number => {
  const illumination = phase <= 0.5
    ? phase * 2 * 100
    : (1 - phase) * 2 * 100;
  return Math.round(illumination);
};

// ============================================================
// Helpers de verificación de horario
// ============================================================

/**
 * Determina si es de noche según amanecer, atardecer y un tiempo de referencia.
 * @param sunrise - ISO string del amanecer.
 * @param sunset - ISO string del atardecer.
 * @param currentTime - Opcional. ISO string del momento actual (usualmente data.dt).
 * @returns true si es de noche.
 */
export const isNightTime = (sunrise?: string, sunset?: string, currentTime?: string): boolean => {
  if (!sunrise || !sunset) return false;

  // Usamos el tiempo de la API si existe, si no el del sistema (fallback)
  const referenceTimestamp = currentTime ? new Date(currentTime).getTime() : Date.now();
  const sunriseTime = new Date(sunrise).getTime();
  const sunsetTime = new Date(sunset).getTime();

  return referenceTimestamp < sunriseTime || referenceTimestamp > sunsetTime;
};

// ============================================================
// Procesador principal: OWM → WeatherData interno
// ============================================================

/**
 * Procesa la respuesta cruda de OWM One Call API 3.0 al formato interno WeatherData.
 * @param apiData - Datos crudos de la OWM One Call API 3.0.
 * @param locationName - Nombre de visualización de la ubicación.
 * @returns Estructura WeatherData normalizada para la UI.
 */
export function processOWMData(apiData: OWMWeatherData, locationName: string): WeatherData {
  const { current, hourly, daily, timezone, timezone_offset, lat } = apiData;

  // ── Current weather ──────────────────────────────────────────
  const currentWeatherId = current.weather[0]?.id ?? 800;
  const currentWeatherIcon = current.weather[0]?.icon ?? '01d';

  // POP en current puede no venir; buscar en la primera hora como fallback
  const currentPop = (current.pop !== undefined && current.pop !== null)
    ? Math.round(current.pop * 100)
    : (hourly[0]?.pop !== undefined ? Math.round(hourly[0].pop * 100) : 0);

  const currentWeatherData: CurrentWeather = {
    location: locationName,
    temp: current.temp,
    feels_like: current.feels_like,
    humidity: current.humidity,
    wind_speed: Math.round(current.wind_speed * 3.6), // m/s → km/h
    wind_direction: current.wind_deg,
    description: getWeatherKeyFromOwmId(currentWeatherId),
    main: getMainCategoryFromOwmId(currentWeatherId),
    pop: currentPop,
    dt: unixToISO(current.dt),
    temp_min: daily[0]?.temp.min ?? current.temp,
    temp_max: daily[0]?.temp.max ?? current.temp,
    sunrise: unixToISO(current.sunrise),
    sunset: unixToISO(current.sunset),
    timezone: timezone,
    weatherCode: currentWeatherId,
    weatherIcon: currentWeatherIcon,
    latitude: lat,
    pressure: current.pressure,
    visibility: current.visibility,
    clouds: current.clouds,
    uvi: current.uvi,
  };

  // ── Hourly forecast (horas del día actual, hasta 24h) ────────
  const todayDateStr = unixToDateString(current.dt, timezone_offset);
  const todayHourlyForecast: HourlyForecast[] = hourly
    .filter(h => unixToDateString(h.dt, timezone_offset) === todayDateStr)
    .slice(0, 24)
    .map(h => ({
      time: unixToISO(h.dt),
      temp: Math.round(h.temp),
      main: getMainCategoryFromOwmId(h.weather[0]?.id ?? 800),
      pop: Math.round(h.pop * 100),
      weatherCode: h.weather[0]?.id ?? 800,
      weatherIcon: h.weather[0]?.icon ?? '01d',
    }));

  // ── Daily forecast (días siguientes, máximo 8) ───────────────
  // ── Daily forecast (incluyendo hoy para completar 8 días en el grid) ─
  const forecastData: DailyForecast[] = daily.slice(0, 8).map(day => {
    const dayWeatherId = day.weather[0]?.id ?? 800;
    const dayWeatherIcon = day.weather[0]?.icon ?? '01d';
    const dayDateStr = unixToDateString(day.dt, timezone_offset);

    return {
      dt: dayDateStr,
      temp_min: Math.round(day.temp.min),
      temp_max: Math.round(day.temp.max),
      main: getMainCategoryFromOwmId(dayWeatherId),
      description: getWeatherKeyFromOwmId(dayWeatherId),
      pop: Math.round(day.pop * 100),
      hourly: hourly
        .filter(h => unixToDateString(h.dt, timezone_offset) === dayDateStr)
        .map(h => ({
          time: unixToISO(h.dt),
          temp: Math.round(h.temp),
          main: getMainCategoryFromOwmId(h.weather[0]?.id ?? 800),
          pop: Math.round(h.pop * 100),
          weatherCode: h.weather[0]?.id ?? 800,
          weatherIcon: h.weather[0]?.icon ?? '01d',
        })),
      humidity: day.humidity,
      wind_speed: Math.round(day.wind_speed * 3.6), // m/s → km/h
      wind_direction: day.wind_deg,
      temp: Math.round(day.temp.day),
      feels_like: Math.round(day.feels_like.day),
      weatherCode: dayWeatherId,
      weatherIcon: dayWeatherIcon,
      sunrise: unixToISO(day.sunrise),
      sunset: unixToISO(day.sunset),
      // Datos astronómicos lunares
      moonrise: day.moonrise ? unixToISO(day.moonrise) : undefined,
      moonset: day.moonset ? unixToISO(day.moonset) : undefined,
      moon_phase: day.moon_phase,
      pressure: day.pressure,
      visibility: day.clouds > 80 ? 5000 : 10000, // OWM Daily no da visibility, usamos estimado
      clouds: day.clouds,
      uvi: day.uvi,
    };
  });

  return {
    current: currentWeatherData,
    forecast: forecastData,
    hourly: todayHourlyForecast,
    latitude: lat,
    lastUpdated: unixToISO(current.dt),
    owmRawDaily: daily, // Array completo para el MoonCalendar
  };
};
