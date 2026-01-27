import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize2, SkipBack, SkipForward, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  title = 'Property Walkthrough',
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'relative aspect-video rounded-lg overflow-hidden bg-black group',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="h-10 w-10 text-white animate-spin" />
        </div>
      )}

      {/* Title Badge */}
      <Badge className="absolute top-4 left-4 bg-black/70 text-white hover:bg-black/80">
        🎥 {title}
      </Badge>

      {/* Play Button Overlay */}
      {!isPlaying && !isLoading && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
          onClick={togglePlay}
        >
          <div className="h-20 w-20 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
            <Play className="h-10 w-10 text-primary ml-1" />
          </div>
        </motion.div>
      )}

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: showControls || !isPlaying ? 1 : 0, 
          y: showControls || !isPlaying ? 0 : 20 
        }}
        transition={{ duration: 0.2 }}
        className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
      >
        {/* Progress Bar */}
        <div className="mb-3">
          <Slider
            value={[currentTime]}
            onValueChange={handleSeek}
            max={duration || 100}
            step={0.1}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-white/80 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-white hover:bg-white/20"
              onClick={() => skip(-10)}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-white hover:bg-white/20"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-white hover:bg-white/20"
              onClick={() => skip(10)}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-white hover:bg-white/20"
              onClick={toggleMute}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-white hover:bg-white/20"
              onClick={toggleFullscreen}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VideoPlayer;
