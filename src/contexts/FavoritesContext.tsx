import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Property } from '@/data/listings';

interface FavoritesContextType {
  favorites: string[];
  addFavorite: (propertyId: string) => void;
  removeFavorite: (propertyId: string) => void;
  toggleFavorite: (propertyId: string) => void;
  isFavorite: (propertyId: string) => boolean;
  compareList: string[];
  addToCompare: (propertyId: string) => void;
  removeFromCompare: (propertyId: string) => void;
  toggleCompare: (propertyId: string) => void;
  isInCompare: (propertyId: string) => boolean;
  clearCompare: () => void;
  isCompareOpen: boolean;
  setIsCompareOpen: (open: boolean) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const addFavorite = useCallback((propertyId: string) => {
    setFavorites(prev => [...prev, propertyId]);
  }, []);

  const removeFavorite = useCallback((propertyId: string) => {
    setFavorites(prev => prev.filter(id => id !== propertyId));
  }, []);

  const toggleFavorite = useCallback((propertyId: string) => {
    setFavorites(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  }, []);

  const isFavorite = useCallback((propertyId: string) => {
    return favorites.includes(propertyId);
  }, [favorites]);

  const addToCompare = useCallback((propertyId: string) => {
    if (compareList.length < 3 && !compareList.includes(propertyId)) {
      setCompareList(prev => [...prev, propertyId]);
    }
  }, [compareList]);

  const removeFromCompare = useCallback((propertyId: string) => {
    setCompareList(prev => prev.filter(id => id !== propertyId));
  }, []);

  const toggleCompare = useCallback((propertyId: string) => {
    setCompareList(prev => {
      if (prev.includes(propertyId)) {
        return prev.filter(id => id !== propertyId);
      }
      if (prev.length < 3) {
        return [...prev, propertyId];
      }
      return prev;
    });
  }, []);

  const isInCompare = useCallback((propertyId: string) => {
    return compareList.includes(propertyId);
  }, [compareList]);

  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavorite,
      compareList,
      addToCompare,
      removeFromCompare,
      toggleCompare,
      isInCompare,
      clearCompare,
      isCompareOpen,
      setIsCompareOpen,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
