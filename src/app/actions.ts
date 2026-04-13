
'use server';

import type { WeatherData, NormalizedLocation, CitySuggestion } from '@/lib/types';
import { generateBackground } from '@/ai/flows/generate-background-flow';
import {
  getCitySuggestions as fetchCitySuggestions,
  getLocationFromCoords,
  getLocationFromQuery,
  normalizeLocation,
} from '@/services/geocoding';
import { getWeatherData as fetchWeatherData } from '@/services/owm';

// ============================================================
// Acción principal: obtiene el clima orquestando geocoding + OWM
// ============================================================

/**
 * Server Action principal que gestiona el flujo completo:
 * 1. Resolver la ubicación a través de OWM Geocoding (GPS o texto).
 * 2. Normalizar la ubicación para obtener un cityKey estable.
 * 3. Obtener el clima desde OWM One Call API 3.0 (vía Route Handler con caché).
 */
export async function getWeather(prevState: any, formData: FormData): Promise<any> {
  const locationQuery = formData.get('location') as string | null;
  const latStr = formData.get('latitude') as string | null;
  const lonStr = formData.get('longitude') as string | null;
  const cityKeyFromForm = formData.get('cityKey') as string | null;

  try {
    let normalizedLocation: NormalizedLocation | null = null;

    // Caso A: El formulario ya trae un cityKey (ej: sugerencia del buscador con coordenadas OWM ya normalizadas)
    if (latStr && lonStr && cityKeyFromForm && locationQuery) {
      normalizedLocation = {
        cityKey: cityKeyFromForm,
        displayName: locationQuery,
        lat: parseFloat(latStr),
        lon: parseFloat(lonStr),
      };
    }
    // Caso B: Coordenadas GPS crudas → normalizar con OWM Reverse Geocoding
    else if (latStr && lonStr && !locationQuery) {
      // Redondear a 4 decimales (~11m) para estabilizar el caché de geocoding
      const rawLat = parseFloat(latStr);
      const rawLon = parseFloat(lonStr);
      const stableLat = Math.round(rawLat * 10000) / 10000;
      const stableLon = Math.round(rawLon * 10000) / 10000;

      normalizedLocation = await getLocationFromCoords(stableLat, stableLon);

      if (!normalizedLocation) {
        // Fallback: construir una location básica si OWM falla
        normalizedLocation = {
          cityKey: `location-${Math.round(stableLat)}-${Math.round(stableLon)}`,
          displayName: 'Mi ubicación',
          lat: stableLat,
          lon: stableLon,
        };
      }
    }
    // Caso C: Solo texto de búsqueda → normalizar con OWM Direct Geocoding
    else if (locationQuery && !latStr && !lonStr) {
      normalizedLocation = await getLocationFromQuery(locationQuery);

      if (!normalizedLocation) {
        const errorDetail = `No se encontró la ciudad: ${locationQuery}`;
        return { ...prevState, success: false, message: 'fetchError', errorDetail };
      }
    }
    // Caso D: Datos insuficientes
    else {
      const errorDetail = 'No se proporcionó información de ubicación.';
      return { ...prevState, success: false, message: 'fetchError', errorDetail };
    }

    // Obtener el clima con la ubicación normalizada
    const weatherData: WeatherData = await fetchWeatherData(normalizedLocation);

    return {
      ...prevState,
      success: true,
      weatherData,
      normalizedLocation, // Se devuelve al cliente para que lo guarde en localStorage
      message: '',
      errorDetail: null,
    };

  } catch (error: any) {
    const errorDetail = error.message || 'Ocurrió un error desconocido.';
    console.error(`[getWeather] Error:`, errorDetail);
    console.error(`[getWeather] Raw error:`, error);
    return { ...prevState, success: false, message: 'fetchError', errorDetail };
  }
}

// ============================================================
// Acción de IA: generación de fondo con Gemini
// ============================================================

export async function generateAndSetBackground(input: { city: string; weather: string }): Promise<string> {
  try {
    const bg = await generateBackground(input);
    return bg.image;
  } catch (e) {
    console.error('[generateAndSetBackground] Error:', e);
    return '';
  }
}

// ============================================================
// Acción de geocoding: exponer sugerencias de ciudades al cliente
// ============================================================

/**
 * Expone el servicio de sugerencias de ciudades como Server Action.
 * Llamado por el componente SearchControls con debounce.
 */
export async function getCitySuggestions(
  query: string,
  language: string,
  count: number = 5,
  userLat?: number,
  userLon?: number
): Promise<CitySuggestion[]> {
  return fetchCitySuggestions(query, language, count, userLat, userLon);
}


