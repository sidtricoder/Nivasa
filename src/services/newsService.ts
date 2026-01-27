// News service to fetch real-time real estate news from various sources
// Uses RSS-to-JSON converters and free news APIs

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

interface RSSItem {
  title: string;
  description?: string;
  content?: string;
  link: string;
  pubDate: string;
  enclosure?: {
    url: string;
  };
  thumbnail?: string;
}

// RSS Feed URLs for Indian Real Estate News
const RSS_FEEDS = {
  economicTimes: 'https://economictimes.indiatimes.com/industry/services/property-/-cstruction/rssfeeds/13358319.cms',
  moneycontrol: 'https://www.moneycontrol.com/rss/realestate.xml',
  businessStandard: 'https://www.business-standard.com/rss/economy-policy-205.rss',
};

// RSS to JSON converter (using rss2json.com - free tier: 10k requests/day)
const RSS_TO_JSON_API = 'https://api.rss2json.com/v1/api.json';

// Fallback placeholder images by category
const placeholderImages: Record<string, string[]> = {
  market: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=250&fit=crop',
  ],
  policy: [
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=400&h=250&fit=crop',
  ],
  investment: [
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=250&fit=crop',
  ],
  trends: [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400&h=250&fit=crop',
  ],
  city: [
    'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=250&fit=crop',
  ],
};

// Keywords to categorize news
const categoryKeywords: Record<string, string[]> = {
  market: ['price', 'surge', 'fall', 'growth', 'sales', 'demand', 'supply', 'market', 'rate', 'index', 'quarterly', 'annual'],
  policy: ['rera', 'rbi', 'government', 'policy', 'regulation', 'tax', 'gst', 'subsidy', 'pmay', 'loan', 'interest', 'scheme', 'act', 'law'],
  investment: ['invest', 'reit', 'return', 'roi', 'profit', 'fund', 'fdi', 'nri', 'portfolio', 'yield', 'capital'],
  trends: ['smart', 'technology', 'ai', 'iot', 'green', 'sustainable', 'co-living', 'coworking', 'luxury', 'premium', 'digital', 'virtual'],
  city: ['mumbai', 'delhi', 'bangalore', 'bengaluru', 'hyderabad', 'pune', 'chennai', 'kolkata', 'ahmedabad', 'ncr', 'gurugram', 'noida'],
};

// City detection for city news
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Bengaluru', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad', 'Gurugram', 'Noida', 'NCR'];

function categorizeArticle(title: string, description: string): { category: NewsArticle['category']; city?: string } {
  const text = `${title} ${description}`.toLowerCase();
  
  // Check for city first
  for (const city of cities) {
    if (text.includes(city.toLowerCase())) {
      return { category: 'city', city: city === 'Bengaluru' ? 'Bangalore' : city };
    }
  }
  
  // Check other categories by keyword frequency
  let maxScore = 0;
  let detectedCategory: NewsArticle['category'] = 'market';
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (category === 'city') continue;
    const score = keywords.filter(kw => text.includes(kw)).length;
    if (score > maxScore) {
      maxScore = score;
      detectedCategory = category as NewsArticle['category'];
    }
  }
  
  return { category: detectedCategory };
}

function extractImageUrl(item: RSSItem): string | null {
  // Try to get image from enclosure
  if (item.enclosure?.url) {
    return item.enclosure.url;
  }
  
  // Try to get image from thumbnail
  if (item.thumbnail) {
    return item.thumbnail;
  }
  
  // Try to extract image from content/description using regex
  const content = item.content || item.description || '';
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/);
  if (imgMatch) {
    return imgMatch[1];
  }
  
  return null;
}

function estimateReadTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.max(2, Math.ceil(wordCount / wordsPerMinute));
}

function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

async function fetchFromRSS(feedUrl: string, sourceName: string): Promise<NewsArticle[]> {
  try {
    const response = await fetch(`${RSS_TO_JSON_API}?rss_url=${encodeURIComponent(feedUrl)}`);
    
    if (!response.ok) {
      console.warn(`Failed to fetch RSS from ${sourceName}:`, response.status);
      return [];
    }
    
    const data = await response.json();
    
    if (data.status !== 'ok' || !data.items) {
      console.warn(`Invalid RSS response from ${sourceName}`);
      return [];
    }
    
    return data.items.slice(0, 10).map((item: RSSItem, index: number) => {
      const { category, city } = categorizeArticle(item.title, item.description || '');
      const cleanDescription = cleanHtml(item.description || '');
      
      // Get image or use placeholder
      let imageUrl = extractImageUrl(item);
      if (!imageUrl) {
        const categoryImages = placeholderImages[category];
        imageUrl = categoryImages[index % categoryImages.length];
      }
      
      return {
        id: `${sourceName.toLowerCase().replace(/\s+/g, '-')}-${index}-${Date.now()}`,
        title: cleanHtml(item.title),
        summary: cleanDescription.length > 200 ? cleanDescription.substring(0, 200) + '...' : cleanDescription,
        category,
        source: sourceName,
        sourceUrl: item.link,
        publishedAt: item.pubDate,
        imageUrl,
        readTime: estimateReadTime(cleanDescription),
        trending: index === 0, // First article from each source is trending
        city,
      };
    });
  } catch (error) {
    console.error(`Error fetching RSS from ${sourceName}:`, error);
    return [];
  }
}

// Fetch from Google News search (via RSS)
async function fetchGoogleNews(query: string = 'india real estate property'): Promise<NewsArticle[]> {
  const googleNewsRSS = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;
  return fetchFromRSS(googleNewsRSS, 'Google News');
}

// Main function to fetch all news
export async function fetchRealEstateNews(): Promise<NewsArticle[]> {
  try {
    const results = await Promise.allSettled([
      fetchGoogleNews('india real estate property housing'),
      fetchGoogleNews('india property market prices'),
      fetchGoogleNews('RERA housing policy india'),
    ]);
    
    const allNews: NewsArticle[] = [];
    
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allNews.push(...result.value);
      }
    }
    
    // Remove duplicates by title
    const uniqueNews = allNews.filter((article, index, self) =>
      index === self.findIndex(a => a.title.toLowerCase() === article.title.toLowerCase())
    );
    
    // Sort by publish date (newest first)
    uniqueNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    return uniqueNews.slice(0, 20); // Return max 20 articles
  } catch (error) {
    console.error('Error fetching real estate news:', error);
    return [];
  }
}

// Export the NewsArticle type
export type { NewsArticle };
