
'use server';

import type { WeatherData, GenerateBackgroundInput, CitySuggestion } from "@/lib/types";
import { generateBackground } from "@/ai/flows/generate-background-flow";
import { getCitySuggestions as fetchCitySuggestions, getCityFromCoords as fetchCityFromCoords } from "@/services/geocoding";
import { getWeatherData as fetchWeatherData } from "@/services/open-meteo";

// This is the primary server action that orchestrates the data fetching.
export async function getWeather(prevState: any, formData: FormData): Promise<any> {
  let locationName = formData.get('location') as string | null;
  let latitude = formData.get('latitude') as string | null;
  let longitude = formData.get('longitude') as string | null;
  
  try {
    // Step 1: Resolve coordinates if not provided
    if (locationName && !latitude && !longitude) {
        const suggestions = await fetchCitySuggestions(locationName, 'en', 1);
        if (suggestions.length > 0) {
            latitude = suggestions[0].lat.toString();
            longitude = suggestions[0].lon.toString();
            locationName = suggestions[0].name; // Use the precise name from the API
        } else {
            const errorDetail = `Could not find city: ${locationName}`;
            return { ...prevState, success: false, message: 'fetchError', errorDetail };
        }
    } 
    // Step 2: Resolve city name if not provided
    else if (latitude && longitude && !locationName) {
       locationName = await fetchCityFromCoords(parseFloat(latitude), parseFloat(longitude));
    } 
    // Step 3: Handle missing data
    else if (!latitude || !longitude) {
        const errorDetail = 'No location information provided.';
        return { ...prevState, success: false, message: 'fetchError', errorDetail };
    }
    
    if (!locationName) locationName = "Current Location";

    // Step 4: Fetch and process weather data
    const weatherData = await fetchWeatherData(latitude, longitude, locationName);
    
    return { ...prevState, success: true, weatherData, message: '', errorDetail: null };

  } catch (error: any) {
    const errorDetail = error.message || 'An unknown error occurred.';
    console.error(`[getWeather] CATCH BLOCK ERROR: ${errorDetail}`);
    return { ...prevState, success: false, message: 'fetchError', errorDetail };
  }
}

// AI Background Generation Action
export async function generateAndSetBackground(input: GenerateBackgroundInput): Promise<string> {
    try {
        const bg = await generateBackground(input);
        return bg.image;
    } catch(e) {
        console.error('Failed to generate background image', e);
        return '';
    }
}

// City Suggestions Action
export async function getCitySuggestions(query: string, language: string, count: number = 5): Promise<CitySuggestion[]> {
  return fetchCitySuggestions(query, language, count);
}
