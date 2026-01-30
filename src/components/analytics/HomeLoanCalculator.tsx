import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Building2, Calculator, CheckCircle, AlertCircle, IndianRupee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface HomeLoanCalculatorProps {
  propertyPrice?: number;
  className?: string;
}

const HomeLoanCalculator: React.FC<HomeLoanCalculatorProps> = ({
  propertyPrice = 5000000,
  className,
}) => {
  const [monthlyIncome, setMonthlyIncome] = useState(150000);
  const [existingEMI, setExistingEMI] = useState(0);
  const [downPayment, setDownPayment] = useState(20); // percentage
  const [tenure, setTenure] = useState(20); // years
  const [interestRate, setInterestRate] = useState(8.5); // percentage

  const calculations = useMemo(() => {
    // Loan amount
    const downPaymentAmount = (propertyPrice * downPayment) / 100;
    const loanAmount = propertyPrice - downPaymentAmount;

    // Monthly EMI calculation using standard formula
    const monthlyRate = interestRate / 12 / 100;
    const months = tenure * 12;
    const emi = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);

    // Total payment and interest
    const totalPayment = emi * months;
    const totalInterest = totalPayment - loanAmount;

    // Eligibility check (FOIR - Fixed Obligations to Income Ratio)
    const foir = ((emi + existingEMI) / monthlyIncome) * 100;
    const maxFoir = 50; // Banks generally allow up to 50% FOIR
    const isEligible = foir <= maxFoir;

    // Maximum eligible loan (targeting 50% FOIR)
    const maxEMI = (monthlyIncome * maxFoir / 100) - existingEMI;
    const maxLoan = maxEMI * (Math.pow(1 + monthlyRate, months) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, months));

    // Credit score estimate based on FOIR
    const estimatedScore = foir < 30 ? 'Excellent' : foir < 40 ? 'Good' : foir < 50 ? 'Fair' : 'High Risk';

    return {
      downPaymentAmount,
      loanAmount,
      emi,
      totalPayment,
      totalInterest,
      foir,
      isEligible,
      maxLoan,
      maxEMI,
      estimatedScore,
    };
  }, [propertyPrice, monthlyIncome, existingEMI, downPayment, tenure, interestRate]);

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    }
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`;
    }
    return `₹${value.toLocaleString()}`;
  };

  const foirColor = calculations.foir < 30 ? 'success' : calculations.foir < 40 ? 'primary' : calculations.foir < 50 ? 'warning' : 'destructive';

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Home Loan Eligibility
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Eligibility Status */}
        <motion.div
          key={calculations.isEligible ? 'eligible' : 'not'}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className={cn(
            'p-4 rounded-lg border flex items-center gap-4',
            calculations.isEligible
              ? 'bg-success/10 border-success/30'
              : 'bg-destructive/10 border-destructive/30'
          )}
        >
          {calculations.isEligible ? (
            <CheckCircle className="h-8 w-8 text-success shrink-0" />
          ) : (
            <AlertCircle className="h-8 w-8 text-destructive shrink-0" />
          )}
          <div>
            <h4 className={cn('font-medium', calculations.isEligible ? 'text-success' : 'text-destructive')}>
              {calculations.isEligible ? 'You are likely eligible!' : 'Eligibility may be at risk'}
            </h4>
            <p className="text-sm text-muted-foreground">
              {calculations.isEligible
                ? 'Based on your income and existing EMIs, you should qualify for this loan.'
                : 'Your FOIR is above 50%. Consider increasing down payment or tenure.'}
            </p>
          </div>
        </motion.div>

        {/* FOIR Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">FOIR (Fixed Obligations to Income Ratio)</span>
            <Badge variant={foirColor === 'destructive' ? 'destructive' : 'secondary'} className={cn(
              foirColor === 'success' && 'bg-success/20 text-success',
              foirColor === 'warning' && 'bg-warning/20 text-warning',
              foirColor === 'primary' && 'bg-primary/20 text-primary'
            )}>
              {calculations.foir.toFixed(1)}% • {calculations.estimatedScore}
            </Badge>
          </div>
          <Progress 
            value={Math.min(calculations.foir, 70)} 
            className="h-2"
          />
          <p className="text-xs text-muted-foreground">Banks typically allow up to 50% FOIR</p>
        </div>

        <Separator />

        {/* Input Parameters */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Monthly Income (₹)</Label>
              <Input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Existing EMIs (₹)</Label>
              <Input
                type="number"
                value={existingEMI}
                onChange={(e) => setExistingEMI(Number(e.target.value))}
                min={0}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Down Payment</Label>
              <Badge variant="outline">{downPayment}% • {formatCurrency(calculations.downPaymentAmount)}</Badge>
            </div>
            <Slider
              value={[downPayment]}
              onValueChange={(v) => setDownPayment(v[0])}
              min={10}
              max={50}
              step={5}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Loan Tenure</Label>
              <Badge variant="outline">{tenure} years</Badge>
            </div>
            <Slider
              value={[tenure]}
              onValueChange={(v) => setTenure(v[0])}
              min={5}
              max={30}
              step={1}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Interest Rate</Label>
              <Badge variant="outline">{interestRate}%</Badge>
            </div>
            <Slider
              value={[interestRate]}
              onValueChange={(v) => setInterestRate(v[0])}
              min={6}
              max={14}
              step={0.1}
              className="py-2"
            />
          </div>
        </div>

        <Separator />

        {/* Loan Details */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Loan Details</h4>
          
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground">Monthly EMI</p>
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(calculations.emi)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-secondary/30">
              <p className="text-xs text-muted-foreground">Loan Amount</p>
              <p className="font-semibold">{formatCurrency(calculations.loanAmount)}</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30">
              <p className="text-xs text-muted-foreground">Total Interest</p>
              <p className="font-semibold text-destructive">{formatCurrency(calculations.totalInterest)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 text-sm">
            <span className="text-muted-foreground">Total Payment</span>
            <span className="font-medium">{formatCurrency(calculations.totalPayment)}</span>
          </div>

          {!calculations.isEligible && (
            <div className="p-3 rounded-lg bg-secondary/30 text-sm">
              <p className="text-muted-foreground">Max Eligible Loan:</p>
              <p className="font-medium text-foreground">{formatCurrency(calculations.maxLoan)}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HomeLoanCalculator;
