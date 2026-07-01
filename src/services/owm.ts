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

// (unstable_cache se inicializará dinámicamente dentro de getWeatherData)

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

  // 1. Instanciar la función cacheada dinámicamente para inyectar la cityKey
  // en la clave maestra y en los 'tags' que Next.js maneja en sus internals.
  const getCachedOWMData = unstable_cache(
    async (latNum: number, lonNum: number, apiStr: string) => {
      return await fetchRawDataFromOWM(latNum, lonNum, apiStr);
    },
    // La clave oficial para Next.js (esto aísla a Wilde de Bernal, por ejemplo)
    ['owm-weather-data', cityKey],
    {
      revalidate: 1800, // 30 minutos
      tags: ['weather', `weather-${cityKey}`],
    }
  );

  // Llamar a la versión cacheada
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
