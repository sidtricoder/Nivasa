import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  TreePine,
  TrendingUp,
  MapPin,
  Star,
  ShoppingBag,
  GraduationCap,
  Hospital,
  Train,
  Loader2,
  RefreshCw,
  Utensils,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  getNeighborhoodData, 
  NeighborhoodData,
  NearbyAmenity 
} from '@/services/neighborhoodService';

interface LocalityInsightsProps {
  locality: string;
  city: string;
  coordinates?: { lat: number; lng: number };
  className?: string;
}

// Count amenities by type from real data
const countAmenitiesByType = (amenities: NearbyAmenity[]) => {
  const counts: Record<string, number> = {};
  for (const amenity of amenities) {
    counts[amenity.type] = (counts[amenity.type] || 0) + 1;
  }
  return counts;
};

// Generate highlights based on real data
const generateHighlights = (data: NeighborhoodData, counts: Record<string, number>) => {
  const highlights: { text: string; positive: boolean }[] = [];
  
  if (data.connectivityScore >= 60) {
    highlights.push({ text: 'Good Public Transport', positive: true });
  }
  if (data.safetyScore >= 70) {
    highlights.push({ text: 'Safe Neighborhood', positive: true });
  }
  if ((counts.park || 0) >= 2) {
    highlights.push({ text: 'Green Cover', positive: true });
  }
  if ((counts.restaurant || 0) >= 5) {
    highlights.push({ text: 'Vibrant Lifestyle', positive: true });
  }
  if (data.lifestyleScore >= 75) {
    highlights.push({ text: 'Premium Location', positive: true });
  }
  
  return highlights.slice(0, 4); // Max 4 highlights
};

// Spring animation config
const springConfig = { stiffness: 300, damping: 30 };

const LocalityInsights: React.FC<LocalityInsightsProps> = ({
  locality,
  city,
  coordinates,
  className,
}) => {
  const [data, setData] = useState<NeighborhoodData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!coordinates) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const result = await getNeighborhoodData(coordinates.lat, coordinates.lng);
        setData(result);
      } catch (err) {
        console.error('Failed to fetch locality insights:', err);
        setError('Unable to load locality data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [coordinates?.lat, coordinates?.lng]);

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-[#10B981]'; // Green
    if (score >= 50) return 'text-[#F59E0B]'; // Amber
    return 'text-red-500';
  };

  // Calculate amenity counts from real data
  const amenityCounts = data ? countAmenitiesByType(data.amenities) : {};
  const highlights = data ? generateHighlights(data, amenityCounts) : [];

  // Loading state
  if (loading) {
    return (
      <Card className={cn('', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Locality Insights
            <Badge variant="secondary">{locality}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading real data...</span>
        </CardContent>
      </Card>
    );
  }

  // No coordinates provided - show message
  if (!coordinates) {
    return (
      <Card className={cn('', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Locality Insights
            <Badge variant="secondary">{locality}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          Location coordinates required for real-time insights
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Locality Insights
          <Badge variant="secondary">{locality}</Badge>
          <Badge variant="outline" className="text-[10px] ml-auto bg-[#3B7BFF]/10 text-[#3B7BFF] border-0">
            LIVE DATA
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Cards - Real Data */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', ...springConfig, delay: 0.1 }}
            className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-[#E5E7EB] dark:border-slate-700 text-center"
          >
            <Shield className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className={cn('text-2xl font-bold', getScoreColor(data?.safetyScore || 0))}>
              {data?.safetyScore || 0}
            </p>
            <p className="text-xs text-muted-foreground">Safety Score</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', ...springConfig, delay: 0.2 }}
            className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-[#E5E7EB] dark:border-slate-700 text-center"
          >
            <Train className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className={cn('text-2xl font-bold', getScoreColor(data?.connectivityScore || 0))}>
              {data?.connectivityScore || 0}
            </p>
            <p className="text-xs text-muted-foreground">Connectivity</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', ...springConfig, delay: 0.3 }}
            className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-[#E5E7EB] dark:border-slate-700 text-center"
          >
            <Star className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className={cn('text-2xl font-bold', getScoreColor(data?.lifestyleScore || 0))}>
              {data?.lifestyleScore || 0}
            </p>
            <p className="text-xs text-muted-foreground">Lifestyle</p>
          </motion.div>
        </div>

        <Separator />

        {/* Nearby Amenities - Real Counts */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            Nearby Amenities
            <Badge variant="outline" className="text-[10px] bg-[#10B981]/10 text-[#10B981] border-0">
              Real Count
            </Badge>
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', ...springConfig, delay: 0.1 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-[#E5E7EB] dark:border-slate-700"
            >
              <GraduationCap className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">
                {amenityCounts.school || 0} Schools
              </span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', ...springConfig, delay: 0.15 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-[#E5E7EB] dark:border-slate-700"
            >
              <Hospital className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">
                {amenityCounts.hospital || 0} Hospitals
              </span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', ...springConfig, delay: 0.2 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-[#E5E7EB] dark:border-slate-700"
            >
              <ShoppingBag className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">
                {amenityCounts.mall || 0} Malls
              </span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', ...springConfig, delay: 0.25 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-[#E5E7EB] dark:border-slate-700"
            >
              <Train className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">
                {amenityCounts.metro || 0} Metro Stations
              </span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', ...springConfig, delay: 0.3 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-[#E5E7EB] dark:border-slate-700"
            >
              <TreePine className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">
                {amenityCounts.park || 0} Parks
              </span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', ...springConfig, delay: 0.35 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-[#E5E7EB] dark:border-slate-700"
            >
              <Utensils className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">
                {amenityCounts.restaurant || 0} Restaurants
              </span>
            </motion.div>
          </div>
        </div>

        {/* Highlights based on real data */}
        {highlights.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Highlights</h4>
              <div className="flex flex-wrap gap-2">
                {highlights.map((h) => (
                  <Badge 
                    key={h.text} 
                    variant="outline" 
                    className="bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30"
                  >
                    {h.text}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Cache indicator */}
        {data?.isFromCache && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            Cached data for faster loading
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default LocalityInsights;
