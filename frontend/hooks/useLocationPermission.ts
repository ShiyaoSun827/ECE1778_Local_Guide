import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

export const useLocationPermission = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);

  const requestPermission = useCallback(async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === 'granted');

      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setHasPermission(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  const getCurrentLocation = useCallback(async () => {
    if (!hasPermission) {
      await requestPermission();
    }
    if (hasPermission) {
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      return currentLocation;
    }
    return null;
  }, [hasPermission, requestPermission]);

  return {
    hasPermission,
    location,
    loading,
    requestPermission,
    getCurrentLocation,
  };
};

