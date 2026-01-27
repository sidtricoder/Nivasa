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

// Unsplash search terms by category for unique images
const categorySearchTerms: Record<string, string[]> = {
  market: ['real estate', 'apartment building', 'city skyline', 'modern architecture', 'housing development'],
  policy: ['government building', 'legal documents', 'courthouse', 'business meeting', 'office building'],
  investment: ['investment growth', 'money finance', 'real estate investment', 'property portfolio', 'financial charts'],
  trends: ['smart home', 'modern interior', 'luxury apartment', 'green building', 'technology home'],
  city: ['mumbai skyline', 'delhi cityscape', 'bangalore city', 'urban development', 'indian architecture'],
};

// Generate a simple hash from string for consistent but unique images
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Generate unique Unsplash image URL based on category and article title
function getUniqueImageUrl(category: string, title: string, index: number): string {
  const searchTerms = categorySearchTerms[category] || categorySearchTerms.market;
  const searchTerm = searchTerms[simpleHash(title) % searchTerms.length];
  const seed = simpleHash(title + index.toString());
  
  // Use Unsplash source API with sig for cache-busting to get unique images
  return `https://source.unsplash.com/800x500/?${encodeURIComponent(searchTerm)}&sig=${seed}`;
}

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
      const cleanTitle = cleanHtml(item.title);
      
      // Get image or generate unique one based on title
      let imageUrl = extractImageUrl(item);
      if (!imageUrl) {
        imageUrl = getUniqueImageUrl(category, cleanTitle, index);
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
