
import type { WeatherData, DailyForecast, HourlyForecast, OpenMeteoWeatherData, WeatherCodeInfo } from "@/lib/types";
import { weatherCodes } from "@/lib/weather-codes";

/**
 * Gets a sanitized, key-friendly weather description from a WMO code.
 * @param code - The WMO weather code.
 * @returns A string key for translation (e.g., 'clear_sky').
 */
export const getWeatherDescriptionFromCode = (code: number): string => {
  const codeInfo: WeatherCodeInfo = weatherCodes[code] || weatherCodes[0];
  // Sanitize the description to create a valid key: lowercase and replace non-alphanumerics with underscores.
  return codeInfo.description.replace(/: /g, '_').replace(/ /g, '_').toLowerCase();
};

/**
 * Gets a general weather category (e.g., 'Clear', 'Rain') from a WMO code.
 * @param code - The WMO weather code.
 * @returns A general weather category string.
 */
export const getMainWeatherFromCode = (code: number): string => {
  if ([0, 1].includes(code)) return 'Clear';
  if ([2, 3].includes(code)) return 'Clouds';
  if ([45, 48].includes(code)) return 'Fog';
  if (code >= 51 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Clear';
};

/**
 * Determines the most frequent weather code for daytime hours (7am-7pm) from a list of hourly codes.
 * @param hourlyCodes - An array of WMO weather codes for a single day.
 * @returns The dominant daytime weather code.
 */
export const getDominantWeatherCode = (hourlyCodes: number[]): number => {
    if (!hourlyCodes || hourlyCodes.length === 0) return 0;

    // We only care about daytime weather for the daily summary icon (e.g. 7am to 7pm)
    const daytimeCodes = hourlyCodes.slice(7, 19);

    if (daytimeCodes.length === 0) {
        return hourlyCodes[Math.floor(hourlyCodes.length / 2)] || 0;
    }
    
    const codeCounts = daytimeCodes.reduce((acc, code) => {
        acc[code] = (acc[code] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);

    // Find the most frequent code
    const dominantCode = Object.entries(codeCounts).reduce((a, b) => (b[1] > a[1] ? b : a))[0];

    return parseInt(dominantCode, 10);
};

/**
 * Determines if the current time is considered night based on sunrise and sunset times.
 * @param sunrise - ISO string for sunrise.
 * @param sunset - ISO string for sunset.
 * @returns True if it is currently night, false otherwise.
 */
export const isNightTime = (sunrise?: string, sunset?: string): boolean => {
    if (!sunrise || !sunset) return false;

    const sunriseTimestamp = new Date(sunrise).getTime();
    const sunsetTimestamp = new Date(sunset).getTime();
    const nowTimestamp = Date.now();

    return nowTimestamp < sunriseTimestamp || nowTimestamp > sunsetTimestamp;
}

/**
 * Processes the raw API response from Open-Meteo into the structured WeatherData format used by the app.
 * @param apiData - The raw weather data from the Open-Meteo API.
 * @param locationName - The name of the location for which the weather is being fetched.
 * @returns A structured WeatherData object.
 */
export function processWeatherData(apiData: OpenMeteoWeatherData, locationName: string): WeatherData {
    const { daily: dailyData, hourly: hourlyData, current: currentData, timezone, latitude: apiLatitude } = apiData;

    if (!currentData) {
        throw new Error("API response did not include 'current' weather data.");
    }
    
    // Process 6-day forecast (from tomorrow, so i=1 to i=6)
    const forecastData: DailyForecast[] = [];
    for (let i = 1; i <= 6; i++) {
        const forecastDateStr = dailyData.time[i]; // e.g. "2024-07-30"
        
        const dayHourlyData = hourlyData.time
            .map((t, index) => ({ time: t, index })) // Keep original index
            .filter(item => item.time.startsWith(forecastDateStr))
            .map(item => ({
                time: item.time,
                temp: Math.round(hourlyData.temperature_2m[item.index]),
                main: getMainWeatherFromCode(hourlyData.weather_code[item.index]),
                pop: hourlyData.precipitation_probability[item.index],
                weatherCode: hourlyData.weather_code[item.index],
            }));
        
        const hourlyCodesForDay = dayHourlyData.map(h => h.weatherCode);
        const dominantCode = getDominantWeatherCode(hourlyCodesForDay);
        
        const dayForecast: DailyForecast = {
            dt: forecastDateStr,
            temp_min: Math.round(dailyData.temperature_2m_min[i]),
            temp_max: Math.round(dailyData.temperature_2m_max[i]),
            main: getMainWeatherFromCode(dominantCode),
            description: getWeatherDescriptionFromCode(dominantCode),
            pop: dailyData.precipitation_probability_max[i],
            hourly: dayHourlyData,
            humidity: 0, // Not available in daily forecast, would need to average hourly
            wind_speed: dailyData.wind_speed_10m_max[i], 
            wind_direction: dailyData.wind_direction_10m_dominant[i],
            temp: Math.round((dailyData.temperature_2m_max[i] + dailyData.temperature_2m_min[i]) / 2),
            feels_like: Math.round((dailyData.temperature_2m_max[i] + dailyData.temperature_2m_min[i]) / 2), // Approximation
            weatherCode: dominantCode,
            sunrise: dailyData.sunrise[i],
            sunset: dailyData.sunset[i],
        };
        forecastData.push(dayForecast);
    }
    
    // Process Today's hourly data
    const todayDateStr = dailyData.time[0];
    const todayHourlyForecast: HourlyForecast[] = hourlyData.time
        .map((t, index) => ({ time: t, index }))
        .filter(item => item.time.startsWith(todayDateStr))
        .map(item => ({
            time: item.time,
            temp: Math.round(hourlyData.temperature_2m[item.index]),
            main: getMainWeatherFromCode(hourlyData.weather_code[item.index]),
            pop: hourlyData.precipitation_probability[item.index],
            weatherCode: hourlyData.weather_code[item.index],
        }));
    
    // Use hourly data for current pop, find the closest hour
    const now = new Date();
    const closestHourIndex = hourlyData.time.findIndex(
      (timeStr) => new Date(timeStr).getTime() >= now.getTime()
    );
    const currentPop = hourlyData.precipitation_probability[closestHourIndex > 0 ? closestHourIndex -1 : 0];

    const weatherData: WeatherData = {
      current: {
        location: locationName,
        temp: currentData.temperature_2m,
        feels_like: currentData.apparent_temperature,
        humidity: currentData.relative_humidity_2m,
        wind_speed: currentData.wind_speed_10m,
        wind_direction: currentData.wind_direction_10m,
        description: getWeatherDescriptionFromCode(currentData.weather_code),
        main: getMainWeatherFromCode(currentData.weather_code),
        pop: currentPop,
        dt: new Date().toISOString(),
        temp_min: dailyData.temperature_2m_min[0],
        temp_max: dailyData.temperature_2m_max[0],
        sunrise: dailyData.sunrise[0],
        sunset: dailyData.sunset[0],
        timezone: timezone,
        weatherCode: currentData.weather_code,
        latitude: apiLatitude,
      },
      forecast: forecastData,
      hourly: todayHourlyForecast,
      latitude: apiLatitude,
    };

    return weatherData;
}
