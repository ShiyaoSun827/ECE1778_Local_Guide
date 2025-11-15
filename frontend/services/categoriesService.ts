/**
 * Service for fetching place categories from Google Places API
 * Falls back to a default list if API is unavailable
 */

export interface PlaceCategory {
  id: string;
  name: string;
  icon?: string;
}

// Default categories as fallback
const DEFAULT_CATEGORIES: PlaceCategory[] = [
  { id: 'restaurant', name: 'Restaurant', icon: '🍽️' },
  { id: 'cafe', name: 'Cafe', icon: '☕' },
  { id: 'park', name: 'Park', icon: '🌳' },
  { id: 'museum', name: 'Museum', icon: '🏛️' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️' },
  { id: 'hotel', name: 'Hotel', icon: '🏨' },
  { id: 'attraction', name: 'Tourist Attraction', icon: '🎯' },
  { id: 'bar', name: 'Bar', icon: '🍺' },
  { id: 'library', name: 'Library', icon: '📚' },
  { id: 'gym', name: 'Gym', icon: '💪' },
  { id: 'hospital', name: 'Hospital', icon: '🏥' },
  { id: 'school', name: 'School', icon: '🏫' },
];

/**
 * Fetch place categories from Google Places API
 * Note: Requires Google Places API key in environment variables
 * Falls back to default categories if API call fails
 */
export async function fetchPlaceCategories(): Promise<PlaceCategory[]> {
  try {
    // Google Places API endpoint for place types
    // This is a simplified version - in production, you'd use the actual Google Places API
    const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
    
    if (!API_KEY) {
      console.log('No Google Places API key found, using default categories');
      return DEFAULT_CATEGORIES;
    }

    // Google Places API - Place Types endpoint
    // Note: This is a conceptual implementation
    // Actual implementation would use: https://maps.googleapis.com/maps/api/place/nearbysearch/json
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/types/json?key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch categories from Google Places API');
    }

    const data = await response.json();
    
    // Transform Google Places types to our category format
    if (data.types && Array.isArray(data.types)) {
      return data.types.map((type: string, index: number) => ({
        id: type,
        name: formatCategoryName(type),
        icon: DEFAULT_CATEGORIES[index % DEFAULT_CATEGORIES.length]?.icon,
      }));
    }

    return DEFAULT_CATEGORIES;
  } catch (error) {
    console.error('Error fetching place categories:', error);
    // Return default categories as fallback
    return DEFAULT_CATEGORIES;
  }
}

/**
 * Format category name from Google Places type
 * e.g., "restaurant" -> "Restaurant", "tourist_attraction" -> "Tourist Attraction"
 */
function formatCategoryName(type: string): string {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get default categories (for offline use)
 */
export function getDefaultCategories(): PlaceCategory[] {
  return DEFAULT_CATEGORIES;
}

/**
 * Search for categories by name
 */
export function searchCategories(
  query: string,
  categories: PlaceCategory[] = DEFAULT_CATEGORIES
): PlaceCategory[] {
  const lowerQuery = query.toLowerCase();
  return categories.filter(
    (category) =>
      category.name.toLowerCase().includes(lowerQuery) ||
      category.id.toLowerCase().includes(lowerQuery)
  );
}

