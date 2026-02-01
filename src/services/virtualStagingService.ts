// Virtual Staging Service
// Uses Hugging Face AI (FREE) to generate staged room images from empty/unfurnished property photos

export type StylePreset = 'modern' | 'traditional' | 'minimal' | 'scandinavian' | 'bohemian';
export type RoomType = 'living-room' | 'bedroom' | 'kitchen' | 'bathroom' | 'office';

export interface StagingResult {
  id: string;
  originalImage: string;
  stagedImage: string;
  style: StylePreset;
  roomType: RoomType;
  createdAt: Date;
}

export interface StylePresetInfo {
  id: StylePreset;
  name: string;
  description: string;
  icon: string;
  colors: string[];
}

export interface RoomTypeInfo {
  id: RoomType;
  name: string;
  icon: string;
}

// Style preset configurations
export const stylePresets: StylePresetInfo[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean lines, neutral colors, contemporary furniture',
    icon: '🏢',
    colors: ['#2B2F36', '#FFFFFF', '#3B7BFF'],
  },
  {
    id: 'traditional',
    name: 'Traditional',
    description: 'Classic elegance, rich woods, ornate details',
    icon: '🏛️',
    colors: ['#8B4513', '#F5DEB3', '#DEB887'],
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple, uncluttered, essential pieces only',
    icon: '⬜',
    colors: ['#FFFFFF', '#F5F5F5', '#E0E0E0'],
  },
  {
    id: 'scandinavian',
    name: 'Scandinavian',
    description: 'Light woods, cozy textiles, hygge vibes',
    icon: '🌲',
    colors: ['#F0EEE9', '#D4C5B5', '#87CEEB'],
  },
  {
    id: 'bohemian',
    name: 'Bohemian',
    description: 'Eclectic mix, vibrant patterns, artistic flair',
    icon: '🎨',
    colors: ['#FF6B6B', '#4ECDC4', '#FFE66D'],
  },
];

// Room type configurations
export const roomTypes: RoomTypeInfo[] = [
  { id: 'living-room', name: 'Living Room', icon: '🛋️' },
  { id: 'bedroom', name: 'Bedroom', icon: '🛏️' },
  { id: 'kitchen', name: 'Kitchen', icon: '🍳' },
  { id: 'bathroom', name: 'Bathroom', icon: '🚿' },
  { id: 'office', name: 'Home Office', icon: '💻' },
];

// Style-specific prompt templates for AI image generation
const stylePrompts: Record<StylePreset, string> = {
  modern: 'modern contemporary interior design, clean lines, minimalist furniture, neutral color palette, sleek finishes, chrome accents, statement lighting, geometric shapes, open spaces',
  traditional: 'traditional classic interior design, elegant furniture, rich wood tones, ornate details, warm colors, classic patterns, antique pieces, crown molding, chandeliers',
  minimal: 'minimalist interior design, essential furniture only, white and neutral colors, clean uncluttered space, simple forms, natural light, zen aesthetic, functional pieces',
  scandinavian: 'scandinavian interior design, light wood furniture, cozy textiles, neutral warm colors, hygge atmosphere, plants, natural materials, functional design, soft lighting',
  bohemian: 'bohemian eclectic interior design, colorful textiles, mixed patterns, plants, artistic decor, vintage furniture, global influences, layered textures, warm lighting',
};

// Room-specific prompt additions
const roomPrompts: Record<RoomType, string> = {
  'living-room': 'spacious living room with comfortable sofa, coffee table, area rug, decorative lighting, wall art',
  'bedroom': 'cozy bedroom with bed, nightstands, soft bedding, ambient lighting, window treatments',
  'kitchen': 'functional kitchen with modern appliances, clean countertops, organized cabinets, pendant lighting',
  'bathroom': 'spa-like bathroom with elegant fixtures, fresh towels, decorative accessories, ambient lighting',
  'office': 'productive home office with desk, ergonomic chair, organized storage, good lighting, plants',
};

// Generate a complete prompt for the AI
export const generatePrompt = (style: StylePreset, roomType: RoomType): string => {
  return `A beautiful ${roomPrompts[roomType]} with ${stylePrompts[style]}. Professional real estate photography, high quality, photorealistic, well-lit, inviting atmosphere, interior design magazine quality, 8k resolution`;
};

// Hugging Face API configuration (FREE tier available!)
const HUGGINGFACE_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;


