/**
 * Hook for Place CRUD operations
 * This hook should be used through Context API
 * The actual implementation is in PlacesContext.tsx
 * This file is kept for backward compatibility
 */
import { usePlacesContext } from '../context/PlacesContext';

export const usePlaces = () => {
  return usePlacesContext();
};

