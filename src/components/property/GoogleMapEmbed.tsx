import React, { useEffect, useRef, useState } from 'react';
import { MapPin, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import loadGoogleMaps from '@/lib/googleMapsLoader';

interface GoogleMapEmbedProps {
  coordinates: { lat: number; lng: number };
  address?: string;
  title?: string;
  className?: string;
}

const GoogleMapEmbed: React.FC<GoogleMapEmbedProps> = ({ 
  coordinates, 
  address,
  title = "Location",
  className 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const { lat, lng } = coordinates;
  
  // Google Maps link
  const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (!mapRef.current) return;

      try {
        setIsLoading(true);
        setError('');
        
        await loadGoogleMaps();
        
        if (!isMounted || !mapRef.current) return;

        // Create map
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: { lat, lng },
          zoom: 17,
          mapTypeControl: false,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        // Add marker
        markerRef.current = new google.maps.Marker({
          position: { lat, lng },
          map: mapInstanceRef.current,
          title: title,
          animation: google.maps.Animation.DROP,
        });

        // Add info window
        if (title || address) {
          const infoWindow = new google.maps.InfoWindow({
            content: `<div style="padding: 8px;"><strong>${title}</strong>${address ? `<br><small>${address}</small>` : ''}</div>`
          });
          
          markerRef.current.addListener('click', () => {
            infoWindow.open(mapInstanceRef.current, markerRef.current);
          });
          
          // Open by default
          infoWindow.open(mapInstanceRef.current, markerRef.current);
        }

        setIsLoading(false);
      } catch (err: any) {
        console.error('Map initialization error:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load map');
          setIsLoading(false);
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
  }, [lat, lng, title, address]);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a 
              href={googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open in Google Maps
            </a>
          </Button>
        </div>
        {address && (
          <p className="text-sm text-muted-foreground">{address}</p>
        )}
      </CardHeader>
      <CardContent className="p-0 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
            <p className="text-sm text-destructive text-center px-4">{error}</p>
          </div>
        )}
        <div
          ref={mapRef}
          className="w-full aspect-video bg-muted"
        />
      </CardContent>
    </Card>
  );
};

export default GoogleMapEmbed;
