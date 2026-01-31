import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  SlidersHorizontal, 
  Grid3X3, 
  List, 
  ChevronDown,
  X,
  PawPrint,
  Train,
  Car,
  Building2,
  Home,
  Castle,
  Loader2,
  Sparkles,
  MapPin
} from 'lucide-react';
import { getAllProperties, saveAISearchQuery } from '@/services/firestoreService';
import { extractFiltersFromQuery, formatExtractedFilters, AIExtractedFilters, geocodeLandmark, calculateDistance } from '@/services/aiSearchService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/property/PropertyCard';
import CompareModal from '@/components/property/CompareModal';
import { VoiceSearchButton, RecentSearches, SavedSearches } from '@/components/search';
import { useSearchStore } from '@/stores/searchStore';
import { mockListings, getUniqueLocalities, getPriceRange, Property } from '@/data/listings';
import { toast } from 'sonner';
import { PropertyCardSkeleton } from '@/components/ui/skeletons';



const propertyTypes = [
  { value: 'apartment', label: 'Apartment', icon: Building2 },
  { value: 'villa', label: 'Villa', icon: Castle },
  { value: 'house', label: 'House', icon: Home },
  { value: 'penthouse', label: 'Penthouse', icon: Building2 },
];

const bhkOptions = [1, 2, 3, 4, 5];

const lifestyleFilters = [
  { id: 'pet-friendly', label: 'Pet Friendly', icon: PawPrint },
  { id: 'near-metro', label: 'Near Metro', icon: Train },
  { id: 'parking', label: 'Has Parking', icon: Car },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'walk-score', label: 'Walk Score' },
];

const DiscoveryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const priceRange = getPriceRange();
  const localities = getUniqueLocalities();

  // Firebase state
  const [firebaseProperties, setFirebaseProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

  // Calculate dynamic price range including Firebase properties
  const allProperties = useMemo(() => [...mockListings, ...firebaseProperties], [firebaseProperties]);
  
  const dynamicPriceRange = useMemo(() => {
    if (allProperties.length === 0) return priceRange;
    const prices = allProperties.map(p => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [allProperties]);

  // Filter State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedPriceRange, setSelectedPriceRange] = useState<[number, number]>([
    priceRange.min,
    priceRange.max,
  ]);
  const [selectedBHK, setSelectedBHK] = useState<number[]>([]);
  const [selectedLocality, setSelectedLocality] = useState<string>('all');
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  const [selectedLifestyle, setSelectedLifestyle] = useState<string[]>(
    searchParams.get('filter') ? [searchParams.get('filter')!] : []
  );
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // AI Search state
  const [isAISearching, setIsAISearching] = useState(false);
  const [aiFilters, setAIFilters] = useState<AIExtractedFilters | null>(null);
  const [showAIBadge, setShowAIBadge] = useState(false);
  
  // Landmark-based search state
  const [landmarkCoords, setLandmarkCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [landmarkName, setLandmarkName] = useState<string>('');
  const NEARBY_RADIUS_KM = 5; // Properties within 5km of landmark (tighter radius for accuracy)
  
  // AI Location filters (flexible matching, independent of dropdown)
  const [aiLocality, setAiLocality] = useState<string>('');
  const [aiCity, setAiCity] = useState<string>('');
  const [aiState, setAiState] = useState<string>('');

  // Search store for recent/saved searches
  const { addRecentSearch, setVoiceTranscript, voiceTranscript } = useSearchStore();
  
  // Flipkart-style price input handlers
  const [minPriceInput, setMinPriceInput] = useState<string>('');
  const [maxPriceInput, setMaxPriceInput] = useState<string>('');
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);

  // Sync input fields with slider values
  useEffect(() => {
    // Display in Crores if >= 1 Crore (100 Lakhs), otherwise in Lakhs
    setMinPriceInput(
      selectedPriceRange[0] >= 10000000 
        ? (selectedPriceRange[0] / 10000000).toFixed(1)
        : Math.round(selectedPriceRange[0] / 100000).toString()
    );
    setMaxPriceInput(
      selectedPriceRange[1] >= 10000000
        ? (selectedPriceRange[1] / 10000000).toFixed(1)
        : Math.round(selectedPriceRange[1] / 100000).toString()
    );
  }, [selectedPriceRange]);

  const handleMinPriceChange = (value: string) => {
    setMinPriceInput(value);
  };

  const handleMaxPriceChange = (value: string) => {
    setMaxPriceInput(value);
  };

  const applyPriceInputs = () => {
    // Convert input values based on whether they're in Crores or Lakhs
    const minVal = selectedPriceRange[0] >= 10000000
      ? parseFloat(minPriceInput) * 10000000 || dynamicPriceRange.min
      : parseFloat(minPriceInput) * 100000 || dynamicPriceRange.min;
    
    const maxVal = selectedPriceRange[1] >= 10000000
      ? parseFloat(maxPriceInput) * 10000000 || dynamicPriceRange.max
      : parseFloat(maxPriceInput) * 100000 || dynamicPriceRange.max;
    
    const clampedMin = Math.max(dynamicPriceRange.min, Math.min(minVal, dynamicPriceRange.max));
    const clampedMax = Math.min(dynamicPriceRange.max, Math.max(maxVal, dynamicPriceRange.min));
    
    if (clampedMin <= clampedMax) {
      setSelectedPriceRange([clampedMin, clampedMax]);
    } else {
      setSelectedPriceRange([clampedMax, clampedMin]);
    }
  };

  const handleSliderMouseDown = (e: React.MouseEvent, thumb: 'min' | 'max') => {
    e.preventDefault();
    setIsDragging(thumb);
  };

  const handleSliderMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const value = dynamicPriceRange.min + percentage * (dynamicPriceRange.max - dynamicPriceRange.min);
    
    if (isDragging === 'min') {
      setSelectedPriceRange([Math.min(value, selectedPriceRange[1]), selectedPriceRange[1]]);
    } else if (isDragging === 'max') {
      setSelectedPriceRange([selectedPriceRange[0], Math.max(value, selectedPriceRange[0])]);
    }
  };

  const handleSliderMouseUp = () => {
    setIsDragging(null);
  };

  // Add global mouse up listener
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => setIsDragging(null);
      const handleGlobalMouseMove = (e: MouseEvent) => {
        const sliderElement = document.querySelector('.price-slider-track');
        if (!sliderElement) return;
        
        const rect = sliderElement.getBoundingClientRect();
        const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const value = dynamicPriceRange.min + percentage * (dynamicPriceRange.max - dynamicPriceRange.min);
        
        if (isDragging === 'min') {
          setSelectedPriceRange([Math.min(value, selectedPriceRange[1]), selectedPriceRange[1]]);
        } else if (isDragging === 'max') {
          setSelectedPriceRange([selectedPriceRange[0], Math.max(value, selectedPriceRange[0])]);
        }
      };

      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('mousemove', handleGlobalMouseMove);
      
      return () => {
        document.removeEventListener('mouseup', handleGlobalMouseUp);
        document.removeEventListener('mousemove', handleGlobalMouseMove);
      };
    }
  }, [isDragging, selectedPriceRange, dynamicPriceRange]);
  
  // AI Search handler
  const handleAISearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsAISearching(true);
    setShowAIBadge(false);
    setLandmarkCoords(null);
    setLandmarkName('');
    setAiLocality('');
    setAiCity('');
    setAiState('');
    
    try {
      const result = await extractFiltersFromQuery(query);
      
      // Debug logging - see what AI extracted
      console.log('AI Search Query:', query);
      console.log('AI Extracted Filters:', result.filters);
      
      if (result.success && Object.keys(result.filters).length > 1) {
        // Apply extracted filters
        const filters = result.filters;
        
        // Reset filter states
        setSelectedPriceRange([dynamicPriceRange.min, dynamicPriceRange.max]);
        setSelectedBHK([]);
        setSelectedLocality('all');
        setSelectedPropertyTypes([]);
        setSelectedLifestyle([]);
        
        if (filters.bhk) setSelectedBHK([filters.bhk]);
        if (filters.priceMax || filters.priceMin) {
          setSelectedPriceRange([
            filters.priceMin || dynamicPriceRange.min,
            filters.priceMax || dynamicPriceRange.max
          ]);
        }
        
        // For locality, try to find exact match in available localities for dropdown
        if (filters.locality) {
          const matchedLocality = localities.find(
            loc => loc.toLowerCase() === filters.locality?.toLowerCase()
          );
          if (matchedLocality) {
            setSelectedLocality(matchedLocality);
          }
          // Also store for flexible AI filtering (partial match)
          setAiLocality(filters.locality.toLowerCase());
        }
        
        // Store city for filtering (AI extracted)
        if (filters.city) {
          setAiCity(filters.city.toLowerCase());
        }
        
        // Store state for filtering (AI extracted)
        if (filters.state) {
          setAiState(filters.state.toLowerCase());
        }
        
        if (filters.propertyType) setSelectedPropertyTypes([filters.propertyType]);
        if (filters.isPetFriendly) setSelectedLifestyle(['pet-friendly']);
        if (filters.hasParking) setSelectedLifestyle(prev => [...prev, 'parking']);
        
        // Handle landmark-based search
        if (filters.nearLandmark) {
          toast.loading('Finding location...', { id: 'geocoding' });
          const coords = await geocodeLandmark(filters.nearLandmark);
          if (coords) {
            setLandmarkCoords({ lat: coords.lat, lng: coords.lng });
            setLandmarkName(filters.nearLandmark.replace(' Bangalore', ''));
            toast.success(`Showing properties within ${NEARBY_RADIUS_KM}km of ${filters.nearLandmark.replace(' Bangalore', '')}`, { id: 'geocoding' });
          } else {
            toast.error('Could not find that location', { id: 'geocoding' });
          }
        }
        
        // Clear search query so text search doesn't conflict with AI filters
        setSearchQuery('');
        
        setAIFilters(filters);
        setShowAIBadge(true);
        
        // Save query to Firebase for analytics (async, don't await)
        saveAISearchQuery({
          rawQuery: query,
          extractedFilters: filters,
          resultsCount: 0, // Will be updated later or can be approximate
          landmarkSearched: filters.nearLandmark,
          userAgent: navigator.userAgent
        });
        
        if (!filters.nearLandmark) {
          toast.success('AI found matching filters', {
            description: formatExtractedFilters(filters).join(' • ')
          });
        }
      } else {
        // Fall back to regular text search - keep the query as is
        setAIFilters(null);
        setShowAIBadge(false);
      }
    } catch (error) {
      console.error('AI search error:', error);
      toast.error('AI search failed, using text search');
    } finally {
      setIsAISearching(false);
    }
  };

  // Fetch properties from Firebase on mount
  useEffect(() => {
    const fetchProperties = async () => {
      setLoadingProperties(true);
      try {
        const { properties } = await getAllProperties(100);
        setFirebaseProperties(properties);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoadingProperties(false);
      }
    };

    fetchProperties();
  }, []);

  // Handle voice search result
  useEffect(() => {
    if (voiceTranscript) {
      setSearchQuery(voiceTranscript);
      setVoiceTranscript('');
    }
  }, [voiceTranscript, setVoiceTranscript]);

  // Handle city URL parameter from navigation
  useEffect(() => {
    const cityParam = searchParams.get('city');
    if (cityParam) {
      // Set the city filter when coming from navigation
      setAiCity(cityParam.toLowerCase());
    } else {
      // Clear city filter when navigating to "all properties"
      setAiCity('');
    }
  }, [searchParams]);

  // Get current filters for saving (full SearchFilters type)
  const getCurrentFilters = (): import('@/stores/searchStore').SearchFilters => ({
    query: searchQuery,
    priceRange: selectedPriceRange,
    bhk: selectedBHK,
    localities: selectedLocality !== 'all' ? [selectedLocality] : [],
    propertyTypes: selectedPropertyTypes,
    lifestyles: selectedLifestyle,
    sortBy: sortBy,
  });

  // Apply saved search filters
  const handleApplyFilters = (filters: Partial<import('@/stores/searchStore').SearchFilters>) => {
    if (filters.priceRange) setSelectedPriceRange(filters.priceRange);
    if (filters.bhk) setSelectedBHK(filters.bhk);
    if (filters.localities && filters.localities.length > 0) {
      setSelectedLocality(filters.localities[0]);
    }
    if (filters.propertyTypes) setSelectedPropertyTypes(filters.propertyTypes);
    if (filters.lifestyles) setSelectedLifestyle(filters.lifestyles);
    if (filters.sortBy) setSortBy(filters.sortBy);
  };

  // Memoized filtered listings
  const filteredListings = useMemo(() => {
    // Combine mock listings with Firebase properties
    let results = [...mockListings, ...firebaseProperties];

    // Search query - match if any significant word from query matches property fields
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      // Split into words and filter out common stop words
      const stopWords = ['in', 'the', 'a', 'an', 'for', 'with', 'and', 'or', 'to', 'of', 'i', 'want', 'need', 'looking', 'property', 'house', 'home'];
      const searchWords = query.split(/\s+/).filter(word => word.length > 1 && !stopWords.includes(word));
      
      if (searchWords.length > 0) {
        results = results.filter(p => {
          const searchableText = `${p.title} ${p.location.locality} ${p.location.city} ${p.location.address} ${p.description} ${p.amenities.join(' ')}`.toLowerCase();
          // Match if ANY search word is found in the property
          return searchWords.some(word => searchableText.includes(word));
        });
      }
    }

    // Price range
    results = results.filter(
      p => p.price >= selectedPriceRange[0] && p.price <= selectedPriceRange[1]
    );

    // BHK
    if (selectedBHK.length > 0) {
      results = results.filter(p => selectedBHK.includes(p.specs.bhk));
    }

    // Locality (dropdown exact match)
    if (selectedLocality && selectedLocality !== 'all') {
      results = results.filter(p => p.location.locality === selectedLocality);
    }
    
    // AI Locality filter (flexible partial matching when dropdown not set)
    if (aiLocality && selectedLocality === 'all') {
      results = results.filter(p => 
        p.location.locality.toLowerCase().includes(aiLocality) ||
        aiLocality.includes(p.location.locality.toLowerCase()) ||
        p.location.address.toLowerCase().includes(aiLocality)
      );
    }
    
    // AI City filter (flexible matching)
    if (aiCity) {
      results = results.filter(p => 
        p.location.city.toLowerCase() === aiCity ||
        p.location.city.toLowerCase().includes(aiCity) ||
        aiCity.includes(p.location.city.toLowerCase())
      );
    }
    
    // AI State filter
    if (aiState) {
      results = results.filter(p => 
        p.location.state?.toLowerCase() === aiState ||
        p.location.state?.toLowerCase().includes(aiState) ||
        aiState.includes(p.location.state?.toLowerCase() || '')
      );
    }

    // Property Type
    if (selectedPropertyTypes.length > 0) {
      results = results.filter(p => selectedPropertyTypes.includes(p.specs.propertyType));
    }

    // Lifestyle filters
    if (selectedLifestyle.includes('pet-friendly')) {
      results = results.filter(p => p.isPetFriendly);
    }
    if (selectedLifestyle.includes('parking')) {
      results = results.filter(p => p.hasParking);
    }
    if (selectedLifestyle.includes('near-metro')) {
      results = results.filter(p =>
        p.nearbyPlaces.some(place => place.type === 'metro')
      );
    }

    // Landmark-based distance filtering
    if (landmarkCoords || landmarkName) {
      // First, find properties that explicitly list the landmark in nearbyPlaces
      const propertiesWithExplicitLandmark = results.filter(p => 
        landmarkName && p.nearbyPlaces.some(place => 
          place.name.toLowerCase().includes(landmarkName.toLowerCase()) ||
          landmarkName.toLowerCase().includes(place.name.toLowerCase())
        )
      );
      
      // If we have properties that explicitly mention the landmark, ONLY show those
      if (propertiesWithExplicitLandmark.length > 0) {
        results = propertiesWithExplicitLandmark;
      } else if (landmarkCoords) {
        // Fallback: No explicit matches, use distance-based filtering
        results = results.filter(p => {
          if (p.location.coordinates) {
            const distance = calculateDistance(
              landmarkCoords.lat,
              landmarkCoords.lng,
              p.location.coordinates.lat,
              p.location.coordinates.lng
            );
            return distance <= NEARBY_RADIUS_KM;
          }
          return false;
        });
      }
      
      // Sort by distance when searching by landmark
      if (landmarkCoords) {
        results.sort((a, b) => {
          if (!a.location.coordinates || !b.location.coordinates) return 0;
          const distA = calculateDistance(landmarkCoords.lat, landmarkCoords.lng, a.location.coordinates.lat, a.location.coordinates.lng);
          const distB = calculateDistance(landmarkCoords.lat, landmarkCoords.lng, b.location.coordinates.lat, b.location.coordinates.lng);
          return distA - distB;
        });
      }
    } else {
      // Normal sort when not searching by landmark
      switch (sortBy) {
        case 'price-low':
          results.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          results.sort((a, b) => b.price - a.price);
          break;
        case 'walk-score':
          results.sort((a, b) => b.walkScore - a.walkScore);
          break;
        case 'newest':
        default:
          results.sort((a, b) => new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime());
      }
    }

    return results;
  }, [
    searchQuery,
    selectedPriceRange,
    selectedBHK,
    selectedLocality,
    selectedPropertyTypes,
    selectedLifestyle,
    sortBy,
    firebaseProperties,
    landmarkCoords,
    landmarkName,
    aiLocality,
    aiCity,
    aiState,
  ]);

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    }
    return `₹${(price / 100000).toFixed(0)} L`;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedPriceRange([dynamicPriceRange.min, dynamicPriceRange.max]);
    setSelectedBHK([]);
    setSelectedLocality('all');
    setSelectedPropertyTypes([]);
    setSelectedLifestyle([]);
    setAiLocality('');
    setAiCity('');
    setAiState('');
    // Clear AI-specific filters
    setAIFilters(null);
    setShowAIBadge(false);
    setLandmarkCoords(null);
    setLandmarkName('');
  };

  const activeFiltersCount = [
    selectedBHK.length > 0,
    selectedLocality !== 'all',
    selectedPropertyTypes.length > 0,
    selectedLifestyle.length > 0,
    selectedPriceRange[0] !== priceRange.min || selectedPriceRange[1] !== priceRange.max,
  ].filter(Boolean).length;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range - Flipkart Style */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Price Range</Label>
        
        {/* Min-Max Input Fields */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
              <Input
                type="text"
                value={minPriceInput}
                onChange={(e) => handleMinPriceChange(e.target.value.replace(/[^0-9.]/g, ''))}
                onBlur={applyPriceInputs}
                onKeyDown={(e) => e.key === 'Enter' && applyPriceInputs()}
                placeholder="Min"
                className="pl-7 pr-8 text-sm h-9 text-center"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {selectedPriceRange[0] >= 10000000 ? 'Cr' : 'L'}
              </span>
            </div>
          </div>
          <span className="text-muted-foreground text-sm font-medium">to</span>
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
              <Input
                type="text"
                value={maxPriceInput}
                onChange={(e) => handleMaxPriceChange(e.target.value.replace(/[^0-9.]/g, ''))}
                onBlur={applyPriceInputs}
                onKeyDown={(e) => e.key === 'Enter' && applyPriceInputs()}
                placeholder="Max"
                className="pl-7 pr-8 text-sm h-9 text-center"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {selectedPriceRange[1] >= 10000000 ? 'Cr' : 'L'}
              </span>
            </div>
          </div>
        </div>

        {/* Range Slider - Custom Mouse Tracking */}
        <div className="pt-2 pb-1">
          <div 
            className="relative price-slider-track cursor-pointer select-none"
            onMouseMove={handleSliderMouseMove}
            onMouseUp={handleSliderMouseUp}
            onMouseLeave={handleSliderMouseUp}
          >
            {/* Track background */}
            <div className="w-full h-2 bg-secondary rounded-full relative">
              {/* Active range */}
              <div
                className="absolute h-2 bg-primary rounded-full"
                style={{
                  left: `${((selectedPriceRange[0] - dynamicPriceRange.min) / (dynamicPriceRange.max - dynamicPriceRange.min)) * 100}%`,
                  right: `${100 - ((selectedPriceRange[1] - dynamicPriceRange.min) / (dynamicPriceRange.max - dynamicPriceRange.min)) * 100}%`,
                }}
              />
              
              {/* Min thumb */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full shadow-md cursor-grab transition-transform ${isDragging === 'min' ? 'scale-110 cursor-grabbing' : 'hover:scale-105'}`}
                style={{
                  left: `${((selectedPriceRange[0] - dynamicPriceRange.min) / (dynamicPriceRange.max - dynamicPriceRange.min)) * 100}%`,
                  transform: `translateX(-50%) translateY(-50%)`,
                }}
                onMouseDown={(e) => handleSliderMouseDown(e, 'min')}
              />
              
              {/* Max thumb */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full shadow-md cursor-grab transition-transform ${isDragging === 'max' ? 'scale-110 cursor-grabbing' : 'hover:scale-105'}`}
                style={{
                  left: `${((selectedPriceRange[1] - dynamicPriceRange.min) / (dynamicPriceRange.max - dynamicPriceRange.min)) * 100}%`,
                  transform: `translateX(-50%) translateY(-50%)`,
                }}
                onMouseDown={(e) => handleSliderMouseDown(e, 'max')}
              />
            </div>
          </div>
        </div>

        {/* Range Labels */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatPrice(dynamicPriceRange.min)}</span>
          <span>{formatPrice(dynamicPriceRange.max)}</span>
        </div>
      </div>

      <Separator />

      {/* BHK */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">BHK Configuration</Label>
        <div className="flex flex-wrap gap-2">
          {bhkOptions.map(bhk => (
            <Button
              key={bhk}
              variant={selectedBHK.includes(bhk) ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                setSelectedBHK(prev =>
                  prev.includes(bhk) ? prev.filter(b => b !== bhk) : [...prev, bhk]
                )
              }
            >
              {bhk} BHK
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Locality */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Locality</Label>
        <Select value={selectedLocality} onValueChange={setSelectedLocality}>
          <SelectTrigger>
            <SelectValue placeholder="Select locality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Localities</SelectItem>
            {localities.map(locality => (
              <SelectItem key={locality} value={locality}>
                {locality}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Property Type */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <Label className="text-sm font-medium cursor-pointer">Property Type</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-2">
          {propertyTypes.map(({ value, label, icon: Icon }) => (
            <div key={value} className="flex items-center space-x-2">
              <Checkbox
                id={value}
                checked={selectedPropertyTypes.includes(value)}
                onCheckedChange={(checked) =>
                  setSelectedPropertyTypes(prev =>
                    checked ? [...prev, value] : prev.filter(t => t !== value)
                  )
                }
              />
              <Label htmlFor={value} className="flex items-center gap-2 cursor-pointer text-sm">
                <Icon className="h-4 w-4 text-muted-foreground" />
                {label}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Lifestyle */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <Label className="text-sm font-medium cursor-pointer">Lifestyle</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-2">
          {lifestyleFilters.map(({ id, label, icon: Icon }) => (
            <div key={id} className="flex items-center space-x-2">
              <Checkbox
                id={id}
                checked={selectedLifestyle.includes(id)}
                onCheckedChange={(checked) =>
                  setSelectedLifestyle(prev =>
                    checked ? [...prev, id] : prev.filter(l => l !== id)
                  )
                }
              />
              <Label htmlFor={id} className="flex items-center gap-2 cursor-pointer text-sm">
                <Icon className="h-4 w-4 text-muted-foreground" />
                {label}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {activeFiltersCount > 0 && (
        <>
          <Separator />
          <Button variant="outline" className="w-full" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear All Filters
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <CompareModal />

      <div className="container py-6">
        {/* Search & Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            {/* AI/Search Icon with loading state */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              {isAISearching ? (
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              ) : searchQuery ? (
                <div className="relative">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                </div>
              ) : (
                <div className="relative">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Sparkles className="h-2.5 w-2.5 text-primary absolute -top-1 -right-1" />
                </div>
              )}
            </div>
            <Input
              placeholder="Try: '3BHK under 1 crore in Koramangala with parking'"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!e.target.value) {
                  setShowAIBadge(false);
                  setAIFilters(null);
                }
              }}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 300)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery) {
                  setIsSearchFocused(false); // Close dropdown
                  handleAISearch(searchQuery);
                  addRecentSearch(searchQuery, getCurrentFilters());
                }
              }}
              className="pl-10 pr-32"
              disabled={isAISearching}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => {
                      setSearchQuery('');
                      setShowAIBadge(false);
                      setAIFilters(null);
                      setIsSearchFocused(false);
                      // Reset filters including AI location filters
                      setSelectedPriceRange([priceRange.min, priceRange.max]);
                      setSelectedBHK([]);
                      setSelectedLocality('all');
                      setSelectedPropertyTypes([]);
                      setSelectedLifestyle([]);
                      setAiLocality('');
                      setAiCity('');
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 px-3 gap-1"
                    onClick={() => {
                      setIsSearchFocused(false);
                      handleAISearch(searchQuery);
                      addRecentSearch(searchQuery, getCurrentFilters());
                    }}
                    disabled={isAISearching}
                  >
                    <Sparkles className="h-3 w-3" />
                    Search
                  </Button>
                </>
              )}
              <VoiceSearchButton 
                onResult={(text) => {
                  setSearchQuery(text);
                  setIsSearchFocused(false); // Close recent searches
                  handleAISearch(text);
                  addRecentSearch(text, getCurrentFilters());
                }}
                size="sm"
              />
            </div>
            
            {/* AI Search Hint while typing */}
            {isSearchFocused && searchQuery && !isAISearching && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg p-3 z-50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Press <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono">Enter</kbd> or click Search for AI-powered results</span>
                </div>
              </div>
            )}
            
            {/* Recent Searches Dropdown - only show when not typing */}
            <RecentSearches 
              isOpen={isSearchFocused && !searchQuery && !isAISearching}
              onClose={() => setIsSearchFocused(false)}
              onSelect={(search) => {
                setSearchQuery(search.query);
                handleApplyFilters(search.filters);
              }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Saved Searches */}
            <SavedSearches 
              currentFilters={getCurrentFilters()}
              onApply={(filters) => {
                handleApplyFilters(filters);
                if (filters.query) setSearchQuery(filters.query);
              }}
            />

            {/* Mobile Filter Button */}
            <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6 overflow-y-auto h-[calc(100vh-120px)]">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="hidden sm:flex items-center border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* AI Search Badge */}
        <AnimatePresence>
          {showAIBadge && aiFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
                {landmarkCoords ? (
                  <MapPin className="h-4 w-4 text-primary" />
                ) : (
                  <Sparkles className="h-4 w-4 text-primary" />
                )}
                <span className="text-sm font-medium text-foreground">
                  {landmarkCoords ? `Near ${landmarkName}:` : 'AI found:'}
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {landmarkCoords && (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs">
                      Within {NEARBY_RADIUS_KM}km
                    </Badge>
                  )}
                  {formatExtractedFilters(aiFilters).map((filter, i) => (
                    <Badge key={i} variant="secondary" className="bg-white/80 text-xs">
                      {filter}
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-1"
                  onClick={clearFilters}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex flex-wrap gap-2 mb-4"
          >
            {selectedBHK.map(bhk => (
              <Badge key={bhk} variant="secondary" className="gap-1">
                {bhk} BHK
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setSelectedBHK(prev => prev.filter(b => b !== bhk))}
                />
              </Badge>
            ))}
            {selectedLocality !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {selectedLocality}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setSelectedLocality('all')}
                />
              </Badge>
            )}
            {selectedPropertyTypes.map(type => (
              <Badge key={type} variant="secondary" className="gap-1 capitalize">
                {type}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setSelectedPropertyTypes(prev => prev.filter(t => t !== type))}
                />
              </Badge>
            ))}
            {selectedLifestyle.map(filter => (
              <Badge key={filter} variant="secondary" className="gap-1 capitalize">
                {filter.replace('-', ' ')}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setSelectedLifestyle(prev => prev.filter(l => l !== filter))}
                />
              </Badge>
            ))}
          </motion.div>
        )}

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[280px] flex-shrink-0">
            <div className="sticky top-24 p-4 border rounded-lg bg-card">
              <h3 className="font-semibold mb-4">Filters</h3>
              <FilterContent />
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1">
            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{filteredListings.length}</span> properties found
                {loadingProperties && <Loader2 className="inline h-4 w-4 ml-2 animate-spin" />}
              </p>
            </div>

            {/* Property Grid/List */}
            <AnimatePresence mode="wait">
              {loadingProperties ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <PropertyCardSkeleton key={i} />
                  ))}
                </motion.div>
              ) : filteredListings.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <Search className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No properties found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or search query
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key={viewMode}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                      : 'space-y-4'
                  }
                >
                  {filteredListings.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DiscoveryPage;
