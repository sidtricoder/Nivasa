import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import loadGoogleMaps from '@/lib/googleMapsLoader';

interface GoogleStreetViewProps {
  coordinates: { lat: number; lng: number };
  address?: string;
  title?: string;
  className?: string;
}

/**
 * Google Street View Component
 * Displays interactive Street View panorama for a given location
 */
const GoogleStreetView: React.FC<GoogleStreetViewProps> = ({
  coordinates,
  address,
  title = "Street View",
  className,
}) => {
  const streetViewRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isAvailable, setIsAvailable] = useState(true);

  const { lat, lng } = coordinates;
  
  // Google Maps Street View link
  const streetViewLink = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;

  useEffect(() => {
    let isMounted = true;

    const initStreetView = async () => {
      if (!streetViewRef.current) return;

      try {
        setIsLoading(true);
        setError('');
        setIsAvailable(true);
        
        await loadGoogleMaps();
        
        if (!isMounted || !streetViewRef.current) return;

        // Check if Street View is available at this location
        const streetViewService = new google.maps.StreetViewService();
        
        streetViewService.getPanorama(
          {
            location: { lat, lng },
            radius: 100, // Search within 100 meters
            source: google.maps.StreetViewSource.OUTDOOR,
          },
          (data, status) => {
            if (!isMounted || !streetViewRef.current) return;

            if (status === google.maps.StreetViewStatus.OK && data) {
              // Street View is available, create panorama
              panoramaRef.current = new google.maps.StreetViewPanorama(
                streetViewRef.current,
                {
                  position: data.location?.latLng || { lat, lng },
                  pov: {
                    heading: 0,
                    pitch: 0,
                  },
                  zoom: 1,
                  addressControl: true,
                  fullscreenControl: true,
                  motionTracking: false,
                  motionTrackingControl: false,
                  linksControl: true,
                  panControl: true,
                  zoomControl: true,
                  enableCloseButton: false,
                }
              );
              setIsAvailable(true);
              setIsLoading(false);
            } else {
              // Street View not available
              setIsAvailable(false);
              setIsLoading(false);
            }
          }
        );
      } catch (err: any) {
        console.error('Street View initialization error:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load Street View');
          setIsLoading(false);
        }
      }
    };

    initStreetView();

    return () => {
      isMounted = false;
      panoramaRef.current = null;
    };
  }, [lat, lng]);

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
              href={streetViewLink}
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
          <div className="absolute inset-0 flex items-center justify-center bg-muted z-10 aspect-video">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading Street View...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="aspect-video flex items-center justify-center bg-muted">
            <Alert variant="destructive" className="max-w-md mx-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
        
        {!isAvailable && !isLoading && !error && (
          <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
            <div className="text-center p-8 max-w-md">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Street View Not Available</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Google Street View imagery is not available for this exact location. 
                Try viewing the area on Google Maps for nearby coverage.
              </p>
              <Button variant="outline" asChild>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View on Google Maps
                </a>
              </Button>
            </div>
          </div>
        )}
        
        <div
          ref={streetViewRef}
          className={cn(
            "w-full aspect-video",
            (!isAvailable || error) && "hidden"
          )}
        />
      </CardContent>
    </Card>
  );
};

export default GoogleStreetView;
