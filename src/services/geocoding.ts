
import type { GeocodingResult, NormalizedLocation, CitySuggestion } from '@/lib/types';
import { getBaseUrl } from '@/lib/utils';

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
// Reverse Geocoding: coordenadas GPS → NormalizedLocation
// ============================================================

/**
 * Obtiene la ciudad más cercana a unas coordenadas GPS usando OWM Reverse Geocoding.
 * Las llamadas se realizan a través del Route Handler /api/geocoding para proteger la API Key.
 * @param lat - Latitud GPS.
 * @param lon - Longitud GPS.
 * @returns NormalizedLocation o null si falla.
 */
export async function getLocationFromCoords(
  lat: number,
  lon: number
): Promise<NormalizedLocation | null> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/geocoding?lat=${lat}&lon=${lon}`);
    if (!res.ok) {
      console.error(`[getLocationFromCoords] Error: ${res.status}`);
      return null;
    }
    const results: GeocodingResult[] = await res.json();
    if (!results || results.length === 0) return null;

    return normalizeLocation(results[0]);
  } catch (error: any) {
    console.error('[getLocationFromCoords] Error de red:', error.message);
    return null;
  }
}

// ============================================================
// Direct Geocoding: texto → sugerencias de ciudades
// ============================================================

/**
 * Busca sugerencias de ciudades usando OWM Direct Geocoding.
 * Las llamadas se realizan a través del Route Handler /api/geocoding.
 * @param query - Texto de búsqueda (mínimo 3 caracteres por convención).
 * @param count - Número máximo de resultados.
 * @returns Array de CitySuggestion para el buscador de la UI.
 */
export async function getCitySuggestions(
  query: string,
  _language: string, // Mantenemos el parámetro para compatibilidad de interfaz
  count: number = 5
): Promise<CitySuggestion[]> {
  if (query.length < 3) return [];

  try {
    const res = await fetch(
      `${getBaseUrl()}/api/geocoding?q=${encodeURIComponent(query)}&limit=${count}`
    );
    if (!res.ok) {
      console.error(`[getCitySuggestions] Error: ${res.status}`);
      return [];
    }
    const results: GeocodingResult[] = await res.json();
    if (!results || results.length === 0) return [];

    const seen = new Set<string>();
    const suggestions: CitySuggestion[] = [];

    results.forEach(item => {
      const normalized = normalizeLocation(item);
      if (!seen.has(normalized.cityKey)) {
        seen.add(normalized.cityKey);
        suggestions.push({
          name: normalized.displayName,
          lat: item.lat,
          lon: item.lon,
        });
      }
    });

    return suggestions;
  } catch (error: any) {
    console.error('[getCitySuggestions] Error de red:', error.message);
    return [];
  }
}

/**
 * Obtiene la primera ciudad que coincide con un texto de búsqueda exacto.
 * Útil cuando el usuario escribe un nombre de ciudad directamente en el formulario.
 * @param query - Nombre de la ciudad.
 * @returns NormalizedLocation o null si no se encuentra.
 */
export async function getLocationFromQuery(
  query: string
): Promise<NormalizedLocation | null> {
  if (query.length < 2) return null;

  try {
    const res = await fetch(
      `${getBaseUrl()}/api/geocoding?q=${encodeURIComponent(query)}&limit=1`
    );
    if (!res.ok) {
      console.error(`[getLocationFromQuery] Error: ${res.status}`);
      return null;
    }
    const results: GeocodingResult[] = await res.json();
    if (!results || results.length === 0) return null;

    return normalizeLocation(results[0]);
  } catch (error: any) {
    console.error('[getLocationFromQuery] Error de red:', error.message);
    return null;
  }
}
