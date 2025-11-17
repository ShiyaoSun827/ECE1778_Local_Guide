export interface PlaceCategory {
  id: string;
  name: string;
  icon: string;
  gradient: [string, string];
  includedTypes?: string[];
  keyword?: string;
  radius?: number;
}

const FEATURED_CATEGORIES: PlaceCategory[] = [
  {
    id: "trending",
    name: "Trending",
    icon: "🔥",
    gradient: ["#ff7e5f", "#feb47b"],
    includedTypes: ["tourist_attraction", "cafe", "bar", "restaurant"],
  },
  {
    id: "food",
    name: "Eats",
    icon: "🍽️",
    gradient: ["#ff512f", "#f09819"],
    includedTypes: ["restaurant"],
  },
  {
    id: "shopping",
    name: "Shops",
    icon: "🛍️",
    gradient: ["#6a11cb", "#2575fc"],
    includedTypes: ["shopping_mall", "clothing_store", "store"],
  },
  {
    id: "nature",
    name: "Outdoors",
    icon: "🌿",
    gradient: ["#11998e", "#38ef7d"],
    includedTypes: ["park", "tourist_attraction"],
  },
  {
    id: "nightlife",
    name: "Nightlife",
    icon: "🌙",
    gradient: ["#141e30", "#243b55"],
    includedTypes: ["bar", "night_club"],
  },
  {
    id: "arts",
    name: "Arts & Culture",
    icon: "🎨",
    gradient: ["#8e2de2", "#4a00e0"],
    includedTypes: ["museum", "art_gallery", "library"],
  },
  {
    id: "wellness",
    name: "Wellness",
    icon: "💆",
    gradient: ["#00c6ff", "#0072ff"],
    includedTypes: ["spa", "gym"],
  },
];

export async function fetchPlaceCategories(): Promise<PlaceCategory[]> {
  return FEATURED_CATEGORIES;
}

export function getDefaultCategories(): PlaceCategory[] {
  return FEATURED_CATEGORIES;
}

export function searchCategories(
  query: string,
  categories: PlaceCategory[] = FEATURED_CATEGORIES
): PlaceCategory[] {
  const lowerQuery = query.toLowerCase();
  return categories.filter(
    (category) =>
      category.name.toLowerCase().includes(lowerQuery) ||
      category.id.toLowerCase().includes(lowerQuery)
  );
}

