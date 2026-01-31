import React, { useState } from 'react';
import { Pannellum } from 'pannellum-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, X, RotateCcw, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PannellumViewerProps {
  panoramaImages: string[];
  className?: string;
  height?: string;
}

const PannellumViewer: React.FC<PannellumViewerProps> = ({
  panoramaImages,
  className,
  height = '400px',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!panoramaImages || panoramaImages.length === 0) {
    return (
      <div className={cn('flex items-center justify-center bg-secondary/50 rounded-lg', className)} style={{ height }}>
        <div className="text-center p-8">
          <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No 360° panorama images available</p>
        </div>
      </div>
    );
  }

  const currentImage = panoramaImages[currentIndex];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % panoramaImages.length);
    setIsLoading(true);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + panoramaImages.length) % panoramaImages.length);
    setIsLoading(true);
  };

  const ViewerContent = ({ fullscreen = false }: { fullscreen?: boolean }) => (
    <div className={cn('relative rounded-lg overflow-hidden', fullscreen ? 'h-full' : '')} style={!fullscreen ? { height } : undefined}>
      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-background/80"
          >
            <div className="flex flex-col items-center gap-2">
              <RotateCcw className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading 360° view...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pannellum Viewer */}
      <Pannellum
        width="100%"
        height={fullscreen ? '100%' : height}
        image={currentImage}
        pitch={0}
        yaw={0}
        hfov={110}
        autoLoad
        autoRotate={2}
        compass={false}
        showControls={false}
        showZoomCtrl={false}
        showFullscreenCtrl={false}
        mouseZoom={true}
        draggable={true}
        onLoad={() => setIsLoading(false)}
        onError={(err: any) => console.error('Pannellum error:', err)}
      />

      {/* Controls overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5">
        {/* Navigation arrows (if multiple images) */}
        {panoramaImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium min-w-[40px] text-center">
              {currentIndex + 1} / {panoramaImages.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Fullscreen button */}
        {!fullscreen && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsFullscreen(true)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Tip */}
      <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1.5">
        <p className="text-xs text-muted-foreground">
          🖱️ Drag to look around
        </p>
      </div>
    </div>
  );

  return (
    <>
      <div className={className}>
        <ViewerContent />
      </div>

      {/* Fullscreen modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-background/80"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            <ViewerContent fullscreen />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PannellumViewer;
