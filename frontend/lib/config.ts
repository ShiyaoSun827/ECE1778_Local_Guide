// frontend/lib/config.ts
// IMPORTANT: After changing .env, restart Expo with: npx expo start --clear
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 
  "https://local-guide-backend.fly.dev"; // Fallback to production URL

export const GOOGLE_PLACES_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ??
  "AIzaSyAygeIYYtdDUOEHRM0R2bO67qsnfugUAvQ";

export const GOOGLE_PLACES_BASE_URL = "https://places.googleapis.com/v1";

export const GOOGLE_PLACES_DEFAULT_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.shortFormattedAddress",
  "places.formattedAddress",
  "places.location",
  "places.rating",
  "places.userRatingCount",
  "places.businessStatus",
  "places.currentOpeningHours",
  "places.primaryType",
  "places.types",
  "places.websiteUri",
  "places.googleMapsUri",
  "places.nationalPhoneNumber",
  "places.priceLevel",
  "places.photos",
  "places.editorialSummary",
].join(",");

export const GOOGLE_PLACE_DETAIL_FIELD_MASK = [
  "id",
  "displayName",
  "shortFormattedAddress",
  "formattedAddress",
  "location",
  "rating",
  "userRatingCount",
  "businessStatus",
  "currentOpeningHours",
  "regularOpeningHours",
  "primaryType",
  "types",
  "websiteUri",
  "googleMapsUri",
  "nationalPhoneNumber",
  "internationalPhoneNumber",
  "priceLevel",
  "photos",
  "editorialSummary",
  "reviews",
].join(",");

export const GOOGLE_PLACES_DEFAULT_RADIUS_METERS = 2500;