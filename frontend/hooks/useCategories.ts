/**
 * Hook for managing place categories
 * Fetches categories from Google Maps API with fallback to defaults
 */
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchPlaceCategories, getDefaultCategories, PlaceCategory } from '../services/categoriesService';

const STORAGE_KEY = '@place_categories';

export function useCategories() {
  const [categories, setCategories] = useState<PlaceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to load from cache first
      const cached = await AsyncStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCategories(parsed);
          setLoading(false);
        }
      }

      // Fetch fresh categories from API
      const fetchedCategories = await fetchPlaceCategories();
      setCategories(fetchedCategories);
      
      // Cache the categories
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fetchedCategories));
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories');
      // Fallback to default categories
      const defaults = getDefaultCategories();
      setCategories(defaults);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    await loadCategories();
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    refreshCategories,
  };
}

