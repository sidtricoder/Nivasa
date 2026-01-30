import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  School,
  Hospital,
  Train,
  ShoppingBag,
  TreePine,
  Utensils,
  Shield,
  MapPin,
  Loader2,
  AlertCircle,
  Flame,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  getNeighborhoodData, 
  NearbyAmenity, 
  NeighborhoodData 
} from '@/services/neighborhoodService';

interface NeighborhoodDashboardProps {
  coordinates: { lat: number; lng: number };
  fallbackData?: {
    type: string;
    name: string;
    distance: string;
  }[];
  className?: string;
}

// Icon mapping for amenity types
const amenityIcons: Record<string, React.ComponentType<any>> = {
  school: School,
  hospital: Hospital,
  metro: Train,
  park: TreePine,
  mall: ShoppingBag,
  restaurant: Utensils,
  police: Shield,
  fire_station: Flame,
};

// Color mapping for amenity types
const amenityColors: Record<string, string> = {
  school: 'bg-blue-500/10 text-blue-600',
  hospital: 'bg-red-500/10 text-red-600',
  metro: 'bg-purple-500/10 text-purple-600',
  park: 'bg-green-500/10 text-green-600',
  mall: 'bg-amber-500/10 text-amber-600',
  restaurant: 'bg-orange-500/10 text-orange-600',
  police: 'bg-indigo-500/10 text-indigo-600',
  fire_station: 'bg-rose-500/10 text-rose-600',
};

// Spring animation config from CLAUDE.md
const springConfig = { stiffness: 300, damping: 30 };

