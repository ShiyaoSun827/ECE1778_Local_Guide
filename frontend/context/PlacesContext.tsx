/**
 * Places Context
 * Provides global state management using Context API
 * Integrates with AsyncStorage for persistence
 */
import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Place, PlaceFormData } from '../types';

const STORAGE_KEY = '@places';

interface PlacesContextType {
  places: Place[];
  loading: boolean;
  addPlace: (formData: PlaceFormData) => Promise<Place>;
  updatePlace: (id: string, updates: Partial<Place>) => Promise<void>;
  deletePlace: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  incrementVisitCount: (id: string) => Promise<void>;
  getPlace: (id: string) => Place | undefined;
  getFavorites: () => Place[];
  refresh: () => Promise<void>;
}

const PlacesContext = createContext<PlacesContextType | undefined>(undefined);

interface PlacesProviderProps {
  children: ReactNode;
}

export function PlacesProvider({ children }: PlacesProviderProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        setPlaces(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading places:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const savePlaces = useCallback(async (newPlaces: Place[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPlaces));
      setPlaces(newPlaces);
    } catch (error) {
      console.error('Error saving places:', error);
    }
  }, []);

  const addPlace = useCallback(
    async (formData: PlaceFormData): Promise<Place> => {
      const newPlace: Place = {
        id: Date.now().toString(),
        ...formData,
        isFavorite: false,
        visitCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updatedPlaces = [newPlace, ...places];
      await savePlaces(updatedPlaces);
      return newPlace;
    },
    [places, savePlaces]
  );

  const updatePlace = useCallback(
    async (id: string, updates: Partial<Place>): Promise<void> => {
      const updatedPlaces = places.map((place) =>
        place.id === id
          ? { ...place, ...updates, updatedAt: new Date().toISOString() }
          : place
      );
      await savePlaces(updatedPlaces);
    },
    [places, savePlaces]
  );

  const deletePlace = useCallback(
    async (id: string): Promise<void> => {
      const updatedPlaces = places.filter((place) => place.id !== id);
      await savePlaces(updatedPlaces);
    },
    [places, savePlaces]
  );

  const toggleFavorite = useCallback(
    async (id: string): Promise<void> => {
      const place = places.find((p) => p.id === id);
      if (place) {
        await updatePlace(id, { isFavorite: !place.isFavorite });
      }
    },
    [places, updatePlace]
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
      return places.find((p) => p.id === id);
    },
    [places]
  );

  const getFavorites = useCallback((): Place[] => {
    return places.filter((p) => p.isFavorite);
  }, [places]);

  const value: PlacesContextType = {
    places,
    loading,
    addPlace,
    updatePlace,
    deletePlace,
    toggleFavorite,
    incrementVisitCount,
    getPlace,
    getFavorites,
    refresh: loadPlaces,
  };

  return (
    <PlacesContext.Provider value={value}>
      {children}
    </PlacesContext.Provider>
  );
}

export function usePlacesContext() {
  const context = useContext(PlacesContext);
  if (context === undefined) {
    throw new Error('usePlacesContext must be used within a PlacesProvider');
  }
  return context;
}

