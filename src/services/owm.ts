import type { WeatherData, NormalizedLocation, OWMWeatherData } from '@/lib/types';
import { processOWMData } from '@/lib/weather-utils';

/**
 * Obtiene los datos meteorológicos completos directamente desde OWM One Call API 3.0.
 *
 * Esta función se ejecuta exclusivamente en el servidor (Server Actions / RSC),
 * por lo que tiene acceso directo a OWM_API_KEY y NO necesita pasar por el
 * Route Handler /api/weather (que existe como proxy seguro solo para el cliente).
 *
 * @param location - Ubicación normalizada con cityKey, lat y lon oficiales.
 * @returns WeatherData procesado y listo para la UI.
 */
export async function getWeatherData(location: NormalizedLocation): Promise<WeatherData> {
  const { lat, lon, cityKey, displayName } = location;

  const apiKey = process.env.OWM_API_KEY;
  if (!apiKey) {
    throw new Error('[getWeatherData] OWM_API_KEY no está configurada en el entorno del servidor.');
  }

  const owmUrl =
    `https://api.openweathermap.org/data/3.0/onecall` +
    `?lat=${lat}&lon=${lon}` +
    `&exclude=minutely,alerts` +
    `&units=metric` +
    `&lang=es` +
    `&appid=${apiKey}`;

  console.log(`[getWeatherData] Llamando directamente a OWM para cityKey: ${cityKey}`);

  const res = await fetch(owmUrl, {
    next: {
      revalidate: 1800, // 30 minutos de caché a nivel de fetch en Next.js
      tags: [`weather-${cityKey}`],
    },
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`[getWeatherData] Error de OWM (${res.status}): ${errorBody}`);
    throw new Error(`Error del proveedor meteorológico: ${res.status}`);
  }

  const rawData: OWMWeatherData = await res.json();

  return processOWMData(rawData, displayName);
}