const NeighborhoodDashboard: React.FC<NeighborhoodDashboardProps> = ({
  coordinates,
  fallbackData,
  className,
}) => {
  const [data, setData] = useState<NeighborhoodData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getNeighborhoodData(coordinates.lat, coordinates.lng);
      setData(result);
    } catch (err) {
      console.error('Failed to fetch neighborhood data:', err);
      setError('Unable to load neighborhood data');
      
      // Use fallback data if available
      if (fallbackData && fallbackData.length > 0) {
        setData({
          amenities: fallbackData.map((item, index) => ({
            type: item.type as NearbyAmenity['type'],
            name: item.name,
            distance: item.distance,
            distanceMeters: parseFloat(item.distance) * (item.distance.includes('km') ? 1000 : 1),
            lat: coordinates.lat,
            lng: coordinates.lng,
          })),
          safeHavenScore: 50,
          walkScore: 50,
          safetyScore: 50,
          connectivityScore: 50,
          lifestyleScore: 50,
          lastUpdated: new Date().toISOString(),
          isFromCache: false,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [coordinates.lat, coordinates.lng]);

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-[#10B981]'; // Success Green
    if (score >= 50) return 'text-[#F59E0B]'; // Warning Amber
    return 'text-red-500';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 70) return 'bg-[#10B981]/10 border-[#10B981]/20';
    if (score >= 50) return 'bg-[#F59E0B]/10 border-[#F59E0B]/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Very Good';
    if (score >= 60) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Improvement';
  };

  // Show all amenity types (balanced mix from service)
  const displayAmenities = data?.amenities.slice(0, 10) || [];

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Skeleton for SafeHaven Score */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 animate-pulse">
          <div className="w-16 h-16 rounded-full bg-secondary/50" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-secondary/50 rounded" />
            <div className="h-3 w-48 bg-secondary/50 rounded" />
          </div>
        </div>
        
        {/* Skeleton for amenities */}
        <div className="grid md:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-secondary/50" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-secondary/50 rounded" />
                <div className="h-3 w-16 bg-secondary/50 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Real-Time Scores Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', ...springConfig }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {/* Walk Score */}
        <div className="flex flex-col items-center justify-center p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-[#E5E7EB] dark:border-slate-700">
          <motion.div 
            className={cn("text-2xl font-bold mb-1", getScoreColor(data?.walkScore || 0))}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', ...springConfig, delay: 0.1 }}
          >
            {data?.walkScore || 0}
          </motion.div>
          <p className="text-xs text-[#6B7280] dark:text-slate-400 text-center">Walk Score</p>
          <Badge variant="secondary" className="text-[10px] mt-1 bg-[#3B7BFF]/10 text-[#3B7BFF] border-0">
            LIVE
          </Badge>
        </div>

        {/* Safety Score */}
        <div className="flex flex-col items-center justify-center p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-[#E5E7EB] dark:border-slate-700">
          <motion.div 
            className={cn("text-2xl font-bold mb-1", getScoreColor(data?.safetyScore || 0))}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', ...springConfig, delay: 0.15 }}
          >
            {data?.safetyScore || 0}
          </motion.div>
          <p className="text-xs text-[#6B7280] dark:text-slate-400 text-center">Safety Score</p>
          <Badge variant="secondary" className="text-[10px] mt-1 bg-[#3B7BFF]/10 text-[#3B7BFF] border-0">
            LIVE
          </Badge>
        </div>

        {/* Connectivity Score */}
        <div className="flex flex-col items-center justify-center p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-[#E5E7EB] dark:border-slate-700">
          <motion.div 
            className={cn("text-2xl font-bold mb-1", getScoreColor(data?.connectivityScore || 0))}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', ...springConfig, delay: 0.2 }}
          >
            {data?.connectivityScore || 0}
          </motion.div>
          <p className="text-xs text-[#6B7280] dark:text-slate-400 text-center">Connectivity</p>
          <Badge variant="secondary" className="text-[10px] mt-1 bg-[#3B7BFF]/10 text-[#3B7BFF] border-0">
            LIVE
          </Badge>
        </div>

        {/* Lifestyle Score */}
        <div className="flex flex-col items-center justify-center p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-[#E5E7EB] dark:border-slate-700">
          <motion.div 
            className={cn("text-2xl font-bold mb-1", getScoreColor(data?.lifestyleScore || 0))}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', ...springConfig, delay: 0.25 }}
          >
            {data?.lifestyleScore || 0}
          </motion.div>
          <p className="text-xs text-[#6B7280] dark:text-slate-400 text-center">Lifestyle</p>
          <Badge variant="secondary" className="text-[10px] mt-1 bg-[#3B7BFF]/10 text-[#3B7BFF] border-0">
            LIVE
          </Badge>
        </div>
      </motion.div>

      {/* SafeHaven Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', ...springConfig }}
        className={cn(
          "p-5 rounded-2xl border backdrop-blur-sm",
          getScoreBgColor(data?.safeHavenScore || 0)
        )}
      >
        <div className="flex items-center gap-4">
          <motion.div
            className={cn(
              "relative flex items-center justify-center w-20 h-20 rounded-full border-4",
              getScoreBgColor(data?.safeHavenScore || 0)
            )}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', ...springConfig, delay: 0.1 }}
          >
            <Shield className={cn("h-8 w-8", getScoreColor(data?.safeHavenScore || 0))} />
            <motion.span
              className={cn(
                "absolute -bottom-1 -right-1 px-2 py-0.5 text-xs font-bold rounded-full bg-white shadow-sm",
                getScoreColor(data?.safeHavenScore || 0)
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', ...springConfig, delay: 0.2 }}
            >
              {data?.safeHavenScore || 0}
            </motion.span>
          </motion.div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-[#2B2F36] dark:text-slate-50">
                SafeHaven Score
              </h4>
              <Badge 
                variant="secondary" 
                className={cn("text-xs", getScoreColor(data?.safeHavenScore || 0))}
              >
                {getScoreLabel(data?.safeHavenScore || 0)}
              </Badge>
            </div>
            <p className="text-sm text-[#6B7280] dark:text-slate-400">
              Based on proximity to police stations, fire stations, and well-lit public areas
            </p>
            {data?.isFromCache && (
              <p className="text-xs text-[#6B7280] mt-1 flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Cached data
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Error State with Retry */}
      {error && !data && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center p-6 rounded-xl bg-secondary/30"
        >
          <AlertCircle className="h-8 w-8 text-[#F59E0B] mb-2" />
          <p className="text-sm text-muted-foreground mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </motion.div>
      )}

      {/* Nearby Amenities Grid */}
      {displayAmenities.length > 0 && (
        <div>
          <h4 className="font-medium mb-4 text-[#2B2F36] dark:text-slate-50">
            Nearby Places
          </h4>
          <div className="grid md:grid-cols-2 gap-3">
            <AnimatePresence>
              {displayAmenities.map((amenity, index) => {
                const Icon = amenityIcons[amenity.type] || MapPin;
                const colorClass = amenityColors[amenity.type] || 'bg-gray-500/10 text-gray-600';
                
                return (
                  <motion.div
                    key={`${amenity.type}-${amenity.name}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      type: 'spring', 
                      ...springConfig, 
                      delay: index * 0.05 
                    }}
                    whileHover={{ 
                      y: -2, 
                      boxShadow: '0 8px 25px -8px rgba(59, 123, 255, 0.15)' 
                    }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm cursor-pointer"
                  >
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full",
                      colorClass
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[#2B2F36] dark:text-slate-50 truncate">
                        {amenity.name}
                      </p>
                      <p className="text-xs text-[#6B7280] dark:text-slate-400 capitalize">
                        {amenity.type.replace('_', ' ')}
                      </p>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-[#3B7BFF]/10 text-[#3B7BFF] border-0"
                    >
                      {amenity.distance}
                    </Badge>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* No amenities found */}
      {!loading && displayAmenities.length === 0 && !error && (
        <div className="text-center p-6 rounded-xl bg-secondary/30">
          <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No nearby amenities found in this area
          </p>
        </div>
      )}
    </div>
  );
};

export default NeighborhoodDashboard;
