import React, { useState } from 'react';
import { MapPin, Maximize2, ExternalLink, Map, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'map' | 'streetview'>('streetview');

  const { lat, lng } = coordinates;
  
  // Google Maps embed URL for regular map view
  const mapEmbedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d500!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM${lat}!5e0!3m2!1sen!2sin!4v1`;
  
  // Google Maps Street View embed URL
  const streetViewUrl = `https://www.google.com/maps/embed?pb=!4v1!6m8!1m7!1s!2m2!1d${lat}!2d${lng}!3f0!4f0!5f0.7820865974627469`;
  
  // Direct Google Maps link for opening in new tab
  const googleMapsLink = `https://www.google.com/maps/@${lat},${lng},18z`;
  const streetViewLink = `https://www.google.com/maps/@${lat},${lng},3a,75y,0h,90t/data=!3m6!1e1!3m4!1s!2e0!7i16384!8i8192`;

  const handleLoad = () => {
    setIsLoading(false);
  };

  const MapIframe = ({ fullscreen = false, view = 'streetview' }: { fullscreen?: boolean; view?: 'map' | 'streetview' }) => (
    <div className={cn(
      "relative bg-muted rounded-lg overflow-hidden",
      fullscreen ? "w-full h-full min-h-[70vh]" : "aspect-video"
    )}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Loading {view === 'streetview' ? 'Street View' : 'Map'}...</p>
          </div>
        </div>
      )}
      
      <iframe
        src={view === 'streetview' ? streetViewUrl : mapEmbedUrl}
        title={`${title} - ${view === 'streetview' ? 'Street View' : 'Map'}`}
        className="w-full h-full border-0"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        onLoad={handleLoad}
      />
    </div>
  );

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-primary" />
            {title}
            <Badge variant="secondary" className="ml-2">
              <Navigation className="h-3 w-3 mr-1" />
              Street View
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => window.open(activeView === 'streetview' ? streetViewLink : googleMapsLink, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
              Open in Google Maps
            </Button>
            
            <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Maximize2 className="h-4 w-4" />
                  Fullscreen
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full p-0">
                <DialogHeader className="absolute top-2 left-2 z-20">
                  <DialogTitle className="bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {title} - {activeView === 'streetview' ? 'Street View' : 'Map View'}
                  </DialogTitle>
                </DialogHeader>
                <div className="w-full h-full">
                  <MapIframe fullscreen view={activeView} />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {/* View Toggle */}
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'map' | 'streetview')} className="mb-3">
          <TabsList className="grid w-full grid-cols-2 max-w-xs">
            <TabsTrigger value="streetview" className="gap-2">
              <Navigation className="h-4 w-4" />
              Street View
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-2">
              <Map className="h-4 w-4" />
              Map View
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <MapIframe view={activeView} />
        
        {address && (
          <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>{address}</p>
          </div>
        )}
        
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <p>🖱️ Click and drag to look around • Use controls to navigate</p>
          <Badge variant="outline" className="text-xs">
            Powered by Google Maps
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleMapEmbed;
