/**
 * Utility functions for weather data
 */

import { WeatherCode, WeatherCondition } from "../types/weather";

/**
 * Map WMO weather code to weather condition
 */
export function getWeatherConditionFromCode(code: WeatherCode): WeatherCondition {
  if (code === 0 || code === 1) return "clear";
  if (code === 2) return "partly-cloudy";
  if (code === 3 || code === 45 || code === 48) return "cloudy";
  if (code >= 51 && code <= 57) return "drizzle";
  if (code >= 61 && code <= 67) return "rain";
  if (code >= 71 && code <= 77 || code >= 85 && code <= 86) return "snow";
  if (code >= 80 && code <= 82) return "rain";
  if (code >= 95 && code <= 99) return "thunderstorm";
  return "cloudy";
}

/**
 * Get weather description from WMO weather code
 */
export function getWeatherDescriptionFromCode(code: WeatherCode): string {
  const descriptions: Record<WeatherCode, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Dense freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  return descriptions[code] || "Unknown";
}

/**
 * Get Ionicons icon name based on weather description or code
 */
export function getWeatherIcon(
  description?: string,
  iconCode?: string
): keyof typeof import("@expo/vector-icons").Ionicons.glyphMap {
  if (iconCode) {
    // Map common icon codes to Ionicons
    const iconMap: Record<string, keyof typeof import("@expo/vector-icons").Ionicons.glyphMap> = {
      "01d": "sunny",
      "01n": "moon",
      "02d": "partly-sunny",
      "02n": "cloudy-night",
      "03d": "cloud",
      "03n": "cloud",
      "04d": "cloudy",
      "04n": "cloudy",
      "09d": "rainy",
      "09n": "rainy",
      "10d": "rainy",
      "10n": "rainy",
      "11d": "thunderstorm",
      "11n": "thunderstorm",
      "13d": "snow",
      "13n": "snow",
      "50d": "cloudy",
      "50n": "cloudy",
    };
    if (iconMap[iconCode]) {
      return iconMap[iconCode];
    }
  }

  if (!description) {
    return "partly-sunny-outline";
  }

  const desc = description.toLowerCase();
  
  if (desc.includes("clear") || desc.includes("sunny")) {
    return "sunny-outline";
  }
  if (desc.includes("cloud")) {
    if (desc.includes("partly")) {
      return "partly-sunny-outline";
    }
    return "cloudy-outline";
  }
  if (desc.includes("rain") || desc.includes("drizzle")) {
    return "rainy-outline";
  }
  if (desc.includes("snow")) {
    return "snow-outline";
  }
  if (desc.includes("thunder") || desc.includes("storm")) {
    return "thunderstorm-outline";
  }
  if (desc.includes("fog") || desc.includes("mist")) {
    return "cloudy-outline";
  }

  return "partly-sunny-outline";
}

/**
 * Convert wind speed from m/s to km/h
 */
export function convertWindSpeedToKmh(windSpeedMs: number): number {
  return Math.round(windSpeedMs * 3.6 * 10) / 10;
}

/**
 * Format wind speed for display
 */
export function formatWindSpeed(windSpeedKmh: number | null | undefined): string {
  if (windSpeedKmh === null || windSpeedKmh === undefined || isNaN(windSpeedKmh)) {
    return "N/A";
  }
  return `${windSpeedKmh.toFixed(1)} km/h`;
}

