import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface SearchFilters {
  query: string;
  priceRange: [number, number];
  bhk: number[];
  localities: string[];
  propertyTypes: string[];
  lifestyles: string[];
  sortBy: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  alertEnabled: boolean;
  createdAt: string;
}

export interface RecentSearch {
  id: string;
  query: string;
  filters: Partial<SearchFilters>;
  timestamp: string;
}

interface SearchState {
  // Recent searches
  recentSearches: RecentSearch[];
  addRecentSearch: (query: string, filters?: Partial<SearchFilters>) => void;
  clearRecentSearches: () => void;

  // Saved searches
  savedSearches: SavedSearch[];
  saveSearch: (name: string, filters: SearchFilters) => void;
  deleteSavedSearch: (id: string) => void;
  toggleSearchAlert: (id: string) => void;

  // User preferences (for recommendations)
  viewedProperties: string[];
  addViewedProperty: (propertyId: string) => void;
  preferredLocalities: string[];
  preferredBhk: number[];
  updatePreferences: () => void;

  // Voice search
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  voiceTranscript: string;
  setVoiceTranscript: (transcript: string) => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      // Recent searches
      recentSearches: [],
      addRecentSearch: (query, filters) => {
        const { recentSearches } = get();
        
        // Don't add duplicate or empty searches
        if (!query.trim() && (!filters || Object.keys(filters).length === 0)) return;
        
        const newSearch: RecentSearch = {
          id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          query: query.trim(),
          filters: filters || {},
          timestamp: new Date().toISOString(),
        };

        // Remove duplicates and keep only last 10
        const filteredSearches = recentSearches.filter(
          (s) => s.query.toLowerCase() !== query.toLowerCase()
        );
        
        set({
          recentSearches: [newSearch, ...filteredSearches].slice(0, 10),
        });
      },
      clearRecentSearches: () => set({ recentSearches: [] }),

      // Saved searches
      savedSearches: [],
      saveSearch: (name, filters) => {
        const { savedSearches } = get();
        
        const newSavedSearch: SavedSearch = {
          id: `saved_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          name,
          filters,
          alertEnabled: false,
          createdAt: new Date().toISOString(),
        };

        set({
          savedSearches: [newSavedSearch, ...savedSearches],
        });
      },
      deleteSavedSearch: (id) => {
        set((state) => ({
          savedSearches: state.savedSearches.filter((s) => s.id !== id),
        }));
      },
      toggleSearchAlert: (id) => {
        set((state) => ({
          savedSearches: state.savedSearches.map((s) =>
            s.id === id ? { ...s, alertEnabled: !s.alertEnabled } : s
          ),
        }));
      },

      // User preferences
      viewedProperties: [],
      addViewedProperty: (propertyId) => {
        const { viewedProperties } = get();
        
        // Keep only last 50 viewed properties
        const newViewed = [
          propertyId,
          ...viewedProperties.filter((id) => id !== propertyId),
        ].slice(0, 50);

        set({ viewedProperties: newViewed });
        
        // Update preferences based on viewed properties
        get().updatePreferences();
      },
      preferredLocalities: [],
      preferredBhk: [],
      updatePreferences: () => {
        // This would analyze viewed properties to determine preferences
        // For now, we'll leave it as a placeholder
        // In a real app, this would look at which localities and BHK types
        // the user most frequently views
      },

      // Voice search
      isListening: false,
      setIsListening: (listening) => set({ isListening: listening }),
      voiceTranscript: '',
      setVoiceTranscript: (transcript) => set({ voiceTranscript: transcript }),
    }),
    {
      name: 'roomgi-search',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        recentSearches: state.recentSearches,
        savedSearches: state.savedSearches,
        viewedProperties: state.viewedProperties,
        preferredLocalities: state.preferredLocalities,
        preferredBhk: state.preferredBhk,
      }),
    }
  )
);
