// frontend/context/PlacesContext.tsx
import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Place, PlaceFormData } from "../types";
import {
  searchNearbyPlaces,
  searchPlacesByText,
  fetchPlaceDetails as fetchGooglePlaceDetails,
  GooglePlacesError,
} from "../services/googlePlacesService";
import {
  getDefaultCategories,
  PlaceCategory,
} from "../services/categoriesService";
import { useLocationPermission } from "../hooks/useLocationPermission";
import { calculateDistance } from "../utils";
import { apiFetch } from "../lib/apiClient"; // [新增] 引入带 Cookie 的 apiFetch

const CUSTOM_STORAGE_KEY = "@localguide:customPlaces";

const MIN_DISCOVER_REFRESH_INTERVAL = 30 * 1000;
const NEARBY_CACHE_TTL = 5 * 60 * 1000;
const SEARCH_CACHE_TTL = 2 * 60 * 1000;
const MIN_SEARCH_QUERY_LENGTH = 3;
const MAX_DISCOVER_RESULTS = 6;
const MAX_SEARCH_RESULTS = 10;

type RefreshDiscoverOptions = {
  force?: boolean;
};

interface PlacesContextType {
  places: Place[];
  favorites: Place[];
  discoverPlaces: Place[];
  searchResults: Place[];
  categories: PlaceCategory[];
  activeCategory: string;
  loading: boolean;
  discoverLoading: boolean;
  searchLoading: boolean;
  locationLoading: boolean;
  locationPermissionGranted: boolean | null;
  error: string | null;
  currentCoordinates: { latitude: number; longitude: number } | null;
  addPlace: (formData: PlaceFormData) => Promise<Place>;
  updatePlace: (id: string, updates: Partial<Place>) => Promise<void>;
  deletePlace: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  incrementVisitCount: (id: string) => Promise<void>;
  getPlace: (id: string) => Place | undefined;
  getFavorites: () => Place[];
  refresh: () => Promise<void>;
  refreshDiscover: (options?: RefreshDiscoverOptions) => Promise<void>;
  searchGooglePlaces: (query: string) => Promise<void>;
  fetchPlaceDetails: (id: string) => Promise<Place | undefined>;
  setActiveCategory: (categoryId: string) => void;
}

const PlacesContext = createContext<PlacesContextType | undefined>(undefined);

interface PlacesProviderProps {
  children: ReactNode;
}

