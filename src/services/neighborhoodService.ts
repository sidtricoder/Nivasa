/**
 * Neighborhood Intelligence Service
 * Uses Overpass API (OpenStreetMap) - Completely FREE, no API key needed!
 * Fetches real nearby amenities and calculates SafeHaven Score
 */

// Types for neighborhood data
export interface NearbyAmenity {
  type: 'school' | 'hospital' | 'metro' | 'park' | 'mall' | 'restaurant' | 'police' | 'fire_station';
  name: string;
  distance: string;
  distanceMeters: number;
  lat: number;
  lng: number;
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

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1500; // 1.5 seconds between requests

const waitForRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();
};

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
 * Map OSM amenity tags to our types
 */
const mapOsmType = (tags: Record<string, string>): NearbyAmenity['type'] | null => {
  if (tags.amenity === 'school' || tags.amenity === 'university' || tags.amenity === 'college') {
    return 'school';
  }
  if (tags.amenity === 'hospital' || tags.amenity === 'clinic' || tags.amenity === 'doctors') {
    return 'hospital';
  }
  if (tags.railway === 'station' || tags.station === 'subway' || tags.amenity === 'bus_station') {
    return 'metro';
  }
  if (tags.leisure === 'park' || tags.leisure === 'garden' || tags.leisure === 'playground') {
    return 'park';
  }
  if (tags.shop === 'mall' || tags.shop === 'supermarket' || tags.shop === 'department_store') {
    return 'mall';
  }
  if (tags.amenity === 'restaurant' || tags.amenity === 'cafe' || tags.amenity === 'fast_food') {
    return 'restaurant';
  }
  if (tags.amenity === 'police') {
    return 'police';
  }
  if (tags.amenity === 'fire_station') {
    return 'fire_station';
  }
  return null;
};

/**
 * Fetch nearby amenities from Overpass API
 */
