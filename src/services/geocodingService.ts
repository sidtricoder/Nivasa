/**
 * Geocoding Service
 * Uses Google Geocoding API for address-to-coordinates conversion
 * Docs: https://developers.google.com/maps/documentation/geocoding
 */

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
  placeId: string;
}

/**
 * Convert address to coordinates using Google Geocoding API
 * With fallback strategies for better success rate
 */
export const geocodeAddress = async (address: string): Promise<GeocodeResult> => {
  if (!address || address.trim().length < 3) {
    throw new Error('Please enter a valid address with at least 3 characters');
  }

  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    throw new Error('Google Maps API key is not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.');
  }

  // Clean up address - remove empty parts and "Near" prefix for better geocoding
  const cleanAddress = address
    .split(',')
    .map(part => part.trim())
    .filter(part => part && part !== '')
    .join(', ')
    .replace(/^near\s+/i, ''); // Remove "Near " prefix for better results

  const encodedAddress = encodeURIComponent(cleanAddress + ', India');
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Geocoding service temporarily unavailable');
    }

    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];
      const location = result.geometry.location;

      // Validate coordinates are within India
      if (!isWithinIndia(location.lat, location.lng)) {
        throw new Error('Location found is outside India. Please enter a valid Indian address or click on the map to set location.');
      }

      return {
        lat: location.lat,
        lng: location.lng,
        formattedAddress: result.formatted_address,
        placeId: result.place_id || 'unknown',
      };
    } else if (data.status === 'ZERO_RESULTS') {
      // Try a simpler search - extract city and pincode if present
      const simplifiedAddress = extractSimplifiedAddress(cleanAddress);
      if (simplifiedAddress && simplifiedAddress !== cleanAddress) {
        console.log('Trying simplified address:', simplifiedAddress);
        return await geocodeSimplified(simplifiedAddress);
      }
      throw new Error('Address not found. Please try clicking on the map to set the location manually, or enter a nearby landmark.');
    } else if (data.status === 'REQUEST_DENIED') {
      throw new Error('Google Maps API key is invalid or the Geocoding API is not enabled.');
    } else {
      throw new Error(`Geocoding failed: ${data.status}`);
    }
  } catch (error: any) {
    if (error.message.includes('not found') || error.message.includes('API') || error.message.includes('clicking')) {
      throw error;
    }
    console.error('Geocoding error:', error);
    throw new Error('Failed to geocode address. Please check your internet connection and try again.');
  }
};

/**
 * Extract simplified address for fallback geocoding
 * Tries to get city, state, or pincode from the address
 */
function extractSimplifiedAddress(address: string): string | null {
  // Try to find pincode (6 digits)
  const pincodeMatch = address.match(/\b\d{6}\b/);
  if (pincodeMatch) {
    return pincodeMatch[0] + ', India';
  }
  
  // Get the last 2-3 parts (usually city, state)
  const parts = address.split(',').map(p => p.trim()).filter(p => p);
  if (parts.length >= 2) {
    return parts.slice(-2).join(', ') + ', India';
  }
  
  return null;
}

/**
 * Simplified geocoding for fallback
 */
async function geocodeSimplified(address: string): Promise<GeocodeResult> {
  const encodedAddress = encodeURIComponent(address);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status === 'OK' && data.results && data.results.length > 0) {
    const result = data.results[0];
    const location = result.geometry.location;

    // Validate coordinates are within India
    if (!isWithinIndia(location.lat, location.lng)) {
      throw new Error('Location found is outside India. Please enter a valid Indian address or click on the map to set location manually.');
    }

    return {
      lat: location.lat,
      lng: location.lng,
      formattedAddress: result.formatted_address,
      placeId: result.place_id || 'unknown',
    };
  }
  
  throw new Error('Address not found. Please try clicking on the map to set the location manually.');
}

/**
 * Validate if coordinates are within India's bounding box
 * India bounds: lat 6.5-35.5, lng 68-97
 */
function isWithinIndia(lat: number, lng: number): boolean {
  const INDIA_BOUNDS = {
    minLat: 6.5,
    maxLat: 35.5,
    minLng: 68.0,
    maxLng: 97.5,
  };
  
  return lat >= INDIA_BOUNDS.minLat && 
         lat <= INDIA_BOUNDS.maxLat && 
         lng >= INDIA_BOUNDS.minLng && 
         lng <= INDIA_BOUNDS.maxLng;
}

/**
 * Reverse geocode - convert coordinates to address using Google Geocoding API
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    throw new Error('Google Maps API key is not configured.');
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    } else {
      throw new Error('Unable to find address for coordinates');
    }
  } catch (error) {
    throw new Error('Failed to reverse geocode coordinates');
  }
};
