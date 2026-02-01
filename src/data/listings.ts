import { FloorPlanData } from '@/types/floorPlan';

// Firebase Firestore schema for property listings
export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  pricePerSqft: number;
  images: string[];
  location: {
    address: string;
    locality: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: { lat: number; lng: number };
  };
  specs: {
    bhk: number;
    bathrooms: number;
    sqft: number;
    floor: number;
    totalFloors: number;
    facing: string;
    propertyAge: number;
    furnishing: 'unfurnished' | 'semi-furnished' | 'fully-furnished';
    propertyType: 'apartment' | 'villa' | 'house' | 'penthouse';
  };
  amenities: string[];
  features: string[];
  seller: {
    id: string;
    name: string;
    phone: string;
    email: string;
    isVerified: boolean;
    memberSince: string;
    responseRate: number;
  };
  verification: {
    ownerVerified: boolean;
    documentsReady: boolean;
    reraApproved: boolean;
  };
  walkScore: number;
  safetyScore: number;
  connectivityScore: number;
  lifestyleScore: number;
  highlights: string[];
  thingsToConsider: string[];
  nearbyPlaces: {
    type: 'school' | 'hospital' | 'metro' | 'park' | 'mall' | 'restaurant';
    name: string;
    distance: string;
  }[];
  isPetFriendly: boolean;
  hasParking: boolean;
  isNewListing: boolean;
  listedAt: string;
  updatedAt: string;
  // Virtual tour & media
  panoee3DTourUrl?: string;
  videoUrl?: string;
  panoramaImages?: string[]; // 360° panorama images
  floorPlan?: FloorPlanData; // 3D floor plan data
}

export interface Seller {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  listings: string[];
  createdAt: string;
}

// Mock property images using verified Unsplash CDN links
// 30 unique property photos that rotate based on property ID
const propertyImagePool = [
  // Modern apartments & interiors
  'photo-1600596542815-ffad4c1539a9',
  'photo-1600585154340-be6161a56a0c',
  'photo-1600607687939-ce8a6c25118c',
  'photo-1600566753086-00f18fb6b3ea',
  'photo-1600573472550-8090b5e0745e',
  'photo-1560448204-e02f11c3d0e2',
  'photo-1512917774080-9991f1c4c750',
  'photo-1600585154526-990dced4db0d',
  'photo-1602343168117-bb8ffe3e2e9f',
  'photo-1600047509807-ba8f99d2cdde',
  // Luxury homes & villas
  'photo-1613490493576-7fde63acd811',
  'photo-1613977257363-707ba9348227',
  'photo-1604014237800-1c9102c219da',
  'photo-1600210492486-724fe5c67fb0',
  'photo-1600573472592-401b489a3cdc',
  'photo-1600566753190-17f0baa2a6c3',
  'photo-1600210491892-03d54c0aaf87',
  'photo-1600607687644-c7171b42498f',
  'photo-1600585153490-76fb20a32601',
  'photo-1600563438938-a9a27216b4f5',
  // Interiors & rooms
  'photo-1522708323590-d24dbb6b0267',
  'photo-1502672260266-1c1ef2d93688',
  'photo-1560185007-c5ca9d2c014d',
  'photo-1560185008-b033106af5c3',
  'photo-1560184897-ae75f418493e',
  'photo-1560185127-6a2a4a0a834c',
  'photo-1600121848594-d8644e57abab',
  'photo-1600585152220-90363fe7e115',
  'photo-1600585152915-d208bec867a1',
  'photo-1600607688969-a5bfcd646154',
];

const generatePropertyImages = (id: number) => {
  // Use id to pick starting index for variety
  const startIndex = (id * 3) % propertyImagePool.length;
  const images = [];
  
  for (let i = 0; i < 5; i++) {
    const photoId = propertyImagePool[(startIndex + i) % propertyImagePool.length];
    images.push(`https://images.unsplash.com/${photoId}?w=800&h=600&fit=crop&auto=format`);
  }
  
  return images;
};

