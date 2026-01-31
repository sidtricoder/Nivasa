/**
 * Neighborhood Intelligence Service
 * Uses Google Places JavaScript API for nearby amenities and calculates scores
 */

import loadGoogleMaps from '@/lib/googleMapsLoader';

// Types for neighborhood data
export interface NearbyAmenity {
  type: 'school' | 'hospital' | 'metro' | 'park' | 'mall' | 'restaurant' | 'police' | 'fire_station';
  name: string;
  distance: string;
  distanceMeters: number;
  lat: number;
  lng: number;
  rating?: number;
}

export interface NeighborhoodData {
  amenities: NearbyAmenity[];
  safeHavenScore: number;
  walkScore: number;
  safetyScore: number;
  connectivityScore: number;
  lifestyleScore: number;
  lastUpdated: string;
  isFromCache: boolean;
}

// Cache for neighborhood data (1 hour TTL)
const neighborhoodCache = new Map<string, { data: NeighborhoodData; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Calculate distance between two coordinates using Haversine formula
 */
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Format distance for display
 */
const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

/**
 * Map Google Places type to our amenity type
 */
const mapGoogleType = (types: string[]): NearbyAmenity['type'] | null => {
  if (types.includes('school') || types.includes('university') || types.includes('secondary_school') || types.includes('primary_school')) {
    return 'school';
  }
  if (types.includes('hospital') || types.includes('doctor') || types.includes('health')) {
    return 'hospital';
  }
  if (types.includes('subway_station') || types.includes('train_station') || types.includes('transit_station') || types.includes('bus_station')) {
    return 'metro';
  }
  if (types.includes('park')) {
    return 'park';
  }
  if (types.includes('shopping_mall') || types.includes('supermarket') || types.includes('department_store')) {
    return 'mall';
  }
  if (types.includes('restaurant') || types.includes('cafe') || types.includes('food')) {
    return 'restaurant';
  }
  if (types.includes('police')) {
    return 'police';
  }
  if (types.includes('fire_station')) {
    return 'fire_station';
  }
  return null;
};

// Hidden div for PlacesService (required by Google Maps API)
let placesServiceDiv: HTMLDivElement | null = null;

const getPlacesServiceDiv = (): HTMLDivElement => {
  if (!placesServiceDiv) {
    placesServiceDiv = document.createElement('div');
    placesServiceDiv.style.display = 'none';
    document.body.appendChild(placesServiceDiv);
  }
  return placesServiceDiv;
};

/**
 * Fetch nearby places using Google Maps JavaScript PlacesService
 */
const fetchNearbyPlacesJS = async (
  lat: number,
  lng: number,
  type: string,
  radius: number = 1500
): Promise<google.maps.places.PlaceResult[]> => {
  await loadGoogleMaps();
  
  return new Promise((resolve) => {
    const location = new google.maps.LatLng(lat, lng);
    const service = new google.maps.places.PlacesService(getPlacesServiceDiv());
    
    const request: google.maps.places.PlaceSearchRequest = {
      location,
      radius,
      type: type as any,
    };

    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        resolve(results);
      } else {
        console.warn(`Places API returned status: ${status} for type: ${type}`);
        resolve([]);
      }
    });
  });
};

/**
 * Fetch nearby amenities from Google Places API
 */