export function PlacesProvider({ children }: PlacesProviderProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [favorites, setFavorites] = useState<Place[]>([]);
  const [discoverPlaces, setDiscoverPlaces] = useState<Place[]>([]);
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [discoverLoading, setDiscoverLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategoryState] = useState<string>(
    getDefaultCategories()[0]?.id ?? "trending"
  );

  const categories = useMemo(() => getDefaultCategories(), []);
  const detailCache = useRef<Map<string, Place>>(new Map());
  const searchCounter = useRef(0);
  const lastDiscoverFetch = useRef(0);
  const nearbyCache = useRef<
    Map<string, { timestamp: number; places: Place[] }>
  >(new Map());
  const searchCache = useRef<
    Map<string, { timestamp: number; places: Place[] }>
  >(new Map());
  const placesRef = useRef<Place[]>([]);

  useEffect(() => {
    placesRef.current = places;
  }, [places]);

  const handleSetActiveCategory = useCallback((categoryId: string) => {
    setActiveCategoryState(categoryId);
  }, []);

  const {
    hasPermission: locationPermissionGranted,
    location,
    loading: locationLoading,
    requestPermission,
  } = useLocationPermission();

  const currentCoordinates = useMemo(() => {
    if (!location?.coords) return null;
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  }, [location?.coords?.latitude, location?.coords?.longitude]);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((fav) => fav.id)),
    [favorites]
  );

  const enrichPlace = useCallback(
    (place: Place): Place => {
      if (!place) return place;
      const distanceKm =
        typeof place.distanceKm === "number" || !currentCoordinates
          ? place.distanceKm
          : calculateDistance(
              currentCoordinates.latitude,
              currentCoordinates.longitude,
              place.latitude,
              place.longitude
            );

      const source = place.source ?? "google";
      return {
        ...place,
        distanceKm,
        source,
        isFavorite:
          source === "custom" ? place.isFavorite : favoriteIds.has(place.id),
      };
    },
    [currentCoordinates, favoriteIds]
  );

  const enrichList = useCallback(
    (list: Place[]) => list.map(enrichPlace),
    [enrichPlace]
  );

  const hydrateCustomPlaces = (items: Place[]) =>
    (items ?? []).map((place) => {
      const now = new Date().toISOString();
      return {
        ...place,
        isFavorite: place.isFavorite ?? false,
        visitCount: place.visitCount ?? 0,
        createdAt: place.createdAt ?? now,
        updatedAt: place.updatedAt ?? now,
        source: "custom" as const,
      };
    });

  const loadCustomPlaces = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem(CUSTOM_STORAGE_KEY);
      if (data) {
        setPlaces(hydrateCustomPlaces(JSON.parse(data)));
      }
    } catch (err) {
      console.error("Error loading custom places:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // [修改] 使用 apiFetch 加载收藏，这样会自动携带 Cookie
  const loadFavoritePlaces = useCallback(async () => {
    try {
      // 这里的路径需要和 apiClient 的 BASE_URL 拼接正确，通常是 /api/favorites
      const response = await apiFetch("/api/favorites");
      
      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      } else if (response.status === 401) {
        setFavorites([]); // 未登录状态
      } else {
        console.warn("Failed to load favorites, status:", response.status);
      }
    } catch (err) {
      console.error("Error loading favorite places from API:", err);
    }
  }, []);

  useEffect(() => {
    loadCustomPlaces();
    loadFavoritePlaces();
  }, [loadCustomPlaces, loadFavoritePlaces]);

  const saveCustomPlaces = useCallback(async (updated: Place[]) => {
    try {
      await AsyncStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(updated));
      setPlaces(hydrateCustomPlaces(updated));
    } catch (err) {
      console.error("Error saving custom places:", err);
    }
  }, []);

  const addPlace = useCallback(
    async (formData: PlaceFormData): Promise<Place> => {
      const now = new Date().toISOString();
      const newPlace: Place = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description ?? "",
        latitude: formData.latitude,
        longitude: formData.longitude,
        imageUri: formData.imageUri,
        category: formData.category,
        address: formData.address,
        isFavorite: false,
        visitCount: 0,
        createdAt: now,
        updatedAt: now,
        source: "custom",
      };
      const updatedPlaces = [newPlace, ...places];
      await saveCustomPlaces(updatedPlaces);
      return newPlace;
    },
    [places, saveCustomPlaces]
  );

  const updatePlace = useCallback(
    async (id: string, updates: Partial<Place>): Promise<void> => {
      const updatedPlaces = places.map((place) =>
        place.id === id
          ? {
              ...place,
              ...updates,
              updatedAt: new Date().toISOString(),
              source: "custom",
            }
          : place
      );
      await saveCustomPlaces(updatedPlaces);
    },
    [places, saveCustomPlaces]
  );

  const deletePlace = useCallback(
    async (id: string): Promise<void> => {
      const updatedPlaces = places.filter((place) => place.id !== id);
      await saveCustomPlaces(updatedPlaces);
    },
    [places, saveCustomPlaces]
  );

  // [修改] 核心：切换收藏状态并同步到后端
  const toggleFavorite = useCallback(
    async (id: string): Promise<void> => {
      // 1. 处理本地 Custom Places (暂时保持本地逻辑，或者你也想同步到后端)
      const customPlace = places.find((p) => p.id === id);
      if (customPlace) {
        await updatePlace(id, { isFavorite: !customPlace.isFavorite });
        return;
      }

      // 2. Google / Backend Places -> 调用 API 同步数据库
      const isAlreadyFavorite = favorites.some((fav) => fav.id === id);
      const prevFavorites = [...favorites];

      let sourcePlace =
        discoverPlaces.find((place) => place.id === id) ||
        searchResults.find((place) => place.id === id) ||
        detailCache.current.get(id);

      if (!sourcePlace && !isAlreadyFavorite) {
        sourcePlace = await fetchGooglePlaceDetails(id);
      }

      if (!sourcePlace && !isAlreadyFavorite) return;

      // --- 乐观更新 (UI 立即响应) ---
      if (isAlreadyFavorite) {
        setFavorites((prev) => prev.filter((p) => p.id !== id));
      } else if (sourcePlace) {
        const enriched = {
          ...sourcePlace,
          isFavorite: true,
          source: sourcePlace.source ?? ("favorite" as const),
          updatedAt: new Date().toISOString(),
        };
        setFavorites((prev) => [enriched, ...prev]);
      }

      // --- 后端同步 (使用 apiFetch 携带 Cookie) ---
      try {
        if (isAlreadyFavorite) {
          // DELETE
          const res = await apiFetch(`/api/favorites?placeId=${id}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error("Failed to delete favorite");
        } else if (sourcePlace) {
          // POST
          const res = await apiFetch(`/api/favorites`, {
            method: "POST",
            body: JSON.stringify({
              id: sourcePlace.id,
              name: sourcePlace.name,
              description: sourcePlace.editorialSummary || sourcePlace.description,
              address: sourcePlace.address,
              latitude: sourcePlace.latitude,
              longitude: sourcePlace.longitude,
              imageUri: sourcePlace.imageUri,
              category: sourcePlace.category,
              source: sourcePlace.source,
            }),
          });
          if (!res.ok) throw new Error("Failed to add favorite");
        }
      } catch (err) {
        console.error("Error syncing favorite:", err);
        // 失败回滚
        setFavorites(prevFavorites);
        alert("Failed to sync favorite. Please check your connection.");
      }
    },
    [
      places,
      favorites,
      discoverPlaces,
      searchResults,
      updatePlace,
    ]
  );

  const incrementVisitCount = useCallback(
    async (id: string): Promise<void> => {
      const place = places.find((p) => p.id === id);
      if (place) {
        await updatePlace(id, { visitCount: place.visitCount + 1 });
      }
    },
    [places, updatePlace]
  );

  const getPlace = useCallback(
    (id: string): Place | undefined => {
      if (!id) return undefined;
      return (
        places.find((p) => p.id === id) ||
        favorites.find((p) => p.id === id) ||
        discoverPlaces.find((p) => p.id === id) ||
        searchResults.find((p) => p.id === id)
      );
    },
    [places, favorites, discoverPlaces, searchResults]
  );

  const getFavorites = useCallback((): Place[] => {
    const customFavorites = places.filter((p) => p.isFavorite);
    const combined = [...favorites];
    
    customFavorites.forEach((place) => {
      if (!combined.some((fav) => fav.id === place.id)) {
        combined.push(place);
      }
    });
    return combined;
  }, [places, favorites]);

  const getNearbyCacheKey = useCallback(
    (coords: { latitude: number; longitude: number }, categoryId: string) =>
      `${categoryId}:${coords.latitude.toFixed(3)}:${coords.longitude.toFixed(3)}`,
    []
  );

  const refreshDiscover = useCallback(
    async (options: RefreshDiscoverOptions = {}) => {
      const { force = false } = options;
      if (!currentCoordinates) {
        await requestPermission();
        return;
      }

      const now = Date.now();
      if (!force && now - lastDiscoverFetch.current < MIN_DISCOVER_REFRESH_INTERVAL) {
        return;
      }
      lastDiscoverFetch.current = now;

      setDiscoverLoading(true);
      setError(null);

      const cacheKey = getNearbyCacheKey(currentCoordinates, activeCategory);
      const cached = nearbyCache.current.get(cacheKey);
      if (!force && cached && now - cached.timestamp < NEARBY_CACHE_TTL) {
        setDiscoverPlaces(cached.places);
        setDiscoverLoading(false);
        return;
      }
      try {
        const category =
          categories.find((cat) => cat.id === activeCategory) ?? categories[0];

        const results = await searchNearbyPlaces({
          latitude: currentCoordinates.latitude,
          longitude: currentCoordinates.longitude,
          radius: category?.radius,
          includedTypes: category?.includedTypes,
          keyword: category?.keyword,
        });

        const enrichedResults = enrichList(results).slice(
          0,
          MAX_DISCOVER_RESULTS
        );
        setDiscoverPlaces(enrichedResults);
        nearbyCache.current.set(cacheKey, {
          timestamp: Date.now(),
          places: enrichedResults,
        });
      } catch (err) {
        console.error("Error fetching nearby places:", err);
        if (err instanceof GooglePlacesError && err.isQuotaExceeded) {
          setError(
            "We hit the Google Places quota. Showing your saved places until the limit resets."
          );
        } else {
          setError(
            err instanceof Error ? err.message : "Unable to load nearby places."
          );
        }
      } finally {
        setDiscoverLoading(false);
      }
    },
    [
      currentCoordinates,
      requestPermission,
      categories,
      activeCategory,
      enrichList,
      getNearbyCacheKey,
    ]
  );

  useEffect(() => {
    if (!currentCoordinates) return;
    refreshDiscover({ force: true });
  }, [
    currentCoordinates?.latitude,
    currentCoordinates?.longitude,
    activeCategory,
    refreshDiscover,
  ]);

  const searchGooglePlaces = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      const normalized = trimmed.toLowerCase();
      if (!trimmed) {
        setSearchResults([]);
        return;
      }
      if (trimmed.length < MIN_SEARCH_QUERY_LENGTH) {
        setSearchResults([]);
        setSearchLoading(false);
        return;
      }

      setSearchLoading(true);
      setError(null);
      const currentSearch = ++searchCounter.current;

      const cached = searchCache.current.get(normalized);
      const now = Date.now();
      if (cached && now - cached.timestamp < SEARCH_CACHE_TTL) {
        setSearchResults(cached.places);
        setSearchLoading(false);
        return;
      }

      try {
        const results = await searchPlacesByText({
          query: trimmed,
          latitude: currentCoordinates?.latitude,
          longitude: currentCoordinates?.longitude,
        });
        if (currentSearch !== searchCounter.current) return;
        const enrichedResults = enrichList(results).slice(
          0,
          MAX_SEARCH_RESULTS
        );
        setSearchResults(enrichedResults);
        searchCache.current.set(normalized, {
          timestamp: Date.now(),
          places: enrichedResults,
        });
      } catch (err) {
        console.error("Error searching places:", err);
        if (currentSearch === searchCounter.current) {
          setError(err instanceof Error ? err.message : "Search failed.");
        }
      } finally {
        if (currentSearch === searchCounter.current) {
          setSearchLoading(false);
        }
      }
    },
    [currentCoordinates, enrichList]
  );

  const fetchPlaceDetails = useCallback(
    async (id: string): Promise<Place | undefined> => {
      if (!id) return undefined;
      if (detailCache.current.has(id)) {
        return detailCache.current.get(id);
      }

      try {
        const place = await fetchGooglePlaceDetails(id);
        if (!place) return undefined;
        const enriched = enrichPlace(place);
        detailCache.current.set(id, enriched);
        return enriched;
      } catch (err) {
        console.error("Error fetching place details:", err);
        return undefined;
      }
    },
    [enrichPlace]
  );

  useEffect(() => {
    setDiscoverPlaces((prev) => enrichList(prev));
    setSearchResults((prev) => enrichList(prev));
  }, [favoriteIds, enrichList]);

  // [修改] refresh 包含 API 拉取
  const refresh = useCallback(async () => {
    await Promise.all([loadCustomPlaces(), loadFavoritePlaces()]);
    await refreshDiscover({ force: true });
  }, [loadCustomPlaces, loadFavoritePlaces, refreshDiscover]);

  const value: PlacesContextType = {
    places,
    favorites,
    discoverPlaces,
    searchResults,
    categories,
    activeCategory,
    loading,
    discoverLoading,
    searchLoading,
    locationLoading,
    locationPermissionGranted,
    error,
    currentCoordinates,
    addPlace,
    updatePlace,
    deletePlace,
    toggleFavorite,
    incrementVisitCount,
    getPlace,
    getFavorites,
    refresh,
    refreshDiscover,
    searchGooglePlaces,
    fetchPlaceDetails,
    setActiveCategory: handleSetActiveCategory,
  };

  return (
    <PlacesContext.Provider value={value}>{children}</PlacesContext.Provider>
  );
}

export function usePlacesContext() {
  const context = useContext(PlacesContext);
  if (context === undefined) {
    throw new Error("usePlacesContext must be used within a PlacesProvider");
  }
  return context;
}