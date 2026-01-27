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

// Curated Unsplash photo IDs by category (reliable direct links)
const categoryPhotoIds: Record<string, string[]> = {
  market: [
    'photo-1486406146926-c627a92ad1ab', 'photo-1560518883-ce09059eeffa', 'photo-1545324418-cc1a3fa10c00',
    'photo-1560448204-e02f11c3d0e2', 'photo-1582407947304-fd86f028f716', 'photo-1512917774080-9991f1c4c750',
    'photo-1494526585095-c41746248156', 'photo-1560185893-a55cbc8c57e8', 'photo-1600596542815-ffad4c1539a9',
    'photo-1600607687939-ce8a6c25118c'
  ],
  policy: [
    'photo-1554224155-6726b3ff858f', 'photo-1450101499163-c8848c66ca85', 'photo-1434626881859-194d67b2b86f',
    'photo-1589829545856-d10d557cf95f', 'photo-1507003211169-0a1dd7228f2d', 'photo-1521791136064-7986c2920216',
    'photo-1575505586569-646b2ca898fc', 'photo-1568992687947-868a62a9f521', 'photo-1497366811353-6870744d04b2',
    'photo-1486312338219-ce68d2c6f44d'
  ],
  investment: [
    'photo-1560518883-ce09059eeffa', 'photo-1579532537598-459ecdaf39cc', 'photo-1551836022-d5d88e9218df',
    'photo-1611974789855-9c2a0a7236a3', 'photo-1590283603385-17ffb3a7f29f', 'photo-1567427017947-545c5f8d16ad',
    'photo-1604594849809-dfedbc827105', 'photo-1460925895917-afdab827c52f', 'photo-1553729459-efe14ef6055d',
    'photo-1518186285589-2f7649de83e0'
  ],
  trends: [
    'photo-1558618666-fcd25c85cd64', 'photo-1522708323590-d24dbb6b0267', 'photo-1518005020951-eccb494ad742',
    'photo-1617802690992-15d93263d3a9', 'photo-1558002038-1055907df827', 'photo-1585771724684-38269d6639fd',
    'photo-1600585154340-be6161a56a0c', 'photo-1600566753190-17f0baa2a6c3', 'photo-1600210492493-0946911123ea',
    'photo-1600573472592-401b489a3cdc'
  ],
  city: [
    'photo-1567157577867-05ccb1388e66', 'photo-1582407947304-fd86f028f716', 'photo-1570168007204-dfb528c6958f',
    'photo-1477959858617-67f85cf4f1df', 'photo-1514565131-fce0801e5785', 'photo-1449824913935-59a10b8d2000',
    'photo-1444723121867-7a241cacace9', 'photo-1480714378408-67cf0d13bc1b', 'photo-1519501025264-65ba15a82390',
    'photo-1496568816309-51d7c20e3b21'
  ],
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

// Generate unique image URL based on category and article title
function getUniqueImageUrl(category: string, title: string, index: number): string {
  const photoIds = categoryPhotoIds[category] || categoryPhotoIds.market;
  // Use hash of title + index to get a unique but consistent photo for each article
  const photoIndex = (simpleHash(title) + index) % photoIds.length;
  const photoId = photoIds[photoIndex];
  
  // Use direct Unsplash CDN link which is reliable
  return `https://images.unsplash.com/${photoId}?w=800&h=500&fit=crop&auto=format`;
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
