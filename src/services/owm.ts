import type { WeatherData, NormalizedLocation, OWMWeatherData } from '@/lib/types';
import { processOWMData } from '@/lib/weather-utils';
import { getBaseUrl } from '@/lib/utils';

/**
 * Obtiene los datos meteorológicos completos de OWM One Call API 3.0
 * a través del Route Handler /api/weather (que aplica caché de 30 min por cityKey).
 *
 * @param location - Ubicación normalizada con cityKey, lat y lon oficiales.
 * @returns WeatherData procesado y listo para la UI.
 */
export async function getWeatherData(location: NormalizedLocation): Promise<WeatherData> {
  const { lat, lon, cityKey, displayName } = location;

  const url =
    `${getBaseUrl()}/api/weather` +
    `?lat=${lat}&lon=${lon}&cityKey=${encodeURIComponent(cityKey)}`;

  console.log(`[getWeatherData] Fetching URL: ${url}`);

  // LOG DE DEPURECIÓN PARA DESPLIEGUES
  if (process.env.NODE_ENV === 'production') {
    console.log(`[getWeatherData] Fetching: ${url}`);
  }

  const res = await fetch(url);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    const message = errorData?.error || `HTTP ${res.status}`;
    console.error(`[getWeatherData] Error del Route Handler: ${message}`);
    throw new Error(`Error al obtener el clima: ${message}`);
  }

  const rawData: OWMWeatherData = await res.json();

  return processOWMData(rawData, displayName);
}
