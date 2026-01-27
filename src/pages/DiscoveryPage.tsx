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
  Castle
} from 'lucide-react';
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

  // Search store for recent/saved searches
  const { addRecentSearch, setVoiceTranscript, voiceTranscript } = useSearchStore();

  // Handle voice search result
  useEffect(() => {
    if (voiceTranscript) {
      setSearchQuery(voiceTranscript);
      setVoiceTranscript('');
    }
  }, [voiceTranscript, setVoiceTranscript]);

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
    let results = [...mockListings];

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        p =>
          p.title.toLowerCase().includes(query) ||
          p.location.locality.toLowerCase().includes(query) ||
          p.location.city.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // Price range
    results = results.filter(
      p => p.price >= selectedPriceRange[0] && p.price <= selectedPriceRange[1]
    );

    // BHK
    if (selectedBHK.length > 0) {
      results = results.filter(p => selectedBHK.includes(p.specs.bhk));
    }

    // Locality
    if (selectedLocality && selectedLocality !== 'all') {
      results = results.filter(p => p.location.locality === selectedLocality);
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

    // Sort
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

    return results;
  }, [
    searchQuery,
    selectedPriceRange,
    selectedBHK,
    selectedLocality,
    selectedPropertyTypes,
    selectedLifestyle,
    sortBy,
  ]);

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    }
    return `₹${(price / 100000).toFixed(0)} L`;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedPriceRange([priceRange.min, priceRange.max]);
    setSelectedBHK([]);
    setSelectedLocality('all');
    setSelectedPropertyTypes([]);
    setSelectedLifestyle([]);
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
      {/* Price Range */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Price Range</Label>
        <Slider
          value={selectedPriceRange}
          onValueChange={(value) => setSelectedPriceRange(value as [number, number])}
          min={priceRange.min}
          max={priceRange.max}
          step={100000}
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{formatPrice(selectedPriceRange[0])}</span>
          <span>{formatPrice(selectedPriceRange[1])}</span>
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
    <div className="min-h-screen bg-background">
      <Header />
      <CompareModal />

      <div className="container py-6">
        {/* Search & Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by location, property name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery) {
                  addRecentSearch(searchQuery, getCurrentFilters());
                }
              }}
              className="pl-10 pr-12"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <VoiceSearchButton 
                onResult={(text) => {
                  setSearchQuery(text);
                  addRecentSearch(text, getCurrentFilters());
                }}
                size="sm"
              />
            </div>
            
            {/* Recent Searches Dropdown */}
            <RecentSearches 
              isOpen={isSearchFocused}
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
              </p>
            </div>

            {/* Property Grid/List */}
            <AnimatePresence mode="wait">
              {filteredListings.length === 0 ? (
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
