import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Wifi,
  Car,
  TreePine,
  Building,
  TrendingUp,
  MapPin,
  Star,
  ShoppingBag,
  GraduationCap,
  Hospital,
  Train,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface LocalityInsightsProps {
  locality: string;
  city: string;
  className?: string;
}

// Generate mock locality data
const generateLocalityData = (locality: string) => {
  const hash = locality.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  return {
    safetyScore: 60 + (hash % 35), // 60-95
    connectivityScore: 65 + (hash % 30), // 65-95
    lifestyleScore: 55 + (hash % 40), // 55-95
    avgPricePerSqft: 8000 + (hash % 10000),
    priceAppreciation: 5 + (hash % 15), // 5-20% per year
    nearbyCount: {
      schools: 3 + (hash % 8),
      hospitals: 2 + (hash % 5),
      malls: 1 + (hash % 4),
      metroStations: (hash % 4),
      parks: 2 + (hash % 6),
    },
    highlights: [
      { text: 'Good Public Transport', positive: true },
      { text: 'Low Crime Rate', positive: hash % 2 === 0 },
      { text: 'Green Cover', positive: hash % 3 === 0 },
      { text: 'Premium Location', positive: hash % 4 === 0 },
    ].filter((h) => h.positive),
    concerns: [
      { text: 'Traffic Congestion', active: hash % 2 === 0 },
      { text: 'Limited Parking', active: hash % 3 === 0 },
      { text: 'Construction Noise', active: hash % 5 === 0 },
    ].filter((c) => c.active),
  };
};

const LocalityInsights: React.FC<LocalityInsightsProps> = ({
  locality,
  city,
  className,
}) => {
  const data = generateLocalityData(locality);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 55) return 'Average';
    return 'Below Average';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-success';
    if (score >= 60) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Locality Insights
          <Badge variant="secondary">{locality}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Cards */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-3 rounded-lg bg-secondary/30 text-center"
          >
            <Shield className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className={cn('text-2xl font-bold', getScoreColor(data.safetyScore))}>
              {data.safetyScore}
            </p>
            <p className="text-xs text-muted-foreground">Safety Score</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-3 rounded-lg bg-secondary/30 text-center"
          >
            <Train className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className={cn('text-2xl font-bold', getScoreColor(data.connectivityScore))}>
              {data.connectivityScore}
            </p>
            <p className="text-xs text-muted-foreground">Connectivity</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-3 rounded-lg bg-secondary/30 text-center"
          >
            <Star className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className={cn('text-2xl font-bold', getScoreColor(data.lifestyleScore))}>
              {data.lifestyleScore}
            </p>
            <p className="text-xs text-muted-foreground">Lifestyle</p>
          </motion.div>
        </div>

        <Separator />

        {/* Price Stats */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Market Overview</h4>
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
            <div>
              <p className="text-sm text-muted-foreground">Avg. Price/Sqft</p>
              <p className="text-lg font-bold text-foreground">
                ₹{data.avgPricePerSqft.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Annual Growth</p>
              <p className="text-lg font-bold text-success flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                +{data.priceAppreciation}%
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Nearby Amenities */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Nearby Amenities</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/20">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {data.nearbyCount.schools} Schools
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/20">
              <Hospital className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {data.nearbyCount.hospitals} Hospitals
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/20">
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {data.nearbyCount.malls} Malls
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/20">
              <Train className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {data.nearbyCount.metroStations} Metro Stations
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/20">
              <TreePine className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {data.nearbyCount.parks} Parks
              </span>
            </div>
          </div>
        </div>

        {/* Highlights & Concerns */}
        {(data.highlights.length > 0 || data.concerns.length > 0) && (
          <>
            <Separator />
            <div className="space-y-3">
              {data.highlights.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Highlights</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.highlights.map((h) => (
                      <Badge key={h.text} variant="outline" className="bg-success/10 text-success border-success/30">
                        {h.text}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {data.concerns.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Things to Consider</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.concerns.map((c) => (
                      <Badge key={c.text} variant="outline" className="bg-warning/10 text-warning border-warning/30">
                        {c.text}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LocalityInsights;
