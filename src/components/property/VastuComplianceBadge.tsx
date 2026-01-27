import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Check, X, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type VastuStatus = 'compliant' | 'partial' | 'non-compliant' | 'unknown';

interface VastuDetail {
  aspect: string;
  status: 'good' | 'neutral' | 'concern';
  description: string;
}

interface VastuComplianceBadgeProps {
  status: VastuStatus;
  facing: string;
  details?: VastuDetail[];
  className?: string;
  variant?: 'badge' | 'card' | 'compact';
}

const vastuDirectionInfo: Record<string, { score: number; label: string; description: string }> = {
  'east': { score: 95, label: 'Excellent', description: 'East-facing is highly auspicious, associated with prosperity and health.' },
  'north': { score: 90, label: 'Very Good', description: 'North-facing brings wealth and opportunities.' },
  'north-east': { score: 100, label: 'Best', description: 'North-East (Ishaan) is the most auspicious direction in Vastu.' },
  'west': { score: 75, label: 'Good', description: 'West-facing is suitable and brings stability.' },
  'south': { score: 70, label: 'Acceptable', description: 'South-facing can be good with proper Vastu corrections.' },
  'south-east': { score: 65, label: 'Moderate', description: 'South-East needs careful planning for positive energy.' },
  'south-west': { score: 60, label: 'Moderate', description: 'South-West requires specific Vastu remedies.' },
  'north-west': { score: 80, label: 'Good', description: 'North-West is favorable for business growth.' },
  'all directions': { score: 85, label: 'Good', description: 'Corner property with good all-round exposure.' },
};

const getVastuInfo = (facing: string) => {
  const normalizedFacing = facing.toLowerCase().trim();
  return vastuDirectionInfo[normalizedFacing] || { 
    score: 70, 
    label: 'Standard', 
    description: 'Standard Vastu compliance.' 
  };
};

const getStatusColor = (status: VastuStatus) => {
  switch (status) {
    case 'compliant':
      return 'bg-success/10 text-success border-success/30';
    case 'partial':
      return 'bg-warning/10 text-warning border-warning/30';
    case 'non-compliant':
      return 'bg-destructive/10 text-destructive border-destructive/30';
    default:
      return 'bg-secondary text-muted-foreground border-border';
  }
};

const getStatusLabel = (status: VastuStatus) => {
  switch (status) {
    case 'compliant':
      return 'Vastu Compliant';
    case 'partial':
      return 'Partially Compliant';
    case 'non-compliant':
      return 'Not Vastu Compliant';
    default:
      return 'Vastu Status Unknown';
  }
};

const VastuComplianceBadge: React.FC<VastuComplianceBadgeProps> = ({
  status,
  facing,
  details = [],
  className,
  variant = 'badge',
}) => {
  const vastuInfo = getVastuInfo(facing);

  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={cn('gap-1.5 cursor-help', getStatusColor(status), className)}
            >
              <Compass className="h-3.5 w-3.5" />
              {facing}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="font-medium">{vastuInfo.label} Vastu</p>
            <p className="text-xs text-muted-foreground mt-1">{vastuInfo.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'badge') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn('inline-flex items-center gap-2', className)}
      >
        <Badge 
          variant="outline" 
          className={cn('gap-1.5 py-1.5 px-3', getStatusColor(status))}
        >
          <Compass className="h-4 w-4" />
          {getStatusLabel(status)}
        </Badge>
        <Badge variant="secondary" className="gap-1">
          {facing} Facing
          <span className="text-xs text-muted-foreground ml-1">
            • {vastuInfo.label}
          </span>
        </Badge>
      </motion.div>
    );
  }

  // Card variant
  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Compass className="h-5 w-5 text-primary" />
          Vastu Compliance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className={cn('gap-1.5 py-1.5 px-3 text-sm', getStatusColor(status))}
          >
            {status === 'compliant' && <Check className="h-4 w-4" />}
            {status === 'partial' && <Info className="h-4 w-4" />}
            {status === 'non-compliant' && <X className="h-4 w-4" />}
            {getStatusLabel(status)}
          </Badge>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">{vastuInfo.score}</p>
            <p className="text-xs text-muted-foreground">Vastu Score</p>
          </div>
        </div>

        {/* Direction Info */}
        <div className="p-3 rounded-lg bg-secondary/30">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">{facing} Facing</span>
            <Badge variant="outline" className="text-xs">{vastuInfo.label}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">{vastuInfo.description}</p>
        </div>

        {/* Detailed Aspects */}
        {details.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Vastu Details</p>
            {details.map((detail, index) => (
              <motion.div
                key={detail.aspect}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 py-2"
              >
                <div
                  className={cn(
                    'h-6 w-6 rounded-full flex items-center justify-center shrink-0',
                    detail.status === 'good' && 'bg-success/10',
                    detail.status === 'neutral' && 'bg-secondary',
                    detail.status === 'concern' && 'bg-warning/10'
                  )}
                >
                  {detail.status === 'good' && <Check className="h-3.5 w-3.5 text-success" />}
                  {detail.status === 'neutral' && <Info className="h-3.5 w-3.5 text-muted-foreground" />}
                  {detail.status === 'concern' && <Info className="h-3.5 w-3.5 text-warning" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{detail.aspect}</p>
                  <p className="text-xs text-muted-foreground truncate">{detail.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VastuComplianceBadge;
