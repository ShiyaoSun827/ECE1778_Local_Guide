export interface Place {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  imageUri?: string;
  isFavorite: boolean;
  visitCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlaceFormData {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  imageUri?: string;
}

