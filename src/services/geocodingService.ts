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
 */
export const geocodeAddress = async (address: string): Promise<GeocodeResult> => {
  if (!address || address.trim().length < 3) {
    throw new Error('Please enter a valid address with at least 3 characters');
  }

  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    throw new Error('Google Maps API key is not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.');
  }

  const encodedAddress = encodeURIComponent(address);
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

      return {
        lat: location.lat,
        lng: location.lng,
        formattedAddress: result.formatted_address,
        placeId: result.place_id || 'unknown',
      };
    } else if (data.status === 'ZERO_RESULTS') {
      throw new Error('Address not found. Please try a more specific location.');
    } else if (data.status === 'REQUEST_DENIED') {
      throw new Error('Google Maps API key is invalid or the Geocoding API is not enabled.');
    } else {
      throw new Error(`Geocoding failed: ${data.status}`);
    }
  } catch (error: any) {
    if (error.message.includes('not found') || error.message.includes('API')) {
      throw error;
    }
    console.error('Geocoding error:', error);
    throw new Error('Failed to geocode address. Please check your internet connection and try again.');
  }
};

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
