import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { 
  Calculator, 
  TrendingUp, 
  Home, 
  Sparkles, 
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Clock,
  Shield,
  Building2,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  Legend
} from 'recharts';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { getBankRates, getPolicyRates, BankRate, PolicyRates } from '@/services/bankRatesService';

// ============================================
// QUIET LUXURY DESIGN SYSTEM
// ============================================
// Colors:
//   Background: Cloud Dancer (#F0EEE9)
//   Cards: Pure White with 20px blur
//   Text: Deep Charcoal (#2B2F36)
//   Accent: Signal Blue (#3B7BFF)
// Typography: Plus Jakarta Sans, -0.02em headings
// Animations: Spring physics (stiffness: 300, damping: 30)
// ============================================

const SPRING_CONFIG = { stiffness: 300, damping: 30 };

// Rolling Number Animation Component
const RollingNumber: React.FC<{ value: number; className?: string }> = ({ value, className }) => {
  const springValue = useSpring(value, SPRING_CONFIG);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    springValue.set(value);
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayValue(Math.round(latest));
    });
    return () => unsubscribe();
  }, [value, springValue]);

  return (
    <motion.span className={cn('tabular-nums', className)}>
      ₹{displayValue.toLocaleString()}
    </motion.span>
  );
};

// Quiet Luxury Card with Parallax
const LuxuryCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  hasGlow?: boolean;
}> = ({ children, className, hasGlow = false }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-100, 100], [1.5, -1.5]), SPRING_CONFIG);
  const rotateY = useSpring(useTransform(mouseX, [-100, 100], [-1.5, 1.5]), SPRING_CONFIG);
  const scale = useSpring(1, SPRING_CONFIG);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseEnter = () => scale.set(1.01);
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    scale.set(1);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ 
        rotateX, 
        rotateY, 
        scale,
        transformPerspective: 1200,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
      }}
      className={cn(
        'relative rounded-3xl',
        'bg-white/95 backdrop-blur-[20px]',
        'border border-white/20',
        className
      )}
    >
      {/* Light-catching top/left border */}
      <div 
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 40%)',
          borderRadius: 'inherit'
        }}
      />
      
      {/* Signal Blue ambient glow */}
      {hasGlow && (
        <div 
          className="absolute -inset-[1px] rounded-3xl -z-10"
          style={{
            boxShadow: '0 20px 40px -15px rgba(59, 123, 255, 0.18)'
          }}
        />
      )}

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

// Floating Icon with faster parallax
const FloatingIcon: React.FC<{
  icon: React.ElementType;
  color: string;
  className?: string;
}> = ({ icon: Icon, color, className }) => {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, ...SPRING_CONFIG }}
      whileHover={{ scale: 1.08, rotate: 3 }}
      className={cn(
        'h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg z-30',
        className
      )}
      style={{ 
        background: color,
        boxShadow: `0 8px 24px -4px ${color}44`
      }}
    >
      <Icon className="h-7 w-7 text-white" />
    </motion.div>
  );
};

