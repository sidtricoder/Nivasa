import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Rotate3d, Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface VirtualTour360Props {
  images: string[]; // Array of images for 360 rotation
  className?: string;
}

const VirtualTour360: React.FC<VirtualTour360Props> = ({ images, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  // Auto-rotate effect
  useEffect(() => {
    if (!autoRotate || isDragging) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 150);

    return () => clearInterval(interval);
  }, [autoRotate, isDragging, images.length]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setAutoRotate(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const diff = e.clientX - startX;
    const sensitivity = 5; // pixels per frame

    if (Math.abs(diff) > sensitivity) {
      const direction = diff > 0 ? 1 : -1;
      setCurrentIndex((prev) => {
        const newIndex = prev + direction;
        if (newIndex < 0) return images.length - 1;
        if (newIndex >= images.length) return 0;
        return newIndex;
      });
      setStartX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setAutoRotate(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const diff = e.touches[0].clientX - startX;
    const sensitivity = 5;

    if (Math.abs(diff) > sensitivity) {
      const direction = diff > 0 ? 1 : -1;
      setCurrentIndex((prev) => {
        const newIndex = prev + direction;
        if (newIndex < 0) return images.length - 1;
        if (newIndex >= images.length) return 0;
        return newIndex;
      });
      setStartX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const TourViewer = ({ fullscreen = false }: { fullscreen?: boolean }) => (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden rounded-lg bg-black cursor-grab active:cursor-grabbing',
        fullscreen ? 'w-full h-full' : 'aspect-video',
        className
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Current Frame */}
      <motion.img
        key={currentIndex}
        src={images[currentIndex]}
        alt={`Virtual tour frame ${currentIndex + 1}`}
        className="w-full h-full object-cover select-none"
        style={{ 
          transform: `scale(${zoom})`,
          transition: 'transform 0.2s ease-out',
        }}
        draggable={false}
      />

      {/* 360° Badge */}
      <Badge 
        className="absolute top-4 left-4 gap-1.5 bg-black/70 text-white hover:bg-black/80"
      >
        <Rotate3d className="h-3.5 w-3.5" />
        360° View
      </Badge>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="flex items-center gap-1 px-3 py-2 rounded-full bg-black/70 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              setZoom((z) => Math.max(1, z - 0.5));
            }}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              setZoom((z) => Math.min(3, z + 0.5));
            }}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="w-px h-4 bg-white/30" />
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8 text-white hover:bg-white/20',
              autoRotate && 'bg-white/20'
            )}
            onClick={(e) => {
              e.stopPropagation();
              setAutoRotate(!autoRotate);
            }}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          {!fullscreen && (
            <>
              <div className="w-px h-4 bg-white/30" />
              <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-xs">
        Drag to rotate • {currentIndex + 1}/{images.length}
      </div>
    </div>
  );

  return (
    <>
      <TourViewer />
      
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
            <TourViewer fullscreen />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VirtualTour360;
