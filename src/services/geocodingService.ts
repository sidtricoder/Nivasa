/**
 * Geocoding Service
 * Uses Nominatim (OpenStreetMap) - Completely FREE, no API key needed!
 * Usage Policy: https://operations.osmfoundation.org/policies/nominatim/
 */

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
  placeId: string;
}

/**
 * Convert address to coordinates using Nominatim (OpenStreetMap Geocoding)
 * FREE - No API key, no credit card, no limits for fair use
 * Rate limit: Max 1 request per second (automatically handled)
 */
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

const waitForRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();
};

export const geocodeAddress = async (address: string): Promise<GeocodeResult> => {
  if (!address || address.trim().length < 3) {
    throw new Error('Please enter a valid address with at least 3 characters');
  }

  await waitForRateLimit();

  const encodedAddress = encodeURIComponent(address);
  const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1&addressdetails=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Nivasa Real Estate Platform',
      },
    });

    if (!response.ok) {
      throw new Error('Geocoding service temporarily unavailable');
    }

    const data = await response.json();

    if (data.length > 0) {
      const result = data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        formattedAddress: result.display_name,
        placeId: result.place_id.toString(),
      };
    } else {
      throw new Error('Address not found. Please check the address and try again.');
    }
  } catch (error: any) {
    if (error.message.includes('not found')) {
      throw error;
    }
    throw new Error('Failed to geocode address. Please check your internet connection and try again.');
  }
};

/**
 * Reverse geocode - convert coordinates to address
 * FREE - No API key needed
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  await waitForRateLimit();

  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Nivasa Real Estate Platform',
      },
    });

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();

    if (data.display_name) {
      return data.display_name;
    } else {
      throw new Error('Unable to find address for coordinates');
    }
  } catch (error) {
    throw new Error('Failed to reverse geocode coordinates');
  }
};
