import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, ZoomIn, ZoomOut, RotateCcw, Layers, Box, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import Room3D from './Room3D';
import { FloorPlanData, Room, roomColors } from '@/types/floorPlan';

interface FloorPlan3DViewerProps {
  floorPlan: FloorPlanData;
  className?: string;
}

const FloorPlan3DViewer: React.FC<FloorPlan3DViewerProps> = ({ floorPlan, className }) => {
  // Default to 2D if image is available, otherwise 3D
  const [viewMode, setViewMode] = useState<'3D' | '2D'>(floorPlan?.floorPlanImage ? '2D' : '3D');
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Validate floor plan data
  if (!floorPlan || !floorPlan.rooms || floorPlan.rooms.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-8 rounded-xl bg-muted/50 min-h-[300px]', className)}>
        <Box className="h-12 w-12 text-muted-foreground mb-3" />
        <p className="text-muted-foreground text-center">
          No floor plan data available
        </p>
        <p className="text-sm text-muted-foreground/70 text-center mt-1">
          The seller hasn't uploaded a floor plan yet
        </p>
      </div>
    );
  }

  const hoveredRoomData = floorPlan.rooms.find(r => r.id === hoveredRoom);

  // Calculate bounds for camera positioning
  const bounds = floorPlan.rooms.reduce(
    (acc, room) => ({
      maxX: Math.max(acc.maxX, room.position.x + room.width),
      maxZ: Math.max(acc.maxZ, room.position.y + room.length),
    }),
    { maxX: 0, maxZ: 0 }
  );

  const cameraDistance = Math.max(bounds.maxX, bounds.maxZ) * 0.5;

  const Scene = () => (
    <>
      <PerspectiveCamera 
        makeDefault 
        position={[cameraDistance * 1.5, cameraDistance * 1.2, cameraDistance * 1.5]} 
        fov={50}
      />
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={30}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.2}
        target={[bounds.maxX * 0.15, 0, bounds.maxZ * 0.15]}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <directionalLight position={[-5, 10, -5]} intensity={0.3} />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[bounds.maxX * 0.15, -0.01, bounds.maxZ * 0.15]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#E8E4DF" roughness={1} />
      </mesh>

      {/* Rooms */}
      {floorPlan.rooms.map((room) => (
        <Room3D
          key={room.id}
          room={room}
          isHovered={hoveredRoom === room.id}
          onHover={setHoveredRoom}
        />
      ))}

      {/* Contact shadows for depth */}
      <ContactShadows
        position={[bounds.maxX * 0.15, 0, bounds.maxZ * 0.15]}
        opacity={0.4}
        scale={30}
        blur={2}
        far={10}
      />

      {/* Environment for reflections */}
      <Environment preset="apartment" />
    </>
  );

  const LoadingFallback = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-secondary/30">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Loading 3D View...</span>
      </div>
    </div>
  );

  const Viewer = ({ fullscreen = false }: { fullscreen?: boolean }) => (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200',
        fullscreen ? 'w-full h-full' : 'aspect-[16/10]',
        className
      )}
    >
      <AnimatePresence mode="wait">
        {viewMode === '3D' ? (
          <motion.div
            key="3d-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <Suspense fallback={<LoadingFallback />}>
              <Canvas 
                shadows
                camera={{ position: [20, 25, 20], fov: 50 }}
                gl={{ 
                  antialias: true,
                  powerPreference: 'high-performance',
                  failIfMajorPerformanceCaveat: false,
                }}
              >
                <Scene />
              </Canvas>
            </Suspense>
          </motion.div>
        ) : (
          <motion.div
            key="2d-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex items-center justify-center p-4"
          >
            {floorPlan.floorPlanImage ? (
              <img
                src={floorPlan.floorPlanImage}
                alt="2D Floor Plan"
                className="max-w-full max-h-full object-contain"
                style={{ transform: `scale(${zoom})` }}
              />
            ) : (
              <div className="text-center text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No 2D floor plan image available</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Mode Toggle */}
      <div className="absolute top-4 right-4 flex flex-col gap-1">
        <Button
          size="sm"
          variant={viewMode === '3D' ? 'default' : 'secondary'}
          className={cn(
            'rounded-lg px-4 font-semibold transition-all',
            viewMode === '3D' && 'bg-primary text-primary-foreground shadow-lg'
          )}
          onClick={() => setViewMode('3D')}
        >
          <Box className="h-4 w-4 mr-1" />
          3D
        </Button>
        <Button
          size="sm"
          variant={viewMode === '2D' ? 'default' : 'secondary'}
          className={cn(
            'rounded-lg px-4 font-semibold transition-all',
            viewMode === '2D' && 'bg-primary text-primary-foreground shadow-lg'
          )}
          onClick={() => setViewMode('2D')}
        >
          <Layers className="h-4 w-4 mr-1" />
          2D
        </Button>
      </div>

      {/* Info Badge */}
      <Badge className="absolute top-4 left-4 gap-1.5 bg-background/90 text-foreground backdrop-blur-sm">
        <Box className="h-3.5 w-3.5" />
        {viewMode} Floor Plan • {floorPlan.totalSqft} sq.ft
      </Badge>

      {/* Room Info on Hover */}
      <AnimatePresence>
        {hoveredRoomData && viewMode === '3D' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-20 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg"
          >
            <p className="font-semibold text-sm">{hoveredRoomData.name}</p>
            <p className="text-xs text-muted-foreground">
              {hoveredRoomData.width} × {hoveredRoomData.length} ft ({hoveredRoomData.width * hoveredRoomData.length} sq.ft)
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="flex items-center gap-1 px-3 py-2 rounded-full bg-background/90 backdrop-blur-sm shadow-lg">
          {viewMode === '2D' && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom Out</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-xs font-medium w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom In</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="w-px h-4 bg-border" />
            </>
          )}
          
          {viewMode === '3D' && (
            <span className="text-xs text-muted-foreground px-2">
              Drag to rotate • Scroll to zoom
            </span>
          )}

          {!fullscreen && (
            <>
              <div className="w-px h-4 bg-border" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setIsFullscreen(true)}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Fullscreen</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      </div>

      {/* Room Legend */}
      <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-2 shadow-lg max-h-32 overflow-y-auto">
        <p className="text-xs font-semibold mb-1 text-muted-foreground">Rooms</p>
        <div className="space-y-0.5">
          {floorPlan.rooms.map((room) => (
            <div 
              key={room.id} 
              className={cn(
                "text-xs px-2 py-0.5 rounded cursor-pointer transition-colors",
                hoveredRoom === room.id ? "bg-primary/20" : "hover:bg-muted"
              )}
              onMouseEnter={() => setHoveredRoom(room.id)}
              onMouseLeave={() => setHoveredRoom(null)}
            >
              {room.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Viewer />

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
            <Viewer fullscreen />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FloorPlan3DViewer;
