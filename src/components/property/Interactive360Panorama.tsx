import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Maximize2, Volume2, VolumeX, RotateCcw, X, Navigation, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface Hotspot {
  id: string;
  pitch: number; // Vertical position (-90 to 90)
  yaw: number;   // Horizontal position (-180 to 180)
  label: string;
  targetScene?: string; // Scene ID to navigate to
  type: 'navigation' | 'info' | 'link';
  content?: string; // Info tooltip content
  url?: string; // External link
}

interface Scene {
  id: string;
  title: string;
  imageUrl: string;
  hotspots?: Hotspot[];
}

interface Interactive360PanoramaProps {
  scenes: Scene[];
  initialScene?: string;
  className?: string;
  autoRotate?: boolean;
}

/**
 * Interactive360Panorama - 360° panoramic viewer with navigation hotspots
 * 
 * Features:
 * - Multiple connected scenes (room to room navigation)
 * - Clickable hotspots for navigation, info, or links
 * - Auto-rotate option
 * - Fullscreen support
 * 
 * Uses Pannellum (embedded via CDN) for 360° viewing
 * 
 * How to create panoramas:
 * 1. Use your phone's panorama mode OR
 * 2. Use a 360° camera (Insta360, Ricoh Theta) OR
 * 3. Use Google Street View app to capture
 */