export const fetchNearbyAmenities = async (
  lat: number,
  lng: number,
  radius: number = 1500
): Promise<NearbyAmenity[]> => {
  try {
    await loadGoogleMaps();
  } catch (error) {
    console.warn('Google Maps API not available:', error);
    return [];
  }

  // Place types to search for
  const searchTypes = [
    { type: 'school', radius: radius },
    { type: 'hospital', radius: radius * 1.5 },
    { type: 'subway_station', radius: radius * 2 },
    { type: 'park', radius: radius },
    { type: 'shopping_mall', radius: radius * 2 },
    { type: 'restaurant', radius: radius },
    { type: 'police', radius: radius * 2 },
  ];

  try {
    // Fetch all place types sequentially to avoid rate limits
    const allResults: google.maps.places.PlaceResult[] = [];
    
    for (const { type, radius: r } of searchTypes) {
      try {
        const results = await fetchNearbyPlacesJS(lat, lng, type, r);
        allResults.push(...results);
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        console.warn(`Failed to fetch ${type}:`, err);
      }
    }

    const amenities: NearbyAmenity[] = [];
    const seenPlaceIds = new Set<string>();

    // Process results
    allResults.forEach((place) => {
      if (!place.place_id || seenPlaceIds.has(place.place_id)) return;
      seenPlaceIds.add(place.place_id);

      const type = mapGoogleType(place.types || []);
      if (!type) return;

      const placeLat = place.geometry?.location?.lat();
      const placeLng = place.geometry?.location?.lng();
      if (placeLat === undefined || placeLng === undefined) return;

      const distanceMeters = calculateDistance(lat, lng, placeLat, placeLng);

      amenities.push({
        type,
        name: place.name || `Unnamed ${type}`,
        distance: formatDistance(distanceMeters),
        distanceMeters,
        lat: placeLat,
        lng: placeLng,
        rating: place.rating,
      });
    });

    // Balance results by type
    const byType: Record<string, NearbyAmenity[]> = {};
    for (const amenity of amenities) {
      if (!byType[amenity.type]) byType[amenity.type] = [];
      byType[amenity.type].push(amenity);
    }

    // Sort each category by distance
    for (const type in byType) {
      byType[type].sort((a, b) => a.distanceMeters - b.distanceMeters);
    }

    // Priority order and limits
    const priorityTypes = ['hospital', 'school', 'metro', 'mall', 'park', 'restaurant', 'police', 'fire_station'];
    const maxPerCategory: Record<string, number> = {
      restaurant: 4,
      hospital: 2,
      school: 2,
      metro: 2,
      mall: 2,
      park: 2,
      police: 1,
      fire_station: 1,
    };

    const finalResults: NearbyAmenity[] = [];
    for (const type of priorityTypes) {
      const items = byType[type] || [];
      const maxItems = maxPerCategory[type] || 2;
      finalResults.push(...items.slice(0, maxItems));
    }

    // Sort by distance
    finalResults.sort((a, b) => a.distanceMeters - b.distanceMeters);

    console.log('🏘️ [Neighborhood] Google Places data fetched:', {
      totalFound: finalResults.length,
      types: [...new Set(finalResults.map(a => a.type))],
    });

    return finalResults.slice(0, 16);

  } catch (error) {
    console.error('Google Places API error:', error);
    throw new Error('Failed to fetch neighborhood data. Please try again.');
  }
};

/**
 * Calculate SafeHaven Score based on safety infrastructure proximity
 */
export const calculateSafeHavenScore = (amenities: NearbyAmenity[]): number => {
  let score = 45;

  const policeStations = amenities.filter(a => a.type === 'police');
  score += Math.min(policeStations.length * 10, 20);

  const fireStations = amenities.filter(a => a.type === 'fire_station');
  score += Math.min(fireStations.length * 10, 10);

  const hospitals = amenities.filter(a => a.type === 'hospital' && a.distanceMeters < 2000);
  score += Math.min(hospitals.length * 5, 10);

  const restaurants = amenities.filter(a => a.type === 'restaurant' && a.distanceMeters < 500);
  if (restaurants.length >= 8) score += 15;
  else if (restaurants.length >= 5) score += 10;
  else if (restaurants.length >= 3) score += 5;

  return Math.min(Math.max(score, 0), 100);
};

/**
 * Calculate Walk Score based on nearby amenities
 */
