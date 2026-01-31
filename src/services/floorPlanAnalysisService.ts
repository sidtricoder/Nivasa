// Floor Plan Analysis Service
// Uses Google Vision API to extract room information from 2D floor plan images
// Falls back to BHK templates if no dimensions detected

import { FloorPlanData, Room, RoomType, generateRoomId } from '@/types/floorPlan';

const GOOGLE_VISION_API_KEY = import.meta.env.VITE_GOOGLE_VISION_API_KEY;

// BHK-based floor plan templates
const bhkTemplates: Record<number, Room[]> = {
  1: [
    { id: generateRoomId(), name: 'Living Room', type: 'living', width: 12, length: 10, position: { x: 0, y: 0 } },
    { id: generateRoomId(), name: 'Bedroom', type: 'bedroom', width: 12, length: 10, position: { x: 0, y: 10 } },
    { id: generateRoomId(), name: 'Kitchen', type: 'kitchen', width: 8, length: 6, position: { x: 12, y: 0 } },
    { id: generateRoomId(), name: 'Bathroom', type: 'bathroom', width: 6, length: 5, position: { x: 12, y: 6 } },
    { id: generateRoomId(), name: 'Balcony', type: 'balcony', width: 8, length: 4, position: { x: 0, y: -4 } },
  ],
  2: [
    { id: generateRoomId(), name: 'Living Room', type: 'living', width: 14, length: 11, position: { x: 0, y: 0 } },
    { id: generateRoomId(), name: 'Kitchen', type: 'kitchen', width: 9, length: 7, position: { x: 14, y: 0 } },
    { id: generateRoomId(), name: 'Master Bedroom', type: 'bedroom', width: 12, length: 11, position: { x: 0, y: 11 } },
    { id: generateRoomId(), name: 'Bedroom 2', type: 'bedroom', width: 11, length: 10, position: { x: 12, y: 11 } },
    { id: generateRoomId(), name: 'Master Bath', type: 'bathroom', width: 7, length: 5, position: { x: 0, y: 22 } },
    { id: generateRoomId(), name: 'Bathroom 2', type: 'bathroom', width: 5, length: 5, position: { x: 7, y: 22 } },
    { id: generateRoomId(), name: 'Balcony', type: 'balcony', width: 10, length: 4, position: { x: 0, y: -4 } },
  ],
  3: [
    { id: generateRoomId(), name: 'Living Room', type: 'living', width: 15, length: 12, position: { x: 0, y: 0 } },
    { id: generateRoomId(), name: 'Kitchen', type: 'kitchen', width: 10, length: 8, position: { x: 15, y: 0 } },
    { id: generateRoomId(), name: 'Master Bedroom', type: 'bedroom', width: 14, length: 12, position: { x: 0, y: 12 } },
    { id: generateRoomId(), name: 'Bedroom 2', type: 'bedroom', width: 12, length: 10, position: { x: 14, y: 12 } },
    { id: generateRoomId(), name: 'Bedroom 3', type: 'bedroom', width: 11, length: 10, position: { x: 14, y: 22 } },
    { id: generateRoomId(), name: 'Master Bath', type: 'bathroom', width: 8, length: 6, position: { x: 0, y: 24 } },
    { id: generateRoomId(), name: 'Bathroom 2', type: 'bathroom', width: 6, length: 6, position: { x: 8, y: 24 } },
    { id: generateRoomId(), name: 'Dining', type: 'dining', width: 10, length: 8, position: { x: 25, y: 0 } },
    { id: generateRoomId(), name: 'Balcony', type: 'balcony', width: 15, length: 5, position: { x: 0, y: -5 } },
    { id: generateRoomId(), name: 'Lobby', type: 'lobby', width: 8, length: 6, position: { x: 25, y: 8 } },
  ],
  4: [
    { id: generateRoomId(), name: 'Living Room', type: 'living', width: 18, length: 14, position: { x: 0, y: 0 } },
    { id: generateRoomId(), name: 'Kitchen', type: 'kitchen', width: 12, length: 10, position: { x: 18, y: 0 } },
    { id: generateRoomId(), name: 'Dining Room', type: 'dining', width: 12, length: 10, position: { x: 18, y: 10 } },
    { id: generateRoomId(), name: 'Master Bedroom', type: 'bedroom', width: 15, length: 13, position: { x: 0, y: 14 } },
    { id: generateRoomId(), name: 'Bedroom 2', type: 'bedroom', width: 13, length: 11, position: { x: 15, y: 14 } },
    { id: generateRoomId(), name: 'Bedroom 3', type: 'bedroom', width: 12, length: 10, position: { x: 0, y: 27 } },
    { id: generateRoomId(), name: 'Bedroom 4', type: 'bedroom', width: 12, length: 10, position: { x: 12, y: 27 } },
    { id: generateRoomId(), name: 'Master Bath', type: 'bathroom', width: 9, length: 7, position: { x: 15, y: 25 } },
    { id: generateRoomId(), name: 'Bathroom 2', type: 'bathroom', width: 7, length: 6, position: { x: 24, y: 25 } },
    { id: generateRoomId(), name: 'Bathroom 3', type: 'bathroom', width: 6, length: 5, position: { x: 28, y: 14 } },
    { id: generateRoomId(), name: 'Balcony', type: 'balcony', width: 18, length: 5, position: { x: 0, y: -5 } },
    { id: generateRoomId(), name: 'Utility', type: 'utility', width: 6, length: 5, position: { x: 30, y: 0 } },
  ],
  5: [
    { id: generateRoomId(), name: 'Living Room', type: 'living', width: 20, length: 15, position: { x: 0, y: 0 } },
    { id: generateRoomId(), name: 'Kitchen', type: 'kitchen', width: 14, length: 10, position: { x: 20, y: 0 } },
    { id: generateRoomId(), name: 'Dining Room', type: 'dining', width: 14, length: 10, position: { x: 20, y: 10 } },
    { id: generateRoomId(), name: 'Master Bedroom', type: 'bedroom', width: 16, length: 14, position: { x: 0, y: 15 } },
    { id: generateRoomId(), name: 'Bedroom 2', type: 'bedroom', width: 14, length: 12, position: { x: 16, y: 15 } },
    { id: generateRoomId(), name: 'Bedroom 3', type: 'bedroom', width: 13, length: 11, position: { x: 0, y: 29 } },
    { id: generateRoomId(), name: 'Bedroom 4', type: 'bedroom', width: 13, length: 11, position: { x: 13, y: 29 } },
    { id: generateRoomId(), name: 'Bedroom 5', type: 'bedroom', width: 12, length: 10, position: { x: 26, y: 29 } },
    { id: generateRoomId(), name: 'Master Bath', type: 'bathroom', width: 10, length: 8, position: { x: 16, y: 27 } },
    { id: generateRoomId(), name: 'Bathroom 2', type: 'bathroom', width: 8, length: 6, position: { x: 30, y: 15 } },
    { id: generateRoomId(), name: 'Bathroom 3', type: 'bathroom', width: 7, length: 6, position: { x: 26, y: 21 } },
    { id: generateRoomId(), name: 'Balcony', type: 'balcony', width: 20, length: 6, position: { x: 0, y: -6 } },
    { id: generateRoomId(), name: 'Utility', type: 'utility', width: 8, length: 6, position: { x: 34, y: 0 } },
    { id: generateRoomId(), name: 'Lobby', type: 'lobby', width: 10, length: 8, position: { x: 30, y: 20 } },
  ],
};