export const mockListings: Property[] = [
  {
    id: "prop-001",
    title: "Luxurious 3BHK with Panoramic City View",
    description: "Experience luxury living in this stunning 3BHK apartment featuring floor-to-ceiling windows, premium Italian marble flooring, and a private balcony with breathtaking city views. Located in a gated community with world-class amenities.",
    price: 15500000,
    pricePerSqft: 12400,
    images: generatePropertyImages(1),
    location: {
      address: "Tower A, Prestige Heights, 14th Floor",
      locality: "Koramangala",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560034",
      coordinates: { lat: 12.9352, lng: 77.6245 },
    },
    specs: {
      bhk: 3,
      bathrooms: 3,
      sqft: 1250,
      floor: 14,
      totalFloors: 25,
      facing: "East",
      propertyAge: 2,
      furnishing: "semi-furnished",
      propertyType: "apartment",
    },
    amenities: ["Swimming Pool", "Gym", "Clubhouse", "Children's Play Area", "24/7 Security", "Power Backup", "Covered Parking", "Garden"],
    features: ["Modular Kitchen", "Wooden Flooring", "Split AC", "Geyser", "Intercom"],
    seller: {
      id: "seller-001",
      name: "Rajesh Kumar",
      phone: "+91 98765 43210",
      email: "rajesh.k@email.com",
      isVerified: true,
      memberSince: "2021-03-15",
      responseRate: 95,
    },
    verification: {
      ownerVerified: true,
      documentsReady: true,
      reraApproved: true,
    },
    walkScore: 85,
    safetyScore: 90,
    connectivityScore: 88,
    lifestyleScore: 92,
    highlights: [
      "Floor-to-ceiling windows with panoramic city views",
      "Premium Italian marble flooring throughout",
      "Private balcony perfect for morning coffee",
      "24/7 concierge service",
      "Smart home automation system"
    ],
    thingsToConsider: [
      "Construction ongoing in adjacent plot",
      "Limited visitor parking during peak hours"
    ],
    nearbyPlaces: [
      { type: "metro", name: "Koramangala Metro", distance: "0.5 km" },
      { type: "school", name: "Delhi Public School", distance: "1.2 km" },
      { type: "hospital", name: "Apollo Hospital", distance: "2.1 km" },
      { type: "mall", name: "Forum Mall", distance: "0.8 km" },
    ],
    isPetFriendly: true,
    hasParking: true,
    isNewListing: true,
    listedAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-20T15:45:00Z",
    panoee3DTourUrl: "https://tour.panoee.net/6978ea2270f11a38ef1098be",
    floorPlan: {
      rooms: [
        { id: 'room-1', name: 'Living Room', type: 'living', width: 15, length: 12, position: { x: 0, y: 0 } },
        { id: 'room-2', name: 'Kitchen', type: 'kitchen', width: 10, length: 8, position: { x: 15, y: 0 } },
        { id: 'room-3', name: 'Master Bedroom', type: 'bedroom', width: 14, length: 12, position: { x: 0, y: 12 } },
        { id: 'room-4', name: 'Bedroom 2', type: 'bedroom', width: 12, length: 10, position: { x: 14, y: 12 } },
        { id: 'room-5', name: 'Bedroom 3', type: 'bedroom', width: 11, length: 10, position: { x: 14, y: 22 } },
        { id: 'room-6', name: 'Master Bath', type: 'bathroom', width: 8, length: 6, position: { x: 0, y: 24 } },
        { id: 'room-7', name: 'Bathroom 2', type: 'bathroom', width: 6, length: 6, position: { x: 8, y: 24 } },
        { id: 'room-8', name: 'Dining', type: 'dining', width: 10, length: 8, position: { x: 25, y: 0 } },
        { id: 'room-9', name: 'Balcony', type: 'balcony', width: 15, length: 5, position: { x: 0, y: -5 } },
        { id: 'room-10', name: 'Lobby', type: 'lobby', width: 8, length: 6, position: { x: 25, y: 8 } },
      ],
      totalSqft: 1250,
      floorPlanImage: '/TX83-GROUND-FLOOR_page-0001-768x1120.jpg',
    },
  },
  {
    id: "prop-002",
    title: "Modern 2BHK Near Tech Park",
    description: "Perfect for IT professionals! This modern 2BHK is just 5 minutes from major tech parks. Features smart home automation, energy-efficient appliances, and a dedicated work-from-home space.",
    price: 8500000,
    pricePerSqft: 9444,
    images: [
      `https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop`,
      `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop`,
      `https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop`,
    ],
    location: {
      address: "Block C, Maple Gardens",
      locality: "Andheri East",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400069",
      coordinates: { lat: 19.1136, lng: 72.8697 },
    },
    specs: {
      bhk: 2,
      bathrooms: 2,
      sqft: 900,
      floor: 8,
      totalFloors: 15,
      facing: "North",
      propertyAge: 1,
      furnishing: "fully-furnished",
      propertyType: "apartment",
    },
    amenities: ["Gym", "Rooftop Garden", "Co-working Space", "EV Charging", "Smart Locks"],
    features: ["Smart Home", "Modular Kitchen", "Video Doorbell", "Central AC"],
    seller: {
      id: "seller-002",
      name: "Priya Sharma",
      phone: "+91 87654 32109",
      email: "sid.dev.2006@gmail.com",
      isVerified: true,
      memberSince: "2022-06-20",
      responseRate: 88,
    },
    verification: {
      ownerVerified: true,
      documentsReady: true,
      reraApproved: true,
    },
    walkScore: 72,
    safetyScore: 85,
    connectivityScore: 95,
    lifestyleScore: 70,
    highlights: [
      "Walking distance to tech park",
      "Modern amenities and facilities",
      "Pet-friendly community"
    ],
    thingsToConsider: [
      "Noise from nearby highway during peak hours"
    ],
    nearbyPlaces: [
      { type: "restaurant", name: "Cafe Coffee Day", distance: "0.2 km" },
      { type: "park", name: "ITPL Park", distance: "0.6 km" },
      { type: "hospital", name: "Columbia Asia", distance: "1.5 km" },
    ],
    isPetFriendly: false,
    hasParking: true,
    isNewListing: false,
    listedAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-18T12:30:00Z",
    floorPlan: {
      rooms: [
        { id: 'room-1', name: 'Living Room', type: 'living', width: 14, length: 11, position: { x: 0, y: 0 } },
        { id: 'room-2', name: 'Kitchen', type: 'kitchen', width: 9, length: 7, position: { x: 14, y: 0 } },
        { id: 'room-3', name: 'Master Bedroom', type: 'bedroom', width: 12, length: 11, position: { x: 0, y: 11 } },
        { id: 'room-4', name: 'Bedroom 2', type: 'bedroom', width: 11, length: 10, position: { x: 12, y: 11 } },
        { id: 'room-5', name: 'Master Bath', type: 'bathroom', width: 7, length: 5, position: { x: 0, y: 22 } },
        { id: 'room-6', name: 'Bathroom 2', type: 'bathroom', width: 5, length: 5, position: { x: 7, y: 22 } },
        { id: 'room-7', name: 'Balcony', type: 'balcony', width: 10, length: 4, position: { x: 0, y: -4 } },
      ],
      totalSqft: 900,
    },
  },
  {
    id: "prop-003",
    title: "Spacious 4BHK Independent Villa",
    description: "Your dream home awaits! This stunning independent villa offers 4 spacious bedrooms, a private garden, home theater room, and a rooftop terrace. Perfect for large families seeking privacy and luxury.",
    price: 35000000,
    pricePerSqft: 11667,
    images: [
      `https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop`,
      `https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop`,
      `https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop`,
    ],
    location: {
      address: "Villa 42, Palm Meadows",
      locality: "Sarjapur Road",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560102",
      coordinates: { lat: 12.8587, lng: 77.7680 },
    },
    specs: {
      bhk: 4,
      bathrooms: 5,
      sqft: 3000,
      floor: 0,
      totalFloors: 2,
      facing: "South",
      propertyAge: 5,
      furnishing: "semi-furnished",
      propertyType: "villa",
    },
    amenities: ["Private Pool", "Home Theater", "Garden", "Servant Quarter", "Double Car Garage", "BBQ Area"],
    features: ["Imported Fittings", "Solar Panels", "Rainwater Harvesting", "Central AC", "Italian Marble"],
    seller: {
      id: "seller-003",
      name: "Vikram Mehta",
      phone: "+91 76543 21098",
      email: "sid.dev.2006@gmail.com",
      isVerified: true,
      memberSince: "2020-11-10",
      responseRate: 92,
    },
    verification: {
      ownerVerified: true,
      documentsReady: true,
      reraApproved: false,
    },
    walkScore: 45,
    safetyScore: 95,
    connectivityScore: 60,
    lifestyleScore: 85,
    highlights: [
      "Private swimming pool and garden",
      "Spacious villa with modern amenities",
      "Solar panels for eco-friendly living"
    ],
    thingsToConsider: [
      "Far from public transport",
      "Limited nearby shopping options"
    ],
    nearbyPlaces: [
      { type: "school", name: "Greenwood High", distance: "1.0 km" },
      { type: "mall", name: "Total Mall", distance: "2.5 km" },
      { type: "hospital", name: "Narayana Health", distance: "3.0 km" },
    ],
    isPetFriendly: true,
    hasParking: true,
    isNewListing: true,
    listedAt: "2024-01-18T14:00:00Z",
    updatedAt: "2024-01-20T09:15:00Z",
    floorPlan: {
      rooms: [
        { id: 'room-1', name: 'Living Room', type: 'living', width: 20, length: 15, position: { x: 0, y: 0 } },
        { id: 'room-2', name: 'Kitchen', type: 'kitchen', width: 12, length: 10, position: { x: 20, y: 0 } },
        { id: 'room-3', name: 'Dining Room', type: 'dining', width: 14, length: 12, position: { x: 20, y: 10 } },
        { id: 'room-4', name: 'Master Bedroom', type: 'bedroom', width: 16, length: 14, position: { x: 0, y: 15 } },
        { id: 'room-5', name: 'Bedroom 2', type: 'bedroom', width: 14, length: 12, position: { x: 16, y: 15 } },
        { id: 'room-6', name: 'Bedroom 3', type: 'bedroom', width: 12, length: 11, position: { x: 0, y: 29 } },
        { id: 'room-7', name: 'Bedroom 4', type: 'bedroom', width: 12, length: 11, position: { x: 12, y: 29 } },
        { id: 'room-8', name: 'Master Bath', type: 'bathroom', width: 10, length: 8, position: { x: 16, y: 27 } },
        { id: 'room-9', name: 'Bathroom 2', type: 'bathroom', width: 8, length: 6, position: { x: 30, y: 15 } },
        { id: 'room-10', name: 'Balcony', type: 'balcony', width: 20, length: 6, position: { x: 0, y: -6 } },
        { id: 'room-11', name: 'Utility', type: 'utility', width: 8, length: 6, position: { x: 32, y: 0 } },
      ],
      totalSqft: 3000,
    },
  },
  {
    id: "prop-004",
    title: "Cozy 1BHK Studio Apartment",
    description: "Perfect starter home or investment property! This compact yet well-designed 1BHK features an open kitchen, large windows for natural light, and is located in a vibrant neighborhood.",
    price: 4200000,
    pricePerSqft: 8400,
    images: [
      `https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop`,
      `https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800&h=600&fit=crop`,
    ],
    location: {
      address: "Unit 305, Urban Nest",
      locality: "Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400050",
      coordinates: { lat: 19.0596, lng: 72.8295 },
    },
    specs: {
      bhk: 1,
      bathrooms: 1,
      sqft: 500,
      floor: 3,
      totalFloors: 10,
      facing: "West",
      propertyAge: 3,
      furnishing: "fully-furnished",
      propertyType: "apartment",
    },
    amenities: ["Gym", "Laundry Room", "Rooftop Lounge", "Bike Parking"],
    features: ["Murphy Bed", "Built-in Storage", "Induction Cooktop"],
    seller: {
      id: "seller-004",
      name: "Anita Reddy",
      phone: "+91 65432 10987",
      email: "sid.dev.2006@gmail.com",
      isVerified: false,
      memberSince: "2023-02-28",
      responseRate: 75,
    },
    verification: {
      ownerVerified: true,
      documentsReady: false,
      reraApproved: true,
    },
    walkScore: 90,
    safetyScore: 88,
    connectivityScore: 92,
    lifestyleScore: 95,
    highlights: [
      "Premium apartment in prime location",
      "Walking distance to metro and shopping",
      "High-end finishes throughout"
    ],
    thingsToConsider: [
      "Higher maintenance costs",
      "Limited parking for guests"
    ],
    nearbyPlaces: [
      { type: "metro", name: "HSR Layout Metro", distance: "0.3 km" },
      { type: "restaurant", name: "Truffles", distance: "0.4 km" },
      { type: "park", name: "Agara Lake Park", distance: "1.0 km" },
    ],
    isPetFriendly: true,
    hasParking: false,
    isNewListing: false,
    listedAt: "2024-01-05T11:20:00Z",
    updatedAt: "2024-01-15T16:00:00Z",
  },
  {
    id: "prop-005",
    title: "Premium 3BHK with Lake View",
    description: "Wake up to stunning lake views every day! This premium 3BHK apartment features a private balcony overlooking the lake, high-end finishes, and access to exclusive club amenities.",
    price: 22000000,
    pricePerSqft: 14667,
    images: [
      `https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&h=600&fit=crop`,
      `https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&h=600&fit=crop`,
      `https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop`,
    ],
    location: {
      address: "Wing A, Lake View Towers, 18th Floor",
      locality: "Dwarka",
      city: "Delhi",
      state: "Delhi",
      pincode: "110075",
      coordinates: { lat: 28.5921, lng: 77.0460 },
    },
    specs: {
      bhk: 3,
      bathrooms: 3,
      sqft: 1500,
      floor: 18,
      totalFloors: 30,
      facing: "North-East",
      propertyAge: 1,
      furnishing: "unfurnished",
      propertyType: "apartment",
    },
    amenities: ["Infinity Pool", "Sky Lounge", "Gym", "Spa", "Tennis Court", "Concierge"],
    features: ["Floor-to-ceiling Windows", "Smart Home Ready", "Premium Fittings", "VRV AC"],
    seller: {
      id: "seller-005",
      name: "Mohammed Ali",
      phone: "+91 54321 09876",
      email: "sid.dev.2006@gmail.com",
      isVerified: true,
      memberSince: "2021-08-12",
      responseRate: 98,
    },
    verification: {
      ownerVerified: true,
      documentsReady: true,
      reraApproved: true,
    },
    walkScore: 65,
    safetyScore: 78,
    connectivityScore: 70,
    lifestyleScore: 68,
    highlights: [
      "Affordable housing in developing area",
      "Good for investment",
      "Peaceful neighborhood"
    ],
    thingsToConsider: [
      "Limited amenities currently",
      "Area still developing"
    ],
    nearbyPlaces: [
      { type: "park", name: "Hebbal Lake", distance: "0.1 km" },
      { type: "mall", name: "Esteem Mall", distance: "1.2 km" },
      { type: "metro", name: "Hebbal Metro", distance: "0.8 km" },
      { type: "hospital", name: "Manipal Hospital", distance: "2.0 km" },
    ],
    isPetFriendly: true,
    hasParking: true,
    isNewListing: true,
    listedAt: "2024-01-19T09:00:00Z",
    updatedAt: "2024-01-20T11:30:00Z",
  },
  {
    id: "prop-006",
    title: "Elegant 2BHK in Gated Community",
    description: "Live in a serene gated community with this elegant 2BHK. Features include a contemporary design, landscaped gardens, and proximity to top schools and shopping centers.",
    price: 7200000,
    pricePerSqft: 9000,
    images: [
      `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop&auto=format`,
      `https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop&auto=format`,
      `https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&h=600&fit=crop&auto=format`,
    ],
    location: {
      address: "Block D, Sobha Dream Acres",
      locality: "Hinjewadi",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411057",
      coordinates: { lat: 18.5912, lng: 73.7389 },
    },
    specs: {
      bhk: 2,
      bathrooms: 2,
      sqft: 800,
      floor: 5,
      totalFloors: 12,
      facing: "East",
      propertyAge: 4,
      furnishing: "semi-furnished",
      propertyType: "apartment",
    },
    amenities: ["Clubhouse", "Swimming Pool", "Jogging Track", "Indoor Games", "Kids Pool"],
    features: ["Vitrified Tiles", "Modular Kitchen", "Wooden Wardrobes"],
    seller: {
      id: "seller-006",
      name: "Sneha Patel",
      phone: "+91 43210 98765",
      email: "sid.dev.2006@gmail.com",
      isVerified: true,
      memberSince: "2022-01-05",
      responseRate: 85,
    },
    verification: {
      ownerVerified: true,
      documentsReady: true,
      reraApproved: true,
    },
    walkScore: 70,
    safetyScore: 82,
    connectivityScore: 75,
    lifestyleScore: 72,
    highlights: [
      "Family-friendly community",
      "Good schools nearby",
      "Well-maintained society"
    ],
    thingsToConsider: [
      "Older building, may need renovations"
    ],
    nearbyPlaces: [
      { type: "school", name: "Inventure Academy", distance: "0.8 km" },
      { type: "hospital", name: "Sakra World Hospital", distance: "1.5 km" },
      { type: "mall", name: "Phoenix Marketcity", distance: "3.0 km" },
    ],
    isPetFriendly: false,
    hasParking: true,
    isNewListing: false,
    listedAt: "2024-01-08T13:45:00Z",
    updatedAt: "2024-01-17T10:20:00Z",
  },
  {
    id: "prop-007",
    title: "Heritage Style 3BHK Row House",
    description: "Experience old-world charm with modern conveniences in this beautifully restored heritage-style row house. Features exposed brick walls, wooden beams, and a private courtyard garden.",
    price: 18500000,
    pricePerSqft: 10278,
    images: [
      `https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop`,
      `https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&h=600&fit=crop`,
    ],
    location: {
      address: "House 12, Heritage Lane",
      locality: "Jubilee Hills",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500033",
      coordinates: { lat: 17.4239, lng: 78.4738 },
    },
    specs: {
      bhk: 3,
      bathrooms: 3,
      sqft: 1800,
      floor: 0,
      totalFloors: 2,
      facing: "South",
      propertyAge: 15,
      furnishing: "fully-furnished",
      propertyType: "house",
    },
    amenities: ["Private Garden", "Terrace", "Study Room", "Servant Room"],
    features: ["Exposed Brick", "Wooden Beams", "Antique Fittings", "Courtyard"],
    seller: {
      id: "seller-007",
      name: "Karthik Rao",
      phone: "+91 32109 87654",
      email: "sid.dev.2006@gmail.com",
      isVerified: true,
      memberSince: "2019-05-20",
      responseRate: 90,
    },
    verification: {
      ownerVerified: true,
      documentsReady: true,
      reraApproved: false,
    },
    walkScore: 88,
    safetyScore: 92,
    connectivityScore: 90,
    lifestyleScore: 94,
    highlights: [
      "Luxury penthouse with stunning views",
      "Premium location and amenities",
      "Recently renovated"
    ],
    thingsToConsider: [
      "High property tax",
      "Premium pricing"
    ],
    nearbyPlaces: [
      { type: "restaurant", name: "Toit", distance: "0.2 km" },
      { type: "metro", name: "Indiranagar Metro", distance: "0.5 km" },
      { type: "park", name: "Indiranagar Park", distance: "0.3 km" },
    ],
    isPetFriendly: true,
    hasParking: true,
    isNewListing: false,
    listedAt: "2023-12-20T16:30:00Z",
    updatedAt: "2024-01-14T14:00:00Z",
  },
  {
    id: "prop-008",
    title: "Sky-High 5BHK Penthouse",
    description: "The ultimate in luxury living! This breathtaking penthouse spans two floors with a private rooftop pool, 360-degree city views, and designer interiors. For the most discerning buyers.",
    price: 85000000,
    pricePerSqft: 21250,
    images: [
      `https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800&h=600&fit=crop`,
      `https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop`,
      `https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800&h=600&fit=crop`,
    ],
    location: {
      address: "Penthouse 1, The Presidential Tower",
      locality: "Anna Nagar",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600040",
      coordinates: { lat: 13.0850, lng: 80.2101 },
    },
    specs: {
      bhk: 5,
      bathrooms: 6,
      sqft: 4000,
      floor: 40,
      totalFloors: 42,
      facing: "All Directions",
      propertyAge: 2,
      furnishing: "fully-furnished",
      propertyType: "penthouse",
    },
    amenities: ["Private Pool", "Private Elevator", "Wine Cellar", "Home Theater", "Spa Room", "Helipad Access"],
    features: ["Designer Interiors", "Imported Marble", "Smart Home", "Soundproof Walls", "Art Collection"],
    seller: {
      id: "seller-008",
      name: "Arjun Kapoor",
      phone: "+91 21098 76543",
      email: "arjun.k@email.com",
      isVerified: true,
      memberSince: "2018-09-15",
      responseRate: 100,
    },
    verification: {
      ownerVerified: true,
      documentsReady: true,
      reraApproved: true,
    },
    walkScore: 95,
    safetyScore: 96,
    connectivityScore: 98,
    lifestyleScore: 97,
    highlights: [
      "Ultra-luxury residence in heart of city",
      "World-class amenities and services",
      "Iconic building with prestigious address"
    ],
    thingsToConsider: [
      "Very high price point",
      "High maintenance and association fees"
    ],
    nearbyPlaces: [
      { type: "mall", name: "UB City Mall", distance: "0.0 km" },
      { type: "restaurant", name: "Karavalli", distance: "0.1 km" },
      { type: "hospital", name: "Fortis Hospital", distance: "1.0 km" },
      { type: "metro", name: "MG Road Metro", distance: "0.5 km" },
    ],
    isPetFriendly: true,
    hasParking: true,
    isNewListing: true,
    listedAt: "2024-01-20T08:00:00Z",
    updatedAt: "2024-01-20T08:00:00Z",
  },
];

// Helper functions for filtering
export const getUniqueLocalities = () => [...new Set(mockListings.map(p => p.location.locality))];
export const getUniqueCities = () => [...new Set(mockListings.map(p => p.location.city))];
export const getPriceRange = (properties: Property[] = mockListings) => ({
  min: properties.length > 0 ? Math.min(...properties.map(p => p.price)) : 1000000,
  max: properties.length > 0 ? Math.max(...properties.map(p => p.price)) : 100000000,
});
export const getBHKOptions = () => [...new Set(mockListings.map(p => p.specs.bhk))].sort((a, b) => a - b);
