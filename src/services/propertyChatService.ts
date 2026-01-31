// AI-powered property chatbot service using Google Gemini API
// Answers buyer questions about a specific property

import { Property } from '@/data/listings';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Generate a system prompt with full property context
 */
function generatePropertyContext(property: Property): string {
  const nearbyPlacesText = property.nearbyPlaces
    .map(p => `- ${p.name} (${p.type}): ${p.distance}`)
    .join('\n');

  const amenitiesText = property.amenities.join(', ');
  const featuresText = property.features.join(', ');
  const highlightsText = property.highlights.join('\n- ');
  const considerationsText = property.thingsToConsider.join('\n- ');

  return `You are a helpful property assistant for Nivasa, an Indian real estate platform. 
Answer questions about this specific property based on the data provided below. Be friendly, concise, and accurate.

## PROPERTY INFORMATION

**Title:** ${property.title}
**Price:** ₹${(property.price / 100000).toFixed(2)} Lakhs (₹${property.pricePerSqft}/sqft)

**Location:**
- Address: ${property.location.address}
- Locality: ${property.location.locality}
- City: ${property.location.city}
- State: ${property.location.state}
- Pincode: ${property.location.pincode}

**Specifications:**
- BHK: ${property.specs.bhk} BHK
- Bathrooms: ${property.specs.bathrooms}
- Area: ${property.specs.sqft} sqft
- Floor: ${property.specs.floor} of ${property.specs.totalFloors}
- Facing: ${property.specs.facing}
- Age: ${property.specs.propertyAge} years old
- Furnishing: ${property.specs.furnishing}
- Property Type: ${property.specs.propertyType}

**Features:**
- Pet Friendly: ${property.isPetFriendly ? 'Yes' : 'No'}
- Parking Available: ${property.hasParking ? 'Yes' : 'No'}

**Amenities:** ${amenitiesText}

**Features:** ${featuresText}

**Scores:**
- Walk Score: ${property.walkScore}/100
- Safety Score: ${property.safetyScore}/100
- Connectivity Score: ${property.connectivityScore}/100
- Lifestyle Score: ${property.lifestyleScore}/100

**Nearby Places:**
${nearbyPlacesText}

**Highlights:**
- ${highlightsText}

**Things to Consider:**
- ${considerationsText}

**Seller:** ${property.seller.name} (${property.seller.isVerified ? 'Verified' : 'Not Verified'})
- Response Rate: ${property.seller.responseRate}%

**Description:** ${property.description}

---

Rules:
1. Only answer based on the property data above
2. Be helpful and conversational
3. Keep responses concise (2-3 sentences max unless more detail is asked)
4. If asked about something not in the data, politely say you don't have that information
5. Use Indian Rupees (₹) and Indian measurement units (sqft)
6. For location questions, reference the nearby places data`;
}

/**
 * Convert chat history to Gemini format
 */
function convertToGeminiFormat(history: ChatMessage[], systemPrompt: string, userMessage: string) {
  const contents: any[] = [];
  
  // Add system context as first user message
  contents.push({
    role: 'user',
    parts: [{ text: systemPrompt + '\n\nNow answer user questions based on this property data.' }]
  });
  contents.push({
    role: 'model',
    parts: [{ text: 'I understand. I\'ll help answer questions about this property based on the information provided. How can I help you?' }]
  });

  // Add conversation history
  for (const msg of history) {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    });
  }

  // Add current user message
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  return contents;
}

/**
 * Send a message to the property chatbot and get a response
 */
export async function sendPropertyChatMessage(
  property: Property,
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  if (!GEMINI_API_KEY) {
    return "I'm sorry, the AI assistant is not configured. Please contact the seller directly for questions about this property.";
  }

  const systemPrompt = generatePropertyContext(property);

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: convertToGeminiFormat(conversationHistory, systemPrompt, userMessage),
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300,
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
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    return content.trim() || "I couldn't understand that. Could you please rephrase your question?";
  } catch (error) {
    console.error('Property chat error:', error);
    return "I'm having trouble connecting right now. Please try again in a moment, or contact the seller directly.";
  }
}

/**
 * Quick suggestion chips for common questions
 */
export const quickSuggestions = [
  { label: 'How many BHK?', query: 'How many bedrooms does this property have?' },
  { label: 'Is it pet friendly?', query: 'Is this property pet friendly?' },
  { label: 'Near metro?', query: 'Is there a metro station nearby?' },
  { label: 'Amenities?', query: 'What amenities does this property have?' },
  { label: 'Walk score?', query: 'What is the walk score of this property?' },
  { label: 'Parking?', query: 'Is parking available?' },
  { label: 'Which floor?', query: 'Which floor is this property on?' },
  { label: 'Furnishing?', query: 'Is the property furnished?' },
];
