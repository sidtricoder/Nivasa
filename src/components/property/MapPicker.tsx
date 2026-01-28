import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { geocodeAddress, reverseGeocode } from '@/services/geocodingService';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface MapPickerProps {
  address: string;
  initialCoordinates?: { lat: number; lng: number };
  onCoordinatesChange: (coordinates: { lat: number; lng: number }) => void;
  onAddressUpdate?: (address: string) => void;
}

/**
 * MapPicker Component
 * Interactive map with draggable marker using Leaflet + OpenStreetMap
 * 100% FREE - No API key, no credit card needed!
 */
const MapPicker: React.FC<MapPickerProps> = ({
  address,
  initialCoordinates,
  onCoordinatesChange,
  onAddressUpdate,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [coordinates, setCoordinates] = useState(initialCoordinates || { lat: 0, lng: 0 });

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map centered on coordinates or default location
    const center: [number, number] = coordinates.lat !== 0 
      ? [coordinates.lat, coordinates.lng]
      : [28.6139, 77.2090]; // Default to Delhi

    mapInstanceRef.current = L.map(mapRef.current).setView(center, coordinates.lat !== 0 ? 15 : 12);

    // Add OpenStreetMap tiles (FREE!)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    // Add draggable marker
    markerRef.current = L.marker(center, {
      draggable: true,
    }).addTo(mapInstanceRef.current);

    // Handle marker drag
    markerRef.current.on('dragend', async () => {
      if (!markerRef.current) return;
      
      const position = markerRef.current.getLatLng();
      const newCoords = {
        lat: position.lat,
        lng: position.lng,
      };

      setCoordinates(newCoords);
      onCoordinatesChange(newCoords);

      // Optionally reverse geocode
      if (onAddressUpdate) {
        try {
          const updatedAddress = await reverseGeocode(newCoords.lat, newCoords.lng);
          onAddressUpdate(updatedAddress);
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
        }
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker position when coordinates change externally
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current && coordinates.lat !== 0) {
      const newPos: [number, number] = [coordinates.lat, coordinates.lng];
      markerRef.current.setLatLng(newPos);
      mapInstanceRef.current.setView(newPos, 15);
    }
  }, [coordinates]);

  // Geocode address when it changes
  const handleGeocodeAddress = async () => {
    if (!address) {
      setError('Please enter an address first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await geocodeAddress(address);
      const newCoords = { lat: result.lat, lng: result.lng };
      
      setCoordinates(newCoords);
      onCoordinatesChange(newCoords);

      // Update map and marker
      if (mapInstanceRef.current && markerRef.current) {
        const newPos: [number, number] = [newCoords.lat, newCoords.lng];
        mapInstanceRef.current.setView(newPos, 15);
        markerRef.current.setLatLng(newPos);
      }

      if (onAddressUpdate) {
        onAddressUpdate(result.formattedAddress);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to geocode address');
    } finally {
      setLoading(false);
    }
  };

  // Auto-geocode when address changes
  useEffect(() => {
    if (address && coordinates.lat === 0 && coordinates.lng === 0) {
      handleGeocodeAddress();
    }
  }, [address]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <div>
            <p className="font-medium">Property Location</p>
            <p className="text-xs text-muted-foreground">
              {coordinates.lat !== 0 && coordinates.lng !== 0
                ? `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`
                : 'Coordinates not set'}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGeocodeAddress}
          disabled={loading || !address}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2">Find Address</span>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden">
        <div
          ref={mapRef}
          className="w-full h-[400px] bg-muted"
        />
      </Card>

      <Alert>
        <MapPin className="h-4 w-4" />
        <AlertDescription>
          Using OpenStreetMap (100% FREE, no API key needed). Drag the pin to adjust the exact location.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default MapPicker;
