import React, { useEffect, useRef } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
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
  const mapInstanceRef = useRef<L.Map | null>(null);

  const { lat, lng } = coordinates;
  
  // OpenStreetMap link (opens in new tab)
  const openStreetMapLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map
    mapInstanceRef.current = L.map(mapRef.current).setView([lat, lng], 17);

    // Add OpenStreetMap tiles (FREE!)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    // Add marker
    const marker = L.marker([lat, lng]).addTo(mapInstanceRef.current);
    
    if (title || address) {
      marker.bindPopup(`<strong>${title}</strong>${address ? `<br>${address}` : ''}`).openPopup();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
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
              href={openStreetMapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open in Maps
            </a>
          </Button>
        </div>
        {address && (
          <p className="text-sm text-muted-foreground">{address}</p>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div
          ref={mapRef}
          className="w-full aspect-video bg-muted"
        />
      </CardContent>
    </Card>
  );
};

export default GoogleMapEmbed;