const Interactive360Panorama: React.FC<Interactive360PanoramaProps> = ({
  scenes,
  initialScene,
  className,
  autoRotate = true,
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const pannellumRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentScene, setCurrentScene] = useState(initialScene || scenes[0]?.id);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSceneList, setShowSceneList] = useState(false);

  // Load Pannellum script
  useEffect(() => {
    // Check if Pannellum is already loaded
    if ((window as any).pannellum) {
      initViewer();
      return;
    }

    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
    script.async = true;
    script.onload = () => {
      initViewer();
    };
    document.head.appendChild(script);

    return () => {
      if (pannellumRef.current?.destroy) {
        pannellumRef.current.destroy();
      }
    };
  }, []);

  // Initialize Pannellum viewer
  const initViewer = () => {
    if (!viewerRef.current || !(window as any).pannellum) return;

    // Build scenes config for Pannellum
    const scenesConfig: Record<string, any> = {};
    
    scenes.forEach((scene) => {
      scenesConfig[scene.id] = {
        title: scene.title,
        type: 'equirectangular',
        panorama: scene.imageUrl,
        autoLoad: true,
        hotSpots: scene.hotspots?.map((hotspot) => ({
          pitch: hotspot.pitch,
          yaw: hotspot.yaw,
          type: hotspot.type === 'navigation' ? 'scene' : 'info',
          text: hotspot.label,
          sceneId: hotspot.targetScene,
          URL: hotspot.url,
          cssClass: `hotspot-${hotspot.type}`,
        })) || [],
      };
    });

    // Initialize viewer
    pannellumRef.current = (window as any).pannellum.viewer(viewerRef.current, {
      default: {
        firstScene: currentScene,
        autoLoad: true,
        autoRotate: autoRotate ? -2 : 0,
        compass: true,
        showControls: false,
      },
      scenes: scenesConfig,
    });

    pannellumRef.current.on('load', () => {
      setIsLoading(false);
    });

    pannellumRef.current.on('scenechange', (sceneId: string) => {
      setCurrentScene(sceneId);
    });
  };

  // Navigate to scene
  const goToScene = (sceneId: string) => {
    if (pannellumRef.current?.loadScene) {
      pannellumRef.current.loadScene(sceneId);
      setShowSceneList(false);
    }
  };

  // Toggle auto rotate
  const toggleAutoRotate = () => {
    if (pannellumRef.current) {
      const current = pannellumRef.current.getConfig().autoRotate;
      pannellumRef.current.setAutoRotate(current ? 0 : -2);
    }
  };

  const currentSceneData = scenes.find(s => s.id === currentScene);

  const ViewerContent = ({ fullscreen = false }: { fullscreen?: boolean }) => (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg bg-black',
        fullscreen ? 'w-full h-full' : 'aspect-video',
        className
      )}
    >
      {/* Pannellum Container */}
      <div 
        ref={viewerRef} 
        className="w-full h-full"
        style={{ minHeight: fullscreen ? '100%' : '400px' }}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="text-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-3" />
            <p className="text-white text-sm">Loading 360° Panorama...</p>
          </div>
        </div>
      )}

      {/* Badge */}
      <Badge 
        className="absolute top-4 left-4 gap-1.5 bg-black/70 text-white hover:bg-black/80 z-20"
      >
        <Navigation className="h-3.5 w-3.5" />
        360° Interactive Tour
      </Badge>

      {/* Current Scene */}
      {currentSceneData && (
        <Badge 
          variant="secondary" 
          className="absolute top-4 right-4 bg-black/70 text-white z-20"
        >
          {currentSceneData.title}
        </Badge>
      )}

      {/* Scene Navigator */}
      {scenes.length > 1 && (
        <div className="absolute bottom-4 left-4 z-20">
          <Button
            variant="secondary"
            size="sm"
            className="gap-2 bg-black/70 text-white hover:bg-black/80"
            onClick={() => setShowSceneList(!showSceneList)}
          >
            <Navigation className="h-4 w-4" />
            Rooms ({scenes.length})
          </Button>
          
          {/* Scene List */}
          {showSceneList && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-full left-0 mb-2 bg-black/90 backdrop-blur-sm rounded-lg p-2 min-w-[200px]"
            >
              {scenes.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => goToScene(scene.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2',
                    scene.id === currentScene
                      ? 'bg-primary text-primary-foreground'
                      : 'text-white hover:bg-white/20'
                  )}
                >
                  <ChevronRight className="h-4 w-4" />
                  {scene.title}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20">
        <Button
          variant="secondary"
          size="icon"
          className="h-9 w-9 bg-black/70 text-white hover:bg-black/80"
          onClick={toggleAutoRotate}
          title="Toggle auto-rotate"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        {!fullscreen && (
          <Button
            variant="secondary"
            size="icon"
            className="h-9 w-9 bg-black/70 text-white hover:bg-black/80"
            onClick={() => setIsFullscreen(true)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 text-white text-xs z-20">
        Drag to look around • Click hotspots to navigate
      </div>
    </div>
  );

  // Demo mode when no scenes provided
  if (!scenes || scenes.length === 0) {
    return (
      <div
        className={cn(
          'relative aspect-video rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-dashed border-muted-foreground/30 flex items-center justify-center',
          className
        )}
      >
        <div className="text-center p-6 max-w-md">
          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center mx-auto mb-4">
            <Navigation className="h-8 w-8 text-white" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Interactive 360° Panorama</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create immersive room-to-room navigation experiences
          </p>
          <div className="text-left bg-secondary/50 rounded-lg p-4 text-sm">
            <p className="font-medium mb-2">How to create:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Use your phone's panorama mode in each room</li>
              <li>Upload panorama images</li>
              <li>Define hotspots for room navigation</li>
              <li>Connect scenes together</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

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
};

export default Interactive360Panorama;

// CSS styles for hotspots (add to your global CSS)
const hotspotStyles = `
.pnlm-hotspot.hotspot-navigation {
  background: linear-gradient(135deg, #3B82F6, #8B5CF6);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: pulse 2s infinite;
}

.pnlm-hotspot.hotspot-info {
  background: linear-gradient(135deg, #10B981, #14B8A6);
  border-radius: 50%;
  width: 24px;
  height: 24px;
}

.pnlm-hotspot.hotspot-link {
  background: linear-gradient(135deg, #F59E0B, #EF4444);
  border-radius: 50%;
  width: 24px;
  height: 24px;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}
`;
