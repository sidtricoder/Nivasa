import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

interface EMICalculatorProps {
  propertyPrice: number;
}

const EMICalculator: React.FC<EMICalculatorProps> = ({ propertyPrice }) => {
  const [loanAmount, setLoanAmount] = useState(Math.round(propertyPrice * 0.8));
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const calculateEMI = () => {
    const principal = loanAmount;
    const monthlyRate = interestRate / 12 / 100;
    const months = tenure * 12;

    if (monthlyRate === 0) {
      return principal / months;
    }

    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    return Math.round(emi);
  };

  const emi = calculateEMI();
  const totalAmount = emi * tenure * 12;
  const totalInterest = totalAmount - loanAmount;

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5 text-primary" />
          EMI Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Loan Amount */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-1">
              Loan Amount
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>80% of property value is typical</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <span className="text-sm font-medium">{formatCurrency(loanAmount)}</span>
          </div>
          <Slider
            value={[loanAmount]}
            onValueChange={(value) => setLoanAmount(value[0])}
            min={100000}
            max={propertyPrice}
            step={100000}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>₹1L</span>
            <span>{formatCurrency(propertyPrice)}</span>
          </div>
        </div>

        {/* Interest Rate */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Interest Rate (%)</Label>
            <span className="text-sm font-medium">{interestRate}%</span>
          </div>
          <Slider
            value={[interestRate]}
            onValueChange={(value) => setInterestRate(value[0])}
            min={5}
            max={15}
            step={0.1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>5%</span>
            <span>15%</span>
          </div>
        </div>

        {/* Tenure */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Loan Tenure (Years)</Label>
            <span className="text-sm font-medium">{tenure} years</span>
          </div>
          <Slider
            value={[tenure]}
            onValueChange={(value) => setTenure(value[0])}
            min={1}
            max={30}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 year</span>
            <span>30 years</span>
          </div>
        </div>

        <Separator />

        {/* Results */}
        <motion.div
          key={emi}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-4"
        >
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Monthly EMI</p>
            <p className="text-3xl font-bold text-primary">
              ₹{emi.toLocaleString()}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-secondary rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Total Interest</p>
              <p className="text-sm font-semibold text-foreground">
                {formatCurrency(totalInterest)}
              </p>
            </div>
            <div className="text-center p-3 bg-secondary rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
              <p className="text-sm font-semibold text-foreground">
                {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>

          {/* Visual Breakdown */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Payment Breakdown</p>
            <div className="h-3 rounded-full overflow-hidden flex">
              <div
                className="bg-primary h-full"
                style={{ width: `${(loanAmount / totalAmount) * 100}%` }}
              />
              <div
                className="bg-warning h-full"
                style={{ width: `${(totalInterest / totalAmount) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Principal
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-warning" />
                Interest
              </span>
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default EMICalculator;
