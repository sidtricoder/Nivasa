import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Newspaper, 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  MapPin, 
  Calendar, 
  ExternalLink,
  RefreshCw,
  Filter,
  ChevronRight,
  Bookmark,
  Share2,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { cn } from '@/lib/utils';

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  category: 'market' | 'policy' | 'investment' | 'trends' | 'city';
  source: string;
  sourceUrl: string;
  publishedAt: string;
  imageUrl: string;
  readTime: number;
  trending?: boolean;
  city?: string;
}

// Extended news data with more articles per category
const mockNews: NewsArticle[] = [
  // MARKET NEWS
  {
    id: '1',
    title: 'Bangalore Real Estate Market Sees 15% Price Surge in Q4 2025',
    summary: 'The Silicon Valley of India continues its upward trajectory with premium locations like Whitefield and Electronic City leading the growth.',
    category: 'market',
    source: 'Economic Times',
    sourceUrl: 'https://economictimes.com',
    publishedAt: '2026-01-27T10:30:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop',
    readTime: 5,
    trending: true,
    city: 'Bangalore'
  },
  {
    id: '9',
    title: 'Delhi NCR Witnesses Record Pre-Launch Sales in January 2026',
    summary: 'Premium projects in Gurugram and Noida see unprecedented demand with 70% inventory sold before official launch.',
    category: 'market',
    source: 'Financial Express',
    sourceUrl: 'https://financialexpress.com',
    publishedAt: '2026-01-26T08:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=250&fit=crop',
    readTime: 4,
    city: 'Delhi NCR'
  },
  {
    id: '10',
    title: 'Pune Real Estate Sees 30% Jump in NRI Investments',
    summary: 'Favorable exchange rates and strong rental yields attract overseas Indians to Pune real estate market.',
    category: 'market',
    source: 'India Today',
    sourceUrl: 'https://indiatoday.in',
    publishedAt: '2026-01-24T12:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=250&fit=crop',
    readTime: 6,
    city: 'Pune'
  },
  
  // POLICY NEWS
  {
    id: '2',
    title: 'RBI Announces New Home Loan Interest Rate Cuts for First-Time Buyers',
    summary: 'The Reserve Bank has introduced special schemes to make home ownership more accessible for millennials and first-time buyers.',
    category: 'policy',
    source: 'Mint',
    sourceUrl: 'https://livemint.com',
    publishedAt: '2026-01-26T14:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop',
    readTime: 4,
    trending: true
  },
  {
    id: '6',
    title: 'New RERA Guidelines Strengthen Buyer Protection in 2026',
    summary: 'The Real Estate Regulatory Authority introduces stricter compliance measures for developers.',
    category: 'policy',
    source: 'Business Standard',
    sourceUrl: 'https://business-standard.com',
    publishedAt: '2026-01-22T08:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=250&fit=crop',
    readTime: 5
  },
  {
    id: '11',
    title: 'Government Extends PMAY Subsidy Scheme Till December 2026',
    summary: 'First-time homebuyers in affordable segment can continue to avail interest subsidies up to ₹2.67 lakh.',
    category: 'policy',
    source: 'NDTV',
    sourceUrl: 'https://ndtv.com',
    publishedAt: '2026-01-21T10:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=400&h=250&fit=crop',
    readTime: 3
  },
  
  // INVESTMENT NEWS
  {
    id: '3',
    title: 'Top 5 Emerging Localities for Real Estate Investment in 2026',
    summary: 'Experts reveal the hidden gems across Indian metros that promise high returns for property investors.',
    category: 'investment',
    source: 'Housing.com',
    sourceUrl: 'https://housing.com',
    publishedAt: '2026-01-25T09:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=250&fit=crop',
    readTime: 7
  },
  {
    id: '12',
    title: 'REITs Deliver 18% Returns in 2025, Outperforming Equity Markets',
    summary: 'Real Estate Investment Trusts continue to attract retail investors with consistent dividend payouts.',
    category: 'investment',
    source: 'Moneycontrol',
    sourceUrl: 'https://moneycontrol.com',
    publishedAt: '2026-01-23T15:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=400&h=250&fit=crop',
    readTime: 5
  },
  {
    id: '13',
    title: 'Fractional Ownership Platforms See 200% Growth in User Base',
    summary: 'New-age platforms enable retail investors to own commercial real estate with investments starting ₹25 lakh.',
    category: 'investment',
    source: 'Forbes India',
    sourceUrl: 'https://forbesindia.com',
    publishedAt: '2026-01-20T11:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=250&fit=crop',
    readTime: 6
  },
  
  // TRENDS NEWS
  {
    id: '4',
    title: 'Smart Home Technology Becoming a Must-Have in Premium Properties',
    summary: 'AI-powered homes with IoT integration are commanding 20% premium in the luxury segment.',
    category: 'trends',
    source: 'PropTiger',
    sourceUrl: 'https://proptiger.com',
    publishedAt: '2026-01-24T16:30:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop',
    readTime: 6
  },
  {
    id: '7',
    title: 'Co-living Spaces See 40% Growth as Remote Work Continues',
    summary: 'Young professionals prefer flexible living arrangements with community amenities.',
    category: 'trends',
    source: 'YourStory',
    sourceUrl: 'https://yourstory.com',
    publishedAt: '2026-01-21T13:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=250&fit=crop',
    readTime: 4
  },
  {
    id: '14',
    title: 'Green Buildings Command 15% Premium as ESG Focus Grows',
    summary: 'LEED and IGBC certified projects see higher demand from environmentally conscious buyers.',
    category: 'trends',
    source: 'The Hindu',
    sourceUrl: 'https://thehindu.com',
    publishedAt: '2026-01-19T09:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400&h=250&fit=crop',
    readTime: 5
  },
  {
    id: '15',
    title: 'Virtual Reality Home Tours Now Standard in Luxury Segment',
    summary: 'Developers invest in VR technology as 60% of luxury buyers prefer virtual walkthroughs before site visits.',
    category: 'trends',
    source: 'TechCrunch India',
    sourceUrl: 'https://techcrunch.com',
    publishedAt: '2026-01-18T14:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=400&h=250&fit=crop',
    readTime: 4
  },
  
  // CITY NEWS
  {
    id: '5',
    title: 'Mumbai Metro Line 3 Completion Boosts Property Values by 25%',
    summary: 'Areas along the new metro corridor see surge in demand as connectivity improves dramatically.',
    category: 'city',
    source: 'Times of India',
    sourceUrl: 'https://timesofindia.com',
    publishedAt: '2026-01-23T11:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=400&h=250&fit=crop',
    readTime: 4,
    city: 'Mumbai'
  },
  {
    id: '8',
    title: 'Hyderabad Emerges as Top Destination for IT Sector Real Estate',
    summary: 'HITEC City and Gachibowli see unprecedented demand from tech companies expanding operations.',
    category: 'city',
    source: 'Deccan Chronicle',
    sourceUrl: 'https://deccanchronicle.com',
    publishedAt: '2026-01-20T10:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&h=250&fit=crop',
    readTime: 5,
    city: 'Hyderabad'
  },
  {
    id: '16',
    title: 'Chennai Peripheral Ring Road Project to Transform Real Estate Landscape',
    summary: 'The 130 km ring road connecting suburbs expected to boost property values by 40% in outer areas.',
    category: 'city',
    source: 'The New Indian Express',
    sourceUrl: 'https://newindianexpress.com',
    publishedAt: '2026-01-17T08:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=250&fit=crop',
    readTime: 5,
    city: 'Chennai'
  }
];

