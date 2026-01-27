import React from 'react';
import { motion } from 'framer-motion';
import {
  Wifi,
  Car,
  Dumbbell,
  Trees,
  Shield,
  Droplets,
  Flame,
  Wind,
  Tv,
  Gamepad2,
  DoorClosed,
  Coffee,
  UtensilsCrossed,
  Building2,
  Sparkles,
  Zap,
  Sun,
  Moon,
  Camera,
  Lock,
  Users,
  Baby,
  Dog,
  ShoppingCart,
  Waves,
  Mountain,
  Bike,
  Train,
  Bus,
  Plane,
  CircleParking,
  Heater,
  AirVent,
  Refrigerator,
  WashingMachine,
  Armchair,
  Bed,
  Bath,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Amenity icon mapping
const amenityIcons: Record<string, { icon: LucideIcon; color: string }> = {
  // Connectivity
  'wifi': { icon: Wifi, color: 'text-blue-500' },
  'internet': { icon: Wifi, color: 'text-blue-500' },
  'high-speed internet': { icon: Wifi, color: 'text-blue-500' },
  
  // Parking
  'parking': { icon: Car, color: 'text-slate-500' },
  'covered parking': { icon: CircleParking, color: 'text-slate-500' },
  'visitor parking': { icon: Car, color: 'text-slate-600' },
  
  // Fitness
  'gym': { icon: Dumbbell, color: 'text-red-500' },
  'gymnasium': { icon: Dumbbell, color: 'text-red-500' },
  'fitness center': { icon: Dumbbell, color: 'text-red-500' },
  
  // Garden & Outdoors
  'garden': { icon: Trees, color: 'text-green-500' },
  'landscaped garden': { icon: Trees, color: 'text-green-500' },
  'terrace': { icon: Sun, color: 'text-amber-500' },
  'balcony': { icon: Sun, color: 'text-amber-500' },
  
  // Security
  'security': { icon: Shield, color: 'text-purple-500' },
  '24/7 security': { icon: Shield, color: 'text-purple-500' },
  'cctv': { icon: Camera, color: 'text-gray-500' },
  'cctv surveillance': { icon: Camera, color: 'text-gray-500' },
  'intercom': { icon: DoorClosed, color: 'text-blue-400' },
  'video door phone': { icon: Camera, color: 'text-blue-400' },
  
  // Water & Power
  'water supply': { icon: Droplets, color: 'text-cyan-500' },
  '24/7 water': { icon: Droplets, color: 'text-cyan-500' },
  'borewell': { icon: Droplets, color: 'text-cyan-600' },
  'power backup': { icon: Zap, color: 'text-yellow-500' },
  'generator': { icon: Zap, color: 'text-yellow-500' },
  
  // Entertainment
  'clubhouse': { icon: Users, color: 'text-indigo-500' },
  'swimming pool': { icon: Waves, color: 'text-blue-400' },
  'pool': { icon: Waves, color: 'text-blue-400' },
  'kids play area': { icon: Baby, color: 'text-pink-500' },
  'children play area': { icon: Baby, color: 'text-pink-500' },
  'indoor games': { icon: Gamepad2, color: 'text-purple-400' },
  'games room': { icon: Gamepad2, color: 'text-purple-400' },
  
  // Comfort
  'air conditioning': { icon: AirVent, color: 'text-sky-500' },
  'ac': { icon: AirVent, color: 'text-sky-500' },
  'central air': { icon: AirVent, color: 'text-sky-500' },
  'heating': { icon: Heater, color: 'text-orange-500' },
  'fireplace': { icon: Flame, color: 'text-orange-600' },
  
  // Appliances
  'modular kitchen': { icon: UtensilsCrossed, color: 'text-amber-600' },
  'refrigerator': { icon: Refrigerator, color: 'text-slate-400' },
  'washing machine': { icon: WashingMachine, color: 'text-blue-300' },
  'fully furnished': { icon: Armchair, color: 'text-amber-500' },
  'semi furnished': { icon: Armchair, color: 'text-amber-400' },
  
  // Transport
  'near metro': { icon: Train, color: 'text-red-500' },
  'metro': { icon: Train, color: 'text-red-500' },
  'near bus stop': { icon: Bus, color: 'text-green-600' },
  'near airport': { icon: Plane, color: 'text-sky-600' },
  
  // Pet Friendly
  'pet friendly': { icon: Dog, color: 'text-orange-400' },
  'pets allowed': { icon: Dog, color: 'text-orange-400' },
  
  // Views
  'city view': { icon: Building2, color: 'text-slate-600' },
  'mountain view': { icon: Mountain, color: 'text-emerald-600' },
  'sea view': { icon: Waves, color: 'text-blue-500' },
  'lake view': { icon: Waves, color: 'text-cyan-500' },
  
  // Other
  'gated community': { icon: Lock, color: 'text-slate-500' },
  'maintenance staff': { icon: Sparkles, color: 'text-violet-500' },
  'housekeeping': { icon: Sparkles, color: 'text-violet-500' },
  'jogging track': { icon: Bike, color: 'text-green-500' },
  'cycling track': { icon: Bike, color: 'text-green-500' },
  'shopping center': { icon: ShoppingCart, color: 'text-pink-600' },
  'coffee lounge': { icon: Coffee, color: 'text-amber-700' },
  'cafe': { icon: Coffee, color: 'text-amber-700' },
  'indoor sports': { icon: Dumbbell, color: 'text-red-400' },
  'outdoor sports': { icon: Trees, color: 'text-green-400' },
};

// Get icon for amenity
const getAmenityIcon = (amenity: string): { icon: LucideIcon; color: string } => {
  const normalizedAmenity = amenity.toLowerCase().trim();
  
  // Exact match
  if (amenityIcons[normalizedAmenity]) {
    return amenityIcons[normalizedAmenity];
  }
  
  // Partial match
  for (const [key, value] of Object.entries(amenityIcons)) {
    if (normalizedAmenity.includes(key) || key.includes(normalizedAmenity)) {
      return value;
    }
  }
  
  // Default
  return { icon: Sparkles, color: 'text-primary' };
};

interface AmenitiesDisplayProps {
  amenities: string[];
  className?: string;
  variant?: 'grid' | 'list' | 'badges';
  maxVisible?: number;
}

const AmenitiesDisplay: React.FC<AmenitiesDisplayProps> = ({
  amenities,
  className,
  variant = 'grid',
  maxVisible = 12,
}) => {
  const visibleAmenities = amenities.slice(0, maxVisible);
  const hiddenCount = amenities.length - maxVisible;

  if (variant === 'badges') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {visibleAmenities.map((amenity, index) => {
          const { icon: Icon, color } = getAmenityIcon(amenity);
          return (
            <motion.div
              key={amenity}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
            >
              <Badge variant="secondary" className="gap-1.5 py-1 px-2.5">
                <Icon className={cn('h-3.5 w-3.5', color)} />
                {amenity}
              </Badge>
            </motion.div>
          );
        })}
        {hiddenCount > 0 && (
          <Badge variant="outline" className="py-1 px-2.5">
            +{hiddenCount} more
          </Badge>
        )}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={cn('space-y-2', className)}>
        {visibleAmenities.map((amenity, index) => {
          const { icon: Icon, color } = getAmenityIcon(amenity);
          return (
            <motion.div
              key={amenity}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-center gap-3 py-2 px-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className={cn('h-8 w-8 rounded-full bg-background flex items-center justify-center')}>
                <Icon className={cn('h-4 w-4', color)} />
              </div>
              <span className="text-sm font-medium text-foreground">{amenity}</span>
            </motion.div>
          );
        })}
        {hiddenCount > 0 && (
          <div className="text-sm text-muted-foreground text-center py-2">
            +{hiddenCount} more amenities
          </div>
        )}
      </div>
    );
  }

  // Grid variant (default)
  return (
    <TooltipProvider>
      <div className={cn('grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3', className)}>
        {visibleAmenities.map((amenity, index) => {
          const { icon: Icon, color } = getAmenityIcon(amenity);
          return (
            <Tooltip key={amenity}>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-lg',
                    'bg-secondary/30 hover:bg-secondary/50',
                    'cursor-pointer transition-all hover:scale-105'
                  )}
                >
                  <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center shadow-sm">
                    <Icon className={cn('h-5 w-5', color)} />
                  </div>
                  <span className="text-xs text-muted-foreground text-center line-clamp-1">
                    {amenity.length > 10 ? amenity.slice(0, 10) + '...' : amenity}
                  </span>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{amenity}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
        {hiddenCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: maxVisible * 0.02 }}
            className={cn(
              'flex flex-col items-center justify-center gap-1 p-3 rounded-lg',
              'bg-primary/10 hover:bg-primary/20',
              'cursor-pointer transition-colors'
            )}
          >
            <span className="text-lg font-bold text-primary">+{hiddenCount}</span>
            <span className="text-xs text-muted-foreground">more</span>
          </motion.div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default AmenitiesDisplay;
