import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Hammer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Before',
  afterLabel = 'After',
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      ref={containerRef}
      className={cn(
        'relative aspect-video rounded-lg overflow-hidden cursor-ew-resize select-none',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    >
      {/* After Image (Full width, underneath) */}
      <img
        src={afterImage}
        alt={afterLabel}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Before Image (Clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={beforeImage}
          alt={beforeLabel}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ 
            width: containerRef.current?.offsetWidth || '100%',
            maxWidth: 'none',
          }}
          draggable={false}
        />
      </div>

      {/* Slider Line */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        {/* Slider Handle */}
        <div
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-10 h-10 rounded-full bg-white shadow-xl',
            'flex items-center justify-center',
            'border-2 border-primary',
            isDragging && 'scale-110'
          )}
          style={{ transition: 'transform 0.1s ease-out' }}
        >
          <ArrowLeftRight className="h-5 w-5 text-primary" />
        </div>
      </div>

      {/* Labels */}
      <Badge
        className="absolute top-4 left-4 bg-black/70 text-white hover:bg-black/80"
      >
        {beforeLabel}
      </Badge>
      <Badge
        className="absolute top-4 right-4 bg-primary text-white hover:bg-primary/90"
      >
        {afterLabel}
      </Badge>

      {/* Renovation Badge */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/70 backdrop-blur-sm flex items-center gap-2">
        <Hammer className="h-4 w-4 text-white" />
        <span className="text-sm text-white">Drag to compare</span>
      </div>
    </motion.div>
  );
};

export default BeforeAfterSlider;
