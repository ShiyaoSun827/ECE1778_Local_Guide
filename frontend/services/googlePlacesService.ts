import {
  GOOGLE_PLACES_API_KEY,
  GOOGLE_PLACES_BASE_URL,
  GOOGLE_PLACES_DEFAULT_FIELD_MASK,
  GOOGLE_PLACE_DETAIL_FIELD_MASK,
  GOOGLE_PLACES_DEFAULT_RADIUS_METERS,
} from "../lib/config";
import { Place } from "../types";

export class GooglePlacesError extends Error {
  status: number;
  payload: unknown;
  endpoint: string;

  constructor(endpoint: string, status: number, payload: unknown) {
    super(
      `Google Places ${endpoint} failed (${status})${
        payload ? `: ${JSON.stringify(payload)}` : ""
      }`
    );
    this.endpoint = endpoint;
    this.status = status;
    this.payload = payload;
  }

  get isQuotaExceeded() {
    return this.status === 429;
  }
}

type NearbySearchOptions = {
  latitude: number;
  longitude: number;
  radius?: number;
  includedTypes?: string[];
  keyword?: string;
  maxResultCount?: number;
};

type TextSearchOptions = {
  query: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  includedTypes?: string[];
  maxResultCount?: number;
};

const ensureApiKey = () => {
  if (!GOOGLE_PLACES_API_KEY) {
    throw new Error(
      "Google Places API key is missing. Set EXPO_PUBLIC_GOOGLE_PLACES_API_KEY."
    );
  }
};

const getHeaders = (fieldMask: string) => ({
  "Content-Type": "application/json",
  "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
  "X-Goog-FieldMask": fieldMask,
});

const withDefaultRadius = (radius?: number) =>
  radius ?? GOOGLE_PLACES_DEFAULT_RADIUS_METERS;

const normalizePlace = (place: any): Place => {
  const now = new Date().toISOString();
  const location = place?.location ?? {};
  const latitude = location.latitude ?? 0;
  const longitude = location.longitude ?? 0;
  const photo = place?.photos?.[0];

  return {
    id: place?.id ?? place?.name ?? `${latitude}${longitude}`,
    name: place?.displayName?.text ?? "Untitled place",
    description:
      place?.editorialSummary?.text ??
      place?.shortFormattedAddress ??
      place?.formattedAddress ??
      "",
    latitude,
    longitude,
    imageUri: getPhotoUrl(photo),
    category:
      place?.primaryTypeDisplayName ??
      formatPlaceType(place?.primaryType ?? place?.types?.[0]),
    address: place?.shortFormattedAddress ?? place?.formattedAddress,
    googleMapsUri: place?.googleMapsUri,
    websiteUri: place?.websiteUri,
    phoneNumber:
      place?.nationalPhoneNumber ?? place?.internationalPhoneNumber ?? undefined,
    rating: place?.rating,
    ratingCount: place?.userRatingCount,
    openNow: place?.currentOpeningHours?.openNow ?? null,
    businessStatus: place?.businessStatus,
    priceLevel: place?.priceLevel,
    tags: place?.types ?? [],
    distanceKm:
      typeof place?.distanceMeters === "number"
        ? place.distanceMeters / 1000
        : undefined,
    isFavorite: false,
    visitCount: 0,
    createdAt: now,
    updatedAt: now,
    source: "google",
    editorialSummary: place?.editorialSummary?.text,
  };
};

const formatPlaceType = (type: string | undefined) => {
  if (!type) return undefined;
  return type
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const getPhotoUrl = (
  photo: { name?: string } | undefined,
  maxWidthPx = 1200
): string | undefined => {
  if (!photo?.name) return undefined;
  const params = new URLSearchParams({
    key: GOOGLE_PLACES_API_KEY,
    maxWidthPx: String(maxWidthPx),
  });
  return `${GOOGLE_PLACES_BASE_URL}/${photo.name}/media?${params.toString()}`;
};

const enrichPlaces = (places: any[]): Place[] =>
  (places ?? []).map(normalizePlace);

const handleGooglePlacesError = async (
  endpoint: string,
  response: Response
): Promise<never> => {
  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = await response.text().catch(() => null);
  }
  throw new GooglePlacesError(endpoint, response.status, payload);
};

export const searchNearbyPlaces = async (
  options: NearbySearchOptions
): Promise<Place[]> => {
  ensureApiKey();
  const {
    latitude,
    longitude,
    radius,
    includedTypes,
    keyword,
    maxResultCount = 20,
  } = options;

  const body: Record<string, unknown> = {
    maxResultCount,
    rankPreference: keyword ? "RELEVANCE" : "DISTANCE",
    locationRestriction: {
      circle: {
        center: { latitude, longitude },
        radius: withDefaultRadius(radius),
      },
    },
  };

  if (includedTypes?.length) {
    body.includedTypes = includedTypes;
  }

  if (keyword) {
    body.keyword = keyword;
  }

  const response = await fetch(`${GOOGLE_PLACES_BASE_URL}/places:searchNearby`, {
    method: "POST",
    headers: getHeaders(GOOGLE_PLACES_DEFAULT_FIELD_MASK),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    await handleGooglePlacesError("nearby search", response);
  }

  const data = await response.json();
  return enrichPlaces(data.places);
};

export const searchPlacesByText = async (
  options: TextSearchOptions
): Promise<Place[]> => {
  ensureApiKey();
  const {
    query,
    latitude,
    longitude,
    radius,
    includedTypes,
    maxResultCount = 15,
  } = options;

  const body: Record<string, unknown> = {
    textQuery: query,
    maxResultCount,
  };

  if (includedTypes?.length) {
    body.includedTypes = includedTypes;
  }

  if (latitude && longitude) {
    body.locationBias = {
      circle: {
        center: { latitude, longitude },
        radius: withDefaultRadius(radius),
      },
    };
  }

  const response = await fetch(`${GOOGLE_PLACES_BASE_URL}/places:searchText`, {
    method: "POST",
    headers: getHeaders(GOOGLE_PLACES_DEFAULT_FIELD_MASK),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    await handleGooglePlacesError("text search", response);
  }

  const data = await response.json();
  return enrichPlaces(data.places);
};

export const fetchPlaceDetails = async (
  placeId: string
): Promise<Place | undefined> => {
  ensureApiKey();
  if (!placeId) return undefined;

  const response = await fetch(
    `${GOOGLE_PLACES_BASE_URL}/places/${placeId}`,
    {
      method: "GET",
      headers: getHeaders(GOOGLE_PLACE_DETAIL_FIELD_MASK),
    }
  );

  if (!response.ok) {
    await handleGooglePlacesError("detail", response);
  }

  const data = await response.json();
  return normalizePlace(data);
};


