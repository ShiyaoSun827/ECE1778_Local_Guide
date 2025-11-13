/**
 * Place (Point of Interest) type definitions
 */

export interface Place {
  id: string;
  title: string;
  address?: string;
  description?: string;
  photoUri?: string | null;
  latitude?: number;
  longitude?: number;
  isFavorite?: boolean;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  category?: string;
  tags?: string[];
  distance?: number; // Distance in kilometers (calculated field)
}

export interface PlaceFormData {
  title: string;
  address?: string;
  description?: string;
  photoUri?: string | null;
  latitude?: number;
  longitude?: number;
  category?: string;
  tags?: string[];
}

export interface PlaceFilters {
  searchQuery?: string;
  favoritesOnly?: boolean;
  category?: string;
  tags?: string[];
  sortBy?: PlaceSortOption;
  sortOrder?: "asc" | "desc";
  maxDistance?: number; // Maximum distance in kilometers
}

export type PlaceSortOption = "name" | "date" | "distance";

export interface PlaceCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Check if a Place has valid coordinates
 */
export function hasCoordinates(place: Place): place is Place & PlaceCoordinates {
  return (
    place.latitude !== undefined &&
    place.longitude !== undefined &&
    !isNaN(place.latitude) &&
    !isNaN(place.longitude) &&
    place.latitude >= -90 &&
    place.latitude <= 90 &&
    place.longitude >= -180 &&
    place.longitude <= 180
  );
}

/**
 * Create a new Place from form data
 */
export function createPlaceFromFormData(
  formData: PlaceFormData,
  id?: string
): Omit<Place, "id" | "createdAt" | "updatedAt"> {
  const now = new Date().toISOString();
  return {
    ...formData,
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
  };
}

