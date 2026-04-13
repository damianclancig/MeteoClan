import { unstable_cache } from 'next/cache';
import type { WeatherData, NormalizedLocation, OWMWeatherData } from '@/lib/types';
import { processOWMData } from '@/lib/weather-utils';

/**
 * Función interna para realizar la petición real a OpenWeatherMap.
 * No debe ser llamada directamente fuera de unstable_cache.
 */
async function fetchRawDataFromOWM(lat: number, lon: number, apiKey: string): Promise<OWMWeatherData> {
  const owmUrl =
    `https://api.openweathermap.org/data/3.0/onecall` +
    `?lat=${lat}&lon=${lon}` +
    `&exclude=minutely,alerts` +
    `&units=metric` +
    `&lang=es` +
    `&appid=${apiKey}`;

  const res = await fetch(owmUrl, { cache: 'no-store' }); // Forzamos fresh data para que unstable_cache lo guarde

  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`[fetchRawDataFromOWM] Error de OWM (${res.status}): ${errorBody}`);
    throw new Error(`Error del proveedor meteorológico: ${res.status}`);
  }

  return await res.json();
}

/**
 * Función cacheada que obtiene los datos crudos de OWM.
 * Se indexa por cityKey para que todos los usuarios de la ciudad compartan el mismo dato.
 */
const getCachedOWMData = unstable_cache(
  async (lat: number, lon: number, apiKey: string) => {
    return await fetchRawDataFromOWM(lat, lon, apiKey);
  },
  ['owm-weather-data'],
  {
    revalidate: 1800, // 30 minutos
    tags: ['weather'],
  }
);

/**
 * Obtiene los datos meteorológicos completos.
 * Garantiza persistencia compartida por ciudad usando unstable_cache.
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

  console.log(`[getWeatherData] Consultando clima compartido para: ${cityKey}`);

  // Llamar a la versión cacheada usando la cityKey como parte de la clave de revalidación implícita
  let rawData = await getCachedOWMData(lat, lon, apiKey);

  // Anti-Stale (Bloqueo de Stale-While-Revalidate)
  const nowUnix = Math.floor(Date.now() / 1000);
  const dataAgeSec = nowUnix - rawData.current.dt;

  if (dataAgeSec > 1800) {
    console.log(`[getWeatherData] Cache STALE detectado (${dataAgeSec}s viejo). Bloqueando envío a UI y obteniendo datos frescos directos...`);
    try {
      rawData = await fetchRawDataFromOWM(lat, lon, apiKey);
    } catch (e: any) {
      console.warn(`[getWeatherData] ⚠️ Fetch forzado falló (Timeout/Network). Fallback a datos Stale (${dataAgeSec}s): ${e.message}`);
      // rawData mantiene el valor Stale original
    }
  }

  return processOWMData(rawData, displayName);
}
