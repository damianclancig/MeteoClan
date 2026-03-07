
import type { WeatherData, OpenMeteoWeatherData } from "@/lib/types";
import { processWeatherData } from "@/lib/weather-utils";

/**
 * Fetches weather data from the Open-Meteo API and processes it.
 * @param latitude - The latitude for the weather forecast.
 * @param longitude - The longitude for the weather forecast.
 * @param locationName - The display name for the location.
 * @returns A promise that resolves to the structured WeatherData.
 */
export async function getWeatherData(latitude: string, longitude: string, locationName: string): Promise<WeatherData> {
  const weatherParams = new URLSearchParams({
    latitude: latitude,
    longitude: longitude,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m",
    hourly: "temperature_2m,precipitation_probability,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant",
    timezone: "auto",
    forecast_days: "7", // Fetch 7 days to have today + 6 days forecast
  });

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?${weatherParams}`;
  const weatherResponse = await fetch(weatherUrl, {
    next: { revalidate: 300 } // Cache weather data for 5 minutes
  });

  if (!weatherResponse.ok) {
    const errorData = await weatherResponse.json();
    console.error(`[getWeatherData] API Error: ${errorData.reason}`);
    throw new Error(`API Error: ${errorData.reason}`);
  }

  const weatherAPIData: OpenMeteoWeatherData = await weatherResponse.json();

  // Process the raw data into our app's format
  return processWeatherData(weatherAPIData, locationName);
}