const categoryConfig = {
  market: { label: 'Market', color: 'bg-blue-500', icon: TrendingUp },
  policy: { label: 'Policy', color: 'bg-purple-500', icon: Building2 },
  investment: { label: 'Investment', color: 'bg-green-500', icon: TrendingUp },
  trends: { label: 'Trends', color: 'bg-orange-500', icon: TrendingDown },
  city: { label: 'City News', color: 'bg-cyan-500', icon: MapPin },
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

const NewsCard: React.FC<{ article: NewsArticle; featured?: boolean }> = ({ article, featured }) => {
  const CategoryIcon = categoryConfig[article.category].icon;

  if (featured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group"
      >
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative aspect-video md:aspect-auto">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              {article.trending && (
                <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Trending
                </Badge>
              )}
            </div>
            <CardContent className="p-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className={cn('gap-1', categoryConfig[article.category].color, 'text-white')}>
                  <CategoryIcon className="h-3 w-3" />
                  {categoryConfig[article.category].label}
                </Badge>
                {article.city && (
                  <Badge variant="outline" className="gap-1">
                    <MapPin className="h-3 w-3" />
                    {article.city}
                  </Badge>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                {article.title}
              </h2>
              <p className="text-muted-foreground mb-4">{article.summary}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{article.source}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {article.readTime} min read
                  </span>
                  <span>{formatDate(article.publishedAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
        <div className="relative aspect-video">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <Badge 
            variant="secondary" 
            className={cn('absolute top-3 left-3 gap-1', categoryConfig[article.category].color, 'text-white')}
          >
            <CategoryIcon className="h-3 w-3" />
            {categoryConfig[article.category].label}
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{article.summary}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-medium">{article.source}</span>
              <span>•</span>
              <span>{formatDate(article.publishedAt)}</span>
            </div>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.readTime}m
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const NewsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [news, setNews] = useState<NewsArticle[]>(mockNews);
  const [isLoading, setIsLoading] = useState(false);
  
  // Read category from URL, default to 'all'
  const categoryFromUrl = searchParams.get('category') || 'all';
  const [activeCategory, setActiveCategory] = useState<string>(categoryFromUrl);

  // Sync with URL params
  useEffect(() => {
    const category = searchParams.get('category') || 'all';
    setActiveCategory(category);
  }, [searchParams]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (category === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  };

  const filteredNews = activeCategory === 'all' 
    ? news 
    : news.filter(article => article.category === activeCategory);

  const featuredArticle = filteredNews.find(article => article.trending) || filteredNews[0];
  const restArticles = filteredNews.filter(article => article.id !== featuredArticle?.id);

  const refreshNews = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Newspaper className="h-8 w-8 text-primary" />
              Real Estate News
            </h1>
            <p className="text-muted-foreground mt-1">
              Stay updated with the latest property market trends, policies, and insights
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={refreshNews}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>

        {/* Category Tabs */}
        <Tabs value={activeCategory} className="mb-8" onValueChange={handleCategoryChange}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all">All News</TabsTrigger>
            <TabsTrigger value="market" className="gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              Market
            </TabsTrigger>
            <TabsTrigger value="policy" className="gap-1">
              <Building2 className="h-3.5 w-3.5" />
              Policy
            </TabsTrigger>
            <TabsTrigger value="investment" className="gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              Investment
            </TabsTrigger>
            <TabsTrigger value="trends" className="gap-1">
              <TrendingDown className="h-3.5 w-3.5" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="city" className="gap-1">
              <MapPin className="h-3.5 w-3.5" />
              City News
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-[400px] w-full rounded-lg" />
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[300px] rounded-lg" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Featured Article */}
            {featuredArticle && (
              <div className="mb-8">
                <NewsCard article={featuredArticle} featured />
              </div>
            )}

            {/* News Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restArticles.map((article, index) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>

            {/* Empty State */}
            {filteredNews.length === 0 && (
              <div className="text-center py-12">
                <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No news found</h3>
                <p className="text-muted-foreground">
                  Check back later for updates in this category
                </p>
              </div>
            )}
          </>
        )}

        {/* Market Highlights Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Market Highlights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-muted-foreground">Avg. Price Growth</p>
                <p className="text-2xl font-bold text-green-600">+12.5%</p>
                <p className="text-xs text-muted-foreground">YoY across metros</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-muted-foreground">New Launches</p>
                <p className="text-2xl font-bold text-blue-600">2,450+</p>
                <p className="text-xs text-muted-foreground">Projects this month</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <p className="text-sm text-muted-foreground">Home Loan Rate</p>
                <p className="text-2xl font-bold text-purple-600">8.35%</p>
                <p className="text-xs text-muted-foreground">Starting from</p>
              </div>
              <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <p className="text-sm text-muted-foreground">Sales Volume</p>
                <p className="text-2xl font-bold text-orange-600">↑ 18%</p>
                <p className="text-xs text-muted-foreground">vs. last quarter</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default NewsPage;
