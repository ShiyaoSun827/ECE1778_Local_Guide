export type PlaceSource = "custom" | "google" | "favorite";

export interface Place {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  imageUri?: string;
  heroImageUri?: string;
  category?: string;
  address?: string;
  googleMapsUri?: string;
  websiteUri?: string;
  phoneNumber?: string;
  rating?: number;
  ratingCount?: number;
  priceLevel?: number;
  openNow?: boolean | null;
  businessStatus?: string;
  tags?: string[];
  distanceKm?: number;
  editorialSummary?: string;
  source?: PlaceSource;
  isFavorite: boolean;
  visitCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlaceFormData {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  imageUri?: string;
  category?: string;
  address?: string;
}

