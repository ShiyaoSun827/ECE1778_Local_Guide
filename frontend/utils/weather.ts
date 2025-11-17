import { WeatherData } from "../types";

// Use Open-Meteo API (free, no API key required)
const WEATHER_BASE_URL = "https://api.open-meteo.com/v1/forecast";

// Weather condition mapping from weather code to readable text
const getWeatherCondition = (code: number): string => {
  // WMO Weather interpretation codes (WW)
  if (code === 0) return "Clear";
  if (code <= 3) return "Cloudy";
  if (code <= 49) return "Foggy";
  if (code <= 59) return "Drizzle";
  if (code <= 69) return "Rain";
  if (code <= 79) return "Snow";
  if (code <= 84) return "Rain";
  if (code <= 86) return "Snow";
  if (code <= 99) return "Thunderstorm";
  return "Weather";
};

const getWeatherDescription = (code: number): string => {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 49) return "Foggy conditions";
  if (code <= 59) return "Light drizzle";
  if (code <= 69) return "Light rain";
  if (code <= 79) return "Light snow";
  if (code <= 84) return "Heavy rain";
  if (code <= 86) return "Heavy snow";
  if (code <= 99) return "Thunderstorm";
  return "Weather data available";
};

export const getWeatherData = async (
  latitude: number,
  longitude: number
): Promise<WeatherData> => {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m,weather_code",
    timezone: "auto",
  });

  const response = await fetch(`${WEATHER_BASE_URL}?${params.toString()}`);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Weather API request failed (${response.status}): ${text}`
    );
  }

  const data = await response.json();

  const current = data.current;
  const temperature = Math.round(current?.temperature_2m ?? 20);
  const weatherCode = current?.weather_code ?? 0;
  const condition = getWeatherCondition(weatherCode);
  const description = getWeatherDescription(weatherCode);

  return {
    temperature,
    condition,
    description,
    icon: undefined, // Open-Meteo doesn't provide icons, but you can add your own icon mapping if needed
  };
};

