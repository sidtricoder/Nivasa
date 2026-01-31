import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { geocodeAddress, reverseGeocode } from '@/services/geocodingService';
import loadGoogleMaps from '@/lib/googleMapsLoader';

interface MapPickerProps {
  address: string;
  initialCoordinates?: { lat: number; lng: number };
  onCoordinatesChange: (coordinates: { lat: number; lng: number }) => void;
  onAddressUpdate?: (address: string) => void;
}

/**
 * MapPicker Component
 * Interactive Google Map with draggable marker and Places Autocomplete
 */
const MapPicker: React.FC<MapPickerProps> = ({
  address,
  initialCoordinates,
  onCoordinatesChange,
  onAddressUpdate,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [coordinates, setCoordinates] = useState(initialCoordinates || { lat: 0, lng: 0 });
  const [searchValue, setSearchValue] = useState(address || '');

  // Initialize map
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (!mapRef.current) return;

      try {
        setMapLoading(true);
        await loadGoogleMaps();
        
        if (!isMounted || !mapRef.current) return;

        // Default center (Delhi if no coordinates)
        const center = coordinates.lat !== 0 
          ? { lat: coordinates.lat, lng: coordinates.lng }
          : { lat: 28.6139, lng: 77.2090 };

        // Create map
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center,
          zoom: coordinates.lat !== 0 ? 15 : 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        });

        // Create draggable marker
        markerRef.current = new google.maps.Marker({
          position: center,
          map: mapInstanceRef.current,
          draggable: true,
          title: 'Drag to adjust location',
          animation: google.maps.Animation.DROP,
        });

        // Handle marker drag
        markerRef.current.addListener('dragend', async () => {
          if (!markerRef.current) return;
          
          const position = markerRef.current.getPosition();
          if (!position) return;

          const newCoords = {
            lat: position.lat(),
            lng: position.lng(),
          };

          setCoordinates(newCoords);
          onCoordinatesChange(newCoords);

          // Reverse geocode
          if (onAddressUpdate) {
            try {
              const updatedAddress = await reverseGeocode(newCoords.lat, newCoords.lng);
              onAddressUpdate(updatedAddress);
              setSearchValue(updatedAddress);
            } catch (error) {
              console.error('Reverse geocoding failed:', error);
            }
          }
        });

        // Handle map click
        mapInstanceRef.current.addListener('click', async (e: google.maps.MapMouseEvent) => {
          if (!markerRef.current || !e.latLng) return;

          const newCoords = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
          };

          setCoordinates(newCoords);
          onCoordinatesChange(newCoords);
          markerRef.current.setPosition(e.latLng);

          // Reverse geocode
          if (onAddressUpdate) {
            try {
              const updatedAddress = await reverseGeocode(newCoords.lat, newCoords.lng);
              onAddressUpdate(updatedAddress);
              setSearchValue(updatedAddress);
            } catch (error) {
              console.error('Reverse geocoding failed:', error);
            }
          }
        });

        // Initialize Places Autocomplete
        if (searchInputRef.current) {
          autocompleteRef.current = new google.maps.places.Autocomplete(searchInputRef.current, {
            componentRestrictions: { country: 'in' }, // Restrict to India
            fields: ['geometry', 'formatted_address', 'name'],
          });

          autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current?.getPlace();
            if (!place?.geometry?.location) return;

            const newCoords = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            };

            setCoordinates(newCoords);
            onCoordinatesChange(newCoords);

            // Update map and marker
            if (mapInstanceRef.current && markerRef.current) {
              mapInstanceRef.current.setCenter(newCoords);
              mapInstanceRef.current.setZoom(15);
              markerRef.current.setPosition(newCoords);
            }

            // Update address
            if (onAddressUpdate && place.formatted_address) {
              onAddressUpdate(place.formatted_address);
              setSearchValue(place.formatted_address);
            }
          });
        }

        setMapLoading(false);
      } catch (err: any) {
        console.error('Map initialization error:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load map');
          setMapLoading(false);
        }
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      mapInstanceRef.current = null;
    };
  }, []);

  // Update marker when coordinates change externally
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current && coordinates.lat !== 0) {
      const newPos = { lat: coordinates.lat, lng: coordinates.lng };
      markerRef.current.setPosition(newPos);
      mapInstanceRef.current.setCenter(newPos);
      mapInstanceRef.current.setZoom(15);
    }
  }, [coordinates]);

  // Manual geocode handler
  const handleGeocodeAddress = async () => {
    if (!searchValue) {
      setError('Please enter an address first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await geocodeAddress(searchValue);
      const newCoords = { lat: result.lat, lng: result.lng };
      
      setCoordinates(newCoords);
      onCoordinatesChange(newCoords);

      // Update map and marker
      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.setCenter(newCoords);
        mapInstanceRef.current.setZoom(15);
        markerRef.current.setPosition(newCoords);
      }

      if (onAddressUpdate) {
        onAddressUpdate(result.formattedAddress);
        setSearchValue(result.formattedAddress);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to geocode address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search with Autocomplete */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search for an address..."
            className="pl-9"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleGeocodeAddress();
              }
            }}
          />
        </div>
        <Button
          variant="outline"
          onClick={handleGeocodeAddress}
          disabled={loading || !searchValue}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2 hidden sm:inline">Find</span>
        </Button>
      </div>

      {/* Coordinates display */}
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        <div>
          <p className="font-medium text-sm">Property Location</p>
          <p className="text-xs text-muted-foreground">
            {coordinates.lat !== 0 && coordinates.lng !== 0
              ? `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`
              : 'Search or click on map to set location'}
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden relative">
        {mapLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <div
          ref={mapRef}
          className="w-full h-[400px] bg-muted"
          style={{ minHeight: '400px' }}
        />
      </Card>

      <Alert>
        <MapPin className="h-4 w-4" />
        <AlertDescription>
          <strong>Tip:</strong> Type an address above for suggestions, or <strong>click anywhere on the map</strong> or <strong>drag the marker</strong> to set the exact location.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default MapPicker;
