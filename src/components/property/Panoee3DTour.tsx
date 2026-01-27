import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Box, Maximize2, Minimize2, X, RotateCcw, ExternalLink } from 'lucide-react';
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
import { cn } from '@/lib/utils';

interface Panoee3DTourProps {
  tourUrl: string;
  title?: string;
  className?: string;
}

const Panoee3DTour: React.FC<Panoee3DTourProps> = ({ 
  tourUrl, 
  title = "3D Virtual Tour",
  className 
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Validate Panoee URL
  const isPanoeeUrl = tourUrl.includes('tour.panoee.net') || tourUrl.includes('panoee.com');
  
  if (!isPanoeeUrl) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Box className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Invalid Panoee tour URL</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const EmbeddedTour = ({ fullscreen = false }: { fullscreen?: boolean }) => (
    <div className={cn(
      "relative bg-black rounded-lg overflow-hidden",
      fullscreen ? "w-full h-full" : "aspect-video"
    )}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/80 z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Loading 3D Tour...</p>
          </div>
        </div>
      )}
      
      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="text-center p-4">
            <p className="text-destructive mb-2">Failed to load 3D tour</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setHasError(false);
                setIsLoading(true);
              }}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <iframe
          src={tourUrl}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking; fullscreen"
          allowFullScreen
          loading="lazy"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      )}
    </div>
  );

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Box className="h-5 w-5 text-primary" />
            {title}
            <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              360° View
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => window.open(tourUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
              Open in New Tab
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
                    <Box className="h-4 w-4 text-primary" />
                    {title}
                  </DialogTitle>
                </DialogHeader>
                <div className="w-full h-full min-h-[80vh]">
                  <EmbeddedTour fullscreen />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <EmbeddedTour />
        </motion.div>
        
        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
          <p>🔄 Drag to rotate • 🔍 Scroll to zoom • 🖱️ Click hotspots to navigate</p>
          <Badge variant="outline" className="text-xs">
            Powered by Panoee
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default Panoee3DTour;
