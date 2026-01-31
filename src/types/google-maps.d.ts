/// <reference types="@types/google.maps" />

// Google Maps JavaScript API type declarations
declare global {
  interface Window {
    google: typeof google;
    __googleMapsCallback?: () => void;
  }
}

// Extend google.maps namespace if types aren't available
declare namespace google.maps {
  // Basic types for when @types/google.maps isn't installed
  class Map {
    constructor(mapDiv: Element, opts?: MapOptions);
    setCenter(latlng: LatLng | LatLngLiteral): void;
    setZoom(zoom: number): void;
  }

  class Marker {
    constructor(opts?: MarkerOptions);
    setPosition(latlng: LatLng | LatLngLiteral): void;
    setMap(map: Map | null): void;
    addListener(eventName: string, handler: Function): void;
    getPosition(): LatLng | null;
  }

  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }

  class InfoWindow {
    constructor(opts?: InfoWindowOptions);
    open(map?: Map | null, anchor?: Marker): void;
    setContent(content: string): void;
  }

  class StreetViewPanorama {
    constructor(container: Element, opts?: StreetViewPanoramaOptions);
  }

  class StreetViewService {
    getPanorama(
      request: StreetViewLocationRequest,
      callback: (data: StreetViewPanoramaData | null, status: StreetViewStatus) => void
    ): void;
  }

  interface MapOptions {
    center?: LatLngLiteral;
    zoom?: number;
    mapTypeControl?: boolean;
    streetViewControl?: boolean;
    fullscreenControl?: boolean;
    zoomControl?: boolean;
    styles?: any[];
  }

  interface MarkerOptions {
    position?: LatLng | LatLngLiteral;
    map?: Map;
    title?: string;
    draggable?: boolean;
    animation?: Animation;
  }

  interface InfoWindowOptions {
    content?: string;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  interface StreetViewPanoramaOptions {
    position?: LatLng | LatLngLiteral;
    pov?: { heading: number; pitch: number };
    zoom?: number;
    addressControl?: boolean;
    fullscreenControl?: boolean;
    motionTracking?: boolean;
    motionTrackingControl?: boolean;
    linksControl?: boolean;
    panControl?: boolean;
    zoomControl?: boolean;
    enableCloseButton?: boolean;
  }

  interface StreetViewLocationRequest {
    location: LatLngLiteral;
    radius?: number;
    source?: StreetViewSource;
  }

  interface StreetViewPanoramaData {
    location?: {
      latLng: LatLng;
    };
  }

  enum Animation {
    DROP = 1,
    BOUNCE = 2,
  }

  enum StreetViewStatus {
    OK = 'OK',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    ZERO_RESULTS = 'ZERO_RESULTS',
  }

  enum StreetViewSource {
    DEFAULT = 'default',
    OUTDOOR = 'outdoor',
  }

  namespace places {
    class PlacesService {
      constructor(attrContainer: Element);
      nearbySearch(
        request: PlaceSearchRequest,
        callback: (results: PlaceResult[] | null, status: PlacesServiceStatus) => void
      ): void;
    }

    class Autocomplete {
      constructor(inputField: HTMLInputElement, opts?: AutocompleteOptions);
      addListener(eventName: string, handler: Function): void;
      getPlace(): PlaceResult;
    }

    interface PlaceSearchRequest {
      location: LatLng | LatLngLiteral;
      radius: number;
      type?: string;
    }

    interface PlaceResult {
      place_id?: string;
      name?: string;
      types?: string[];
      geometry?: {
        location?: LatLng;
      };
      rating?: number;
      formatted_address?: string;
    }

    interface AutocompleteOptions {
      componentRestrictions?: { country: string | string[] };
      fields?: string[];
    }

    enum PlacesServiceStatus {
      OK = 'OK',
      ZERO_RESULTS = 'ZERO_RESULTS',
      INVALID_REQUEST = 'INVALID_REQUEST',
      OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
      REQUEST_DENIED = 'REQUEST_DENIED',
      UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    }
  }
}

export {};
