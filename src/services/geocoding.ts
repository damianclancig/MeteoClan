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

import type { GeocodingResult, NormalizedLocation, CitySuggestion } from '@/lib/types';

// ============================================================
// Persistencia local de la ubicación normalizada
// ============================================================

const LOCATION_STORAGE_KEY = 'meteoclan_normalized_location';

/**
 * Recupera la ubicación normalizada guardada en localStorage.
 * Retorna null si no existe o si el entorno no soporta localStorage.
 */
export function getCachedLocation(): NormalizedLocation | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(LOCATION_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as NormalizedLocation) : null;
  } catch {
    return null;
  }
}

/**
 * Guarda una ubicación normalizada en localStorage para reutilizarla
 * en futuras visitas y evitar re-geocoding innecesario.
 */
export function setCachedLocation(location: NormalizedLocation): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
  } catch {
    // localStorage puede estar deshabilitado (ej: modo incógnito con restricciones)
  }
}

// ============================================================
// Normalización de resultados de OWM Geocoding
// ============================================================

/**
 * Convierte un resultado de OWM Geocoding a una NormalizedLocation.
 * Genera el cityKey en formato "nombre-estado-pais" (lowercase, sin tildes).
 * @param result - Resultado de OWM Geocoding API.
 * @returns NormalizedLocation lista para usar como clave de caché.
 */
export function normalizeLocation(result: GeocodingResult): NormalizedLocation {
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos
      .replace(/[^a-z0-9]+/g, '-')    // Reemplazar caracteres no alfanuméricos con guión
      .replace(/^-|-$/g, '');          // Eliminar guiones al inicio/fin

  const parts = [result.name, result.state, result.country].filter(Boolean) as string[];
  const cityKey = parts.map(normalize).join('-');

  const displayParts = [result.name, result.state, result.country].filter(Boolean);
  const displayName = displayParts.join(', ');

  return {
    cityKey,
    displayName,
    lat: result.lat,
    lon: result.lon,
  };
}

// ============================================================
// Helper privado: valida y retorna la OWM_API_KEY del servidor
// ============================================================

/**
 * Obtiene y valida la OWM_API_KEY del entorno del servidor.
 * Lanza un error si no está configurada, para hacer el fallo explícito.
 */
function getApiKey(): string {
  const apiKey = process.env.OWM_API_KEY;
  if (!apiKey) {
    throw new Error('[geocoding] OWM_API_KEY no está configurada en el entorno del servidor.');
  }
  return apiKey;
}

// ============================================================
// Reverse Geocoding: coordenadas GPS → NormalizedLocation
// ============================================================

/**
 * Obtiene la ciudad más cercana a unas coordenadas GPS usando OWM Reverse Geocoding.
 * Llama directamente a la API de OWM (se ejecuta en el servidor con acceso a OWM_API_KEY).
 * @param lat - Latitud GPS.
 * @param lon - Longitud GPS.
 * @returns NormalizedLocation o null si falla.
 */
