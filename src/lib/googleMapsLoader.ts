/**
 * Google Maps Loader Utility
 * Loads Google Maps JavaScript API dynamically with Places library
 */

let googleMapsPromise: Promise<typeof google.maps> | null = null;
let isLoaded = false;

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/**
 * Load Google Maps JavaScript API
 * Returns a promise that resolves when the API is ready
 */
export const loadGoogleMaps = (): Promise<typeof google.maps> => {
  // Return existing promise if already loading/loaded
  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  // Check if already loaded (e.g., from script tag)
  if (window.google?.maps) {
    isLoaded = true;
    return Promise.resolve(window.google.maps);
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      reject(new Error('Google Maps API key is not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.'));
      return;
    }

    // Create callback function
    const callbackName = '__googleMapsCallback';
    (window as any)[callbackName] = () => {
      isLoaded = true;
      resolve(window.google.maps);
      delete (window as any)[callbackName];
    };

    // Create and inject script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      googleMapsPromise = null;
      reject(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

/**
 * Check if Google Maps is loaded
 */
export const isGoogleMapsLoaded = (): boolean => {
  return isLoaded;
};

/**
 * Get Google Maps API (throws if not loaded)
 */
export const getGoogleMaps = (): typeof google.maps => {
  if (!window.google?.maps) {
    throw new Error('Google Maps API is not loaded. Call loadGoogleMaps() first.');
  }
  return window.google.maps;
};

export default loadGoogleMaps;
