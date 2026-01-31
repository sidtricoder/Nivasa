import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image, Loader2, Check, AlertCircle, Sparkles, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { processFloorPlan } from '@/services/floorPlanAnalysisService';
import { FloorPlanData, Room, roomColors } from '@/types/floorPlan';
import { cn } from '@/lib/utils';

interface FloorPlanUploadProps {
  bhk: number;
  sqft: number;
  onFloorPlanChange: (data: { image: string | null; floorPlanData: FloorPlanData | null }) => void;
  initialImage?: string;
  initialFloorPlan?: FloorPlanData;
}

type AnalysisStatus = 'idle' | 'uploading' | 'analyzing' | 'success' | 'fallback' | 'error';

const FloorPlanUpload: React.FC<FloorPlanUploadProps> = ({
  bhk,
  sqft,
  onFloorPlanChange,
  initialImage,
  initialFloorPlan,
}) => {
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [floorPlanData, setFloorPlanData] = useState<FloorPlanData | null>(initialFloorPlan || null);
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload an image file');
      setStatus('error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size must be less than 10MB');
      setStatus('error');
      return;
    }

    setStatus('uploading');
    setErrorMessage('');

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Image = event.target?.result as string;
        setImage(base64Image);
        setStatus('analyzing');

        try {
          // Process floor plan with AI analysis
          const result = await processFloorPlan(base64Image, bhk, sqft);
          
          setFloorPlanData(result.floorPlanData);
          setStatus(result.usedTemplate ? 'fallback' : 'success');
          
          // Notify parent
          onFloorPlanChange({
            image: base64Image,
            floorPlanData: result.floorPlanData,
          });
        } catch (error) {
          console.error('Analysis error:', error);
          // Still use template on error
          const result = await processFloorPlan(null, bhk, sqft);
          setFloorPlanData(result.floorPlanData);
          setStatus('fallback');
          onFloorPlanChange({
            image: base64Image,
            floorPlanData: result.floorPlanData,
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setErrorMessage('Failed to process image');
      setStatus('error');
    }
  }, [bhk, sqft, onFloorPlanChange]);

  const handleUseTemplate = async () => {
    setStatus('analyzing');
    try {
      const result = await processFloorPlan(null, bhk, sqft);
      setFloorPlanData(result.floorPlanData);
      setImage(null);
      setStatus('fallback');
      onFloorPlanChange({
        image: null,
        floorPlanData: result.floorPlanData,
      });
    } catch (error) {
      setErrorMessage('Failed to generate template');
      setStatus('error');
    }
  };

  const handleRemove = () => {
    setImage(null);
    setFloorPlanData(null);
    setStatus('idle');
    onFloorPlanChange({ image: null, floorPlanData: null });
  };

  return (
    <Card className="border-dashed border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Floor Plan
        </CardTitle>
        <CardDescription>
          Upload a 2D floor plan image for AI analysis, or use our auto-generated template
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {status === 'idle' && !image && !floorPlanData && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Upload Area */}
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium text-foreground">
                    Click to upload floor plan
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG up to 10MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              {/* Template Option */}
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleUseTemplate}
              >
                <Sparkles className="h-4 w-4" />
                Auto-generate {bhk}BHK Template
              </Button>
            </motion.div>
          )}

          {(status === 'uploading' || status === 'analyzing') && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-48 space-y-4"
            >
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <div className="text-center">
                <p className="font-medium text-foreground">
                  {status === 'uploading' ? 'Uploading...' : 'Analyzing floor plan...'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {status === 'analyzing' && 'Detecting rooms and dimensions with AI'}
                </p>
              </div>
            </motion.div>
          )}

          {(status === 'success' || status === 'fallback') && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <Badge variant={status === 'success' ? 'default' : 'secondary'} className="gap-1">
                  {status === 'success' ? (
                    <>
                      <Sparkles className="h-3 w-3" />
                      AI Detected
                    </>
                  ) : (
                    <>
                      <Building2 className="h-3 w-3" />
                      Template Generated
                    </>
                  )}
                </Badge>
                <Button variant="ghost" size="sm" onClick={handleRemove}>
                  Remove
                </Button>
              </div>

              {/* Preview */}
              <div className="grid grid-cols-2 gap-4">
                {/* 2D Image Preview */}
                {image && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">2D Floor Plan</p>
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img
                        src={image}
                        alt="Floor Plan"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Room List */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Detected Rooms ({floorPlanData?.rooms.length || 0})
                  </p>
                  <div className={cn(
                    "space-y-1.5 max-h-48 overflow-y-auto pr-2",
                    !image && "col-span-2"
                  )}>
                    {floorPlanData?.rooms.map((room) => (
                      <div
                        key={room.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                      >
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: roomColors[room.type]?.floor || '#888' }}
                        />
                        <span className="text-sm font-medium flex-1 truncate">
                          {room.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {room.width}' × {room.length}'
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Info Message */}
              {status === 'fallback' && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Using template layout based on {bhk}BHK configuration
                </p>
              )}
              {status === 'success' && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Room layout detected from your floor plan image
                </p>
              )}
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-48 space-y-4"
            >
              <AlertCircle className="h-10 w-10 text-destructive" />
              <div className="text-center">
                <p className="font-medium text-destructive">{errorMessage}</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={handleRemove}>
                  Try Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default FloorPlanUpload;
