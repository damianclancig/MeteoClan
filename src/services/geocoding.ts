
import type { CitySuggestion } from "@/lib/types";

/**
 * Fetches city name from geographical coordinates using BigDataCloud API.
 * @param lat - Latitude.
 * @param lon - Longitude.
 * @returns The name of the city.
 */
export async function getCityFromCoords(lat: number, lon: number): Promise<string> {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=es`;
    try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
            console.error(`[getCityFromCoords] API Error: ${res.statusText}`);
            return "Current Location";
        }
        const data = await res.json();
        
        const mostSpecificAdmin = data.localityInfo?.administrative?.sort((a: any, b: any) => b.order - a.order)[0];
        const city = mostSpecificAdmin?.name || data.city || data.locality || data.principalSubdivision || "Current Location";

        return city;
    } catch (error: any) {
        console.error(`[getCityFromCoords] CATCH BLOCK ERROR: ${error.message}`);
        return "Current Location";
    }
}

/**
 * Fetches city suggestions from Open-Meteo Geocoding API based on a query.
 * @param query - The search query string.
 * @param language - The language for the results.
 * @param count - The number of suggestions to return.
 * @returns An array of city suggestions.
 */
export async function getCitySuggestions(query: string, language: string, count: number = 5): Promise<CitySuggestion[]> {
  if (query.length < 3) {
    return [];
  }

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=${count}&format=json&language=${language}`;
  
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
    if (!response.ok) {
      console.error(`[getCitySuggestions] API Error: ${response.statusText}`);
      return [];
    }
    const data = await response.json();
    const results = data.results || [];

    if (!results || results.length === 0) return [];

    const suggestions: CitySuggestion[] = [];
    const seen = new Set<string>();

    results.forEach((item: any) => {
      let name = item.name;
      if (item.admin1 && item.name !== item.admin1) {
          name += `, ${item.admin1}`;
      }
      if (item.country) {
          name += `, ${item.country}`;
      }

      if (!seen.has(name)) {
        suggestions.push({
          name: name,
          lat: item.latitude,
          lon: item.longitude,
        });
        seen.add(name);
      }
    });

    return suggestions;
  } catch (error) {
    console.error("[getCitySuggestions] Fetch Error:", error);
    return [];
  }
}
