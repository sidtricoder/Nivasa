import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Maximize2, ZoomIn, ZoomOut, LayoutGrid, X, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface FloorPlan {
  id: string;
  name: string;
  image: string;
  type: '2D' | '3D';
  area?: string;
}

interface FloorPlanViewerProps {
  plans: FloorPlan[];
  className?: string;
}

const FloorPlanViewer: React.FC<FloorPlanViewerProps> = ({ plans, className }) => {
  const [selectedPlan, setSelectedPlan] = useState<FloorPlan>(plans[0]);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const plans2D = plans.filter((p) => p.type === '2D');
  const plans3D = plans.filter((p) => p.type === '3D');

  const PlanViewer = ({ fullscreen = false }: { fullscreen?: boolean }) => (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg bg-secondary/30',
        fullscreen ? 'w-full h-full' : 'aspect-[4/3]',
        className
      )}
    >
      {/* Floor Plan Image */}
      <motion.div
        key={selectedPlan.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-full flex items-center justify-center p-4"
      >
        <img
          src={selectedPlan.image}
          alt={selectedPlan.name}
          className="max-w-full max-h-full object-contain"
          style={{
            transform: `scale(${zoom})`,
            transition: 'transform 0.2s ease-out',
          }}
          draggable={false}
        />
      </motion.div>

      {/* Badge */}
      <Badge className="absolute top-4 left-4 gap-1.5 bg-background/90 text-foreground">
        <Layers className="h-3.5 w-3.5" />
        {selectedPlan.type} Floor Plan
      </Badge>

      {/* Plan Info */}
      <div className="absolute top-4 right-4 text-right">
        <p className="text-sm font-medium text-foreground bg-background/90 px-2 py-1 rounded">
          {selectedPlan.name}
        </p>
        {selectedPlan.area && (
          <p className="text-xs text-muted-foreground bg-background/90 px-2 py-1 rounded mt-1">
            {selectedPlan.area}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="flex items-center gap-1 px-3 py-2 rounded-full bg-background/90 backdrop-blur-sm shadow-lg">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs font-medium w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          {!fullscreen && (
            <>
              <div className="w-px h-4 bg-border" />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsFullscreen(true)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Plan Type Tabs */}
      {(plans2D.length > 0 && plans3D.length > 0) && (
        <Tabs defaultValue={selectedPlan.type} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-xs">
            <TabsTrigger value="2D" onClick={() => setSelectedPlan(plans2D[0])}>
              2D Floor Plan
            </TabsTrigger>
            <TabsTrigger value="3D" onClick={() => setSelectedPlan(plans3D[0])}>
              3D Floor Plan
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Plan Viewer */}
      <PlanViewer />

      {/* Plan Thumbnails */}
      {plans.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {plans
            .filter((p) => p.type === selectedPlan.type)
            .map((plan) => (
              <motion.button
                key={plan.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPlan(plan)}
                className={cn(
                  'shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors',
                  selectedPlan.id === plan.id
                    ? 'border-primary'
                    : 'border-transparent hover:border-border'
                )}
              >
                <img
                  src={plan.image}
                  alt={plan.name}
                  className="w-full h-full object-cover"
                />
              </motion.button>
            ))}
        </div>
      )}

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50"
            onClick={() => setIsFullscreen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="w-full h-[85vh]">
            <PlanViewer fullscreen />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FloorPlanViewer;
