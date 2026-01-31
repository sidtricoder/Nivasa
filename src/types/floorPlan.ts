// Types for 3D Floor Plan Viewer

export type RoomType = 'bedroom' | 'bathroom' | 'kitchen' | 'living' | 'dining' | 'balcony' | 'utility' | 'lobby';

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  width: number;   // in feet
  length: number;  // in feet
  position: { x: number; y: number }; // Grid position
}

export interface FloorPlanData {
  rooms: Room[];
  totalSqft: number;
  floorPlanImage?: string; // Optional 2D image URL
}

// Room color themes
export const roomColors: Record<RoomType, { floor: string; wall: string; accent: string }> = {
  bedroom: { floor: '#D4A574', wall: '#F5F0E8', accent: '#8B7355' },
  bathroom: { floor: '#E8E8E8', wall: '#FFFFFF', accent: '#87CEEB' },
  kitchen: { floor: '#F5DEB3', wall: '#FFF8DC', accent: '#CD853F' },
  living: { floor: '#DEB887', wall: '#FAF0E6', accent: '#A0522D' },
  dining: { floor: '#D2B48C', wall: '#FFF5EE', accent: '#8B4513' },
  balcony: { floor: '#90EE90', wall: '#FFFAF0', accent: '#228B22' },
  utility: { floor: '#C0C0C0', wall: '#F0F0F0', accent: '#808080' },
  lobby: { floor: '#E6D5B8', wall: '#FFFEF0', accent: '#9B8B6E' },
};

// Generate unique ID for rooms
export const generateRoomId = () => `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