export async function getLocationFromCoords(
  lat: number,
  lon: number
): Promise<NormalizedLocation | null> {
  try {
    const apiKey = getApiKey();
    const owmUrl =
      `https://api.openweathermap.org/geo/1.0/reverse` +
      `?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;

    console.log(`[getLocationFromCoords] Llamando directamente a OWM para lat=${lat}, lon=${lon}`);

    const res = await fetch(owmUrl, { next: { revalidate: 86400 } }); // 24h caché
    if (!res.ok) {
      console.error(`[getLocationFromCoords] Error OWM: ${res.status}`);
      return null;
    }
    const results: GeocodingResult[] = await res.json();
    if (!results || results.length === 0) return null;

    return normalizeLocation(results[0]);
  } catch (error: any) {
    console.error('[getLocationFromCoords] Error:', error.message);
    return null;
  }
}

// ============================================================
// Direct Geocoding: texto → sugerencias de ciudades
// ============================================================

/**
 * Calcula la distancia en kilómetros entre dos puntos geográficos (Fórmula de Haversine).
 */
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Busca sugerencias de ciudades usando OWM Direct Geocoding.
 * Llama directamente a la API de OWM (se ejecuta en el servidor con acceso a OWM_API_KEY).
 * @param query - Texto de búsqueda.
 * @param _language - Parámetro de compatibilidad.
 * @param count - Número máximo de resultados retornar.
 * @param userLat - Latitud del usuario para priorización por cercanía.
 * @param userLon - Longitud del usuario para priorización por cercanía.
 * @returns Array de CitySuggestion ordenado por relevancia y cercanía.
 */
export async function getCitySuggestions(
  query: string,
  _language: string,
  count: number = 5,
  userLat?: number,
  userLon?: number
): Promise<CitySuggestion[]> {
  if (query.length < 3) return [];

  try {
    const apiKey = getApiKey();
    // Aumentamos el límite interno para tener más candidatos que ordenar por cercanía
    const internalLimit = userLat && userLon ? 15 : count + 5;
    const owmUrl =
      `https://api.openweathermap.org/geo/1.0/direct` +
      `?q=${encodeURIComponent(query)}&limit=${internalLimit}&appid=${apiKey}`;

    console.log(`[getCitySuggestions] Query="${query}" (UserLoc: ${userLat}, ${userLon})`);

    const res = await fetch(owmUrl, { next: { revalidate: 86400 } });
    if (!res.ok) return [];

    const results: GeocodingResult[] = await res.json();
    if (!results || results.length === 0) return [];

    const seen = new Set<string>();
    let suggestionsWithDistance: (CitySuggestion & { distance?: number })[] = [];

    results.forEach(item => {
      const normalized = normalizeLocation(item);
      if (!seen.has(normalized.cityKey)) {
        seen.add(normalized.cityKey);
        
        const suggestion: CitySuggestion & { distance?: number } = {
          name: normalized.displayName,
          lat: item.lat,
          lon: item.lon,
        };

        if (userLat !== undefined && userLon !== undefined) {
          suggestion.distance = getDistance(userLat, userLon, item.lat, item.lon);
        }
        
        suggestionsWithDistance.push(suggestion);
      }
    });

    // Ordenar por cercanía si tenemos la ubicación del usuario
    if (userLat !== undefined && userLon !== undefined) {
      suggestionsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    // Retornar solo el número solicitado de sugerencias
    return suggestionsWithDistance.slice(0, count).map(({ distance, ...rest }) => rest);
  } catch (error: any) {
    console.error('[getCitySuggestions] Error:', error.message);
    return [];
  }
}

/**
 * Obtiene la primera ciudad que coincide con un texto de búsqueda exacto.
 * Útil cuando el usuario escribe un nombre de ciudad directamente en el formulario.
 * Llama directamente a la API de OWM (se ejecuta en el servidor con acceso a OWM_API_KEY).
 * @param query - Nombre de la ciudad.
 * @returns NormalizedLocation o null si no se encuentra.
 */
export async function getLocationFromQuery(
  query: string
): Promise<NormalizedLocation | null> {
  if (query.length < 2) return null;

  try {
    const apiKey = getApiKey();
    const owmUrl =
      `https://api.openweathermap.org/geo/1.0/direct` +
      `?q=${encodeURIComponent(query)}&limit=1&appid=${apiKey}`;

    console.log(`[getLocationFromQuery] Llamando directamente a OWM para query="${query}"`);

    const res = await fetch(owmUrl, { next: { revalidate: 86400 } }); // 24h caché
    if (!res.ok) {
      console.error(`[getLocationFromQuery] Error OWM: ${res.status}`);
      return null;
    }
    const results: GeocodingResult[] = await res.json();
    if (!results || results.length === 0) return null;

    return normalizeLocation(results[0]);
  } catch (error: any) {
    console.error('[getLocationFromQuery] Error:', error.message);
    return null;
  }
}