export const fetchNearbyAmenities = async (
  lat: number,
  lng: number,
  radius: number = 1500
): Promise<NearbyAmenity[]> => {
  await waitForRateLimit();

  // Overpass QL query for multiple amenity types
  const query = `
    [out:json][timeout:25];
    (
      // Education
      node["amenity"="school"](around:${radius},${lat},${lng});
      node["amenity"="university"](around:${radius},${lat},${lng});
      node["amenity"="college"](around:${radius},${lat},${lng});
      
      // Healthcare
      node["amenity"="hospital"](around:${radius},${lat},${lng});
      node["amenity"="clinic"](around:${radius},${lat},${lng});
      
      // Transport
      node["railway"="station"](around:${radius * 1.5},${lat},${lng});
      node["station"="subway"](around:${radius},${lat},${lng});
      node["amenity"="bus_station"](around:${radius},${lat},${lng});
      
      // Parks & Recreation
      node["leisure"="park"](around:${radius},${lat},${lng});
      node["leisure"="garden"](around:${radius},${lat},${lng});
      
      // Shopping
      node["shop"="mall"](around:${radius * 2},${lat},${lng});
      node["shop"="supermarket"](around:${radius},${lat},${lng});
      
      // Dining
      node["amenity"="restaurant"](around:${radius},${lat},${lng});
      node["amenity"="cafe"](around:${radius},${lat},${lng});
      
      // Safety
      node["amenity"="police"](around:${radius * 2},${lat},${lng});
      node["amenity"="fire_station"](around:${radius * 2},${lat},${lng});
    );
    out body;
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json();
    const amenities: NearbyAmenity[] = [];
    const seenNames = new Set<string>();

    for (const element of data.elements) {
      if (!element.tags) continue;

      const type = mapOsmType(element.tags);
      if (!type) continue;

      const name = element.tags.name || element.tags['name:en'] || `Unnamed ${type}`;
      
      // Skip duplicates
      const key = `${type}-${name}`;
      if (seenNames.has(key)) continue;
      seenNames.add(key);

      const distanceMeters = calculateDistance(lat, lng, element.lat, element.lon);

      amenities.push({
        type,
        name,
        distance: formatDistance(distanceMeters),
        distanceMeters,
        lat: element.lat,
        lng: element.lon,
      });
    }

    // Balance results to show variety of amenity types (not just restaurants)
    // Group by type and take top items from each category
    const byType: Record<string, NearbyAmenity[]> = {};
    for (const amenity of amenities) {
      if (!byType[amenity.type]) byType[amenity.type] = [];
      byType[amenity.type].push(amenity);
    }

    // Sort each category by distance
    for (const type in byType) {
      byType[type].sort((a, b) => a.distanceMeters - b.distanceMeters);
    }

    // Priority order for display (most important first)
    const priorityTypes = ['hospital', 'school', 'metro', 'mall', 'park', 'restaurant', 'police', 'fire_station'];
    const maxPerCategory: Record<string, number> = {
      restaurant: 4,  // Limit restaurants
      hospital: 2,
      school: 2,
      metro: 2,
      mall: 2,
      park: 2,
      police: 1,
      fire_station: 1,
    };

    const results: NearbyAmenity[] = [];
    
    // First pass: take priority items from each category
    for (const type of priorityTypes) {
      const items = byType[type] || [];
      const maxItems = maxPerCategory[type] || 2;
      results.push(...items.slice(0, maxItems));
    }

    // Sort final results by distance
    results.sort((a, b) => a.distanceMeters - b.distanceMeters);

    console.log('🏘️ [Neighborhood] Real data fetched from Overpass API:', {
      totalFound: results.length,
      types: [...new Set(results.map(a => a.type))],
      sampleNames: results.slice(0, 5).map(a => `${a.name} (${a.type})`),
    });

    return results.slice(0, 16); // Max 16 items for display

  } catch (error) {
    console.error('Overpass API error:', error);
    throw new Error('Failed to fetch neighborhood data. Please try again.');
  }
};

/**
 * Calculate SafeHaven Score based on safety infrastructure proximity
 * Commercial areas with many people around are considered safer
 */
export const calculateSafeHavenScore = (amenities: NearbyAmenity[]): number => {
  let score = 45; // Higher base score - urban areas are generally safe

  // Police stations (max +20 points)
  const policeStations = amenities.filter(a => a.type === 'police');
  const policeBonus = Math.min(policeStations.length * 10, 20);
  score += policeBonus;

  // Fire stations (max +10 points)
  const fireStations = amenities.filter(a => a.type === 'fire_station');
  const fireBonus = Math.min(fireStations.length * 10, 10);
  score += fireBonus;

  // Hospitals nearby boost safety perception (max +10 points)
  const hospitals = amenities.filter(a => a.type === 'hospital' && a.distanceMeters < 2000);
  const hospitalBonus = Math.min(hospitals.length * 5, 10);
  score += hospitalBonus;

  // Busy commercial areas are safer - lots of restaurants/cafes = well-lit, people around
  const restaurants = amenities.filter(a => a.type === 'restaurant' && a.distanceMeters < 500);
  if (restaurants.length >= 8) score += 15; // Very busy commercial area
  else if (restaurants.length >= 5) score += 10;
  else if (restaurants.length >= 3) score += 5;

  return Math.min(Math.max(score, 0), 100);
};

/**
 * Calculate Walk Score based on nearby amenities
 * Premium locations with many walkable amenities score higher
 */
const calculateWalkScore = (amenities: NearbyAmenity[]): number => {
  let score = 40; // Higher base score for urban areas

  // Categories and their weight
  const categoryWeights: Record<string, number> = {
    school: 8,
    hospital: 10,
    metro: 15,
    park: 8,
    mall: 12,
    restaurant: 6, // Lower weight but will accumulate
  };

  const categoryCounts: Record<string, number> = {};

  for (const amenity of amenities) {
    if (amenity.distanceMeters > 1500) continue;
    
    const weight = categoryWeights[amenity.type] || 4;
    // Closer = much better score (exponential benefit for nearby places)
    const distanceFactor = Math.pow(1 - (amenity.distanceMeters / 1800), 1.5);
    
    // First amenity in category gets full points, subsequent get less (but still count)
    const categoryCount = categoryCounts[amenity.type] || 0;
    const diminishingFactor = 1 / Math.sqrt(categoryCount + 1);
    
    score += weight * distanceFactor * diminishingFactor;
    categoryCounts[amenity.type] = categoryCount + 1;
  }

  // Bonus for having many different categories nearby (variety bonus)
  const uniqueCategories = Object.keys(categoryCounts).length;
  score += uniqueCategories * 3;

  return Math.min(Math.round(score), 100);
};

/**
 * Calculate Connectivity Score based on transit and infrastructure
 * Premium urban areas with good infrastructure score higher
 */
const calculateConnectivityScore = (amenities: NearbyAmenity[]): number => {
  let score = 45; // Higher base for urban areas

  // Metro/Railway stations (max +30 points)
  const transitStations = amenities.filter(a => a.type === 'metro');
  for (const station of transitStations) {
    if (station.distanceMeters < 500) {
      score += 15;
    } else if (station.distanceMeters < 1000) {
      score += 10;
    } else if (station.distanceMeters < 2000) {
      score += 6;
    }
  }

  // Hospitals and schools add to infrastructure (max +15 points)
  const essentialServices = amenities.filter(
    a => (a.type === 'hospital' || a.type === 'school') && a.distanceMeters < 2000
  );
  score += Math.min(essentialServices.length * 4, 15);

  // Malls/shopping indicate commercial hub (max +10 points)
  const shopping = amenities.filter(a => a.type === 'mall' && a.distanceMeters < 3000);
  score += Math.min(shopping.length * 5, 10);

  // Having many restaurants indicates well-connected commercial area
  const restaurants = amenities.filter(a => a.type === 'restaurant' && a.distanceMeters < 500);
  if (restaurants.length >= 5) score += 10;
  else if (restaurants.length >= 3) score += 5;

  return Math.min(Math.max(score, 0), 100);
};

/**
 * Calculate Lifestyle Score based on entertainment and dining
 * Areas with many restaurants/cafes = high lifestyle score
 */
const calculateLifestyleScore = (amenities: NearbyAmenity[]): number => {
  let score = 35; // Base score

  // Restaurants and cafes - more = better (up to +40 points)
  const dining = amenities.filter(a => a.type === 'restaurant');
  for (const place of dining.slice(0, 10)) {
    if (place.distanceMeters < 100) {
      score += 6;
    } else if (place.distanceMeters < 300) {
      score += 5;
    } else if (place.distanceMeters < 600) {
      score += 4;
    } else if (place.distanceMeters < 1000) {
      score += 2;
    }
  }

  // Parks and recreation (max +15 points)
  const parks = amenities.filter(a => a.type === 'park' && a.distanceMeters < 1500);
  score += Math.min(parks.length * 8, 15);

  // Shopping/malls (max +10 points)
  const malls = amenities.filter(a => a.type === 'mall' && a.distanceMeters < 2000);
  score += Math.min(malls.length * 5, 10);

  return Math.min(Math.max(score, 0), 100);
};

/**
 * Calculate Safety Score (alias using SafeHaven calculation)
 */
const calculateSafetyScore = (amenities: NearbyAmenity[]): number => {
  return calculateSafeHavenScore(amenities);
};

/**
 * Get neighborhood data with caching
 */
export const getNeighborhoodData = async (
  lat: number,
  lng: number
): Promise<NeighborhoodData> => {
  // Create cache key from coordinates (rounded to 4 decimal places for proximity matching)
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  
  // Check cache
  const cached = neighborhoodCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { ...cached.data, isFromCache: true };
  }

  try {
    const amenities = await fetchNearbyAmenities(lat, lng);
    const safeHavenScore = calculateSafeHavenScore(amenities);
    const walkScore = calculateWalkScore(amenities);
    const safetyScore = calculateSafetyScore(amenities);
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

    // Cache the result
    neighborhoodCache.set(cacheKey, { data, timestamp: Date.now() });

    return data;
  } catch (error) {
    console.error('Failed to fetch neighborhood data:', error);
    
    // Return cached data if available (even if stale)
    if (cached) {
      return { ...cached.data, isFromCache: true };
    }
    
    throw error;
  }
};

/**
 * Clear the neighborhood cache
 */
export const clearNeighborhoodCache = (): void => {
  neighborhoodCache.clear();
};
