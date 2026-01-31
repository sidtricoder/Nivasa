import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Room, roomColors } from '@/types/floorPlan';

interface Room3DProps {
  room: Room;
  isHovered: boolean;
  onHover: (roomId: string | null) => void;
}

// Scale factor: 1 foot = 0.3 units in 3D space
const SCALE = 0.3;
const WALL_HEIGHT = 2.5; // meters
const WALL_THICKNESS = 0.1;

const Room3D: React.FC<Room3DProps> = ({ room, isHovered, onHover }) => {
  const groupRef = useRef<THREE.Group>(null);
  const colors = roomColors[room.type];
  
  const width = room.width * SCALE;
  const length = room.length * SCALE;
  const posX = room.position.x * SCALE;
  const posZ = room.position.y * SCALE;

  // Gentle hover animation
  useFrame(() => {
    if (groupRef.current) {
      const targetY = isHovered ? 0.05 : 0;
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.1;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[posX + width / 2, 0, posZ + length / 2]}
      onPointerEnter={() => onHover(room.id)}
      onPointerLeave={() => onHover(null)}
    >
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial 
          color={colors.floor} 
          roughness={0.8} 
          metalness={0.1}
        />
      </mesh>

      {/* Walls */}
      {/* Back wall */}
      <mesh position={[0, WALL_HEIGHT / 2, -length / 2 + WALL_THICKNESS / 2]} castShadow receiveShadow>
        <boxGeometry args={[width, WALL_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color={colors.wall} roughness={0.9} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-width / 2 + WALL_THICKNESS / 2, WALL_HEIGHT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, length]} />
        <meshStandardMaterial color={colors.wall} roughness={0.9} />
      </mesh>

      {/* Right wall (partial - for door opening) */}
      <mesh position={[width / 2 - WALL_THICKNESS / 2, WALL_HEIGHT / 2, -length / 4]} castShadow receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, length / 2]} />
        <meshStandardMaterial color={colors.wall} roughness={0.9} />
      </mesh>

      {/* Front wall (partial - for door/window) */}
      <mesh position={[-width / 4, WALL_HEIGHT / 2, length / 2 - WALL_THICKNESS / 2]} castShadow receiveShadow>
        <boxGeometry args={[width / 2, WALL_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color={colors.wall} roughness={0.9} />
      </mesh>

      {/* Add furniture based on room type */}
      <RoomFurniture type={room.type} width={width} length={length} />

      {/* Room label (floating above) */}
      {isHovered && (
        <mesh position={[0, WALL_HEIGHT + 0.5, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={colors.accent} emissive={colors.accent} emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  );
};

// Furniture component based on room type
const RoomFurniture: React.FC<{ type: string; width: number; length: number }> = ({ type, width, length }) => {
  switch (type) {
    case 'bedroom':
      return (
        <group>
          {/* Bed */}
          <mesh position={[0, 0.25, length / 4]} castShadow>
            <boxGeometry args={[width * 0.5, 0.5, length * 0.4]} />
            <meshStandardMaterial color="#8B4513" roughness={0.7} />
          </mesh>
          {/* Bed mattress */}
          <mesh position={[0, 0.55, length / 4]} castShadow>
            <boxGeometry args={[width * 0.48, 0.1, length * 0.38]} />
            <meshStandardMaterial color="#F5F5DC" roughness={0.9} />
          </mesh>
          {/* Nightstand */}
          <mesh position={[width * 0.35, 0.25, length / 4 - length * 0.15]} castShadow>
            <boxGeometry args={[0.4, 0.5, 0.4]} />
            <meshStandardMaterial color="#5D4037" roughness={0.8} />
          </mesh>
        </group>
      );

    case 'living':
      return (
        <group>
          {/* Sofa */}
          <mesh position={[0, 0.3, length / 4]} castShadow>
            <boxGeometry args={[width * 0.6, 0.6, length * 0.25]} />
            <meshStandardMaterial color="#4A6741" roughness={0.9} />
          </mesh>
          {/* Coffee table */}
          <mesh position={[0, 0.2, -length / 6]} castShadow>
            <boxGeometry args={[width * 0.4, 0.4, length * 0.2]} />
            <meshStandardMaterial color="#8B4513" roughness={0.7} />
          </mesh>
          {/* TV unit */}
          <mesh position={[0, 0.4, -length / 2 + 0.3]} castShadow>
            <boxGeometry args={[width * 0.5, 0.8, 0.2]} />
            <meshStandardMaterial color="#333333" roughness={0.5} />
          </mesh>
        </group>
      );

    case 'kitchen':
      return (
        <group>
          {/* Counter */}
          <mesh position={[-width / 2 + 0.4, 0.45, 0]} castShadow>
            <boxGeometry args={[0.6, 0.9, length * 0.8]} />
            <meshStandardMaterial color="#D2691E" roughness={0.6} />
          </mesh>
          {/* Counter top */}
          <mesh position={[-width / 2 + 0.4, 0.92, 0]} castShadow>
            <boxGeometry args={[0.65, 0.05, length * 0.82]} />
            <meshStandardMaterial color="#F5F5F5" roughness={0.3} metalness={0.1} />
          </mesh>
          {/* Stove */}
          <mesh position={[-width / 2 + 0.4, 0.97, length / 4]} castShadow>
            <boxGeometry args={[0.5, 0.05, 0.5]} />
            <meshStandardMaterial color="#2F2F2F" roughness={0.4} metalness={0.3} />
          </mesh>
        </group>
      );

    case 'bathroom':
      return (
        <group>
          {/* Toilet */}
          <mesh position={[width / 4, 0.25, -length / 3]} castShadow>
            <boxGeometry args={[0.4, 0.5, 0.5]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
          </mesh>
          {/* Sink */}
          <mesh position={[-width / 4, 0.4, -length / 3]} castShadow>
            <boxGeometry args={[0.5, 0.1, 0.4]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
          </mesh>
          {/* Sink stand */}
          <mesh position={[-width / 4, 0.2, -length / 3]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.4, 16]} />
            <meshStandardMaterial color="#C0C0C0" roughness={0.4} metalness={0.6} />
          </mesh>
          {/* Shower area */}
          <mesh position={[0, 0.02, length / 3]} receiveShadow>
            <boxGeometry args={[width * 0.4, 0.02, length * 0.3]} />
            <meshStandardMaterial color="#87CEEB" roughness={0.2} transparent opacity={0.6} />
          </mesh>
        </group>
      );

    case 'dining':
      return (
        <group>
          {/* Dining table */}
          <mesh position={[0, 0.4, 0]} castShadow>
            <boxGeometry args={[width * 0.5, 0.05, length * 0.4]} />
            <meshStandardMaterial color="#8B4513" roughness={0.6} />
          </mesh>
          {/* Table legs */}
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => (
            <mesh key={i} position={[x * width * 0.2, 0.2, z * length * 0.15]} castShadow>
              <boxGeometry args={[0.05, 0.4, 0.05]} />
              <meshStandardMaterial color="#5D4037" roughness={0.8} />
            </mesh>
          ))}
          {/* Chairs */}
          {[[-1, 0], [1, 0]].map(([x], i) => (
            <mesh key={`chair-${i}`} position={[x * width * 0.35, 0.25, 0]} castShadow>
              <boxGeometry args={[0.35, 0.5, 0.35]} />
              <meshStandardMaterial color="#A0522D" roughness={0.8} />
            </mesh>
          ))}
        </group>
      );

    case 'balcony':
      return (
        <group>
          {/* Railing */}
          <mesh position={[0, 0.5, length / 2 - 0.05]} castShadow>
            <boxGeometry args={[width, 0.05, 0.05]} />
            <meshStandardMaterial color="#4A4A4A" roughness={0.5} metalness={0.7} />
          </mesh>
          {/* Railing posts */}
          {[-0.4, 0, 0.4].map((x, i) => (
            <mesh key={i} position={[x * width, 0.25, length / 2 - 0.05]} castShadow>
              <boxGeometry args={[0.03, 0.5, 0.03]} />
              <meshStandardMaterial color="#4A4A4A" roughness={0.5} metalness={0.7} />
            </mesh>
          ))}
          {/* Plant */}
          <mesh position={[-width / 3, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.12, 0.25, 16]} />
            <meshStandardMaterial color="#8B4513" roughness={0.9} />
          </mesh>
          <mesh position={[-width / 3, 0.5, 0]} castShadow>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial color="#228B22" roughness={0.9} />
          </mesh>
        </group>
      );

    default:
      return null;
  }
};

export default Room3D;
