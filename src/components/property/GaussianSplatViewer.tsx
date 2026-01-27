import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Maximize2, RotateCcw, Move3D, ZoomIn, ZoomOut, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface GaussianSplatViewerProps {
  // Option 1: Luma AI embed URL
  lumaUrl?: string;
  // Option 2: Direct .ply/.splat file URL (requires gaussian-splats-3d library)
  splatUrl?: string;
  // Metadata
  title?: string;
  className?: string;
}

/**
 * GaussianSplatViewer - Displays 3D Gaussian Splatting captures
 * 
 * Supports two modes:
 * 1. Luma AI Embed (easiest) - Just provide the Luma share URL
 * 2. Direct .ply/.splat files - Requires @mkkellogg/gaussian-splats-3d
 * 
 * Workflow:
 * 1. Record a 1-min video walking through the room
 * 2. Upload to Luma AI (lumalabs.ai/interactive-scenes)
 * 3. Get the share URL or export .ply file
 * 4. Use this component to display
 */
const GaussianSplatViewer: React.FC<GaussianSplatViewerProps> = ({
  lumaUrl,
  splatUrl,
  title = '3D Room Tour',
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert Luma share URL to embed URL
  const getLumaEmbedUrl = (url: string) => {
    // Handle different Luma URL formats
    // https://lumalabs.ai/capture/xxx -> https://lumalabs.ai/embed/xxx
    // https://lumalabs.ai/interactive-scenes/xxx -> embed format
    if (url.includes('/capture/')) {
      return url.replace('/capture/', '/embed/');
    }
    if (url.includes('/interactive-scenes/')) {
      const id = url.split('/interactive-scenes/')[1]?.split('?')[0];
      return `https://lumalabs.ai/embed/${id}`;
    }
    // Already an embed URL
    if (url.includes('/embed/')) {
      return url;
    }
    return url;
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('Failed to load 3D view. Please check the URL.');
  };

  // Render Luma AI embed
  if (lumaUrl) {
    const embedUrl = getLumaEmbedUrl(lumaUrl);
    
    const ViewerContent = ({ fullscreen = false }: { fullscreen?: boolean }) => (
      <div
        ref={containerRef}
        className={cn(
          'relative overflow-hidden rounded-lg bg-black',
          fullscreen ? 'w-full h-full' : 'aspect-video',
          className
        )}
      >
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="text-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-3" />
              <p className="text-white text-sm">Loading 3D Gaussian Splat...</p>
              <p className="text-white/60 text-xs mt-1">This may take a moment</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="text-center">
              <X className="h-10 w-10 text-destructive mx-auto mb-3" />
              <p className="text-white text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Luma AI Iframe */}
        <iframe
          src={embedUrl}
          className="w-full h-full border-0"
          allow="xr-spatial-tracking; gyroscope; accelerometer"
          allowFullScreen
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />

        {/* Badge */}
        <Badge 
          className="absolute top-4 left-4 gap-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 z-20"
        >
          <Sparkles className="h-3.5 w-3.5" />
          3D Gaussian Splat
        </Badge>

        {/* Title */}
        <div className="absolute top-4 right-4 z-20">
          <Badge variant="secondary" className="bg-black/70 text-white">
            {title}
          </Badge>
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/70 backdrop-blur-sm text-white text-sm">
            <Move3D className="h-4 w-4" />
            <span>Drag to orbit • Scroll to zoom • Right-click to pan</span>
            {!fullscreen && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 ml-2 text-white hover:bg-white/20"
                onClick={() => setIsFullscreen(true)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );

    return (
      <>
        <ViewerContent />
        
        {/* Fullscreen Dialog */}
        <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="w-full h-[90vh]">
              <ViewerContent fullscreen />
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Render splat file viewer (requires @mkkellogg/gaussian-splats-3d)
  if (splatUrl) {
    return (
      <div
        className={cn(
          'relative aspect-video rounded-lg bg-muted flex items-center justify-center',
          className
        )}
      >
        <div className="text-center p-6">
          <Sparkles className="h-12 w-12 text-primary mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-2">Direct Splat File Support</h3>
          <p className="text-sm text-muted-foreground mb-4">
            To render .ply/.splat files directly, install the gaussian-splats-3d library:
          </p>
          <code className="text-xs bg-secondary px-3 py-2 rounded block">
            npm install @mkkellogg/gaussian-splats-3d
          </code>
          <p className="text-xs text-muted-foreground mt-4">
            Or use Luma AI embed URL for easier integration
          </p>
        </div>
      </div>
    );
  }

  // No URL provided
  return (
    <div
      className={cn(
        'relative aspect-video rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-dashed border-muted-foreground/30 flex items-center justify-center',
        className
      )}
    >
      <div className="text-center p-6 max-w-md">
        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">3D Gaussian Splatting</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Create stunning photorealistic 3D tours from just a video walkthrough
        </p>
        <div className="text-left bg-secondary/50 rounded-lg p-4 text-sm">
          <p className="font-medium mb-2">How to create:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Record a 1-minute video walking through the room</li>
            <li>Upload to <a href="https://lumalabs.ai" target="_blank" className="text-primary hover:underline">Luma AI</a></li>
            <li>Copy the share URL</li>
            <li>Paste it in this component</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default GaussianSplatViewer;
