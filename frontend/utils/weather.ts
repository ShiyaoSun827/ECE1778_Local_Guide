import { WeatherData } from '../types';

// Mock weather data - in production, this would call a weather API
export const getWeatherData = async (
  latitude: number,
  longitude: number
): Promise<WeatherData> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock weather data based on coordinates
  const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  
  const temperature = Math.floor(Math.random() * 30) + 10; // 10-40°C

  return {
    temperature,
    condition,
    description: `${condition} with a temperature of ${temperature}°C`,
  };
};

