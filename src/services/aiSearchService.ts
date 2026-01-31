// AI-powered property search using Google Gemini API
// Extracts structured filters from natural language queries

import { geocodeAddress, GeocodeResult } from './geocodingService';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

// Calculate distance between two coordinates in kilometers using Haversine formula
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Geocode a landmark and return coordinates
export async function geocodeLandmark(landmark: string): Promise<GeocodeResult | null> {
  try {
    const result = await geocodeAddress(landmark);
    return result;
  } catch (error) {
    console.error('Failed to geocode landmark:', landmark, error);
    return null;
  }
}

// Filter schema that AI will extract
export interface AIExtractedFilters {
  bhk?: number;
  propertyType?: 'apartment' | 'villa' | 'house' | 'penthouse';
  priceMin?: number;
  priceMax?: number;
  locality?: string;
  city?: string;
  furnishing?: 'unfurnished' | 'semi-furnished' | 'fully-furnished';
  amenities?: string[];
  isPetFriendly?: boolean;
  hasParking?: boolean;
  minSqft?: number;
  maxSqft?: number;
  facing?: string;
  nearLandmark?: string; // Landmark/POI for location-based search
  state?: string; // Indian state for state-level searches
  searchQuery?: string; // Original query for display
}

const SYSTEM_PROMPT = `You are a property search assistant for an Indian real estate platform called Nivasa.

Extract structured search filters from user's natural language query. Return ONLY valid JSON.

Available filters:
- bhk: number (1, 2, 3, 4, 5)
- propertyType: "apartment" | "villa" | "house" | "penthouse"
- priceMin: number (in INR - convert lakhs/crores: 1 lakh = 100000, 1 crore = 10000000)
- priceMax: number (in INR)
- locality: string (area/locality within the city - use for neighborhoods like Koramangala, Indiranagar, Bandra, Andheri, etc.)
- city: string (Indian city - ALWAYS include when locality is mentioned)
- state: string (Indian state like Maharashtra, Karnataka, Gujarat, Tamil Nadu, Telangana, etc.)
- furnishing: "unfurnished" | "semi-furnished" | "fully-furnished"
- amenities: array of strings (Swimming Pool, Gym, Parking, Garden, Clubhouse, etc.)
- isPetFriendly: boolean
- hasParking: boolean
- minSqft: number
- maxSqft: number
- facing: string (East, West, North, South)
- nearLandmark: string (ONLY for specific POIs like malls, hospitals, schools, metro stations - NOT for neighborhoods)

IMPORTANT - Known Indian localities and their cities (use locality + city, NOT nearLandmark):
BANGALORE: Koramangala, Indiranagar, Whitefield, HSR Layout, Jayanagar, JP Nagar, Marathahalli, Electronic City, Sarjapur Road, Bellandur, BTM Layout, Hebbal, Yelahanka, Banashankari, Malleshwaram
MUMBAI: Bandra, Andheri, Powai, Juhu, Worli, Lower Parel, Goregaon, Malad, Borivali, Thane, Navi Mumbai, Dadar, Colaba, Marine Drive
DELHI: Dwarka, Rohini, Vasant Kunj, Saket, Greater Kailash, Defence Colony, Hauz Khas, Janakpuri, Pitampura, Lajpat Nagar
PUNE: Hinjewadi, Baner, Kothrud, Wakad, Viman Nagar, Hadapsar, Kharadi, Magarpatta
HYDERABAD: Jubilee Hills, Banjara Hills, Gachibowli, Hitech City, Madhapur, Kondapur, Kukatpally
CHENNAI: Anna Nagar, T Nagar, Adyar, Velachery, OMR, Porur, Nungambakkam

Price conversion examples:
- "under 50 lakh" → priceMax: 5000000
- "1 crore budget" → priceMax: 10000000
- "above 80 lakh" → priceMin: 8000000
- "between 1-2 crore" → priceMin: 10000000, priceMax: 20000000

CRITICAL EXAMPLES:
- "3BHK near Koramangala under 1 crore" → {"bhk": 3, "locality": "Koramangala", "city": "Bangalore", "priceMax": 10000000}
- "flat in Bandra" → {"locality": "Bandra", "city": "Mumbai"}
- "property near Indiranagar" → {"locality": "Indiranagar", "city": "Bangalore"}
- "house near Forum Mall Bangalore" → {"nearLandmark": "Forum Mall", "city": "Bangalore"}
- "2BHK in Hinjewadi Pune" → {"bhk": 2, "locality": "Hinjewadi", "city": "Pune"}

Return ONLY a JSON object, no explanations. If a filter is not mentioned, don't include it.`;

export interface AISearchResult {
  success: boolean;
  filters: AIExtractedFilters;
  error?: string;
  rawQuery: string;
}

export async function extractFiltersFromQuery(query: string): Promise<AISearchResult> {
  if (!query.trim()) {
    return {
      success: false,
      filters: {},
      error: 'Empty query',
      rawQuery: query
    };
  }

  if (!GEMINI_API_KEY) {
    console.error('Gemini API key not configured');
    return {
      success: false,
      filters: { searchQuery: query },
      error: 'AI search not configured',
      rawQuery: query
    };
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: SYSTEM_PROMPT + '\n\nUser query: ' + query }]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 500,
          topP: 0.95,
          topK: 40
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API error:', errorData);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    // Parse the JSON response
    let filters: AIExtractedFilters;
    try {
      // Clean up response - sometimes LLM adds markdown code blocks
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      filters = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      filters = {};
    }

    // Add original query for display
    filters.searchQuery = query;

    return {
      success: true,
      filters,
      rawQuery: query
    };
  } catch (error) {
    console.error('AI search error:', error);
    return {
      success: false,
      filters: { searchQuery: query },
      error: error instanceof Error ? error.message : 'Unknown error',
      rawQuery: query
    };
  }
}

// Helper to format extracted filters for display
export function formatExtractedFilters(filters: AIExtractedFilters): string[] {
  const parts: string[] = [];

  if (filters.bhk) parts.push(`${filters.bhk}BHK`);
  if (filters.propertyType) parts.push(filters.propertyType.charAt(0).toUpperCase() + filters.propertyType.slice(1));
  if (filters.priceMax) {
    const price = filters.priceMax;
    if (price >= 10000000) {
      parts.push(`Under ₹${(price / 10000000).toFixed(1)} Cr`);
    } else if (price >= 100000) {
      parts.push(`Under ₹${(price / 100000).toFixed(0)} L`);
    }
  }
  if (filters.priceMin) {
    const price = filters.priceMin;
    if (price >= 10000000) {
      parts.push(`Above ₹${(price / 10000000).toFixed(1)} Cr`);
    } else if (price >= 100000) {
      parts.push(`Above ₹${(price / 100000).toFixed(0)} L`);
    }
  }
  if (filters.nearLandmark) parts.push(`Near ${filters.nearLandmark}`);
  if (filters.locality) parts.push(filters.locality);
  if (filters.city) parts.push(filters.city);
  if (filters.state) parts.push(filters.state);
  if (filters.furnishing) parts.push(filters.furnishing.replace('-', ' '));
  if (filters.isPetFriendly) parts.push('Pet Friendly');
  if (filters.hasParking) parts.push('Parking');
  if (filters.amenities?.length) parts.push(...filters.amenities.slice(0, 2));

  return parts;
}
