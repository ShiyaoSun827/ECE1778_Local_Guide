import { WeatherData } from "../types";

const WEATHER_API_KEY =
  process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY ??
  process.env.OPENWEATHER_API_KEY ??
  "f08afc21c7d4a33a3b0d0f2794c3459f"; // fallback for dev

const WEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

const kelvinToCelsius = (kelvin: number) =>
  Math.round((kelvin - 273.15) * 10) / 10;

export const getWeatherData = async (
  latitude: number,
  longitude: number
): Promise<WeatherData> => {
  if (!WEATHER_API_KEY) {
    throw new Error("OpenWeather API key missing");
  }

  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    appid: WEATHER_API_KEY,
    units: "metric",
  });

  const response = await fetch(`${WEATHER_BASE_URL}?${params.toString()}`);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `OpenWeather request failed (${response.status}): ${text}`
    );
  }

  const data = await response.json();

  const condition = data.weather?.[0]?.main ?? "Weather";
  const description =
    data.weather?.[0]?.description ?? "Weather data currently unavailable.";
  const temperature =
    typeof data.main?.temp === "number"
      ? Math.round(data.main.temp)
      : kelvinToCelsius(data.main?.temp ?? 298.15);

  return {
    temperature,
    condition,
    description: description.replace(
      /\b\w/g,
      (ch: string) => ch.toUpperCase()
    ),
    icon: data.weather?.[0]?.icon
      ? `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
      : undefined,
  };
};