const ServicesPage: React.FC = () => {
  // EMI Calculator State
  const [loanAmount, setLoanAmount] = useState(4000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  // Investment Calculator State
  const [investmentYears, setInvestmentYears] = useState(5);
  const [appreciation, setAppreciation] = useState(10);
  const propertyPrice = 5000000;

  // Home Loan Eligibility State
  const [monthlyIncome, setMonthlyIncome] = useState(150000);
  const [existingEMI, setExistingEMI] = useState(0);

  // Bank Rates State
  const [bankRates, setBankRates] = useState<BankRate[]>([]);
  const [policyRates, setPolicyRates] = useState<PolicyRates | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState(true);
  const [selectedBankType, setSelectedBankType] = useState<'all' | 'public' | 'private'>('all');

  // Fetch bank rates on mount
  useEffect(() => {
    const fetchRates = async () => {
      setIsLoadingRates(true);
      try {
        const [rates, policy] = await Promise.all([
          getBankRates(),
          getPolicyRates()
        ]);
        setBankRates(rates);
        setPolicyRates(policy);
      } catch (error) {
        console.error('Failed to fetch bank rates:', error);
      } finally {
        setIsLoadingRates(false);
      }
    };
    fetchRates();
  }, []);

  // Filtered bank rates based on selected type
  const filteredBankRates = useMemo(() => {
    if (selectedBankType === 'all') return bankRates;
    return bankRates.filter(bank => bank.type === selectedBankType);
  }, [bankRates, selectedBankType]);

  // EMI Calculations
  const emiCalculations = useMemo(() => {
    const principal = loanAmount;
    const monthlyRate = interestRate / 12 / 100;
    const months = tenure * 12;

    if (monthlyRate === 0) {
      return { emi: principal / months, totalInterest: 0, totalAmount: principal };
    }

    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    const totalAmount = emi * months;
    const totalInterest = totalAmount - principal;

    return { emi: Math.round(emi), totalInterest, totalAmount };
  }, [loanAmount, interestRate, tenure]);

  // Investment Calculations
  const investmentCalc = useMemo(() => {
    const futureValue = propertyPrice * Math.pow(1 + appreciation / 100, investmentYears);
    const capitalGain = futureValue - propertyPrice;
    const roi = (capitalGain / propertyPrice) * 100;
    return { futureValue, capitalGain, roi };
  }, [propertyPrice, appreciation, investmentYears]);

  // Eligibility Calculations
  const eligibilityCalc = useMemo(() => {
    const monthlyRate = interestRate / 12 / 100;
    const months = tenure * 12;
    const maxFoir = 50;
    const maxEMI = (monthlyIncome * maxFoir / 100) - existingEMI;
    const maxLoan = maxEMI * (Math.pow(1 + monthlyRate, months) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, months));
    const foir = ((emiCalculations.emi + existingEMI) / monthlyIncome) * 100;
    const isEligible = foir <= maxFoir;
    
    return { maxLoan, foir, isEligible, maxEMI };
  }, [monthlyIncome, existingEMI, interestRate, tenure, emiCalculations.emi]);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${Math.round(amount).toLocaleString()}`;
  };

  const emiToIncomeRatio = (emiCalculations.emi / monthlyIncome) * 100;

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{ 
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
      }}
    >
      {/* Soft flowing gradient background */}
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
      
      {/* Animated gradient blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Warm peach/salmon blob - bottom left */}
        <div 
          className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full opacity-40 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(255, 200, 180, 0.6) 0%, rgba(255, 180, 160, 0.3) 50%, transparent 70%)'
          }}
        />
        
        {/* Lavender blob - top right */}
        <div 
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-40 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(200, 190, 230, 0.6) 0%, rgba(180, 170, 220, 0.3) 50%, transparent 70%)'
          }}
        />
        
        {/* Soft blue blob - center right */}
        <div 
          className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full opacity-30 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(180, 200, 240, 0.5) 0%, transparent 60%)'
          }}
        />
        
        {/* Warm amber blob - bottom center */}
        <div 
          className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] rounded-full opacity-25 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(250, 220, 200, 0.5) 0%, transparent 60%)'
          }}
        />
      </div>

      <Header />
      
      <main className="container py-12 md:py-20">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, ...SPRING_CONFIG }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8"
            style={{ 
              background: 'rgba(59, 123, 255, 0.08)',
              border: '1px solid rgba(59, 123, 255, 0.15)'
            }}
          >
            <Sparkles className="h-4 w-4" style={{ color: '#3B7BFF' }} />
            <span 
              className="text-sm font-semibold"
              style={{ color: '#3B7BFF', letterSpacing: '-0.01em' }}
            >
              Financial Tools
            </span>
          </motion.div>
          
          <h1 
            className="text-5xl md:text-7xl font-bold mb-5"
            style={{ 
              color: '#2B2F36',
              letterSpacing: '-0.02em',
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
            }}
          >
            Plan Your Home
          </h1>
          <p 
            className="text-lg md:text-xl max-w-xl mx-auto"
            style={{ color: '#6B7280' }}
          >
            Smart calculators to guide your property investment
          </p>
        </motion.div>

        {/* Bento Grid - Balanced Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-12">
          
          {/* EMI Calculator (7 columns) */}
          <div className="lg:col-span-7">
            <LuxuryCard hasGlow className="p-6 md:p-8">
              {/* Icon + Header Row */}
              <div className="flex items-start gap-4 mb-6">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, ...SPRING_CONFIG }}
                  className="h-12 w-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                  style={{ 
                    background: '#3B7BFF',
                    boxShadow: '0 8px 24px -4px rgba(59, 123, 255, 0.4)'
                  }}
                >
                  <Calculator className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <h2 
                    className="text-xl md:text-2xl font-bold"
                    style={{ color: '#2B2F36', letterSpacing: '-0.02em' }}
                  >
                    EMI Calculator
                  </h2>
                  <p style={{ color: '#6B7280' }} className="text-sm mt-0.5">
                    Calculate your monthly payments
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Sliders */}
                <div className="space-y-6">
                  {/* Loan Amount */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label 
                        className="text-sm font-semibold"
                        style={{ color: '#2B2F36' }}
                      >
                        Loan Amount
                      </Label>
                      <motion.span 
                        key={loanAmount}
                        initial={{ scale: 1.05 }}
                        animate={{ scale: 1 }}
                        className="text-xl font-bold tabular-nums"
                        style={{ color: '#2B2F36', letterSpacing: '-0.02em' }}
                      >
                        {formatCurrency(loanAmount)}
                      </motion.span>
                    </div>
                    <Slider
                      value={[loanAmount]}
                      onValueChange={(v) => setLoanAmount(v[0])}
                      min={500000}
                      max={50000000}
                      step={100000}
                      className="py-3"
                    />
                    <div className="flex justify-between text-xs" style={{ color: '#9CA3AF' }}>
                      <span>₹5L</span>
                      <span>₹5Cr</span>
                    </div>
                  </div>

                  {/* Interest Rate */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold" style={{ color: '#2B2F36' }}>
                        Interest Rate
                      </Label>
                      <span 
                        className="text-xl font-bold"
                        style={{ color: '#2B2F36', letterSpacing: '-0.02em' }}
                      >
                        {interestRate}%
                      </span>
                    </div>
                    <Slider
                      value={[interestRate]}
                      onValueChange={(v) => setInterestRate(v[0])}
                      min={5}
                      max={15}
                      step={0.1}
                      className="py-3"
                    />
                    <div className="flex justify-between text-xs" style={{ color: '#9CA3AF' }}>
                      <span>5%</span>
                      <span>15%</span>
                    </div>
                  </div>

                  {/* Tenure */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold" style={{ color: '#2B2F36' }}>
                        Loan Tenure
                      </Label>
                      <span 
                        className="text-lg font-bold"
                        style={{ color: '#2B2F36', letterSpacing: '-0.02em' }}
                      >
                        {tenure} years
                      </span>
                    </div>
                    <Slider
                      value={[tenure]}
                      onValueChange={(v) => setTenure(v[0])}
                      min={1}
                      max={30}
                      step={1}
                      className="py-2"
                    />
                    <div className="flex justify-between text-xs" style={{ color: '#9CA3AF' }}>
                      <span>1 yr</span>
                      <span>30 yrs</span>
                    </div>
                  </div>

                  {/* Quick EMI Comparison */}
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    <p className="text-sm font-semibold mb-3" style={{ color: '#2B2F36' }}>
                      EMI at Different Rates
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {[7.5, 8.5, 9.5].map((rate) => {
                        const monthlyRate = rate / 12 / 100;
                        const months = tenure * 12;
                        const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
                          (Math.pow(1 + monthlyRate, months) - 1);
                        const isCurrentRate = Math.abs(rate - interestRate) < 0.5;
                        return (
                          <motion.div
                            key={rate}
                            whileHover={{ scale: 1.02 }}
                            className={`p-3 rounded-lg text-center cursor-pointer transition-all ${
                              isCurrentRate ? 'ring-2 ring-blue-500' : ''
                            }`}
                            style={{ 
                              background: isCurrentRate ? 'rgba(59, 123, 255, 0.1)' : 'rgba(0,0,0,0.02)',
                              border: '1px solid rgba(0,0,0,0.04)'
                            }}
                            onClick={() => setInterestRate(rate)}
                          >
                            <p className="text-xs font-medium" style={{ color: '#6B7280' }}>{rate}%</p>
                            <p className="text-sm font-bold" style={{ color: isCurrentRate ? '#3B7BFF' : '#2B2F36' }}>
                              ₹{Math.round(emi).toLocaleString()}
                            </p>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Home Buying Tips */}
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    <p className="text-sm font-semibold mb-3" style={{ color: '#2B2F36' }}>
                      💡 Expert Tips
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#10B981' }} />
                        <p className="text-xs" style={{ color: '#6B7280' }}>
                          Keep EMI under 30% of income for financial stability
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#10B981' }} />
                        <p className="text-xs" style={{ color: '#6B7280' }}>
                          Higher down payment = Lower interest over time
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#10B981' }} />
                        <p className="text-xs" style={{ color: '#6B7280' }}>
                          Compare rates from 3+ banks before deciding
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Popular Loan Amounts - Quick Select */}
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    <p className="text-sm font-semibold mb-3" style={{ color: '#2B2F36' }}>
                      Popular Loan Amounts
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[2500000, 5000000, 7500000, 10000000].map((amount) => (
                        <motion.button
                          key={amount}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setLoanAmount(amount)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            loanAmount === amount 
                              ? 'bg-[#3B7BFF] text-white' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          ₹{(amount / 100000).toFixed(0)}L
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Tenure Guide */}
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    <p className="text-sm font-semibold mb-3" style={{ color: '#2B2F36' }}>
                      Tenure Guide
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                        <p className="text-xs font-bold" style={{ color: '#10B981' }}>10 yrs</p>
                        <p className="text-[10px]" style={{ color: '#6B7280' }}>Low interest</p>
                      </div>
                      <div className="p-2 rounded-lg" style={{ background: 'rgba(59, 123, 255, 0.1)' }}>
                        <p className="text-xs font-bold" style={{ color: '#3B7BFF' }}>20 yrs</p>
                        <p className="text-[10px]" style={{ color: '#6B7280' }}>Balanced</p>
                      </div>
                      <div className="p-2 rounded-lg" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                        <p className="text-xs font-bold" style={{ color: '#F59E0B' }}>30 yrs</p>
                        <p className="text-[10px]" style={{ color: '#6B7280' }}>Low EMI</p>
                      </div>
                    </div>
                  </div>

                  {/* Top Banks Preview */}
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold" style={{ color: '#2B2F36' }}>
                        Top Banks
                      </p>
                      {policyRates && (
                        <Badge variant="outline" className="text-[10px]">
                          Repo: {policyRates.repoRate}%
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      {bankRates.slice(0, 4).map((bank, idx) => (
                        <div 
                          key={bank.shortName}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ background: bank.color }}
                            />
                            <span className="text-xs font-medium" style={{ color: '#2B2F36' }}>
                              {bank.shortName}
                            </span>
                          </div>
                          <span className="text-xs font-bold" style={{ color: bank.color }}>
                            {bank.minRate}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Results */}
                <div className="space-y-4">
                  {/* Giant EMI Display */}
                  <motion.div 
                    layout
                    className="text-center p-8 rounded-2xl"
                    style={{ 
                      background: '#3B7BFF',
                      boxShadow: '0 12px 32px -8px rgba(59, 123, 255, 0.4)'
                    }}
                  >
                    <p className="text-sm text-white/80 mb-2 font-medium">Monthly EMI</p>
                    <motion.p 
                      className="text-4xl md:text-5xl font-bold text-white"
                      style={{ letterSpacing: '-0.04em' }}
                    >
                      <RollingNumber value={emiCalculations.emi} />
                    </motion.p>
                  </motion.div>

                  {/* Status Badge */}
                  <motion.div 
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 rounded-xl"
                    style={{ 
                      background: emiToIncomeRatio < 30 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                      border: `1px solid ${emiToIncomeRatio < 30 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                    }}
                  >
                    <Shield 
                      className="h-5 w-5" 
                      style={{ color: emiToIncomeRatio < 30 ? '#10B981' : '#F59E0B' }} 
                    />
                    <div>
                      <p 
                        className="font-semibold text-sm"
                        style={{ color: emiToIncomeRatio < 30 ? '#10B981' : '#F59E0B' }}
                      >
                        {emiToIncomeRatio.toFixed(0)}% of income
                      </p>
                      <p className="text-xs" style={{ color: '#6B7280' }}>
                        {emiToIncomeRatio < 30 ? 'Comfortable zone' : 'Consider extending tenure'}
                      </p>
                    </div>
                  </motion.div>

                  {/* Breakdown */}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.div 
                      whileHover={{ y: -2 }}
                      transition={SPRING_CONFIG}
                      className="p-4 rounded-xl"
                      style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)' }}
                    >
                      <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Interest</p>
                      <p className="text-lg font-bold" style={{ color: '#F59E0B', letterSpacing: '-0.02em' }}>
                        {formatCurrency(emiCalculations.totalInterest)}
                      </p>
                    </motion.div>
                    <motion.div 
                      whileHover={{ y: -2 }}
                      transition={SPRING_CONFIG}
                      className="p-4 rounded-xl"
                      style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)' }}
                    >
                      <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Total</p>
                      <p className="text-lg font-bold" style={{ color: '#2B2F36', letterSpacing: '-0.02em' }}>
                        {formatCurrency(emiCalculations.totalAmount)}
                      </p>
                    </motion.div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div 
                      className="h-3 rounded-full overflow-hidden flex"
                      style={{ background: '#E5E7EB' }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(loanAmount / emiCalculations.totalAmount) * 100}%` }}
                        transition={SPRING_CONFIG}
                        style={{ background: '#3B7BFF' }}
                        className="h-full"
                      />
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(emiCalculations.totalInterest / emiCalculations.totalAmount) * 100}%` }}
                        transition={SPRING_CONFIG}
                        style={{ background: '#F59E0B' }}
                        className="h-full"
                      />
                    </div>
                    <div className="flex justify-between text-xs font-medium" style={{ color: '#6B7280' }}>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: '#3B7BFF' }} />
                        Principal
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: '#F59E0B' }} />
                        Interest
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </LuxuryCard>
          </div>

          {/* SIDEBAR: Investment Calculator + Loan Eligibility (5 columns) */}
          <div className="lg:col-span-5 space-y-6">
            <LuxuryCard className="p-5">
              {/* Icon + Header Row */}
              <div className="flex items-start gap-3 mb-5">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, ...SPRING_CONFIG }}
                  className="h-12 w-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                  style={{ 
                    background: '#10B981',
                    boxShadow: '0 8px 20px -4px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  <TrendingUp className="h-6 w-6 text-white" />
                </motion.div>
                <h3 
                  className="text-xl font-bold pt-2"
                  style={{ color: '#2B2F36', letterSpacing: '-0.02em' }}
                >
                  Investment Returns
                </h3>
              </div>
                
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: '#6B7280' }} className="font-medium">Hold Period</span>
                      <Badge variant="outline" className="font-bold">{investmentYears} yrs</Badge>
                    </div>
                    <Slider
                      value={[investmentYears]}
                      onValueChange={(v) => setInvestmentYears(v[0])}
                      min={1}
                      max={15}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: '#6B7280' }} className="font-medium">Growth Rate</span>
                      <Badge variant="outline" className="font-bold">{appreciation}%/yr</Badge>
                    </div>
                    <Slider
                      value={[appreciation]}
                      onValueChange={(v) => setAppreciation(v[0])}
                      min={0}
                      max={20}
                      step={0.5}
                    />
                  </div>

                  <Separator style={{ background: '#E5E7EB' }} />

                  <motion.div 
                    key={investmentCalc.futureValue}
                    initial={{ scale: 0.98 }}
                    animate={{ scale: 1 }}
                    transition={SPRING_CONFIG}
                    className="text-center p-5 rounded-xl"
                    style={{ 
                      background: 'rgba(16, 185, 129, 0.06)',
                      border: '1px solid rgba(16, 185, 129, 0.15)'
                    }}
                  >
                    <p className="text-xs mb-1" style={{ color: '#6B7280' }}>Future Value</p>
                    <p 
                      className="text-2xl font-bold"
                      style={{ color: '#10B981', letterSpacing: '-0.03em' }}
                    >
                      {formatCurrency(investmentCalc.futureValue)}
                    </p>
                    <p className="text-sm mt-1 font-medium" style={{ color: '#10B981' }}>
                      +{formatCurrency(investmentCalc.capitalGain)} ({investmentCalc.roi.toFixed(0)}% ROI)
                    </p>
                  </motion.div>

                  {/* Growth Bars */}
                  <div className="h-14 flex items-end gap-1">
                    {Array.from({ length: Math.min(investmentYears, 10) }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${((i + 1) / Math.min(investmentYears, 10)) * 100}%` }}
                        transition={{ delay: i * 0.05, ...SPRING_CONFIG }}
                        className="flex-1 rounded-t"
                        style={{ background: '#10B981' }}
                      />
                    ))}
                  </div>
                  {/* Investment Insights */}
                  <div className="mt-5 pt-5" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    <p className="text-sm font-semibold mb-3" style={{ color: '#2B2F36' }}>
                      Investment Scenarios
                    </p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span style={{ color: '#6B7280' }}>Conservative (6%)</span>
                        <span className="font-bold" style={{ color: '#2B2F36' }}>
                          {formatCurrency(propertyPrice * Math.pow(1.06, investmentYears))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span style={{ color: '#6B7280' }}>Balanced (10%)</span>
                        <span className="font-bold" style={{ color: '#3B7BFF' }}>
                          {formatCurrency(propertyPrice * Math.pow(1.10, investmentYears))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span style={{ color: '#6B7280' }}>Aggressive (15%)</span>
                        <span className="font-bold" style={{ color: '#10B981' }}>
                          {formatCurrency(propertyPrice * Math.pow(1.15, investmentYears))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </LuxuryCard>

            {/* Loan Eligibility */}
            <LuxuryCard className="p-5">
              {/* Icon + Header Row */}
              <div className="flex items-start gap-3 mb-5">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, ...SPRING_CONFIG }}
                  className="h-12 w-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                  style={{ 
                    background: '#6366F1',
                    boxShadow: '0 8px 20px -4px rgba(99, 102, 241, 0.4)'
                  }}
                >
                  <Home className="h-6 w-6 text-white" />
                </motion.div>
                <h3 
                  className="text-xl font-bold pt-2"
                  style={{ color: '#2B2F36', letterSpacing: '-0.02em' }}
                >
                  Loan Eligibility
                </h3>
              </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium" style={{ color: '#6B7280' }}>
                      Monthly Income (₹)
                    </Label>
                    <Input
                      type="number"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                      className="bg-white/80"
                      style={{ border: '1px solid rgba(0,0,0,0.08)' }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium" style={{ color: '#6B7280' }}>
                      Existing EMIs (₹)
                    </Label>
                    <Input
                      type="number"
                      value={existingEMI}
                      onChange={(e) => setExistingEMI(Number(e.target.value))}
                      className="bg-white/80"
                      style={{ border: '1px solid rgba(0,0,0,0.08)' }}
                    />
                  </div>

                  <Separator style={{ background: '#E5E7EB' }} />

                  {/* Eligibility Status */}
                  <motion.div 
                    className="relative p-5 rounded-xl flex items-center gap-4 overflow-hidden"
                    style={{
                      background: eligibilityCalc.isEligible 
                        ? 'rgba(16, 185, 129, 0.06)' 
                        : 'rgba(239, 68, 68, 0.06)',
                      border: `1px solid ${eligibilityCalc.isEligible 
                        ? 'rgba(16, 185, 129, 0.2)' 
                        : 'rgba(239, 68, 68, 0.2)'}`
                    }}
                  >
                    {/* Shimmer on eligible */}
                    {eligibilityCalc.isEligible && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-200%', '200%'] }}
                        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
                      />
                    )}
                    
                    <motion.div
                      animate={eligibilityCalc.isEligible ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      {eligibilityCalc.isEligible ? (
                        <CheckCircle className="h-7 w-7" style={{ color: '#10B981' }} />
                      ) : (
                        <AlertCircle className="h-7 w-7" style={{ color: '#EF4444' }} />
                      )}
                    </motion.div>
                    <div>
                      <p 
                        className="font-bold"
                        style={{ 
                          color: eligibilityCalc.isEligible ? '#10B981' : '#EF4444',
                          letterSpacing: '-0.01em'
                        }}
                      >
                        {eligibilityCalc.isEligible ? 'Likely Eligible!' : 'High Risk'}
                      </p>
                      <p className="text-sm" style={{ color: '#6B7280' }}>
                        FOIR: {eligibilityCalc.foir.toFixed(1)}%
                      </p>
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ y: -2 }}
                    transition={SPRING_CONFIG}
                    className="p-4 rounded-xl"
                    style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-3.5 w-3.5" style={{ color: '#9CA3AF' }} />
                      <p className="text-xs font-medium" style={{ color: '#6B7280' }}>Max Eligible Loan</p>
                    </div>
                    <p 
                      className="text-xl font-bold"
                      style={{ color: '#2B2F36', letterSpacing: '-0.02em' }}
                    >
                      {formatCurrency(eligibilityCalc.maxLoan)}
                    </p>
                  </motion.div>

                  {/* Documents Required */}
                  <div className="mt-2 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                     <p className="text-sm font-semibold mb-3" style={{ color: '#2B2F36' }}>
                      Required Documents
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: '#6B7280' }}>
                       <div className="flex items-center gap-1.5">
                         <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                         ID Proof (Aadhar)
                       </div>
                       <div className="flex items-center gap-1.5">
                         <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                         Salary Slips
                       </div>
                        <div className="flex items-center gap-1.5">
                         <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                         Bank Statements
                       </div>
                       <div className="flex items-center gap-1.5">
                         <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                         Form 16 / ITR
                       </div>
                    </div>
                  </div>
                </div>
              </LuxuryCard>
          </div>
        </div>

        {/* Bank Interest Rates Comparison Section */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, ...SPRING_CONFIG }}
          className="mt-12"
        >
          <LuxuryCard className="p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-start gap-4">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, ...SPRING_CONFIG }}
                  className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
                  style={{ 
                    background: 'linear-gradient(135deg, #3B7BFF 0%, #8B5CF6 100%)',
                    boxShadow: '0 8px 24px -4px rgba(59, 123, 255, 0.4)'
                  }}
                >
                  <Building2 className="h-7 w-7 text-white" />
                </motion.div>
                <div>
                  <h3 
                    className="text-2xl font-bold"
                    style={{ color: '#2B2F36', letterSpacing: '-0.02em' }}
                  >
                    Bank Interest Rates
                  </h3>
                  <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                    Compare home loan rates across major banks • Updated Jan 2026
                  </p>
                </div>
              </div>

              {/* Policy Rate Badge */}
              {policyRates && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center gap-3 px-5 py-3 rounded-xl"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(59, 123, 255, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
                    border: '1px solid rgba(59, 123, 255, 0.15)'
                  }}
                >
                  <div>
                    <p className="text-xs font-medium" style={{ color: '#6B7280' }}>RBI Repo Rate</p>
                    <p className="text-xl font-bold" style={{ color: '#3B7BFF' }}>
                      {policyRates.repoRate}%
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Bank Type Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { key: 'all', label: 'All Banks' },
                { key: 'public', label: 'Public Sector' },
                { key: 'private', label: 'Private Banks' }
              ].map((filter) => (
                <Button
                  key={filter.key}
                  variant={selectedBankType === filter.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedBankType(filter.key as 'all' | 'public' | 'private')}
                  className={cn(
                    "rounded-lg font-medium transition-all",
                    selectedBankType === filter.key 
                      ? "bg-[#3B7BFF] text-white shadow-lg shadow-blue-500/25" 
                      : "hover:bg-gray-100"
                  )}
                >
                  {filter.label}
                </Button>
              ))}
            </div>

            {/* Chart */}
            {isLoadingRates ? (
              <div className="h-[400px] flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw className="h-8 w-8" style={{ color: '#3B7BFF' }} />
                </motion.div>
              </div>
            ) : (
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredBankRates.map(bank => ({
                      name: bank.shortName,
                      minRate: bank.minRate,
                      maxRate: bank.maxRate,
                      spread: bank.maxRate - bank.minRate,
                      color: bank.color,
                      fullName: bank.bankName,
                      type: bank.type
                    }))}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
                    barCategoryGap="20%"
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      horizontal={true}
                      vertical={false}
                      stroke="rgba(0,0,0,0.06)"
                    />
                    <XAxis 
                      type="number" 
                      domain={[7, 14]}
                      tickFormatter={(value) => `${value}%`}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name"
                      tick={{ fill: '#2B2F36', fontSize: 13, fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                      width={70}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(59, 123, 255, 0.05)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="bg-white rounded-xl shadow-xl border border-gray-100 p-4"
                              style={{ minWidth: '200px' }}
                            >
                              <p className="font-bold text-[#2B2F36] mb-2">{data.fullName}</p>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-[#6B7280]">Min Rate:</span>
                                  <span className="font-semibold text-green-600">{data.minRate}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-[#6B7280]">Max Rate:</span>
                                  <span className="font-semibold text-orange-500">{data.maxRate}%</span>
                                </div>
                                <div className="pt-2 border-t border-gray-100">
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {data.type === 'public' ? '🏛️ Public' : data.type === 'private' ? '🏦 Private' : data.type}
                                  </Badge>
                                </div>
                              </div>
                            </motion.div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="minRate" 
                      name="Min Rate"
                      radius={[0, 6, 6, 0]}
                    >
                      {filteredBankRates.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          style={{ filter: 'brightness(1.1)' }}
                        />
                      ))}
                    </Bar>
                    <Bar 
                      dataKey="spread" 
                      name="Rate Range"
                      stackId="a"
                      radius={[0, 6, 6, 0]}
                      fill="rgba(0,0,0,0.1)"
                    />
                    <Legend 
                      verticalAlign="top"
                      align="right"
                      wrapperStyle={{ paddingBottom: '10px' }}
                      formatter={(value) => (
                        <span style={{ color: '#6B7280', fontSize: '12px' }}>{value}</span>
                      )}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Bottom Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <motion.div 
                whileHover={{ y: -2 }}
                className="p-4 rounded-xl text-center"
                style={{ background: 'rgba(16, 185, 129, 0.08)' }}
              >
                <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Lowest Rate</p>
                <p className="text-2xl font-bold" style={{ color: '#10B981' }}>
                  {bankRates.length > 0 ? `${Math.min(...bankRates.map(b => b.minRate))}%` : '-'}
                </p>
                <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                  {bankRates.length > 0 ? bankRates.find(b => b.minRate === Math.min(...bankRates.map(x => x.minRate)))?.shortName : ''}
                </p>
              </motion.div>
              <motion.div 
                whileHover={{ y: -2 }}
                className="p-4 rounded-xl text-center"
                style={{ background: 'rgba(59, 123, 255, 0.08)' }}
              >
                <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Average Rate</p>
                <p className="text-2xl font-bold" style={{ color: '#3B7BFF' }}>
                  {bankRates.length > 0 ? `${(bankRates.reduce((acc, b) => acc + b.minRate, 0) / bankRates.length).toFixed(2)}%` : '-'}
                </p>
                <p className="text-xs mt-1" style={{ color: '#6B7280' }}>Across all banks</p>
              </motion.div>
              <motion.div 
                whileHover={{ y: -2 }}
                className="p-4 rounded-xl text-center"
                style={{ background: 'rgba(245, 158, 11, 0.08)' }}
              >
                <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Banks Compared</p>
                <p className="text-2xl font-bold" style={{ color: '#F59E0B' }}>
                  {bankRates.length}
                </p>
                <p className="text-xs mt-1" style={{ color: '#6B7280' }}>Major lenders</p>
              </motion.div>
            </div>
          </LuxuryCard>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, ...SPRING_CONFIG }}
          className="mt-16 flex justify-center"
        >
          <LuxuryCard className="px-10 py-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="text-center sm:text-left">
                <p className="text-sm mb-1" style={{ color: '#6B7280' }}>
                  Ready to find your dream home?
                </p>
                <p 
                  className="font-bold text-lg"
                  style={{ color: '#2B2F36', letterSpacing: '-0.01em' }}
                >
                  Browse properties tailored to your budget
                </p>
              </div>
              <Button 
                size="lg"
                className="px-8 text-white font-semibold"
                style={{ 
                  background: '#3B7BFF',
                  boxShadow: '0 4px 14px rgba(59, 123, 255, 0.3)'
                }}
              >
                Explore Properties
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </LuxuryCard>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default ServicesPage;
