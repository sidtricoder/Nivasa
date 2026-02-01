import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Eye, TrendingUp, Users, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PropertyViewsTrackerProps {
  propertyId: string;
  className?: string;
  variant?: 'badge' | 'card' | 'inline';
}

// Generate consistent but random-ish view count based on property ID
export const generateViewCounts = (propertyId: string) => {
  // Create a hash from property ID to get consistent numbers
  const hash = propertyId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return {
    totalViews: 150 + (hash % 500),
    todayViews: 5 + (hash % 30),
    thisWeekViews: 30 + (hash % 100),
    viewingNow: 1 + (hash % 8),
    growth: 5 + (hash % 25), // percentage growth
  };
};

const PropertyViewsTracker: React.FC<PropertyViewsTrackerProps> = ({
  propertyId,
  className,
  variant = 'badge',
}) => {
  const [viewCounts, setViewCounts] = useState(() => generateViewCounts(propertyId));
  const [liveCount, setLiveCount] = useState(viewCounts.viewingNow);

  // Simulate live viewer count changes
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount((prev) => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newCount = Math.max(1, Math.min(prev + change, 15));
        return newCount;
      });
    }, 5000 + Math.random() * 10000); // Random interval between 5-15 seconds

    return () => clearInterval(interval);
  }, []);

  if (variant === 'badge') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn('inline-flex', className)}
      >
        <Badge
          variant="secondary"
          className="gap-1.5 py-1 px-2.5 bg-secondary/80 backdrop-blur-sm"
        >
          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium">{viewCounts.totalViews.toLocaleString()}</span>
          <span className="text-muted-foreground">views</span>
        </Badge>
      </motion.div>
    );
  }

  if (variant === 'inline') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('flex items-center gap-4 text-sm', className)}
      >
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Eye className="h-4 w-4" />
          <span>
            <span className="font-medium text-foreground">
              {viewCounts.totalViews.toLocaleString()}
            </span>{' '}
            views
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">{liveCount}</span> viewing now
          </span>
        </div>
      </motion.div>
    );
  }

  // Card variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-4 rounded-lg bg-secondary/30 border border-border space-y-4',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-foreground flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          Property Views
        </h4>
        <Badge variant="outline" className="gap-1">
          <TrendingUp className="h-3 w-3 text-success" />
          +{viewCounts.growth}%
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-2xl font-bold text-foreground">
            {viewCounts.totalViews.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Total Views</p>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-foreground">{viewCounts.todayViews}</p>
          <p className="text-xs text-muted-foreground">Today</p>
        </div>
      </div>

      {/* Live viewers indicator */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
          </span>
          <span className="text-sm">
            <span className="font-medium text-foreground">{liveCount} people</span>
            <span className="text-muted-foreground"> viewing right now</span>
          </span>
        </div>
        <Users className="h-4 w-4 text-muted-foreground" />
      </div>
    </motion.div>
  );
};

export default PropertyViewsTracker;