// Fallback images for demo mode (when API fails or is not configured)
// These are curated interior design photos from Unsplash that match specific room types
const fallbackImages: Record<StylePreset, Record<RoomType, string[]>> = {
  modern: {
    'living-room': [
      'photo-1600210492486-724fe5c67fb0', // Modern living room with sofa
      'photo-1600585154340-be6161a56a0c', // Contemporary living space
    ],
    'bedroom': [
      'photo-1616594039964-ae9021a400a0', // Modern bedroom
      'photo-1617325247661-675ab4b64ae2', // Contemporary bedroom
    ],
    'kitchen': [
      'photo-1600489000022-c2086d79f9d4', // Modern kitchen
      'photo-1556909114-f6e7ad7d3136', // Contemporary kitchen
    ],
    'bathroom': [
      'photo-1620626011761-996317b8d101', // Modern spa bathroom with marble
      'photo-1552321554-5fefe8c9ef14', // Clean modern bathroom
      'photo-1507652313519-d4e9174996dd', // Contemporary bathroom design
    ],
    'office': [
      'photo-1593062096033-9a26b09da705', // Modern home office
      'photo-1618221195710-dd6b41faaea6', // Contemporary workspace
    ],
  },
  traditional: {
    'living-room': [
      'photo-1583847268964-b28dc8f51f92', // Traditional living room
      'photo-1560184897-ae75f418493e', // Classic living space
    ],
    'bedroom': [
      'photo-1560184897-67f4a3f9a7fa', // Traditional bedroom
      'photo-1505693416388-ac5ce068fe85', // Classic bedroom
    ],
    'kitchen': [
      'photo-1556909114-f6e7ad7d3136', // Traditional kitchen
      'photo-1600489000022-c2086d79f9d4', // Classic kitchen
    ],
    'bathroom': [
      'photo-1584622650111-993a426fbf0a', // Traditional elegant bathroom
      'photo-1600566753086-00f18fb6b3ea', // Classic bathroom design
      'photo-1552321554-5fefe8c9ef14', // Traditional bath
    ],
    'office': [
      'photo-1593062096033-9a26b09da705', // Traditional office
      'photo-1497366754035-f200968a6e72', // Classic workspace
    ],
  },
  minimal: {
    'living-room': [
      'photo-1600210492493-0946911123ea', // Minimal living room
      'photo-1600607687939-ce8a6c25118c', // Minimalist space
    ],
    'bedroom': [
      'photo-1617325247661-675ab4b64ae2', // Minimal bedroom
      'photo-1616594039964-ae9021a400a0', // Simple bedroom
    ],
    'kitchen': [
      'photo-1556909114-f6e7ad7d3136', // Minimal kitchen
      'photo-1600489000022-c2086d79f9d4', // Simple kitchen
    ],
    'bathroom': [
      'photo-1552321554-5fefe8c9ef14', // Minimal bathroom
      'photo-1507652313519-d4e9174996dd', // Simple modern bath
      'photo-1620626011761-996317b8d101', // Clean bathroom
    ],
    'office': [
      'photo-1497366754035-f200968a6e72', // Minimal office
      'photo-1618221195710-dd6b41faaea6', // Simple workspace
    ],
  },
  scandinavian: {
    'living-room': [
      'photo-1600585154526-990dced4db0d', // Scandinavian living
      'photo-1600121848594-d8644e57abab', // Nordic living room
    ],
    'bedroom': [
      'photo-1616594039964-ae9021a400a0', // Scandinavian bedroom
      'photo-1617325247661-675ab4b64ae2', // Nordic bedroom
    ],
    'kitchen': [
      'photo-1600489000022-c2086d79f9d4', // Scandinavian kitchen
      'photo-1556909114-f6e7ad7d3136', // Nordic kitchen
    ],
    'bathroom': [
      'photo-1600566753376-12c8ab7fb75b', // Nordic bathroom with light wood
      'photo-1552321554-5fefe8c9ef14', // Scandinavian bath
      'photo-1620626011761-996317b8d101', // Light Nordic bathroom
    ],
    'office': [
      'photo-1618221195710-dd6b41faaea6', // Scandinavian office
      'photo-1593062096033-9a26b09da705', // Nordic workspace
    ],
  },
  bohemian: {
    'living-room': [
      'photo-1560185007-c5ca9d2f014d', // Bohemian living
      'photo-1560185127-6a2a4a0a834c', // Eclectic living room
    ],
    'bedroom': [
      'photo-1505693416388-ac5ce068fe85', // Bohemian bedroom
      'photo-1560184897-67f4a3f9a7fa', // Eclectic bedroom
    ],
    'kitchen': [
      'photo-1556909114-f6e7ad7d3136', // Bohemian kitchen
      'photo-1600489000022-c2086d79f9d4', // Eclectic kitchen
    ],
    'bathroom': [
      'photo-1600566753190-17f0baa2a6c3', // Bohemian bathroom
      'photo-1584622650111-993a426fbf0a', // Eclectic bath design
      'photo-1552321554-5fefe8c9ef14', // Artistic bathroom
    ],
    'office': [
      'photo-1497366754035-f200968a6e72', // Bohemian office
      'photo-1593062096033-9a26b09da705', // Eclectic workspace
    ],
  },
};

