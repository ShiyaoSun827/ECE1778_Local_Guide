// frontend/services/favoritesService.ts
import { API_BASE_URL } from "../lib/config";
import { Place } from "../types";

const buildHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

export async function fetchFavoritePlaces(token?: string): Promise<Place[]> {
  const res = await fetch(`${API_BASE_URL}/api/favorites`, {
    method: "GET",
    headers: buildHeaders(token),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch favorites: ${res.status}`);
  }

  return res.json();
}

export async function saveFavoritePlace(place: Place, token?: string) {
  const res = await fetch(`${API_BASE_URL}/api/favorites`, {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify({ place }),
  });

  if (!res.ok) {
    throw new Error(`Failed to save favorite: ${res.status}`);
  }
}

export async function deleteFavoritePlace(placeId: string, token?: string) {
  const res = await fetch(`${API_BASE_URL}/api/favorites?placeId=${encodeURIComponent(placeId)}`, {
    method: "DELETE",
    headers: buildHeaders(token),
  });

  if (!res.ok) {
    throw new Error(`Failed to delete favorite: ${res.status}`);
  }
}