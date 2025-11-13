/**
 * Utility functions for calculating distances
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Validate coordinates
 */
export function isValidCoordinate(coord: Coordinates): boolean {
  return (
    typeof coord.latitude === "number" &&
    typeof coord.longitude === "number" &&
    !isNaN(coord.latitude) &&
    !isNaN(coord.longitude) &&
    coord.latitude >= -90 &&
    coord.latitude <= 90 &&
    coord.longitude >= -180 &&
    coord.longitude <= 180
  );
}

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * Returns distance in kilometers
 * @throws Error if coordinates are invalid
 */
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  if (!isValidCoordinate(coord1) || !isValidCoordinate(coord2)) {
    throw new Error("Invalid coordinates provided");
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) *
      Math.cos(toRadians(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Round to 2 decimal places for precision
  return Math.round(distance * 100) / 100;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance to a human-readable string
 */
export function formatDistance(distanceInKm: number | null | undefined): string {
  if (distanceInKm === null || distanceInKm === undefined || isNaN(distanceInKm) || distanceInKm < 0) {
    return "N/A";
  }

  if (distanceInKm < 0.001) {
    return "< 1m";
  } else if (distanceInKm < 1) {
    const meters = Math.round(distanceInKm * 1000);
    return `${meters}m`;
  } else if (distanceInKm < 10) {
    return `${distanceInKm.toFixed(1)}km`;
  } else {
    return `${Math.round(distanceInKm)}km`;
  }
}

/**
 * Check if a coordinate is within a certain radius of another coordinate
 * @throws Error if coordinates are invalid
 */
export function isWithinRadius(
  coord1: Coordinates,
  coord2: Coordinates,
  radiusInKm: number
): boolean {
  if (radiusInKm < 0) {
    throw new Error("Radius must be a positive number");
  }
  return calculateDistance(coord1, coord2) <= radiusInKm;
}

/**
 * Get the nearest coordinate from a list of coordinates
 * @returns null if no valid coordinates found
 */
export function getNearestCoordinate(
  target: Coordinates,
  coordinates: Coordinates[]
): { coordinate: Coordinates; distance: number } | null {
  if (!isValidCoordinate(target)) {
    return null;
  }

  const validCoordinates = coordinates.filter(isValidCoordinate);
  
  if (validCoordinates.length === 0) {
    return null;
  }

  let nearest = validCoordinates[0];
  let minDistance = calculateDistance(target, nearest);

  for (let i = 1; i < validCoordinates.length; i++) {
    try {
      const distance = calculateDistance(target, validCoordinates[i]);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = validCoordinates[i];
      }
    } catch (error) {
      // Skip invalid coordinates
      continue;
    }
  }

  return { coordinate: nearest, distance: minDistance };
}

/**
 * Calculate bearing between two coordinates (in degrees)
 */
export function calculateBearing(coord1: Coordinates, coord2: Coordinates): number {
  if (!isValidCoordinate(coord1) || !isValidCoordinate(coord2)) {
    throw new Error("Invalid coordinates provided");
  }

  const lat1 = toRadians(coord1.latitude);
  const lat2 = toRadians(coord2.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  const bearing = Math.atan2(y, x);
  return (toDegrees(bearing) + 360) % 360;
}

/**
 * Convert radians to degrees
 */
function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

