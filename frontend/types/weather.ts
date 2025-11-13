/**
 * Weather data type definitions
 */

export interface WeatherData {
  temperature: number; // in Celsius
  description: string; // e.g., "clear sky", "light rain"
  humidity?: number; // percentage (0-100)
  windSpeed?: number; // in km/h
  icon?: string; // weather icon code
  timestamp: string; // ISO 8601 date string
  weatherCode?: WeatherCode; // WMO weather code
}

export interface WeatherApiResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m?: number;
    weather_code?: number;
    wind_speed_10m?: number;
  };
  current_units?: {
    temperature_2m: string;
    relative_humidity_2m?: string;
    wind_speed_10m?: string;
  };
}

/**
 * Weather condition categories
 */
export type WeatherCondition =
  | "clear"
  | "partly-cloudy"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "thunderstorm";

export type WeatherCode =
  | 0 // Clear sky
  | 1 // Mainly clear
  | 2 // Partly cloudy
  | 3 // Overcast
  | 45 // Fog
  | 48 // Depositing rime fog
  | 51 // Light drizzle
  | 53 // Moderate drizzle
  | 55 // Dense drizzle
  | 56 // Light freezing drizzle
  | 57 // Dense freezing drizzle
  | 61 // Slight rain
  | 63 // Moderate rain
  | 65 // Heavy rain
  | 66 // Light freezing rain
  | 67 // Dense freezing rain
  | 71 // Slight snow fall
  | 73 // Moderate snow fall
  | 75 // Heavy snow fall
  | 77 // Snow grains
  | 80 // Slight rain showers
  | 81 // Moderate rain showers
  | 82 // Violent rain showers
  | 85 // Slight snow showers
  | 86 // Heavy snow showers
  | 95 // Thunderstorm
  | 96 // Thunderstorm with slight hail
  | 99; // Thunderstorm with heavy hail

