import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  MapPin,
  TrendingUp,
  Zap,
  CheckCircle,
  Star,
  Crown,
  Filter
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
import { mockListings, getPriceRange, Property } from '@/data/listings';
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

const furnishingOptions = [
  { value: 'unfurnished', label: 'Unfurnished' },
  { value: 'semi-furnished', label: 'Semi Furnished' },
  { value: 'fully-furnished', label: 'Fully Furnished' },
];

const facingOptions = [
  { value: 'north', label: 'North' },
  { value: 'south', label: 'South' },
  { value: 'east', label: 'East' },
  { value: 'west', label: 'West' },
  { value: 'north-east', label: 'North East' },
  { value: 'north-west', label: 'North West' },
  { value: 'south-east', label: 'South East' },
  { value: 'south-west', label: 'South West' },
];

const floorPreferenceOptions = [
  { value: 'ground', label: 'Ground Floor' },
  { value: 'middle', label: 'Middle Floors (2-10)' },
  { value: 'high', label: 'High Floors (11+)' },
];

const possessionOptions = [
  { value: 'ready', label: 'Ready to Move' },
  { value: 'under-construction', label: 'Under Construction' },
];

const walkScoreRanges = [
  { min: 90, max: 100, label: 'Walker\'s Paradise (90-100)' },
  { min: 70, max: 89, label: 'Very Walkable (70-89)' },
  { min: 50, max: 69, label: 'Somewhat Walkable (50-69)' },
  { min: 25, max: 49, label: 'Car-Dependent (25-49)' },
  { min: 0, max: 24, label: 'Car-Dependent (0-24)' },
];