// Room type keywords for detection
const roomTypeKeywords: Record<RoomType, string[]> = {
  bedroom: ['bedroom', 'bed room', 'master bed', 'br', 'bed', 'sleeping'],
  bathroom: ['bathroom', 'bath room', 'toilet', 'wc', 'restroom', 'washroom', 'bath'],
  kitchen: ['kitchen', 'cooking', 'pantry', 'modular kitchen'],
  living: ['living', 'living room', 'drawing', 'hall', 'lounge', 'family room'],
  dining: ['dining', 'dining room', 'eating'],
  balcony: ['balcony', 'terrace', 'patio', 'deck', 'sit out'],
  utility: ['utility', 'store', 'storage', 'laundry', 'service'],
  lobby: ['lobby', 'foyer', 'entrance', 'passage', 'corridor', 'hallway'],
};

// Detect room type from text
function detectRoomType(text: string): RoomType | null {
  const lowerText = text.toLowerCase();
  for (const [type, keywords] of Object.entries(roomTypeKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return type as RoomType;
      }
    }
  }
  return null;
}

// Parse dimensions from text (e.g., "12' x 10'" or "12x10" or "12ft x 10ft")
function parseDimensions(text: string): { width: number; length: number } | null {
  // Match patterns like: 12x10, 12'x10', 12' x 10', 12ft x 10ft, 12 x 10
  const patterns = [
    /(\d+(?:\.\d+)?)\s*['"]?\s*[xX×]\s*(\d+(?:\.\d+)?)\s*['"]?/,
    /(\d+(?:\.\d+)?)\s*(?:ft|feet)?\s*[xX×]\s*(\d+(?:\.\d+)?)\s*(?:ft|feet)?/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        width: parseFloat(match[1]),
        length: parseFloat(match[2]),
      };
    }
  }
  return null;
}

interface VisionTextAnnotation {
  description: string;
  boundingPoly?: {
    vertices: { x: number; y: number }[];
  };
}

interface AnalysisResult {
  rooms: Room[];
  detectedFromImage: boolean;
  confidence: number;
}