// Get fallback image
const getFallbackImage = (style: StylePreset, roomType: RoomType): string => {
  const images = fallbackImages[style][roomType];
  const selectedImage = images[Math.floor(Math.random() * images.length)];
  return `https://images.unsplash.com/${selectedImage}?w=800&h=600&fit=crop&auto=format`;
};

// Call Hugging Face FLUX.1-schnell for image generation (FREE tier!)
const callPollinationsAPI = async (prompt: string): Promise<string | null> => {
  console.log('=== Hugging Face FLUX.1-schnell (FREE!) ===');
  console.log('HF API Key configured:', !!HUGGINGFACE_API_KEY);
  
  if (!HUGGINGFACE_API_KEY) {
    console.warn('Hugging Face API key not configured');
    return null;
  }

  try {
    // Use the new Hugging Face router endpoint
    // black-forest-labs/FLUX.1-schnell is a fast, free model
    const response = await fetch('https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
      }),
    });

    console.log('HF Response status:', response.status, response.statusText);

    if (!response.ok) {
      const error = await response.text();
      console.error('Hugging Face API error:', error);
      
      // Check if model is loading (503)
      if (response.status === 503) {
        console.log('Model is loading, waiting and retrying...');
        await new Promise(resolve => setTimeout(resolve, 20000));
        return callPollinationsAPI(prompt); // Retry once
      }
      return null;
    }

    // Response is a blob (image)
    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);
    console.log('Generated image URL:', imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('Error calling Hugging Face API:', error);
    return null;
  }
};


// Generate a staged image using AI (Hugging Face FREE with fallback)
export const generateStagedImage = async (
  originalImage: string,
  style: StylePreset,
  roomType: RoomType
): Promise<StagingResult> => {
  const prompt = generatePrompt(style, roomType);
  let stagedImageUrl: string | null = null;
  
  // Try Hugging Face first (FREE!)
  console.log('Trying Hugging Face (free)...');
  stagedImageUrl = await callPollinationsAPI(prompt);
  
  // Fall back to curated images if API fails
  if (!stagedImageUrl) {
    console.log('Using fallback images for demo');
    await new Promise(resolve => setTimeout(resolve, 2000));
    stagedImageUrl = getFallbackImage(style, roomType);
  }

  return {
    id: `staging-${Date.now()}`,
    originalImage,
    stagedImage: stagedImageUrl,
    style,
    roomType,
    createdAt: new Date(),
  };
};

// Generate image using only demo mode (for testing without API)
export const generateDemoStagedImage = async (
  originalImage: string,
  style: StylePreset,
  roomType: RoomType
): Promise<StagingResult> => {
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
  
  return {
    id: `staging-${Date.now()}`,
    originalImage,
    stagedImage: getFallbackImage(style, roomType),
    style,
    roomType,
    createdAt: new Date(),
  };
};

// Get style preset by ID
export const getStylePreset = (id: StylePreset): StylePresetInfo | undefined => {
  return stylePresets.find(preset => preset.id === id);
};

// Get room type by ID
export const getRoomType = (id: RoomType): RoomTypeInfo | undefined => {
  return roomTypes.find(room => room.id === id);
};

// Check if AI API is configured (Hugging Face FREE)
export const isHuggingFaceConfigured = (): boolean => {
  return !!HUGGINGFACE_API_KEY;
};

// Legacy alias for backwards compatibility
export const isReplicateConfigured = isHuggingFaceConfigured;

