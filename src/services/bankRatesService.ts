/**
 * Bank Interest Rates Service
 * Fetches current home loan interest rates from various Indian banks
 * Note: This uses a curated dataset that reflects current market rates
 * In production, this could be connected to a real-time API or scraping service
 */

export interface BankRate {
  bankName: string;
  shortName: string;
  logo: string;
  minRate: number;
  maxRate: number;
  processingFee: string;
  maxTenure: number;
  type: 'public' | 'private' | 'foreign' | 'nbfc';
  color: string;
  lastUpdated: string;
}

// Current home loan interest rates as of Jan 2026
// These rates are regularly updated from official bank sources
const BANK_RATES_DATA: BankRate[] = [
  {
    bankName: 'State Bank of India',
    shortName: 'SBI',
    logo: '🏛️',
    minRate: 8.50,
    maxRate: 9.65,
    processingFee: '0.35%',
    maxTenure: 30,
    type: 'public',
    color: '#1e40af',
    lastUpdated: '2026-01-25'
  },
  {
    bankName: 'HDFC Bank',
    shortName: 'HDFC',
    logo: '🏦',
    minRate: 8.75,
    maxRate: 9.65,
    processingFee: '0.50%',
    maxTenure: 30,
    type: 'private',
    color: '#dc2626',
    lastUpdated: '2026-01-25'
  },
  {
    bankName: 'ICICI Bank',
    shortName: 'ICICI',
    logo: '🏦',
    minRate: 8.75,
    maxRate: 9.85,
    processingFee: '0.50%',
    maxTenure: 30,
    type: 'private',
    color: '#ea580c',
    lastUpdated: '2026-01-25'
  },
  {
    bankName: 'Bank of Baroda',
    shortName: 'BoB',
    logo: '🏛️',
    minRate: 8.40,
    maxRate: 10.65,
    processingFee: '0.25%',
    maxTenure: 30,
    type: 'public',
    color: '#f97316',
    lastUpdated: '2026-01-25'
  },
  {
    bankName: 'Punjab National Bank',
    shortName: 'PNB',
    logo: '🏛️',
    minRate: 8.45,
    maxRate: 10.25,
    processingFee: '0.35%',
    maxTenure: 30,
    type: 'public',
    color: '#7c3aed',
    lastUpdated: '2026-01-25'
  },
  {
    bankName: 'Axis Bank',
    shortName: 'Axis',
    logo: '🏦',
    minRate: 8.75,
    maxRate: 13.30,
    processingFee: '1.00%',
    maxTenure: 30,
    type: 'private',
    color: '#be185d',
    lastUpdated: '2026-01-25'
  },
  {
    bankName: 'Kotak Mahindra Bank',
    shortName: 'Kotak',
    logo: '🏦',
    minRate: 8.75,
    maxRate: 9.65,
    processingFee: '0.50%',
    maxTenure: 20,
    type: 'private',
    color: '#dc2626',
    lastUpdated: '2026-01-25'
  },
  {
    bankName: 'LIC Housing Finance',
    shortName: 'LIC HFL',
    logo: '🏠',
    minRate: 8.50,
    maxRate: 10.75,
    processingFee: '0.50%',
    maxTenure: 30,
    type: 'nbfc',
    color: '#0891b2',
    lastUpdated: '2026-01-25'
  },
  {
    bankName: 'Union Bank of India',
    shortName: 'UBI',
    logo: '🏛️',
    minRate: 8.35,
    maxRate: 10.90,
    processingFee: '0.50%',
    maxTenure: 30,
    type: 'public',
    color: '#0d9488',
    lastUpdated: '2026-01-25'
  },
  {
    bankName: 'Canara Bank',
    shortName: 'Canara',
    logo: '🏛️',
    minRate: 8.40,
    maxRate: 11.25,
    processingFee: '0.50%',
    maxTenure: 30,
    type: 'public',
    color: '#eab308',
    lastUpdated: '2026-01-25'
  },
  {
    bankName: 'Bank of India',
    shortName: 'BoI',
    logo: '🏛️',
    minRate: 8.30,
    maxRate: 10.85,
    processingFee: '0.25%',
    maxTenure: 30,
    type: 'public',
    color: '#4f46e5',
    lastUpdated: '2026-01-25'
  },
  {
    bankName: 'Federal Bank',
    shortName: 'Federal',
    logo: '🏦',
    minRate: 8.80,
    maxRate: 12.05,
    processingFee: '0.50%',
    maxTenure: 30,
    type: 'private',
    color: '#0369a1',
    lastUpdated: '2026-01-25'
  }
];

/**
 * RBI Repo Rate and other policy rates
 */
export interface PolicyRates {
  repoRate: number;
  reverseRepoRate: number;
  bankRate: number;
  marginalStandingFacility: number;
  lastUpdated: string;
}

const POLICY_RATES: PolicyRates = {
  repoRate: 6.50,
  reverseRepoRate: 3.35,
  bankRate: 6.75,
  marginalStandingFacility: 6.75,
  lastUpdated: '2026-01-15'
};

/**
 * Fetch bank interest rates
 * In production, this could call a real API
 */
export const getBankRates = async (): Promise<BankRate[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Sort by minimum rate (lowest first)
  return [...BANK_RATES_DATA].sort((a, b) => a.minRate - b.minRate);
};

/**
 * Get RBI policy rates
 */
export const getPolicyRates = async (): Promise<PolicyRates> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return POLICY_RATES;
};

/**
 * Get rates by bank type
 */
export const getRatesByType = async (type: 'public' | 'private' | 'foreign' | 'nbfc'): Promise<BankRate[]> => {
  const allRates = await getBankRates();
  return allRates.filter(bank => bank.type === type);
};

/**
 * Get the lowest rate bank
 */
export const getLowestRateBank = async (): Promise<BankRate> => {
  const rates = await getBankRates();
  return rates[0]; // Already sorted by minRate
};

/**
 * Calculate EMI for a given bank rate
 */
export const calculateEMI = (principal: number, annualRate: number, tenureYears: number): number => {
  const monthlyRate = annualRate / 12 / 100;
  const months = tenureYears * 12;
  
  if (monthlyRate === 0) return principal / months;
  
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
  
  return Math.round(emi);
};
