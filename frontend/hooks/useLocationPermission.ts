import { useState, useEffect } from "react";
import * as Location from "expo-location";

export interface UseLocationPermissionReturn {
  granted: boolean;
  status: Location.PermissionStatus | null;
  requestPermission: () => Promise<boolean>;
  isLoading: boolean;
}

export function useLocationPermission(): UseLocationPermissionReturn {
  const [granted, setGranted] = useState(false);
  const [status, setStatus] = useState<Location.PermissionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      setIsLoading(true);
      const { status: currentStatus } = await Location.getForegroundPermissionsAsync();
      setStatus(currentStatus);
      setGranted(currentStatus === "granted");
    } catch (error) {
      console.error("Error checking location permission:", error);
      setStatus("undetermined");
      setGranted(false);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
      setStatus(newStatus);
      const isGranted = newStatus === "granted";
      setGranted(isGranted);
      return isGranted;
    } catch (error) {
      console.error("Error requesting location permission:", error);
      setStatus("denied");
      setGranted(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { granted, status, requestPermission, isLoading };
}
