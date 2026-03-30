
// ============================================================
// App Internal Types (used across the entire application)
// ============================================================

/** Datos meteorológicos del momento actual, normalizados para la UI. */
export interface CurrentWeather {
  location: string;
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  wind_direction: number;
  description: string; // Clave de traducción (ej: 'clear_sky')
  main: string;        // Categoría general (ej: 'Clear')
  pop: number;         // Probabilidad de precipitación (0-100)
  dt: string;          // ISO Date String
  temp_min: number;
  temp_max: number;
  sunrise: string;     // ISO 8601 Date string
  sunset: string;      // ISO 8601 Date string
  timezone: string;    // IANA timezone (ej: 'America/Argentina/Buenos_Aires')
  weatherCode: number; // OWM weather condition ID (ej: 800)
  weatherIcon: string; // OWM icon code (ej: '01d')
  latitude: number;
}

/** Pronóstico para un día específico. */
export interface DailyForecast {
  dt: string;         // Fecha 'YYYY-MM-DD'
  temp_min: number;
  temp_max: number;
  main: string;
  description: string;
  pop: number;        // Probabilidad de precipitación (0-100)
  hourly: HourlyForecast[];
  humidity: number;
  wind_speed: number;
  wind_direction: number;
  temp: number;
  feels_like: number;
  weatherCode: number;
  weatherIcon: string;
  sunrise: string;    // ISO 8601 Date string
  sunset: string;     // ISO 8601 Date string
  // Datos astronómicos lunares de OWM
  moonrise?: string;  // ISO 8601 Date string
  moonset?: string;   // ISO 8601 Date string
  moon_phase?: number; // Valor 0-1 (OWM)
}

/** Pronóstico para una hora específica. */
export interface HourlyForecast {
  time: string;       // ISO 8601 Date String
  temp: number;
  main: string;
  pop: number;        // Probabilidad de precipitación (0-100)
  weatherCode: number;
  weatherIcon: string;
}

/** Estructura principal de datos meteorológicos de la app. */
export interface WeatherData {
  current: CurrentWeather;
  forecast: DailyForecast[]; // 8 días (desde mañana)
  hourly: HourlyForecast[];  // Horas del día actual
  latitude: number;
  lastUpdated: string;       // ISO string del momento de generación
  /** Array diario crudo de OWM para datos astronómicos del MoonCalendar. */
  owmRawDaily?: OWMWeatherData['daily'];
}

/** Sugerencia de ciudad para el buscador. */
export interface CitySuggestion {
  name: string;
  lat: number;
  lon: number;
}

// ============================================================
// OWM Geocoding API Types
// ============================================================

/** Resultado de la Geocoding API de OpenWeatherMap. */
export interface GeocodingResult {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

/**
 * Ubicación normalizada, lista para ser usada como clave de caché.
 * Se persiste en localStorage para evitar re-geocoding.
 */
export interface NormalizedLocation {
  cityKey: string;    // Formato: "nombre-estado-pais" (ej: "bernal-buenos-aires-ar")
  displayName: string; // Formato: "Nombre, Estado, País"
  lat: number;
  lon: number;
}

// ============================================================
// OpenWeatherMap One Call API 3.0 Raw Types
// ============================================================

/** Respuesta cruda de la OWM One Call API 3.0. */
export interface OWMWeatherData {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current: {
    dt: number;
    sunrise: number;
    sunset: number;
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    wind_speed: number;
    wind_deg: number;
    pop?: number;
    weather: Array<{ id: number; main: string; description: string; icon: string }>;
  };
  hourly: Array<{
    dt: number;
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    wind_deg: number;
    pop: number; // 0 a 1
    weather: Array<{ id: number; main: string; description: string; icon: string }>;
  }>;
  daily: Array<{
    dt: number;
    sunrise: number;
    sunset: number;
    moonrise: number;
    moonset: number;
    moon_phase: number; // 0 a 1
    summary?: string;
    temp: { min: number; max: number; day: number; night: number; eve: number; morn: number };
    feels_like: { day: number; night: number; eve: number; morn: number };
    pressure: number;
    humidity: number;
    wind_speed: number;
    wind_deg: number;
    pop: number; // 0 a 1
    weather: Array<{ id: number; main: string; description: string; icon: string }>;
  }>;
}

// ============================================================
// Supporting Types
// ============================================================

/** Información de código WMO para compatibilidad con iconos. */
export interface WeatherCodeInfo {
  description: string;
  image: string;
}

/** Input para el flujo de IA de generación de fondo. */
export interface GenerateBackgroundInput {
  city: string;
  weather: string;
}
