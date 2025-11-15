import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Place, PlaceFormData } from '../types';

const STORAGE_KEY = '@places';

export const usePlaces = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async () => {
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
  };

  const savePlaces = async (newPlaces: Place[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPlaces));
      setPlaces(newPlaces);
    } catch (error) {
      console.error('Error saving places:', error);
    }
  };

  const addPlace = useCallback(
    async (formData: PlaceFormData) => {
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
    [places]
  );

  const updatePlace = useCallback(
    async (id: string, updates: Partial<Place>) => {
      const updatedPlaces = places.map((place) =>
        place.id === id
          ? { ...place, ...updates, updatedAt: new Date().toISOString() }
          : place
      );
      await savePlaces(updatedPlaces);
    },
    [places]
  );

  const deletePlace = useCallback(
    async (id: string) => {
      const updatedPlaces = places.filter((place) => place.id !== id);
      await savePlaces(updatedPlaces);
    },
    [places]
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      const place = places.find((p) => p.id === id);
      if (place) {
        await updatePlace(id, { isFavorite: !place.isFavorite });
      }
    },
    [places, updatePlace]
  );

  const incrementVisitCount = useCallback(
    async (id: string) => {
      const place = places.find((p) => p.id === id);
      if (place) {
        await updatePlace(id, { visitCount: place.visitCount + 1 });
      }
    },
    [places, updatePlace]
  );

  const getPlace = useCallback(
    (id: string) => {
      return places.find((p) => p.id === id);
    },
    [places]
  );

  const getFavorites = useCallback(() => {
    return places.filter((p) => p.isFavorite);
  }, [places]);

  return {
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
};

