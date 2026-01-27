import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearchStore } from '@/stores/searchStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface VoiceSearchButtonProps {
  onResult: (transcript: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Check if browser supports Web Speech API
const isSpeechRecognitionSupported = () => {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

const VoiceSearchButton: React.FC<VoiceSearchButtonProps> = ({
  onResult,
  className,
  size = 'md',
}) => {
  const { isListening, setIsListening, voiceTranscript, setVoiceTranscript } = useSearchStore();
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!isSpeechRecognitionSupported()) {
      setIsSupported(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();

    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-IN'; // Indian English

    recognitionInstance.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setVoiceTranscript(transcript);
      
      // If this is a final result, trigger the search
      if (event.results[event.results.length - 1].isFinal) {
        onResult(transcript);
        setIsListening(false);
      }
    };

    recognitionInstance.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please allow microphone access to use voice search.');
      } else if (event.error === 'no-speech') {
        toast.info("Didn't catch that. Please try again.");
      } else {
        toast.error('Voice search error. Please try again.');
      }
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    setRecognition(recognitionInstance);

    return () => {
      recognitionInstance.abort();
    };
  }, [onResult, setIsListening, setVoiceTranscript]);

  const toggleListening = useCallback(() => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setVoiceTranscript('');
      recognition.start();
      setIsListening(true);
    }
  }, [recognition, isListening, setIsListening, setVoiceTranscript]);

  if (!isSupported) {
    return null; // Don't show button if not supported
  }

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className={cn('relative', className)}>
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="absolute inset-0 -m-1"
          >
            {/* Pulsing rings */}
            <motion.div
              className="absolute inset-0 rounded-full bg-destructive/20"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-destructive/30"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.2,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        type="button"
        variant={isListening ? 'destructive' : 'ghost'}
        size="icon"
        onClick={toggleListening}
        className={cn(
          'relative z-10 rounded-full transition-all duration-200',
          sizeClasses[size],
          isListening && 'ring-2 ring-destructive ring-offset-2 ring-offset-background'
        )}
        aria-label={isListening ? 'Stop listening' : 'Start voice search'}
      >
        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.div
              key="listening"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <MicOff className={iconSizes[size]} />
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Mic className={iconSizes[size]} />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      {/* Transcript tooltip */}
      <AnimatePresence>
        {isListening && voiceTranscript && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg max-w-xs">
              <p className="text-sm text-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                "{voiceTranscript}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceSearchButton;

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
