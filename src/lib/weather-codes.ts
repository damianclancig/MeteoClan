
import type { WeatherCodeInfo } from './types';

/**
 * Tabla de mapeo de IDs de condición de OpenWeatherMap a claves de traducción internas.
 * Permite usar los iconos SVG animados existentes (basados en categorías) con datos de OWM.
 * Referencia: https://openweathermap.org/weather-conditions
 */
export const owmIdToWeatherKey: Record<number, string> = {
  // Grupo 2xx: Tormenta
  200: 'thunderstorm_slight_or_moderate',
  201: 'thunderstorm_slight_or_moderate',
  202: 'thunderstorm_with_heavy_hail',
  210: 'thunderstorm_slight_or_moderate',
  211: 'thunderstorm_slight_or_moderate',
  212: 'thunderstorm_with_heavy_hail',
  221: 'thunderstorm_slight_or_moderate',
  230: 'thunderstorm_slight_or_moderate',
  231: 'thunderstorm_slight_or_moderate',
  232: 'thunderstorm_slight_or_moderate',

  // Grupo 3xx: Llovizna
  300: 'drizzle_light',
  301: 'drizzle_moderate',
  302: 'drizzle_dense',
  310: 'drizzle_light',
  311: 'drizzle_moderate',
  312: 'drizzle_dense',
  313: 'rain_showers_slight',
  314: 'rain_showers_moderate',
  321: 'drizzle_moderate',

  // Grupo 5xx: Lluvia
  500: 'rain_slight',
  501: 'rain_moderate',
  502: 'rain_heavy',
  503: 'rain_heavy',
  504: 'rain_heavy',
  511: 'freezing_rain_light',
  520: 'rain_showers_slight',
  521: 'rain_showers_moderate',
  522: 'rain_showers_violent',
  531: 'rain_showers_moderate',

  // Grupo 6xx: Nieve
  600: 'snow_fall_slight',
  601: 'snow_fall_moderate',
  602: 'snow_fall_heavy',
  611: 'freezing_drizzle_light',
  612: 'freezing_drizzle_dense',
  613: 'snow_showers_slight',
  615: 'snow_fall_slight',
  616: 'snow_fall_moderate',
  620: 'snow_showers_slight',
  621: 'snow_showers_heavy',
  622: 'snow_fall_heavy',

  // Grupo 7xx: Atmósfera
  701: 'fog',
  711: 'fog',
  721: 'fog',
  731: 'fog',
  741: 'fog',
  751: 'fog',
  761: 'fog',
  762: 'fog',
  771: 'thunderstorm_slight_or_moderate',
  781: 'thunderstorm_with_heavy_hail',

  // Grupo 800: Despejado
  800: 'clear_sky',

  // Grupo 80x: Nublado
  801: 'mainly_clear',
  802: 'partly_cloudy',
  803: 'overcast',
  804: 'overcast',
};

/**
 * Obtiene la clave de traducción para un ID de condición de OWM.
 * @param owmId - El ID de condición meteorológica de OWM.
 * @returns Clave de traducción interna (ej: 'clear_sky').
 */
export const getWeatherKeyFromOwmId = (owmId: number): string => {
  return owmIdToWeatherKey[owmId] ?? 'clear_sky';
};

/**
 * Mapea categorías de OWM a categorías generales de la app.
 * @param owmId - El ID de condición meteorológica de OWM.
 * @returns Categoría general (ej: 'Clear', 'Rain', 'Clouds').
 */
export const getMainCategoryFromOwmId = (owmId: number): string => {
  if (owmId >= 200 && owmId < 300) return 'Thunderstorm';
  if (owmId >= 300 && owmId < 400) return 'Drizzle';
  if (owmId >= 500 && owmId < 600) return 'Rain';
  if (owmId >= 600 && owmId < 700) return 'Snow';
  if (owmId >= 700 && owmId < 800) return 'Fog';
  if (owmId === 800) return 'Clear';
  if (owmId > 800 && owmId < 900) return 'Clouds';
  return 'Clear';
};

// ============================================================
// WMO Code table (mantenida para compatibilidad con iconos SVG)
// ============================================================

export const weatherCodes: Record<number, WeatherCodeInfo> = {
  0: { description: 'Clear sky', image: 'http://openweathermap.org/img/wn/01d@2x.png' },
  1: { description: 'Mainly clear', image: 'http://openweathermap.org/img/wn/01d@2x.png' },
  2: { description: 'Partly cloudy', image: 'http://openweathermap.org/img/wn/02d@2x.png' },
  3: { description: 'Overcast', image: 'http://openweathermap.org/img/wn/04d@2x.png' },
  45: { description: 'Fog', image: 'http://openweathermap.org/img/wn/50d@2x.png' },
  48: { description: 'Depositing rime fog', image: 'http://openweathermap.org/img/wn/50d@2x.png' },
  51: { description: 'Drizzle: Light', image: 'http://openweathermap.org/img/wn/09d@2x.png' },
  53: { description: 'Drizzle: Moderate', image: 'http://openweathermap.org/img/wn/09d@2x.png' },
  55: { description: 'Drizzle: Dense', image: 'http://openweathermap.org/img/wn/09d@2x.png' },
  56: { description: 'Freezing Drizzle: Light', image: 'http://openweathermap.org/img/wn/09d@2x.png' },
  57: { description: 'Freezing Drizzle: Dense', image: 'http://openweathermap.org/img/wn/09d@2x.png' },
  61: { description: 'Rain: Slight', image: 'http://openweathermap.org/img/wn/10d@2x.png' },
  63: { description: 'Rain: Moderate', image: 'http://openweathermap.org/img/wn/10d@2x.png' },
  65: { description: 'Rain: Heavy', image: 'http://openweathermap.org/img/wn/10d@2x.png' },
  66: { description: 'Freezing Rain: Light', image: 'http://openweathermap.org/img/wn/13d@2x.png' },
  67: { description: 'Freezing Rain: Heavy', image: 'http://openweathermap.org/img/wn/13d@2x.png' },
  71: { description: 'Snow fall: Slight', image: 'http://openweathermap.org/img/wn/13d@2x.png' },
  73: { description: 'Snow fall: Moderate', image: 'http://openweathermap.org/img/wn/13d@2x.png' },
  75: { description: 'Snow fall: Heavy', image: 'http://openweathermap.org/img/wn/13d@2x.png' },
  77: { description: 'Snow grains', image: 'http://openweathermap.org/img/wn/13d@2x.png' },
  80: { description: 'Rain showers: Slight', image: 'http://openweathermap.org/img/wn/09d@2x.png' },
  81: { description: 'Rain showers: Moderate', image: 'http://openweathermap.org/img/wn/09d@2x.png' },
  82: { description: 'Rain showers: Violent', image: 'http://openweathermap.org/img/wn/09d@2x.png' },
  85: { description: 'Snow showers: Slight', image: 'http://openweathermap.org/img/wn/13d@2x.png' },
  86: { description: 'Snow showers: Heavy', image: 'http://openweathermap.org/img/wn/13d@2x.png' },
  95: { description: 'Thunderstorm: Slight or moderate', image: 'http://openweathermap.org/img/wn/11d@2x.png' },
  96: { description: 'Thunderstorm with slight hail', image: 'http://openweathermap.org/img/wn/11d@2x.png' },
  99: { description: 'Thunderstorm with heavy hail', image: 'http://openweathermap.org/img/wn/11d@2x.png' },
};
