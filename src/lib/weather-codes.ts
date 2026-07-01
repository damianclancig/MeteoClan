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


import type { WeatherCodeInfo } from './types';

/**
 * Tabla de mapeo de IDs de condición de OpenWeatherMap a claves de traducción internas.
 * Permite usar los iconos SVG animados existentes (basados en categorías) con datos de OWM.
 * Referencia: https://openweathermap.org/weather-conditions
 */
export const owmIdToWeatherKey: Record<number, string> = {
  // Grupo 2xx: Tormenta
  200: 'thunderstorm_light_rain',
  201: 'thunderstorm_rain',
  202: 'thunderstorm_heavy_rain',
  210: 'light_thunderstorm',
  211: 'thunderstorm',
  212: 'heavy_thunderstorm',
  221: 'ragged_thunderstorm',
  230: 'thunderstorm_light_drizzle',
  231: 'thunderstorm_drizzle',
  232: 'thunderstorm_heavy_drizzle',

  // Grupo 3xx: Llovizna
  300: 'drizzle_light_intensity',
  301: 'drizzle',
  302: 'drizzle_heavy_intensity',
  310: 'drizzle_light_rain',
  311: 'drizzle_rain',
  312: 'drizzle_heavy_rain',
  313: 'drizzle_shower_rain',
  314: 'drizzle_heavy_shower_rain',
  321: 'drizzle_shower',

  // Grupo 5xx: Lluvia
  500: 'rain_light_intensity',
  501: 'rain_moderate_intensity',
  502: 'rain_heavy_intensity',
  503: 'rain_very_heavy_intensity',
  504: 'rain_extreme_intensity',
  511: 'rain_freezing',
  520: 'rain_shower_light_intensity',
  521: 'rain_shower_moderate_intensity',
  522: 'rain_shower_heavy_intensity',
  531: 'rain_shower_ragged',

  // Grupo 6xx: Nieve
  600: 'snow_light',
  601: 'snow',
  602: 'snow_heavy',
  611: 'snow_sleet',
  612: 'snow_shower_sleet_light',
  613: 'snow_shower_sleet',
  615: 'snow_light_rain_and',
  616: 'snow_rain_and',
  620: 'snow_shower_light',
  621: 'snow_shower',
  622: 'snow_shower_heavy',

  // Grupo 7xx: Atmósfera
  701: 'mist',
  711: 'smoke',
  721: 'haze',
  731: 'sand_dust_whirls',
  741: 'fog',
  751: 'sand',
  761: 'dust',
  762: 'volcanic_ash',
  771: 'squalls',
  781: 'tornado',

  // Grupo 800: Despejado
  800: 'clear_sky',

  // Grupo 80x: Nublado
  801: 'clouds_few',
  802: 'clouds_scattered',
  803: 'clouds_broken',
  804: 'clouds_overcast',
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
