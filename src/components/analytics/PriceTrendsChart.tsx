import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface PriceTrendsChartProps {
  locality: string;
  currentPrice: number;
  className?: string;
}

// Generate mock price history data
const generatePriceHistory = (locality: string, currentPrice: number) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  const data = [];

  // Generate 12 months of historical data
  for (let i = 11; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    // Generate a realistic price trend with some variation
    const baseVariation = Math.sin(i * 0.5) * 0.05; // 5% wave pattern
    const randomVariation = (Math.random() - 0.5) * 0.03; // 3% random noise
    const trendFactor = 1 + ((11 - i) * 0.008); // ~10% appreciation over year
    
    const historicalPrice = Math.round(
      currentPrice / trendFactor * (1 + baseVariation + randomVariation)
    );

    data.push({
      month: months[monthIndex],
      price: historicalPrice,
      pricePerSqft: Math.round(historicalPrice / 1200), // Assuming 1200 sqft avg
    });
  }

  return data;
};

const PriceTrendsChart: React.FC<PriceTrendsChartProps> = ({
  locality,
  currentPrice,
  className,
}) => {
  const [timeRange, setTimeRange] = useState<'6' | '12'>('12');
  const [viewType, setViewType] = useState<'total' | 'sqft'>('total');

  const priceHistory = useMemo(
    () => generatePriceHistory(locality, currentPrice),
    [locality, currentPrice]
  );

  const displayData = timeRange === '6' ? priceHistory.slice(-6) : priceHistory;

  // Calculate price change
  const firstPrice = displayData[0]?.price || 0;
  const lastPrice = displayData[displayData.length - 1]?.price || 0;
  const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100;
  const isPositive = priceChange > 0;
  const isNeutral = Math.abs(priceChange) < 0.5;

  const formatPrice = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)}Cr`;
    }
    return `₹${(value / 100000).toFixed(0)}L`;
  };

  const formatPricePerSqft = (value: number) => `₹${value.toLocaleString()}/sqft`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-1">{label} 2024</p>
          <p className="text-sm text-muted-foreground">
            {viewType === 'total'
              ? formatPrice(payload[0].value)
              : formatPricePerSqft(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2">
            Price Trends
            <Badge variant="outline" className="font-normal">
              {locality}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={viewType} onValueChange={(v) => setViewType(v as any)}>
              <SelectTrigger className="w-[130px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total">Total Price</SelectItem>
                <SelectItem value="sqft">Price/Sqft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
              <SelectTrigger className="w-[110px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 Months</SelectItem>
                <SelectItem value="12">12 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Price Change Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-4 p-3 rounded-lg bg-secondary/30"
        >
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-md',
              isNeutral
                ? 'bg-secondary text-muted-foreground'
                : isPositive
                ? 'bg-success/10 text-success'
                : 'bg-destructive/10 text-destructive'
            )}
          >
            {isNeutral ? (
              <Minus className="h-4 w-4" />
            ) : isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="font-medium">
              {isNeutral ? 'Stable' : `${isPositive ? '+' : ''}${priceChange.toFixed(1)}%`}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {isNeutral
              ? `Prices stable in last ${timeRange} months`
              : isPositive
              ? `Prices increased ${priceChange.toFixed(1)}% in ${timeRange} months`
              : `Prices decreased ${Math.abs(priceChange).toFixed(1)}% in ${timeRange} months`}
          </p>
        </motion.div>

        {/* Chart */}
        <div className="h-[250px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) =>
                  viewType === 'total' ? formatPrice(value) : `₹${value}`
                }
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={viewType === 'total' ? 'price' : 'pricePerSqft'}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#priceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Info */}
        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
          <Info className="h-3 w-3" />
          <span>Based on average transaction prices in {locality}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceTrendsChart;