// Analyze floor plan image using Google Vision API
export async function analyzeFloorPlanImage(imageBase64: string): Promise<AnalysisResult> {
  if (!GOOGLE_VISION_API_KEY) {
    console.warn('Google Vision API key not configured, using template');
    return { rooms: [], detectedFromImage: false, confidence: 0 };
  }

  try {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
              },
              features: [
                { type: 'TEXT_DETECTION', maxResults: 50 },
                { type: 'LABEL_DETECTION', maxResults: 20 },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Vision API error: ${response.status}`);
    }

    const data = await response.json();
    const textAnnotations: VisionTextAnnotation[] = data.responses?.[0]?.textAnnotations || [];

    if (textAnnotations.length === 0) {
      return { rooms: [], detectedFromImage: false, confidence: 0 };
    }

    // Skip the first annotation (full text), process individual words/phrases
    const annotations = textAnnotations.slice(1);
    const detectedRooms: Room[] = [];
    const processedTexts = new Set<string>();

    // Group nearby annotations to form room labels with dimensions
    for (let i = 0; i < annotations.length; i++) {
      const annotation = annotations[i];
      const text = annotation.description;

      if (processedTexts.has(text.toLowerCase())) continue;

      const roomType = detectRoomType(text);
      if (roomType) {
        processedTexts.add(text.toLowerCase());

        // Look for dimensions in nearby text
        let dimensions: { width: number; length: number } | null = null;
        
        // Check surrounding annotations for dimensions
        for (let j = Math.max(0, i - 3); j < Math.min(annotations.length, i + 5); j++) {
          if (j !== i) {
            const nearbyText = annotations[j].description;
            dimensions = parseDimensions(nearbyText);
            if (dimensions) break;
          }
        }

        // Calculate position from bounding box
        const vertices = annotation.boundingPoly?.vertices || [];
        const avgX = vertices.reduce((sum, v) => sum + (v.x || 0), 0) / (vertices.length || 1);
        const avgY = vertices.reduce((sum, v) => sum + (v.y || 0), 0) / (vertices.length || 1);

        detectedRooms.push({
          id: generateRoomId(),
          name: text,
          type: roomType,
          width: dimensions?.width || 10,
          length: dimensions?.length || 10,
          position: { x: Math.floor(avgX / 30), y: Math.floor(avgY / 30) },
        });
      }
    }

    // Calculate confidence based on detected rooms and dimensions
    const roomsWithDimensions = detectedRooms.filter(r => r.width !== 10 || r.length !== 10);
    const confidence = detectedRooms.length > 0
      ? Math.min(0.9, (detectedRooms.length * 0.15) + (roomsWithDimensions.length * 0.1))
      : 0;

    return {
      rooms: detectedRooms,
      detectedFromImage: detectedRooms.length > 0,
      confidence,
    };
  } catch (error) {
    console.error('Floor plan analysis error:', error);
    return { rooms: [], detectedFromImage: false, confidence: 0 };
  }
}

// Generate floor plan from BHK template
export function generateBHKTemplate(bhk: number, totalSqft: number): FloorPlanData {
  const template = bhkTemplates[Math.min(bhk, 5)] || bhkTemplates[3];
  
  // Scale rooms based on total sqft
  const templateSqft = template.reduce((sum, room) => sum + room.width * room.length, 0);
  const scaleFactor = Math.sqrt(totalSqft / templateSqft);

  const scaledRooms: Room[] = template.map(room => ({
    ...room,
    id: generateRoomId(),
    width: Math.round(room.width * scaleFactor),
    length: Math.round(room.length * scaleFactor),
    position: {
      x: Math.round(room.position.x * scaleFactor),
      y: Math.round(room.position.y * scaleFactor),
    },
  }));

  return {
    rooms: scaledRooms,
    totalSqft,
  };
}

// Main function to analyze floor plan and generate data
export async function processFloorPlan(
  imageBase64: string | null,
  bhk: number,
  totalSqft: number
): Promise<{ floorPlanData: FloorPlanData; usedTemplate: boolean }> {
  // Try AI analysis if image provided
  if (imageBase64) {
    const analysis = await analyzeFloorPlanImage(imageBase64);
    
    // Use AI results if we have good detection
    if (analysis.detectedFromImage && analysis.rooms.length >= 2 && analysis.confidence >= 0.3) {
      return {
        floorPlanData: {
          rooms: analysis.rooms,
          totalSqft,
        },
        usedTemplate: false,
      };
    }
  }

  // Fall back to BHK template
  return {
    floorPlanData: generateBHKTemplate(bhk, totalSqft),
    usedTemplate: true,
  };
}

export default {
  analyzeFloorPlanImage,
  generateBHKTemplate,
  processFloorPlan,
};
