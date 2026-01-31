import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  IndianRupee, 
  Percent, 
  Calendar,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const EMICalculatorPage: React.FC = () => {
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanTenure, setLoanTenure] = useState(20);

  const emiDetails = useMemo(() => {
    const principal = loanAmount;
    const rate = interestRate / 12 / 100;
    const months = loanTenure * 12;

    if (rate === 0 || months === 0) {
      return {
        emi: 0,
        totalPayment: 0,
        totalInterest: 0,
      };
    }

    const emi = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    const totalPayment = emi * months;
    const totalInterest = totalPayment - principal;

    return {
      emi: Math.round(emi),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
    };
  }, [loanAmount, interestRate, loanTenure]);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const principalPercentage = emiDetails.totalPayment > 0 
    ? (loanAmount / emiDetails.totalPayment) * 100 
    : 50;
  const interestPercentage = emiDetails.totalPayment > 0 
    ? (emiDetails.totalInterest / emiDetails.totalPayment) * 100 
    : 50;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: `
            linear-gradient(135deg, 
              rgba(230, 210, 220, 0.6) 0%,
              rgba(240, 238, 233, 0.9) 25%,
              rgba(245, 243, 240, 1) 50%,
              rgba(220, 225, 240, 0.7) 75%,
              rgba(210, 200, 220, 0.5) 100%
            )
          `
        }}
      />
      
      <Header />

      <main className="pt-32 pb-20">
        <div className="container max-w-6xl px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur border border-[#3B7BFF]/20 text-[#3B7BFF] text-sm font-medium mb-6 shadow-lg shadow-blue-500/10">
              <Calculator className="h-4 w-4" />
              Financial Planning Tool
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#2B2F36] mb-4">
              EMI Calculator
            </h1>
            <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
              Calculate your monthly EMI and plan your home loan effectively
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Calculator Inputs */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-white/80 backdrop-blur-xl border-white/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-[#3B7BFF]" />
                    Loan Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Loan Amount */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-[#3B7BFF]" />
                      Loan Amount (₹)
                    </Label>
                    <Input
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value) || 0)}
                      min={100000}
                      max={100000000}
                      className="text-lg h-12"
                      placeholder="Enter loan amount"
                    />
                    <div className="flex gap-2 flex-wrap">
                      {[1000000, 2500000, 5000000, 10000000].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setLoanAmount(amount)}
                          className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                            loanAmount === amount 
                              ? 'bg-[#3B7BFF] text-white border-[#3B7BFF]' 
                              : 'bg-white hover:bg-gray-50 border-gray-200'
                          }`}
                        >
                          {formatCurrency(amount)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interest Rate */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Percent className="h-4 w-4 text-[#3B7BFF]" />
                      Interest Rate (% p.a.)
                    </Label>
                    <Input
                      type="number"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value) || 0)}
                      min={1}
                      max={30}
                      step={0.1}
                      className="text-lg h-12"
                      placeholder="Enter interest rate"
                    />
                    <div className="flex gap-2 flex-wrap">
                      {[7.5, 8.5, 9.5, 10.5].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => setInterestRate(rate)}
                          className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                            interestRate === rate 
                              ? 'bg-[#3B7BFF] text-white border-[#3B7BFF]' 
                              : 'bg-white hover:bg-gray-50 border-gray-200'
                          }`}
                        >
                          {rate}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Loan Tenure */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[#3B7BFF]" />
                      Loan Tenure (Years)
                    </Label>
                    <Input
                      type="number"
                      value={loanTenure}
                      onChange={(e) => setLoanTenure(Number(e.target.value) || 0)}
                      min={1}
                      max={30}
                      className="text-lg h-12"
                      placeholder="Enter tenure in years"
                    />
                    <div className="flex gap-2 flex-wrap">
                      {[10, 15, 20, 25, 30].map((years) => (
                        <button
                          key={years}
                          onClick={() => setLoanTenure(years)}
                          className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                            loanTenure === years 
                              ? 'bg-[#3B7BFF] text-white border-[#3B7BFF]' 
                              : 'bg-white hover:bg-gray-50 border-gray-200'
                          }`}
                        >
                          {years} yrs
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Results */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              {/* EMI Card */}
              <Card className="bg-gradient-to-br from-[#3B7BFF] to-[#8B5CF6] text-white shadow-xl">
                <CardContent className="p-8">
                  <p className="text-white/80 text-sm font-medium mb-2">Your Monthly EMI</p>
                  <p className="text-5xl font-bold mb-2">
                    ₹{emiDetails.emi.toLocaleString('en-IN')}
                  </p>
                  <p className="text-white/60 text-sm">per month for {loanTenure} years</p>
                </CardContent>
              </Card>

              {/* Breakdown */}
              <Card className="bg-white/80 backdrop-blur-xl border-white/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Payment Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Visual Breakdown */}
                  <div className="h-4 rounded-full overflow-hidden flex bg-gray-100">
                    <div 
                      className="bg-[#3B7BFF] transition-all duration-500"
                      style={{ width: `${principalPercentage}%` }}
                    />
                    <div 
                      className="bg-[#EC4899] transition-all duration-500"
                      style={{ width: `${interestPercentage}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-[#3B7BFF]" />
                      <div>
                        <p className="text-sm text-muted-foreground">Principal</p>
                        <p className="font-semibold">{formatCurrency(loanAmount)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-[#EC4899]" />
                      <div>
                        <p className="text-sm text-muted-foreground">Interest</p>
                        <p className="font-semibold">{formatCurrency(emiDetails.totalInterest)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Payment</span>
                      <span className="text-xl font-bold text-[#2B2F36]">
                        {formatCurrency(emiDetails.totalPayment)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800 mb-1">Pro Tip</p>
                      <p className="text-sm text-amber-700">
                        Consider making part-prepayments to reduce your interest burden. 
                        Even small extra payments can significantly reduce your total interest.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EMICalculatorPage;