const calculateWalkScore = (amenities: NearbyAmenity[]): number => {
  let score = 40;

  const categoryWeights: Record<string, number> = {
    school: 8,
    hospital: 10,
    metro: 15,
    park: 8,
    mall: 12,
    restaurant: 6,
  };

  const categoryCounts: Record<string, number> = {};

  for (const amenity of amenities) {
    if (amenity.distanceMeters > 1500) continue;
    
    const weight = categoryWeights[amenity.type] || 4;
    const distanceFactor = Math.pow(1 - (amenity.distanceMeters / 1800), 1.5);
    
    const categoryCount = categoryCounts[amenity.type] || 0;
    const diminishingFactor = 1 / Math.sqrt(categoryCount + 1);
    
    score += weight * distanceFactor * diminishingFactor;
    categoryCounts[amenity.type] = categoryCount + 1;
  }

  const uniqueCategories = Object.keys(categoryCounts).length;
  score += uniqueCategories * 3;

  return Math.min(Math.round(score), 100);
};

/**
 * Calculate Connectivity Score
 */
const calculateConnectivityScore = (amenities: NearbyAmenity[]): number => {
  let score = 45;

  const transitStations = amenities.filter(a => a.type === 'metro');
  for (const station of transitStations) {
    if (station.distanceMeters < 500) score += 15;
    else if (station.distanceMeters < 1000) score += 10;
    else if (station.distanceMeters < 2000) score += 6;
  }

  const essentialServices = amenities.filter(
    a => (a.type === 'hospital' || a.type === 'school') && a.distanceMeters < 2000
  );
  score += Math.min(essentialServices.length * 4, 15);

  const shopping = amenities.filter(a => a.type === 'mall' && a.distanceMeters < 3000);
  score += Math.min(shopping.length * 5, 10);

  const restaurants = amenities.filter(a => a.type === 'restaurant' && a.distanceMeters < 500);
  if (restaurants.length >= 5) score += 10;
  else if (restaurants.length >= 3) score += 5;

  return Math.min(Math.max(score, 0), 100);
};

/**
 * Calculate Lifestyle Score
 */
const calculateLifestyleScore = (amenities: NearbyAmenity[]): number => {
  let score = 35;

  const dining = amenities.filter(a => a.type === 'restaurant');
  for (const place of dining.slice(0, 10)) {
    if (place.distanceMeters < 100) score += 6;
    else if (place.distanceMeters < 300) score += 5;
    else if (place.distanceMeters < 600) score += 4;
    else if (place.distanceMeters < 1000) score += 2;
  }

  const parks = amenities.filter(a => a.type === 'park' && a.distanceMeters < 1500);
  score += Math.min(parks.length * 8, 15);

  const malls = amenities.filter(a => a.type === 'mall' && a.distanceMeters < 2000);
  score += Math.min(malls.length * 5, 10);

  return Math.min(Math.max(score, 0), 100);
};

/**
 * Get neighborhood data with caching
 */
export const getNeighborhoodData = async (
  lat: number,
  lng: number
): Promise<NeighborhoodData> => {
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  
  const cached = neighborhoodCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { ...cached.data, isFromCache: true };
  }

  try {
    const amenities = await fetchNearbyAmenities(lat, lng);
    const safeHavenScore = calculateSafeHavenScore(amenities);
    const walkScore = calculateWalkScore(amenities);
    const safetyScore = calculateSafeHavenScore(amenities);
    const connectivityScore = calculateConnectivityScore(amenities);
    const lifestyleScore = calculateLifestyleScore(amenities);

    const data: NeighborhoodData = {
      amenities,
      safeHavenScore,
      walkScore,
      safetyScore,
      connectivityScore,
      lifestyleScore,
      lastUpdated: new Date().toISOString(),
      isFromCache: false,
    };

    neighborhoodCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error('Failed to fetch neighborhood data:', error);
    
    if (cached) {
      return { ...cached.data, isFromCache: true };
    }
    
    // Fallback data
    return {
      amenities: [],
      safeHavenScore: 70,
      walkScore: 65,
      safetyScore: 70,
      connectivityScore: 60,
      lifestyleScore: 65,
      lastUpdated: new Date().toISOString(),
      isFromCache: true,
    };
  }
};

/**
 * Clear the neighborhood cache
 */
export const clearNeighborhoodCache = (): void => {
  neighborhoodCache.clear();
};
