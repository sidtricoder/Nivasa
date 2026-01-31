import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Wand2,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  Check,
  AlertCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  StylePreset,
  RoomType,
  StagingResult,
  stylePresets,
  roomTypes,
  generateStagedImage,
  isReplicateConfigured,
} from '@/services/virtualStagingService';

interface VirtualStagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: string;
  allImages?: string[]; // All property images for selection
  propertyTitle?: string;
}

// Spring animation config from CLAUDE.md
const springConfig = { stiffness: 300, damping: 30 };

const VirtualStagingModal: React.FC<VirtualStagingModalProps> = ({
  isOpen,
  onClose,
  image,
  allImages = [],
  propertyTitle = 'Property',
}) => {
  const [selectedImage, setSelectedImage] = useState<string>(image);
  const [selectedStyle, setSelectedStyle] = useState<StylePreset>('modern');
  const [selectedRoom, setSelectedRoom] = useState<RoomType>('living-room');
  const [isGenerating, setIsGenerating] = useState(false);
  const [stagingResult, setStagingResult] = useState<StagingResult | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [savedStagings, setSavedStagings] = useState<StagingResult[]>([]);

  // Update selected image when prop changes
  React.useEffect(() => {
    setSelectedImage(image);
    setStagingResult(null);
  }, [image]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStagingResult(null);

    try {
      const result = await generateStagedImage(selectedImage, selectedStyle, selectedRoom);
      setStagingResult(result);
      setSliderPosition(50);
    } catch (error) {
      console.error('Failed to generate staging:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (stagingResult) {
      setSavedStagings(prev => [...prev, stagingResult]);
    }
  };

  const handleDownload = async () => {
    if (!stagingResult) return;
    
    try {
      const response = await fetch(stagingResult.stagedImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${propertyTitle.replace(/\s+/g, '-')}-staged-${stagingResult.style}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  const handleSliderDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleSliderTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const isDemoMode = !isReplicateConfigured();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-[#F0EEE9] dark:bg-slate-900 flex flex-col">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-2xl font-semibold tracking-[-0.02em] text-[#2B2F36] dark:text-slate-50">
            <Sparkles className="h-6 w-6 text-[#3B7BFF]" />
            Virtual Staging
            {isDemoMode && (
              <Badge variant="secondary" className="ml-2 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                Demo Mode
              </Badge>
            )}
          </DialogTitle>
          <p className="text-sm text-[#6B7280] dark:text-slate-400 mt-1">
            {isDemoMode 
              ? 'Preview example staging designs for each room type and style'
              : 'Transform empty rooms into beautifully furnished spaces'
            }
          </p>
          {isDemoMode && (
            <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Demo mode shows example {selectedRoom.replace('-', ' ')} designs. Configure Hugging Face API for AI-powered transformations of your actual photos.
              </p>
            </div>
          )}
        </DialogHeader>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Style Presets */}
          <div>
            <label className="text-sm font-medium text-[#2B2F36] dark:text-slate-200 mb-3 block">
              Choose Style
            </label>
            <div className="grid grid-cols-5 gap-3">
              {stylePresets.map((style) => (
                <motion.button
                  key={style.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={springConfig}
                  onClick={() => setSelectedStyle(style.id)}
                  className={cn(
                    "relative p-4 rounded-2xl border-2 transition-all duration-200",
                    "bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl",
                    selectedStyle === style.id
                      ? "border-[#3B7BFF] shadow-[0_8px_24px_-8px_rgba(59,123,255,0.3)]"
                      : "border-transparent hover:border-[#E5E7EB] dark:hover:border-slate-600"
                  )}
                >
                  {selectedStyle === style.id && (
                    <motion.div
                      layoutId="selectedStyle"
                      className="absolute top-2 right-2"
                      initial={false}
                      transition={springConfig}
                    >
                      <Check className="h-4 w-4 text-[#3B7BFF]" />
                    </motion.div>
                  )}
                  <div className="text-2xl mb-2">{style.icon}</div>
                  <p className="text-sm font-medium text-[#2B2F36] dark:text-slate-200">
                    {style.name}
                  </p>
                  <div className="flex gap-1 mt-2 justify-center">
                    {style.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-3 h-3 rounded-full border border-black/10"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Room Type */}
          <div>
            <label className="text-sm font-medium text-[#2B2F36] dark:text-slate-200 mb-3 block">
              Room Type
            </label>
            <div className="flex flex-wrap gap-2">
              {roomTypes.map((room) => (
                <motion.button
                  key={room.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={springConfig}
                  onClick={() => setSelectedRoom(room.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all",
                    "bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl",
                    selectedRoom === room.id
                      ? "border-[#3B7BFF] text-[#3B7BFF]"
                      : "border-transparent text-[#6B7280] hover:text-[#2B2F36] dark:hover:text-slate-200"
                  )}
                >
                  <span>{room.icon}</span>
                  <span className="text-sm font-medium">{room.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Image Selector - Show if multiple images available */}
          {allImages.length > 1 && (
            <div>
              <label className="text-sm font-medium text-[#2B2F36] dark:text-slate-200 mb-3 block">
                Select Photo to Stage
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={springConfig}
                    onClick={() => {
                      setSelectedImage(img);
                      setStagingResult(null);
                    }}
                    className={cn(
                      "relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all",
                      selectedImage === img
                        ? "border-[#3B7BFF] shadow-[0_4px_12px_-4px_rgba(59,123,255,0.4)]"
                        : "border-transparent opacity-70 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                    {selectedImage === img && (
                      <div className="absolute inset-0 bg-[#3B7BFF]/10 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white drop-shadow-md" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Image Preview / Result */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-white/50 dark:bg-slate-800/50 border border-[#E5E7EB] dark:border-slate-700">
            {isGenerating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#F0EEE9] to-white dark:from-slate-900 dark:to-slate-800">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Wand2 className="h-12 w-12 text-[#3B7BFF]" />
                </motion.div>
                <p className="mt-4 text-[#2B2F36] dark:text-slate-200 font-medium">
                  AI is staging your room...
                </p>
                <p className="text-sm text-[#6B7280] mt-1">
                  This usually takes a few seconds
                </p>
                <motion.div
                  className="mt-4 h-1 w-48 bg-[#E5E7EB] dark:bg-slate-700 rounded-full overflow-hidden"
                >
                  <motion.div
                    className="h-full bg-[#3B7BFF]"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                  />
                </motion.div>
              </div>
            ) : stagingResult ? (
              // Before/After Comparison Slider
              <div
                className="relative w-full h-full cursor-ew-resize select-none"
                onMouseMove={handleSliderDrag}
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                onTouchMove={handleSliderTouch}
              >
                {/* After (Staged) Image - Full Width Background */}
                <img
                  src={stagingResult.stagedImage}
                  alt="Staged"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Before (Original) Image - Clipped */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <img
                    src={selectedImage}
                    alt="Original"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ width: `${100 / (sliderPosition / 100)}%`, maxWidth: 'none' }}
                  />
                </div>

                {/* Slider Handle */}
                <motion.div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
                  style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <ChevronLeft className="h-4 w-4 text-[#2B2F36] -mr-1" />
                    <ChevronRight className="h-4 w-4 text-[#2B2F36] -ml-1" />
                  </div>
                </motion.div>

                {/* Labels */}
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-[#2B2F36]">
                    Before
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-[#3B7BFF] text-white">
                    After
                  </Badge>
                </div>
              </div>
            ) : (
              // Original Image Preview
              <div className="relative w-full h-full">
                <img
                  src={selectedImage}
                  alt="Original"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <p className="text-white font-medium">
                    Select a style and click "Generate Staging"
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {savedStagings.length > 0 && (
                <Badge variant="outline" className="text-[#6B7280]">
                  {savedStagings.length} saved staging{savedStagings.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              {stagingResult && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleSave}
                    className="gap-2 border-[#E5E7EB] dark:border-slate-600"
                  >
                    <Check className="h-4 w-4" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    className="gap-2 border-[#E5E7EB] dark:border-slate-600"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </>
              )}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="gap-2 bg-[#3B7BFF] hover:bg-[#3B7BFF]/90 text-white shadow-[0_4px_14px_rgba(59,123,255,0.3)]"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                {stagingResult ? 'Regenerate' : 'Generate Staging'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VirtualStagingModal;
