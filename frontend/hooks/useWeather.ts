import { useState, useEffect, useCallback } from 'react';
import { WeatherData } from '../types';
import { getWeatherData } from '../utils/weather';

export const useWeather = (latitude?: number, longitude?: number) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    if (latitude === undefined || longitude === undefined) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getWeatherData(latitude, longitude);
      setWeather(data);
    } catch (err) {
      setError('Failed to fetch weather data');
      console.error('Error fetching weather:', err);
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    if (latitude !== undefined && longitude !== undefined) {
      fetchWeather();
    }
  }, [latitude, longitude, fetchWeather]);

  return {
    weather,
    loading,
    error,
    refetch: fetchWeather,
  };
};

