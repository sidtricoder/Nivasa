/**
 * Geocoding Service
 * Uses Photon API (OpenStreetMap) - Completely FREE, no API key needed!
 * Photon is CORS-friendly and works from localhost
 * Docs: https://photon.komoot.io/
 */

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
  placeId: string;
}

/**
 * Convert address to coordinates using Photon (OpenStreetMap Geocoding)
 * FREE - No API key, no credit card, CORS-enabled
 * Better for localhost development than Nominatim
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
  // Using Photon API - CORS-friendly alternative to Nominatim
  const url = `https://photon.komoot.io/api/?q=${encodedAddress}&limit=1`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Geocoding service temporarily unavailable');
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const result = data.features[0];
      const coords = result.geometry.coordinates; // [lng, lat] in GeoJSON
      const props = result.properties;
      
      // Build formatted address
      const addressParts = [
        props.name,
        props.street,
        props.city || props.county,
        props.state,
        props.country
      ].filter(Boolean);

      return {
        lat: coords[1], // Photon returns [lng, lat]
        lng: coords[0],
        formattedAddress: addressParts.join(', '),
        placeId: props.osm_id?.toString() || 'unknown',
      };
    } else {
      throw new Error('Address not found. Please try a more general location (e.g., just the area name and city).');
    }
  } catch (error: any) {
    if (error.message.includes('not found')) {
      throw error;
    }
    console.error('Geocoding error:', error);
    throw new Error('Failed to geocode address. Please check your internet connection and try again.');
  }
};

/**
 * Reverse geocode - convert coordinates to address
 * Uses Photon reverse API
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  await waitForRateLimit();

  // Photon reverse geocoding
  const url = `https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const props = data.features[0].properties;
      const addressParts = [
        props.name,
        props.street,
        props.city || props.county,
        props.state,
        props.country
      ].filter(Boolean);
      
      return addressParts.join(', ');
    } else {
      throw new Error('Unable to find address for coordinates');
    }
  } catch (error) {
    throw new Error('Failed to reverse geocode coordinates');
  }
};