// Quick filter chips for popular searches
const quickFilterChips = [
  { id: 'pet-friendly', label: 'Pet Friendly', icon: PawPrint, color: 'from-amber-500 to-orange-500' },
  { id: 'under-1cr', label: 'Under ₹1 Cr', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
  { id: 'ready-to-move', label: 'Ready to Move', icon: Zap, color: 'from-blue-500 to-cyan-500' },
  { id: 'verified', label: 'Verified Only', icon: CheckCircle, color: 'from-violet-500 to-purple-500' },
  { id: 'premium', label: 'Premium', icon: Crown, color: 'from-yellow-500 to-amber-500' },
  { id: 'near-metro', label: 'Near Metro', icon: Train, color: 'from-rose-500 to-pink-500' },
];

// Amazon-style Filters Component
interface AmazonStyleFiltersProps {
  FilterContent: React.ComponentType;
}

const AmazonStyleFilters: React.FC<AmazonStyleFiltersProps> = ({ FilterContent }) => {
  const [isSticky, setIsSticky] = useState(false);
  const filterContainerRef = useRef<HTMLDivElement>(null);
  const filterContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (filterContainerRef.current && filterContentRef.current) {
        const container = filterContainerRef.current;
        const content = filterContentRef.current;
        const containerRect = container.getBoundingClientRect();
        const contentHeight = content.scrollHeight;
        const containerHeight = container.clientHeight;
        const scrollTop = container.scrollTop;

        // Check if user has scrolled to the bottom of the filters
        const hasScrolledToBottom = scrollTop + containerHeight >= contentHeight - 10;

        // Also check if the container is at the top of viewport for sticky behavior
        const shouldBeSticky = containerRect.top <= 24 && hasScrolledToBottom;

        setIsSticky(shouldBeSticky);
      }
    };

    const container = filterContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      window.addEventListener('scroll', handleScroll);

      return () => {
        container.removeEventListener('scroll', handleScroll);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `}</style>

      <div
        ref={filterContainerRef}
        className={`
          transition-all duration-300 rounded-2xl glass-card ambient-shadow
          ${isSticky
            ? 'fixed top-24 left-1/2 transform -translate-x-[50vw] translate-x-[160px] z-40 shadow-xl'
            : 'relative'
          }
        `}
        style={{
          height: isSticky ? '70vh' : '80vh',
          width: '320px'
        }}
      >
        <div
          className="pl-4 pr-2 py-4 h-full overflow-y-auto custom-scrollbar"
          ref={filterContentRef}
        >
          {/* Premium Filter Header */}
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                <Filter className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Filters</h3>
            </div>
            {isSticky && (
              <Badge variant="secondary" className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-0">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                Sticky Mode
              </Badge>
            )}
          </div>

          {/* Filter Content - Make it taller to enable scrolling */}
          <div className="space-y-6">
            <FilterContent />
          </div>
        </div>
      </div>
    </>
  );
};

const DiscoveryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const priceRange = getPriceRange();

  // Firebase state
  const [firebaseProperties, setFirebaseProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

  // Calculate dynamic price range including Firebase properties
  // Deduplicate by ID, prioritizing Firebase data over mock data
  const allProperties = useMemo(() => {
    const firebaseIds = new Set(firebaseProperties.map(p => p.id));
    // Filter out mock listings that exist in Firebase (by ID)
    const uniqueMockListings = mockListings.filter(p => !firebaseIds.has(p.id));
    return [...firebaseProperties, ...uniqueMockListings];
  }, [firebaseProperties]);
  
  const dynamicPriceRange = useMemo(() => {
    if (allProperties.length === 0) return priceRange;
    const prices = allProperties.map(p => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [allProperties]);

  const dynamicAreaRange = useMemo(() => {
    if (allProperties.length === 0) return { min: 500, max: 5000 };
    const areas = allProperties.map(p => p.specs.sqft);
    return {
      min: Math.min(...areas),
      max: Math.max(...areas),
    };
  }, [allProperties]);

  const availableCities = useMemo(() => {
    const cities = Array.from(new Set(allProperties.map(p => p.location.city)));
    return cities.sort();
  }, [allProperties]);

  // Filter State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedPriceRange, setSelectedPriceRange] = useState<[number, number]>([
    priceRange.min,
    priceRange.max,
  ]);
  const [selectedBHK, setSelectedBHK] = useState<number[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  const [selectedLifestyle, setSelectedLifestyle] = useState<string[]>(
    searchParams.get('filter') ? [searchParams.get('filter')!] : []
  );
  const [selectedAreaRange, setSelectedAreaRange] = useState<[number, number]>([500, 5000]);
  const [selectedWalkScoreRange, setSelectedWalkScoreRange] = useState<[number, number]>([0, 100]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedFurnishing, setSelectedFurnishing] = useState<string[]>([]);
  const [selectedFacing, setSelectedFacing] = useState<string[]>([]);
  const [selectedFloorPreference, setSelectedFloorPreference] = useState<string[]>([]);
  const [selectedPossessionStatus, setSelectedPossessionStatus] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Custom slider dragging states
  const [isAreaDragging, setIsAreaDragging] = useState<'min' | 'max' | null>(null);
  const [isWalkScoreDragging, setIsWalkScoreDragging] = useState<'min' | 'max' | null>(null);

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

  // Amazon-style filter states
  const [isFilterSticky, setIsFilterSticky] = useState(false);
  const [displayedProperties, setDisplayedProperties] = useState(12); // Initial load
  const LOAD_MORE_COUNT = 12;

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

  // Reset displayed properties when filters change
  useEffect(() => {
    setDisplayedProperties(LOAD_MORE_COUNT);
  }, [selectedPriceRange, selectedBHK, selectedCities, selectedPropertyTypes, selectedLifestyle, selectedAreaRange, selectedWalkScoreRange, verifiedOnly, selectedFurnishing, selectedFacing, selectedFloorPreference, selectedPossessionStatus, searchQuery, sortBy, aiFilters]);

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

  // Area slider handlers
  const handleAreaSliderMouseDown = (e: React.MouseEvent, thumb: 'min' | 'max') => {
    e.preventDefault();
    setIsAreaDragging(thumb);
  };

  const handleAreaSliderMouseMove = (e: React.MouseEvent) => {
    if (!isAreaDragging) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const value = dynamicAreaRange.min + percentage * (dynamicAreaRange.max - dynamicAreaRange.min);
    const steppedValue = Math.round(value / 50) * 50; // Step of 50

    if (isAreaDragging === 'min') {
      setSelectedAreaRange([Math.min(steppedValue, selectedAreaRange[1]), selectedAreaRange[1]]);
    } else if (isAreaDragging === 'max') {
      setSelectedAreaRange([selectedAreaRange[0], Math.max(steppedValue, selectedAreaRange[0])]);
    }
  };

  const handleAreaSliderMouseUp = () => {
    setIsAreaDragging(null);
  };

  // Global mouse listeners for Area slider
  useEffect(() => {
    if (isAreaDragging) {
      const handleGlobalMouseUp = () => setIsAreaDragging(null);
      const handleGlobalMouseMove = (e: MouseEvent) => {
        const sliderElement = document.querySelector('.area-slider-track');
        if (!sliderElement) return;

        const rect = sliderElement.getBoundingClientRect();
        const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const value = dynamicAreaRange.min + percentage * (dynamicAreaRange.max - dynamicAreaRange.min);
        const steppedValue = Math.round(value / 50) * 50;

        if (isAreaDragging === 'min') {
          setSelectedAreaRange([Math.min(steppedValue, selectedAreaRange[1]), selectedAreaRange[1]]);
        } else if (isAreaDragging === 'max') {
          setSelectedAreaRange([selectedAreaRange[0], Math.max(steppedValue, selectedAreaRange[0])]);
        }
      };

      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('mousemove', handleGlobalMouseMove);

      return () => {
        document.removeEventListener('mouseup', handleGlobalMouseUp);
        document.removeEventListener('mousemove', handleGlobalMouseMove);
      };
    }
  }, [isAreaDragging, selectedAreaRange, dynamicAreaRange]);

  // Walk Score slider handlers
  const handleWalkScoreSliderMouseDown = (e: React.MouseEvent, thumb: 'min' | 'max') => {
    e.preventDefault();
    setIsWalkScoreDragging(thumb);
  };

  const handleWalkScoreSliderMouseMove = (e: React.MouseEvent) => {
    if (!isWalkScoreDragging) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const value = percentage * 100;
    const steppedValue = Math.round(value / 5) * 5; // Step of 5

    if (isWalkScoreDragging === 'min') {
      setSelectedWalkScoreRange([Math.min(steppedValue, selectedWalkScoreRange[1]), selectedWalkScoreRange[1]]);
    } else if (isWalkScoreDragging === 'max') {
      setSelectedWalkScoreRange([selectedWalkScoreRange[0], Math.max(steppedValue, selectedWalkScoreRange[0])]);
    }
  };

  const handleWalkScoreSliderMouseUp = () => {
    setIsWalkScoreDragging(null);
  };

  // Global mouse listeners for Walk Score slider
  useEffect(() => {
    if (isWalkScoreDragging) {
      const handleGlobalMouseUp = () => setIsWalkScoreDragging(null);
      const handleGlobalMouseMove = (e: MouseEvent) => {
        const sliderElement = document.querySelector('.walkscore-slider-track');
        if (!sliderElement) return;

        const rect = sliderElement.getBoundingClientRect();
        const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const value = percentage * 100;
        const steppedValue = Math.round(value / 5) * 5;

        if (isWalkScoreDragging === 'min') {
          setSelectedWalkScoreRange([Math.min(steppedValue, selectedWalkScoreRange[1]), selectedWalkScoreRange[1]]);
        } else if (isWalkScoreDragging === 'max') {
          setSelectedWalkScoreRange([selectedWalkScoreRange[0], Math.max(steppedValue, selectedWalkScoreRange[0])]);
        }
      };

      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('mousemove', handleGlobalMouseMove);

      return () => {
        document.removeEventListener('mouseup', handleGlobalMouseUp);
        document.removeEventListener('mousemove', handleGlobalMouseMove);
      };
    }
  }, [isWalkScoreDragging, selectedWalkScoreRange]);

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
        setSelectedCities([]);
        setSelectedPropertyTypes([]);
        setSelectedLifestyle([]);

        if (filters.bhk) setSelectedBHK([filters.bhk]);
        if (filters.priceMax || filters.priceMin) {
          setSelectedPriceRange([
            filters.priceMin || dynamicPriceRange.min,
            filters.priceMax || dynamicPriceRange.max
          ]);
        }
        
        // For locality, try to find exact match in available cities for dropdown
        if (filters.locality) {
          const matchedLocality = availableCities.find(
            loc => loc.toLowerCase() === filters.locality?.toLowerCase()
          );
          if (matchedLocality) {
            // For backward compatibility, add the matched city to selectedCities
            setSelectedCities([matchedLocality]);
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
    localities: selectedCities, // Changed from selectedLocality to selectedCities
    propertyTypes: selectedPropertyTypes,
    lifestyles: selectedLifestyle,
    sortBy: sortBy,
  });

  // Apply saved search filters
  const handleApplyFilters = (filters: Partial<import('@/stores/searchStore').SearchFilters>) => {
    if (filters.priceRange) setSelectedPriceRange(filters.priceRange);
    if (filters.bhk) setSelectedBHK(filters.bhk);
    if (filters.localities && filters.localities.length > 0) {
      setSelectedCities(filters.localities); // Changed from setSelectedLocality to setSelectedCities
    }
    if (filters.propertyTypes) setSelectedPropertyTypes(filters.propertyTypes);
    if (filters.lifestyles) setSelectedLifestyle(filters.lifestyles);
    if (filters.sortBy) setSortBy(filters.sortBy);
  };

  // Memoized filtered listings
  const filteredListings = useMemo(() => {
    // Combine mock listings with Firebase properties, deduplicating by ID
    // Firebase properties take priority (they may have been edited)
    const firebaseIds = new Set(firebaseProperties.map(p => p.id));
    const uniqueMockListings = mockListings.filter(p => !firebaseIds.has(p.id));
    let results = [...firebaseProperties, ...uniqueMockListings];

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

    // Cities (multiple selection)
    if (selectedCities.length > 0) {
      results = results.filter(p => selectedCities.includes(p.location.city));
    }

    // Area range
    results = results.filter(
      p => p.specs.sqft >= selectedAreaRange[0] && p.specs.sqft <= selectedAreaRange[1]
    );

    // Walk score range
    results = results.filter(
      p => p.walkScore >= selectedWalkScoreRange[0] && p.walkScore <= selectedWalkScoreRange[1]
    );

    // Verified only filter
    if (verifiedOnly) {
      results = results.filter(p => p.seller.isVerified && p.verification.ownerVerified);
    }

    // Furnishing filter
    if (selectedFurnishing.length > 0) {
      results = results.filter(p => selectedFurnishing.includes(p.specs.furnishing));
    }

    // Facing direction filter
    if (selectedFacing.length > 0) {
      results = results.filter(p => selectedFacing.some(facing =>
        p.specs.facing.toLowerCase().includes(facing) || facing.includes(p.specs.facing.toLowerCase())
      ));
    }

    // Floor preference filter
    if (selectedFloorPreference.length > 0) {
      results = results.filter(p => {
        const floor = p.specs.floor;
        return selectedFloorPreference.some(pref => {
          switch (pref) {
            case 'ground': return floor === 0 || floor === 1;
            case 'middle': return floor >= 2 && floor <= 10;
            case 'high': return floor >= 11;
            default: return false;
          }
        });
      });
    }

    // Possession status filter
    if (selectedPossessionStatus.length > 0) {
      results = results.filter(p => {
        if (selectedPossessionStatus.includes('ready')) {
          return p.specs.propertyAge >= 0; // Ready properties have age >= 0
        }
        if (selectedPossessionStatus.includes('under-construction')) {
          return p.specs.propertyAge < 0; // Under construction properties have negative age
        }
        return false;
      });
    }

    // AI Locality filter (flexible partial matching when cities not set)
    if (aiLocality && selectedCities.length === 0) {
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
    selectedCities,
    selectedPropertyTypes,
    selectedLifestyle,
    selectedAreaRange,
    selectedWalkScoreRange,
    verifiedOnly,
    selectedFurnishing,
    selectedFacing,
    selectedFloorPreference,
    selectedPossessionStatus,
    sortBy,
    firebaseProperties,
    landmarkCoords,
    landmarkName,
    aiLocality,
    aiCity,
    aiState,
  ]);

  // Infinite scroll effect - moved after filteredListings declaration
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        const totalFiltered = filteredListings.length;
        if (displayedProperties < totalFiltered) {
          setDisplayedProperties(prev => Math.min(prev + LOAD_MORE_COUNT, totalFiltered));
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [displayedProperties, filteredListings.length]);

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
    setSelectedCities([]);
    setSelectedPropertyTypes([]);
    setSelectedLifestyle([]);
    setSelectedAreaRange([dynamicAreaRange.min, dynamicAreaRange.max]);
    setSelectedWalkScoreRange([0, 100]);
    setVerifiedOnly(false);
    setSelectedFurnishing([]);
    setSelectedFacing([]);
    setSelectedFloorPreference([]);
    setSelectedPossessionStatus([]);
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
    selectedCities.length > 0,
    selectedPropertyTypes.length > 0,
    selectedLifestyle.length > 0,
    selectedPriceRange[0] !== priceRange.min || selectedPriceRange[1] !== priceRange.max,
    selectedAreaRange[0] !== 500 || selectedAreaRange[1] !== 5000,
    selectedWalkScoreRange[0] !== 0 || selectedWalkScoreRange[1] !== 100,
    verifiedOnly,
    selectedFurnishing.length > 0,
    selectedFacing.length > 0,
    selectedFloorPreference.length > 0,
    selectedPossessionStatus.length > 0,
  ].filter(Boolean).length;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range - Flipkart Style */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Price Range</Label>

        {/* Min-Max Input Fields */}
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 xs:gap-3">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
              <Input
                type="text"
                value={minPriceInput}
                onChange={(e) => handleMinPriceChange(e.target.value.replace(/[^0-9.]/g, ''))}
                onBlur={applyPriceInputs}
                onKeyDown={(e) => e.key === 'Enter' && applyPriceInputs()}
                placeholder="Min"
                className="pl-7 pr-8 text-sm h-9 text-center w-full"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {selectedPriceRange[0] >= 10000000 ? 'Cr' : 'L'}
              </span>
            </div>
          </div>
          <span className="text-muted-foreground text-sm font-medium text-center xs:text-left">to</span>
          <div className="flex-1 min-w-0">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
              <Input
                type="text"
                value={maxPriceInput}
                onChange={(e) => handleMaxPriceChange(e.target.value.replace(/[^0-9.]/g, ''))}
                onBlur={applyPriceInputs}
                onKeyDown={(e) => e.key === 'Enter' && applyPriceInputs()}
                placeholder="Max"
                className="pl-7 pr-8 text-sm h-9 text-center w-full"
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
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2">
          {bhkOptions.map(bhk => (
            <Button
              key={bhk}
              variant={selectedBHK.includes(bhk) ? 'default' : 'outline'}
              size="sm"
              className="text-xs sm:text-sm flex-shrink-0"
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

      {/* Cities */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Cities</Label>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {availableCities.map(city => (
            <div key={city} className="flex items-center space-x-2">
              <Checkbox
                id={`city-${city}`}
                checked={selectedCities.includes(city)}
                onCheckedChange={(checked) =>
                  setSelectedCities(prev =>
                    checked ? [...prev, city] : prev.filter(c => c !== city)
                  )
                }
              />
              <Label htmlFor={`city-${city}`} className="cursor-pointer text-sm">
                {city}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Area Range - Custom Slider */}
      <div className="space-y-4 overflow-hidden">
        <Label className="text-sm font-medium">Area (sqft)</Label>
        <div className="px-2">
          <Slider
            value={selectedAreaRange}
            onValueChange={(value) => setSelectedAreaRange(value as [number, number])}
            min={dynamicAreaRange.min}
            max={dynamicAreaRange.max}
            step={50}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{selectedAreaRange[0]} sqft</span>
            <span>{selectedAreaRange[1]} sqft</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Walk Score - Custom Slider */}
      <div className="space-y-4 overflow-hidden">
        <Label className="text-sm font-medium">Walk Score</Label>
        <div className="px-2">
          <Slider
            value={selectedWalkScoreRange}
            onValueChange={(value) => setSelectedWalkScoreRange(value as [number, number])}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{selectedWalkScoreRange[0]}</span>
            <span>{selectedWalkScoreRange[1]}</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {walkScoreRanges.find(range =>
            selectedWalkScoreRange[0] >= range.min && selectedWalkScoreRange[1] <= range.max
          )?.label || `${selectedWalkScoreRange[0]}-${selectedWalkScoreRange[1]}`}
        </div>
      </div>

      <Separator />

      {/* Verified Only */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="verified-only"
            checked={verifiedOnly}
            onCheckedChange={(checked) => setVerifiedOnly(checked === true)}
          />
          <Label htmlFor="verified-only" className="cursor-pointer text-sm">
            Verified Properties Only
          </Label>
        </div>
      </div>

      <Separator />

      {/* Furnishing */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <Label className="text-sm font-medium cursor-pointer">Furnishing</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-2">
          {furnishingOptions.map(({ value, label }) => (
            <div key={value} className="flex items-center space-x-2">
              <Checkbox
                id={`furnishing-${value}`}
                checked={selectedFurnishing.includes(value)}
                onCheckedChange={(checked) =>
                  setSelectedFurnishing(prev =>
                    checked ? [...prev, value] : prev.filter(f => f !== value)
                  )
                }
              />
              <Label htmlFor={`furnishing-${value}`} className="cursor-pointer text-sm">
                {label}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Facing Direction */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <Label className="text-sm font-medium cursor-pointer">Facing Direction</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-2">
          {facingOptions.map(({ value, label }) => (
            <div key={value} className="flex items-center space-x-2">
              <Checkbox
                id={`facing-${value}`}
                checked={selectedFacing.includes(value)}
                onCheckedChange={(checked) =>
                  setSelectedFacing(prev =>
                    checked ? [...prev, value] : prev.filter(f => f !== value)
                  )
                }
              />
              <Label htmlFor={`facing-${value}`} className="cursor-pointer text-sm">
                {label}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Floor Preference */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <Label className="text-sm font-medium cursor-pointer">Floor Preference</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-2">
          {floorPreferenceOptions.map(({ value, label }) => (
            <div key={value} className="flex items-center space-x-2">
              <Checkbox
                id={`floor-${value}`}
                checked={selectedFloorPreference.includes(value)}
                onCheckedChange={(checked) =>
                  setSelectedFloorPreference(prev =>
                    checked ? [...prev, value] : prev.filter(f => f !== value)
                  )
                }
              />
              <Label htmlFor={`floor-${value}`} className="cursor-pointer text-sm">
                {label}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Possession Status */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <Label className="text-sm font-medium cursor-pointer">Possession Status</Label>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-2">
          {possessionOptions.map(({ value, label }) => (
            <div key={value} className="flex items-center space-x-2">
              <Checkbox
                id={`possession-${value}`}
                checked={selectedPossessionStatus.includes(value)}
                onCheckedChange={(checked) =>
                  setSelectedPossessionStatus(prev =>
                    checked ? [...prev, value] : prev.filter(p => p !== value)
                  )
                }
              />
              <Label htmlFor={`possession-${value}`} className="cursor-pointer text-sm">
                {label}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

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
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />
      <CompareModal />

      {/* Wave Background Container */}
      <div className="relative w-full">
        {/* Animated Wave Background */}
        <div className="absolute inset-x-0 top-0 h-30 sm:h-30 md:h-40 overflow-hidden pointer-events-none">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1440 590"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <style>
              {`
                .path-0{
                  animation:pathAnim-0 4s;
                  animation-timing-function: linear;
                  animation-iteration-count: infinite;
                }
                @keyframes pathAnim-0{
                  0%{
                    d: path("M 0,600 L 0,225 C 28.059854964774757,236.09932377033263 56.119709929549515,247.19864754066526 95,244 C 133.88029007045049,240.80135245933474 183.58101524657667,223.30473360767155 225,238 C 266.41898475342333,252.69526639232845 299.55622908414387,299.58241802864865 334,272 C 368.44377091585613,244.41758197135135 404.1940684168478,142.3655942777338 437,119 C 469.8059315831522,95.63440572226618 499.667497248465,150.95520486041605 536,173 C 572.332502751535,195.04479513958395 615.1359425892923,183.81358628060192 653,206 C 690.8640574107077,228.18641371939808 723.7887323943661,283.7904500171762 760,258 C 796.2112676056339,232.2095499828238 835.7091278332432,125.02461365069317 878,146 C 920.2908721667568,166.97538634930683 965.3747562726617,316.1110953800511 1007,321 C 1048.6252437273383,325.8889046199489 1086.79184707611,186.5310048291023 1117,136 C 1147.20815292389,85.46899517089768 1169.4578554228985,123.76488530353959 1204,136 C 1238.5421445771015,148.2351146964604 1285.3767312322966,134.40945395673936 1326,158 C 1366.6232687677034,181.59054604326064 1401.0352196479153,242.59729886950305 1419,260 C 1436.9647803520847,277.40270113049695 1438.4823901760424,251.20135056524848 1440,225 L 1440,600 L 0,600 Z");
                  }
                  25%{
                    d: path("M 0,600 L 0,225 C 25.97025541957349,252.82380024285183 51.94051083914698,280.64760048570366 94,284 C 136.05948916085302,287.35239951429634 194.20821206298558,266.23339830003715 236,252 C 277.7917879370144,237.76660169996288 303.22664090891067,230.41880631414773 330,212 C 356.77335909108933,193.58119368585227 384.8852243013717,164.09137644337204 429,164 C 473.1147756986283,163.90862355662796 533.2324618856022,193.21568791236407 571,182 C 608.7675381143978,170.78431208763593 624.1849281562188,119.04587190717174 651,153 C 677.8150718437812,186.95412809282826 716.0278254895226,306.60082445894886 759,330 C 801.9721745104774,353.39917554105114 849.7037698856911,280.55083025703294 890,239 C 930.2962301143089,197.44916974296706 963.1570949677127,187.1958545129194 993,203 C 1022.8429050322873,218.8041454870806 1049.667850243458,260.66575169128953 1094,238 C 1138.332149756542,215.33424830871044 1200.1715040584547,128.1411387219224 1236,123 C 1271.8284959415453,117.8588612780776 1281.6461335227236,194.7696934210209 1315,202 C 1348.3538664772764,209.2303065789791 1405.2439618506505,146.78008759399404 1430,139 C 1454.7560381493495,131.21991240600596 1447.3780190746747,178.10995620300298 1440,225 L 1440,600 L 0,600 Z");
                  }
                  50%{
                    d: path("M 0,600 L 0,225 C 35.57114140225882,280.7860032068652 71.14228280451763,336.5720064137303 106,332 C 140.85771719548237,327.4279935862697 175.0020101841883,262.4979775519439 209,257 C 242.9979898158117,251.50202244805607 276.84967645872916,305.4360833784939 318,330 C 359.15032354127084,354.5639166215061 407.5992839808951,349.7576889340805 449,327 C 490.4007160191049,304.2423110659195 524.7531876176905,263.5331608851842 563,256 C 601.2468123823095,248.46683911481583 643.3879655483428,274.10966752518283 680,263 C 716.6120344516572,251.89033247481717 747.6949501889385,204.02816901408448 780,189 C 812.3050498110615,173.97183098591552 845.8322336959034,191.77765641847915 887,217 C 928.1677663040966,242.22234358152085 976.9761150274485,274.86120531199896 1007,253 C 1037.0238849725515,231.13879468800104 1048.2633061943025,154.77752233352513 1087,168 C 1125.7366938056975,181.22247766647487 1191.9706601953417,284.0287053539005 1236,289 C 1280.0293398046583,293.9712946460995 1301.8540530243313,201.10765625087294 1341,201 C 1380.1459469756687,200.89234374912706 1436.613127707334,293.5406696426077 1456,313 C 1475.386872292666,332.4593303573923 1457.6934361463332,278.7296651786961 1440,225 L 1440,600 L 0,600 Z");
                  }
                  75%{
                    d: path("M 0,600 L 0,225 C 43.60775654205804,275.20915910610574 87.21551308411608,325.4183182122115 118,314 C 148.78448691588392,302.5816817877885 166.74570420559368,229.5358862572597 204,233 C 241.25429579440632,236.4641137427403 297.80167009350924,316.4381367587497 345,285 C 392.19832990649076,253.5618632412503 430.04761542036925,110.71156670774154 459,119 C 487.95238457963075,127.28843329225846 508.0078682250137,286.71559641028415 539,325 C 569.9921317749863,363.28440358971585 611.9209116795762,280.42604765112185 651,221 C 690.0790883204238,161.57395234887815 726.3084850566815,125.58021298522843 764,142 C 801.6915149433185,158.41978701477157 840.8451480936974,227.25310040796438 876,245 C 911.1548519063026,262.7468995920356 942.3109225685282,229.40738538291407 977,247 C 1011.6890774314718,264.5926146170859 1049.91116163219,333.1173580603794 1091,304 C 1132.08883836781,274.8826419396206 1176.044430902712,148.1231823755684 1211,128 C 1245.955569097288,107.8768176244316 1271.911114756962,194.389912437347 1314,246 C 1356.088885243038,297.610087562653 1414.3111100694393,314.3171678750437 1438,305 C 1461.6888899305607,295.6828321249563 1450.8444449652802,260.3414160624782 1440,225 L 1440,600 L 0,600 Z");
                  }
                  100%{
                    d: path("M 0,600 L 0,225 C 28.059854964774757,236.09932377033263 56.119709929549515,247.19864754066526 95,244 C 133.88029007045049,240.80135245933474 183.58101524657667,223.30473360767155 225,238 C 266.41898475342333,252.69526639232845 299.55622908414387,299.58241802864865 334,272 C 368.44377091585613,244.41758197135135 404.1940684168478,142.3655942777338 437,119 C 469.8059315831522,95.63440572226618 499.667497248465,150.95520486041605 536,173 C 572.332502751535,195.04479513958395 615.1359425892923,183.81358628060192 653,206 C 690.8640574107077,228.18641371939808 723.7887323943661,283.7904500171762 760,258 C 796.2112676056339,232.2095499828238 835.7091278332432,125.02461365069317 878,146 C 920.2908721667568,166.97538634930683 965.3747562726617,316.1110953800511 1007,321 C 1048.6252437273383,325.8889046199489 1086.79184707611,186.5310048291023 1117,136 C 1147.20815292389,85.46899517089768 1169.4578554228985,123.76488530353959 1204,136 C 1238.5421445771015,148.2351146964604 1285.3767312322966,134.40945395673936 1326,158 C 1366.6232687677034,181.59054604326064 1401.0352196479153,242.59729886950305 1419,260 C 1436.9647803520847,277.40270113049695 1438.4823901760424,251.20135056524848 1440,225 L 1440,600 L 0,600 Z");
                  }
                }
              `}
            </style>
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="5%" stopColor="#9900ef"></stop>
                <stop offset="95%" stopColor="#8ed1fc"></stop>
              </linearGradient>
            </defs>
            <path
              d="M 0,600 L 0,225 C 28.059854964774757,236.09932377033263 56.119709929549515,247.19864754066526 95,244 C 133.88029007045049,240.80135245933474 183.58101524657667,223.30473360767155 225,238 C 266.41898475342333,252.69526639232845 299.55622908414387,299.58241802864865 334,272 C 368.44377091585613,244.41758197135135 404.1940684168478,142.3655942777338 437,119 C 469.8059315831522,95.63440572226618 499.667497248465,150.95520486041605 536,173 C 572.332502751535,195.04479513958395 615.1359425892923,183.81358628060192 653,206 C 690.8640574107077,228.18641371939808 723.7887323943661,283.7904500171762 760,258 C 796.2112676056339,232.2095499828238 835.7091278332432,125.02461365069317 878,146 C 920.2908721667568,166.97538634930683 965.3747562726617,316.1110953800511 1007,321 C 1048.6252437273383,325.8889046199489 1086.79184707611,186.5310048291023 1117,136 C 1147.20815292389,85.46899517089768 1169.4578554228985,123.76488530353959 1204,136 C 1238.5421445771015,148.2351146964604 1285.3767312322966,134.40945395673936 1326,158 C 1366.6232687677034,181.59054604326064 1401.0352196479153,242.59729886950305 1419,260 C 1436.9647803520847,277.40270113049695 1438.4823901760424,251.20135056524848 1440,225 L 1440,600 L 0,600 Z"
              stroke="none"
              strokeWidth="0"
              fill="url(#gradient)"
              fillOpacity="0.4"
              className="transition-all duration-300 ease-in-out delay-150 path-0"
              transform="rotate(-180 720 300)"
            />
          </svg>
        </div>

        {/* Content on top of wave */}
        <div className="relative z-10 px-4 pt-6 pb-3">
          <div className="max-w-7xl mx-auto">
            {/* Premium Hero Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
                <div>
                  <h1 className="font-premium text-fluid-2xl font-bold text-foreground mb-2">
                    Discover Your Dream Home
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    <span className="font-semibold text-primary">{allProperties.length}</span> verified properties waiting for you
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">AI-Powered Search</span>
                  </div>
                </div>
              </div>

              {/* Quick Filter Chips */}
              <div className="flex flex-wrap gap-2">
                {quickFilterChips.map((chip, index) => {
                  const Icon = chip.icon;
                  const isActive =
                    (chip.id === 'pet-friendly' && selectedLifestyle.includes('pet-friendly')) ||
                    (chip.id === 'under-1cr' && selectedPriceRange[1] <= 10000000) ||
                    (chip.id === 'ready-to-move' && selectedPossessionStatus.includes('ready')) ||
                    (chip.id === 'verified' && verifiedOnly) ||
                    (chip.id === 'near-metro' && selectedLifestyle.includes('near-metro')) ||
                    (chip.id === 'premium' && selectedPriceRange[0] >= 20000000);

                  return (
                    <motion.button
                      key={chip.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        switch (chip.id) {
                          case 'pet-friendly':
                            setSelectedLifestyle(prev =>
                              prev.includes('pet-friendly')
                                ? prev.filter(l => l !== 'pet-friendly')
                                : [...prev, 'pet-friendly']
                            );
                            break;
                          case 'under-1cr':
                            if (selectedPriceRange[1] <= 10000000) {
                              setSelectedPriceRange([dynamicPriceRange.min, dynamicPriceRange.max]);
                            } else {
                              setSelectedPriceRange([dynamicPriceRange.min, 10000000]);
                            }
                            break;
                          case 'ready-to-move':
                            setSelectedPossessionStatus(prev =>
                              prev.includes('ready')
                                ? prev.filter(p => p !== 'ready')
                                : [...prev, 'ready']
                            );
                            break;
                          case 'verified':
                            setVerifiedOnly(!verifiedOnly);
                            break;
                          case 'near-metro':
                            setSelectedLifestyle(prev =>
                              prev.includes('near-metro')
                                ? prev.filter(l => l !== 'near-metro')
                                : [...prev, 'near-metro']
                            );
                            break;
                          case 'premium':
                            if (selectedPriceRange[0] >= 20000000) {
                              setSelectedPriceRange([dynamicPriceRange.min, dynamicPriceRange.max]);
                            } else {
                              setSelectedPriceRange([20000000, dynamicPriceRange.max]);
                            }
                            break;
                        }
                      }}
                      className={`
                        group flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                        transition-all duration-300 hover:scale-105 hover:shadow-md
                        ${isActive
                          ? `bg-gradient-to-r ${chip.color} text-white shadow-lg`
                          : 'bg-white/80 hover:bg-white text-muted-foreground hover:text-foreground border border-border/50 hover:border-primary/30'
                        }
                      `}
                    >
                      <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : ''}`} />
                      {chip.label}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Search & Controls - Single Line */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6 min-w-0">
              {/* Search Input with Glassmorphism */}
              <div className={`relative flex-1 min-w-0 group ${isSearchFocused ? 'animate-glow-pulse' : ''}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {/* AI/Search Icon with loading state */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
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
                  className="pl-10 pr-16 sm:pr-32 h-12 text-base bg-white/80 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-sm hover:shadow-md"
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
                          setSelectedCities([]);
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

              {/* All Controls in Single Line */}
              <div className="flex flex-wrap items-center gap-2 lg:gap-3 min-w-0">
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
                    <Button variant="outline" className="lg:hidden gap-2 flex-shrink-0">
                      <SlidersHorizontal className="h-4 w-4" />
                      <span className="hidden xs:inline">Filters</span>
                      {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[350px] overflow-x-hidden">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 overflow-y-auto h-[calc(100vh-120px)] overflow-x-hidden">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32 sm:w-40 lg:w-[180px] min-w-0">
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
                <div className="flex items-center border rounded-md flex-shrink-0">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    className="h-8 w-8 sm:h-9 sm:w-9"
                  >
                    <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                    className="h-8 w-8 sm:h-9 sm:w-9"
                  >
                    <List className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container pt-4 pb-6 max-w-full overflow-x-hidden"></div>
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
            {selectedCities.map(city => (
              <Badge key={city} variant="secondary" className="gap-1">
                {city}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setSelectedCities(prev => prev.filter(c => c !== city))}
                />
              </Badge>
            ))}
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
          <aside className="hidden lg:block w-[220px] flex-shrink-0 overflow-hidden">
            <AmazonStyleFilters FilterContent={FilterContent} />
          </aside>

          {/* Results */}
          <main className="flex-1 min-w-0 overflow-hidden">
            {/* Premium Results Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-6 pb-4 border-b border-border/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <motion.span
                    key={filteredListings.length}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-2xl font-bold text-primary"
                  >
                    {filteredListings.length}
                  </motion.span>
                  <span className="text-muted-foreground">properties found</span>
                </div>
                {loadingProperties && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10">
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                    <span className="text-xs text-primary font-medium">Loading...</span>
                  </div>
                )}
              </div>
              {displayedProperties < filteredListings.length && (
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(displayedProperties / filteredListings.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span>{Math.round((displayedProperties / filteredListings.length) * 100)}% viewed</span>
                </div>
              )}
            </motion.div>

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
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  {/* Animated Icon Container */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    className="relative mb-6"
                  >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
                      <Search className="h-10 w-10 text-primary/60" />
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20"
                    />
                  </motion.div>

                  <h3 className="text-xl font-semibold mb-2 text-foreground">No properties found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    We couldn't find properties matching your criteria. Try adjusting your filters or search for something different.
                  </p>

                  {/* Suggestion Chips */}
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    <span className="text-sm text-muted-foreground">Try:</span>
                    {['All Properties', 'Under ₹1 Cr', 'Apartments'].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          clearFilters();
                          if (suggestion === 'Under ₹1 Cr') {
                            setSelectedPriceRange([dynamicPriceRange.min, 10000000]);
                          } else if (suggestion === 'Apartments') {
                            setSelectedPropertyTypes(['apartment']);
                          }
                        }}
                        className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>

                  <Button variant="outline" onClick={clearFilters} className="gap-2">
                    <X className="h-4 w-4" />
                    Clear All Filters
                  </Button>
                </motion.div>
              ) : (
                <>
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
                    {filteredListings.slice(0, displayedProperties).map((property, index) => (
                      <motion.div
                        key={property.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: Math.min(index * 0.05, 0.3), // Cap delay at 0.3s
                          duration: 0.4,
                          ease: [0.22, 1, 0.36, 1]
                        }}
                      >
                        <PropertyCard property={property} />
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Load More Section */}
                  {displayedProperties < filteredListings.length && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-12 mb-8 text-center"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-center gap-4">
                          <div className="h-px bg-border flex-1" />
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="text-sm">
                              Showing {displayedProperties} of {filteredListings.length} properties
                            </span>
                          </div>
                          <div className="h-px bg-border flex-1" />
                        </div>

                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => {
                            const remaining = filteredListings.length - displayedProperties;
                            const toLoad = Math.min(LOAD_MORE_COUNT, remaining);
                            setDisplayedProperties(prev => prev + toLoad);
                          }}
                          className="min-w-[200px]"
                        >
                          Load {Math.min(LOAD_MORE_COUNT, filteredListings.length - displayedProperties)} More Properties
                        </Button>

                        <p className="text-xs text-muted-foreground">
                          Or keep scrolling to load automatically
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* All Properties Loaded Message */}
                  {displayedProperties >= filteredListings.length && filteredListings.length > LOAD_MORE_COUNT && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-12 mb-8 text-center"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-sm font-medium">
                            You've seen all {filteredListings.length} properties
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Try adjusting your filters to see more results
                        </p>
                      </div>
                    </motion.div>
                  )}
                </>
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
