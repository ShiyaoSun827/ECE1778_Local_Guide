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
import { apiFetch } from "../lib/apiClient"; 
import * as ImageManipulator from 'expo-image-manipulator';
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
  refreshFavorites: () => Promise<void>;
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
  const refreshFavorites = async () => {
  try {
    const res = await apiFetch("/api/favorites"); // 调用你写好的 GET /api/favorites
    if (res.ok) {
      const data = await res.json();
      setFavorites(data); // 更新前端状态
    } else {
      console.error("Failed to fetch favorites", res.status);
    }
  } catch (error) {
    console.error("Error fetching favorites:", error);
  }
};

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

  const loadFavoritePlaces = useCallback(async () => {
    try {
   
      const response = await apiFetch("/api/favorites");
      
      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      } else if (response.status === 401) {
        setFavorites([]); 
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
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description ?? "");
      data.append("latitude", formData.latitude.toString());
      data.append("longitude", formData.longitude.toString());
      data.append("address", formData.address ?? "");
      data.append("category", formData.category ?? "custom");

      // 🖼️ 修复后的图片处理逻辑 (压缩 + 格式修正)
      if (formData.imageUri) {
        try {
          console.log("Starting image compression..."); // 添加日志方便调试
          
          // 1. 压缩图片: 限制宽度 1080px, 质量 0.7
          const manipResult = await ImageManipulator.manipulateAsync(
            formData.imageUri,
            [{ resize: { width: 1080 } }], 
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
          );

          const fileName = formData.imageUri.split('/').pop() || "photo.jpg";

          // 2. 使用压缩后的 URI
          // ⚠️ Android 必须显式指定 type: 'image/jpeg'
          data.append("image", {
            uri: manipResult.uri, // 使用压缩后的新路径
            name: fileName,
            type: "image/jpeg",   
          } as any);
          
          console.log("Image compressed successfully");

        } catch (compressError) {
          console.error("Image compression failed:", compressError);
          // 备选方案：如果压缩失败，尝试传原图（虽然可能会挂，但比直接崩溃好）
          data.append("image", {
            uri: formData.imageUri,
            name: "photo.jpg",
            type: "image/jpeg",
          } as any);
        }
      }

      try {
        const response = await apiFetch("/api/places", {
          method: "POST",
          // 不要手动设置 Content-Type，让 fetch 自动处理 Boundary
          headers: {}, 
          body: data,
        });

        if (!response.ok) {
          // 获取后端返回的具体错误信息
          const errorText = await response.text(); 
          console.error("Server Error:", errorText);
          throw new Error(`Upload failed: ${response.status}`);
        }

        const savedPlace = await response.json();

        const newPlace: Place = {
          ...savedPlace,
          id: savedPlace.id,
          imageUri: savedPlace.imageUri,
          source: "custom",
          isFavorite: false,
          visitCount: 0,
        };

        setPlaces((prev) => [newPlace, ...prev]);
        return newPlace;

      } catch (err) {
        console.error("Error adding place:", err);
        throw err;
      }
    },
    [places]
  );

  const updatePlace = useCallback(
    async (id: string, updates: Partial<Place>): Promise<void> => {

      const originalPlaces = [...places]; 
      const updatedPlaces = places.map((place) =>
        place.id === id
          ? {
              ...place,
              ...updates,
              updatedAt: new Date().toISOString(),
              source: "custom" as const, 
            }
          : place
      );
      
     
      setPlaces(updatedPlaces);
     
      try {
        const response = await apiFetch(`/api/places/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error("Failed to update place on server");
        }
      } catch (err) {
        console.error("Error syncing update to server:", err);
       
        setPlaces(originalPlaces); 
        
        alert("Failed to save changes. Please check your connection.");
      }
    },
    [places]
  );
  const deletePlace = useCallback(
    async (id: string): Promise<void> => {
      const updatedPlaces = places.filter((place) => place.id !== id);
      await saveCustomPlaces(updatedPlaces);
    },
    [places, saveCustomPlaces]
  );


  const toggleFavorite = useCallback(
    async (id: string): Promise<void> => {
     
      const customPlace = places.find((p) => p.id === id);
      if (customPlace) {
        await updatePlace(id, { isFavorite: !customPlace.isFavorite });
        return;
      }

    
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
    refreshFavorites,
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