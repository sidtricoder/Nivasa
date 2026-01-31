// AI-powered property search using Groq API
// Extracts structured filters from natural language queries

import { geocodeAddress, GeocodeResult } from './geocodingService';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

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
  searchQuery?: string; // Original query for display
}

const SYSTEM_PROMPT = `You are a property search assistant for an Indian real estate platform called Nivasa based in Bangalore.

Extract structured search filters from user's natural language query. Return ONLY valid JSON.

Available filters:
- bhk: number (1, 2, 3, 4, 5)
- propertyType: "apartment" | "villa" | "house" | "penthouse"
- priceMin: number (in INR - convert lakhs/crores: 1 lakh = 100000, 1 crore = 10000000)
- priceMax: number (in INR)
- locality: string (common Bangalore areas: Koramangala, Whitefield, HSR Layout, Indiranagar, Sarjapur, Hebbal, UB City, etc.)
- city: string (default: Bangalore)
- furnishing: "unfurnished" | "semi-furnished" | "fully-furnished"
- amenities: array of strings (Swimming Pool, Gym, Parking, Garden, Clubhouse, etc.)
- isPetFriendly: boolean
- hasParking: boolean
- minSqft: number
- maxSqft: number
- facing: string (East, West, North, South)
- nearLandmark: string (use this when user mentions "near X" where X is a mall, hospital, school, metro, landmark, etc.)

Price conversion examples:
- "under 50 lakh" → priceMax: 5000000
- "1 crore budget" → priceMax: 10000000
- "above 80 lakh" → priceMin: 8000000
- "between 1-2 crore" → priceMin: 10000000, priceMax: 20000000

Landmark examples:
- "property near Forum Mall" → nearLandmark: "Forum Mall Bangalore"
- "house near Manipal Hospital" → nearLandmark: "Manipal Hospital Bangalore"
- "flat near Orion Mall" → nearLandmark: "Orion Mall Bangalore"
- "near Cubbon Park" → nearLandmark: "Cubbon Park Bangalore"

Return ONLY a JSON object, no explanations. If a filter is not mentioned, don't include it.
Example: {"bhk": 2, "nearLandmark": "Forum Mall Bangalore"}`;

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

  if (!GROQ_API_KEY) {
    console.error('Groq API key not configured');
    return {
      success: false,
      filters: { searchQuery: query },
      error: 'AI search not configured',
      rawQuery: query
    };
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'moonshotai/Kimi-K2-Instruct',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: query }
        ],
        temperature: 0.1,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    
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
  if (filters.nearLandmark) parts.push(`Near ${filters.nearLandmark.replace(' Bangalore', '')}`);
  if (filters.locality) parts.push(filters.locality);
  if (filters.city && filters.city !== 'Bangalore') parts.push(filters.city);
  if (filters.furnishing) parts.push(filters.furnishing.replace('-', ' '));
  if (filters.isPetFriendly) parts.push('Pet Friendly');
  if (filters.hasParking) parts.push('Parking');
  if (filters.amenities?.length) parts.push(...filters.amenities.slice(0, 2));

  return parts;
}
