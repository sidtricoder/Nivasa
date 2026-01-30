import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Home, Percent, IndianRupee, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface InvestmentCalculatorProps {
  propertyPrice?: number;
  className?: string;
}

const InvestmentCalculator: React.FC<InvestmentCalculatorProps> = ({
  propertyPrice = 5000000,
  className,
}) => {
  const [investmentYears, setInvestmentYears] = useState(5);
  const [expectedAppreciation, setExpectedAppreciation] = useState(10);
  const [expectedRentalYield, setExpectedRentalYield] = useState(3);
  const [maintenanceCost, setMaintenanceCost] = useState(10000); // Monthly

  const calculations = useMemo(() => {
    // Capital appreciation
    const futureValue = propertyPrice * Math.pow(1 + expectedAppreciation / 100, investmentYears);
    const capitalGain = futureValue - propertyPrice;

    // Rental income
    const monthlyRent = (propertyPrice * expectedRentalYield) / 100 / 12;
    const totalRentalIncome = monthlyRent * 12 * investmentYears;

    // Costs
    const totalMaintenance = maintenanceCost * 12 * investmentYears;
    const stampDuty = propertyPrice * 0.06; // Assumed 6%
    const registrationCharges = propertyPrice * 0.01; // Assumed 1%
    const totalCosts = totalMaintenance + stampDuty + registrationCharges;

    // Net returns
    const totalReturns = capitalGain + totalRentalIncome;
    const netProfit = totalReturns - totalCosts - propertyPrice;
    const totalInvestment = propertyPrice + totalCosts;
    const roi = (((futureValue + totalRentalIncome - totalCosts) - propertyPrice) / propertyPrice) * 100;
    const annualizedRoi = Math.pow(1 + roi / 100, 1 / investmentYears) - 1;

    return {
      futureValue,
      capitalGain,
      monthlyRent,
      totalRentalIncome,
      totalMaintenance,
      stampDuty,
      registrationCharges,
      totalCosts,
      totalReturns,
      netProfit,
      totalInvestment,
      roi,
      annualizedRoi: annualizedRoi * 100,
    };
  }, [propertyPrice, investmentYears, expectedAppreciation, expectedRentalYield, maintenanceCost]);

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    }
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`;
    }
    return `₹${value.toLocaleString()}`;
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Investment Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Property Value Display */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
          <p className="text-sm text-muted-foreground">Property Value</p>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(propertyPrice)}</p>
        </div>

        {/* Investment Parameters */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Investment Horizon</Label>
              <Badge variant="outline">{investmentYears} years</Badge>
            </div>
            <Slider
              value={[investmentYears]}
              onValueChange={(v) => setInvestmentYears(v[0])}
              min={1}
              max={20}
              step={1}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Expected Appreciation (% per year)</Label>
              <Badge variant="outline">{expectedAppreciation}%</Badge>
            </div>
            <Slider
              value={[expectedAppreciation]}
              onValueChange={(v) => setExpectedAppreciation(v[0])}
              min={0}
              max={25}
              step={0.5}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Rental Yield (% per year)</Label>
              <Badge variant="outline">{expectedRentalYield}%</Badge>
            </div>
            <Slider
              value={[expectedRentalYield]}
              onValueChange={(v) => setExpectedRentalYield(v[0])}
              min={0}
              max={8}
              step={0.25}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Monthly Maintenance (₹)</Label>
            <Input
              type="number"
              value={maintenanceCost}
              onChange={(e) => setMaintenanceCost(Number(e.target.value))}
              min={0}
              className="mt-1"
            />
          </div>
        </div>

        <Separator />

        {/* Results */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Investment Returns</h4>

          {/* ROI Highlight */}
          <motion.div
            key={calculations.roi}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="p-4 rounded-lg bg-success/10 border border-success/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total ROI after {investmentYears} years</p>
                <p className="text-3xl font-bold text-success">
                  {calculations.roi.toFixed(1)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Annualized</p>
                <p className="text-xl font-medium text-success">
                  {calculations.annualizedRoi.toFixed(1)}%
                </p>
              </div>
            </div>
          </motion.div>

          {/* Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Future Property Value</span>
              <span className="font-medium">{formatCurrency(calculations.futureValue)}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-success" />
                Capital Appreciation
              </span>
              <span className="font-medium text-success">
                +{formatCurrency(calculations.capitalGain)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Home className="h-4 w-4 text-primary" />
                Total Rental Income
              </span>
              <span className="font-medium text-primary">
                +{formatCurrency(calculations.totalRentalIncome)}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Expected Monthly Rent</span>
              <span className="font-medium">{formatCurrency(calculations.monthlyRent)}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Total Costs (Maintenance + Stamp Duty)</span>
              <span className="font-medium text-destructive">
                -{formatCurrency(calculations.totalCosts)}
              </span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground p-3 rounded-lg bg-secondary/30">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            This is an estimate based on historical trends. Actual returns may vary based on market conditions.
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentCalculator;
