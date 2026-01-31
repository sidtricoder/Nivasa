// Floor Plan Analysis Service
// Uses Google Gemini Vision API to extract room information from 2D floor plan images
// Falls back to BHK templates if analysis fails

import { FloorPlanData, Room, RoomType, generateRoomId } from '@/types/floorPlan';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// BHK-based floor plan templates (fallback)
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

// Room type mapping from Gemini response
const roomTypeMap: Record<string, RoomType> = {
  'bedroom': 'bedroom',
  'master bedroom': 'bedroom',
  'bed room': 'bedroom',
  'guest room': 'bedroom',
  'bathroom': 'bathroom',
  'bath': 'bathroom',
  'toilet': 'bathroom',
  'washroom': 'bathroom',
  'restroom': 'bathroom',
  'kitchen': 'kitchen',
  'modular kitchen': 'kitchen',
  'living room': 'living',
  'living': 'living',
  'hall': 'living',
  'drawing room': 'living',
  'lounge': 'living',
  'dining room': 'dining',
  'dining': 'dining',
  'balcony': 'balcony',
  'terrace': 'balcony',
  'patio': 'balcony',
  'utility': 'utility',
  'store': 'utility',
  'storage': 'utility',
  'laundry': 'utility',
  'lobby': 'lobby',
  'foyer': 'lobby',
  'entrance': 'lobby',
  'corridor': 'lobby',
  'passage': 'lobby',
};

function detectRoomType(name: string): RoomType {
  const lowerName = name.toLowerCase();
  for (const [key, type] of Object.entries(roomTypeMap)) {
    if (lowerName.includes(key)) {
      return type;
    }
  }
  return 'lobby'; // default
}

interface GeminiRoom {
  name: string;
  width: number;
  length: number;
  x: number;
  y: number;
}

// Analyze floor plan using Gemini Vision API
export async function analyzeFloorPlanImage(imageBase64: string): Promise<{ rooms: Room[]; success: boolean }> {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not configured');
    return { rooms: [], success: false };
  }

  try {
    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analyze this floor plan image and extract all rooms with their dimensions.

For each room you detect, provide:
1. Room name (e.g., "Master Bedroom", "Kitchen", "Living Room")
2. Width in feet (estimate if not labeled)
3. Length in feet (estimate if not labeled)
4. Relative X position (0-100 scale, where 0 is left)
5. Relative Y position (0-100 scale, where 0 is top)

IMPORTANT: Return ONLY a JSON array in this exact format, nothing else:
[
  {"name": "Living Room", "width": 15, "length": 12, "x": 0, "y": 0},
  {"name": "Master Bedroom", "width": 14, "length": 12, "x": 0, "y": 40},
  {"name": "Kitchen", "width": 10, "length": 8, "x": 50, "y": 0}
]

If you cannot detect rooms clearly, return an empty array: []`
                },
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', error);
      return { rooms: [], success: false };
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    console.log('Gemini response:', textContent);
    
    // Extract JSON from response
    const jsonMatch = textContent.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn('No JSON found in Gemini response');
      return { rooms: [], success: false };
    }

    const geminiRooms: GeminiRoom[] = JSON.parse(jsonMatch[0]);
    
    if (!Array.isArray(geminiRooms) || geminiRooms.length === 0) {
      return { rooms: [], success: false };
    }

    // Convert to our Room format
    const rooms: Room[] = geminiRooms.map((room, index) => ({
      id: generateRoomId(),
      name: room.name || `Room ${index + 1}`,
      type: detectRoomType(room.name || ''),
      width: Math.max(4, Math.round(room.width || 10)),
      length: Math.max(4, Math.round(room.length || 10)),
      position: {
        x: Math.round((room.x || 0) / 3), // Scale down positions
        y: Math.round((room.y || 0) / 3),
      },
    }));

    console.log('Detected rooms:', rooms);
    return { rooms, success: true };
  } catch (error) {
    console.error('Floor plan analysis error:', error);
    return { rooms: [], success: false };
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
  // Try Gemini Vision analysis if image provided
  if (imageBase64) {
    console.log('Analyzing floor plan with Gemini Vision...');
    const analysis = await analyzeFloorPlanImage(imageBase64);
    
    // Use Gemini results if we detected rooms
    if (analysis.success && analysis.rooms.length >= 2) {
      console.log('Successfully detected rooms from image!');
      return {
        floorPlanData: {
          rooms: analysis.rooms,
          totalSqft,
        },
        usedTemplate: false,
      };
    }
    console.log('Could not detect rooms, using template...');
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
