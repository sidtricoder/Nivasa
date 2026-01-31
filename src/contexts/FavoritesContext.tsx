import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
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

  // Load favorites from Firebase when user logs in
  useEffect(() => {
    const loadFavorites = async () => {
      if (!currentUser) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, FAVORITES_COLLECTION, currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFavorites(data.propertyIds || []);
        } else {
          // Create empty favorites document for new user
          await setDoc(docRef, { propertyIds: [], updatedAt: new Date() });
          setFavorites([]);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [currentUser]);

  // Save to Firebase helper
  const saveFavoriteToFirebase = async (propertyId: string, action: 'add' | 'remove') => {
    if (!currentUser) return;

    try {
      const docRef = doc(db, FAVORITES_COLLECTION, currentUser.uid);
      
      if (action === 'add') {
        await updateDoc(docRef, {
          propertyIds: arrayUnion(propertyId),
          updatedAt: new Date(),
        });
      } else {
        await updateDoc(docRef, {
          propertyIds: arrayRemove(propertyId),
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Error saving favorite to Firebase:', error);
    }
  };

  const addFavorite = useCallback((propertyId: string) => {
    setFavorites(prev => {
      if (!prev.includes(propertyId)) {
        saveFavoriteToFirebase(propertyId, 'add');
        return [...prev, propertyId];
      }
      return prev;
    });
  }, [currentUser]);

  const removeFavorite = useCallback((propertyId: string) => {
    setFavorites(prev => {
      saveFavoriteToFirebase(propertyId, 'remove');
      return prev.filter(id => id !== propertyId);
    });
  }, [currentUser]);

  const toggleFavorite = useCallback((propertyId: string) => {
    setFavorites(prev => {
      if (prev.includes(propertyId)) {
        saveFavoriteToFirebase(propertyId, 'remove');
        return prev.filter(id => id !== propertyId);
      } else {
        saveFavoriteToFirebase(propertyId, 'add');
        return [...prev, propertyId];
      }
    });
  }, [currentUser]);

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
