import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

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
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_COLLECTION = 'userFavorites';

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Real-time sync with Firebase using onSnapshot
  useEffect(() => {
    if (!currentUser) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const docRef = doc(db, FAVORITES_COLLECTION, currentUser.uid);
    
    // Use onSnapshot for real-time updates
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFavorites(data.propertyIds || []);
        } else {
          // Document doesn't exist yet - create it
          setDoc(docRef, { propertyIds: [], updatedAt: new Date() })
            .catch(err => console.error('Error creating favorites doc:', err));
          setFavorites([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error in favorites listener:', error);
        setFavorites([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Save favorites to Firebase
  const saveFavorites = useCallback(async (newFavorites: string[]) => {
    if (!currentUser) return;
    
    try {
      const docRef = doc(db, FAVORITES_COLLECTION, currentUser.uid);
      await setDoc(docRef, { 
        propertyIds: newFavorites, 
        updatedAt: new Date() 
      });
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, [currentUser]);

  const addFavorite = useCallback((propertyId: string) => {
    if (!currentUser) return;
    const newFavorites = favorites.includes(propertyId) 
      ? favorites 
      : [...favorites, propertyId];
    saveFavorites(newFavorites);
  }, [currentUser, favorites, saveFavorites]);

  const removeFavorite = useCallback((propertyId: string) => {
    if (!currentUser) return;
    const newFavorites = favorites.filter(id => id !== propertyId);
    saveFavorites(newFavorites);
  }, [currentUser, favorites, saveFavorites]);

  const toggleFavorite = useCallback((propertyId: string) => {
    if (!currentUser) return;
    const newFavorites = favorites.includes(propertyId)
      ? favorites.filter(id => id !== propertyId)
      : [...favorites, propertyId];
    saveFavorites(newFavorites);
  }, [currentUser, favorites, saveFavorites]);

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
      loading,
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
